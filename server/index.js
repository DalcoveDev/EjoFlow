import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { normalizeServiceResult, describeForEjoChat, errorCodeToHint } from './normalizer.js';
import { getOrCreateConversation, appendMessage, recordAction, lastMessageContent, deleteLastAssistantMessage, getConversationHistory, listConversations, listActions, getStats, exportAllData, clearAllData } from './db.js';
import { servicesKb, discoverPrompt } from './services-kb.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const EJOCHAT_URL = process.env.EJOCHAT_URL ?? 'https://api.ejolabs.com/api/v1/subiza';
const API_KEY = process.env.EJOCHAT_API_KEY;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL ?? '';
const TOOL_MARKER = /\[\[TOOL:([a-z0-9_-]+):([a-z0-9_-]+)\]\]/;

const BRAND_RULE = "Izina ry'urubuga ni 'EjoFlow' gusa — ntirigomba gusemurwa cyangwa guhindurwa mu rurimi urwo ari rwo rwose (ntiwandike 'Tomorrow Flow').";
const SYSTEM_TOOL_PROMPT = `Uri umufasha wa EjoFlow. ${BRAND_RULE} Iyo umukoresha asaba ibintu bikeneye amakuru aturuka mu muyoboro utandukanye (nk'amasoko ya Gmail), sobanura ibyo wifuza mu gisubizo cyawe kandi ugasozwa n'umurongo umwe: [[TOOL:providerId:action]] — urugero: [[TOOL:gmail:read_inbox]]. Niba utakeneye akamenyetso, ntawo ushyiramo.`;
const SYSTEM_DO_PROMPT = `Uri Binkorere AI — umukozi w'ikoranabuhanga wa EjoFlow ushinzwe GUKORA ibikorwa (automation) ku busabe bw'umukoresha, atari gusobanura serivisi.
${BRAND_RULE}
Uko ukora:
1. Umukoresha asaba igikorwa (urugero: gusoma imenyesha za Gmail, kohereza imenyesha, gukurikirana ubusabe).
2. Iyo igikorwa kikeneye amakuru aturuka mu muyoboro (nk'amasoko ya Gmail), sobanura ibyo ugiye gukora mu gisubizo cyawe kandi ugasozwa n'umurongo umwe: [[TOOL:providerId:action]] — urugero: [[TOOL:gmail:read_inbox]].
3. Usubize gusa igisubizo kigufi cy'ibyo wakoreye: gitangire "Byakozwe! ✓" cyangwa "Ntibyashobotse" — nta bisobanuro birebire, nta kwandika intambwe, nta kuvuga uko serivisi iboneka.
Ibikorwa bijyanye n'ubwishyu cyangwa by'iteka (kohereza amafaranga, gusinyisha, gukuraho) NTIBIKORWE mbere yo kwemeza — ubaze umukoresha mbere.
Niba ubusabe budasobanutse, ubaze ikibazo kimwe gusa.`;
const SYSTEM_ANSWER_PROMPT = `Uri umufasha wa EjoFlow. ${BRAND_RULE} Ufite amakuru yujuje ubusabe bw'umukoresha — usubize ukoresheje gusa ayo makuru.
Amabwiriza:
- Ntukoreshe amagambo y'itekiniki imbere: "provider", "action", "n8n", "webhook", "API", "endpoint", "workflow", "JSON", "status", "serivisi y'itekiniki", "ikora", "umuyoboro".
- Niba amakuru ari urutonde, yashyire mu mpando nkeya ku muntu: umwanditsi/umutumye, insanganyamatsiko, igihe, n'incamake ngufi.
- Niba amakuru yerekana ko gikorwa kitakorwa, binyeze mu kinyabupfura.
- Koresha imodoka (emoji) nke kandi zinyuranye kugira ngo umukoresha asome byoroshye. Urugero: 📧 imeli, ✅ ibyo byagenze neza, ⚠️ umuburo, ❌ ikintu kitagenze, 📅 itariki, 🔔 imenyesha, 💰 amafaranga. Tangira umurongo w'ingenzi ku modoka, ntukoreshe imodoka nyinshi (1 ku murongo, ntarenga 2 muri buri gisubizo).`;

const RW_KEYWORDS = ['reka', 'mbone', 'imenyesha', 'ubutumwa', 'ndashaka', 'shaka', 'gera', 'uburyo', 'byose', 'cyane', 'vuga', 'subiza', 'kugira', 'nyuma', 'icyo', 'gikorwa', 'serivisi'];

function detectUserLanguage(messages) {
  const last = [...messages].reverse().find((m) => m.role === 'user');
  const lower = (last?.content ?? '').toLowerCase();
  const isRw = RW_KEYWORDS.some((w) => lower.includes(w));
  return isRw ? 'rw' : 'en';
}

function answerPrompt(lang) {
  const languageRule = lang === 'rw'
    ? 'Vuga mu Kinyarwanda (ururimi rwa default).'
    : 'Subiza mu Cyongereza (English) gusa, kuko umukoresha yanditse mu Cyongereza.';
  return `${SYSTEM_ANSWER_PROMPT}\n- ${languageRule}`;
}

async function callEjoChat(messages, systemPrompt) {
  const upstream = await fetch(EJOCHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    body: JSON.stringify({ messages: [{ role: 'system', content: systemPrompt }, ...messages] }),
    signal: AbortSignal.timeout(90000),
  });
  const data = await upstream.json().catch(() => ({}));
  if (upstream.status === 429 || data?.error?.code === 'RATE_LIMITED') {
    const err = new Error('EjoChat quota exceeded');
    err.code = 'RATE_LIMITED';
    throw err;
  }
  if (!upstream.ok) throw new Error(`EjoChat error ${upstream.status}: ${JSON.stringify(data)}`);
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("EjoChat ntabwo yagarutse n'igisubizo");
  return { content, requestId: data.request_id, latencyMs: data.latency_ms };
}

async function callN8n(payload) {
  if (!N8N_WEBHOOK_URL) throw new Error('N8N_WEBHOOK_URL ntihari mu .env');
  const res = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`n8n error ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

function staticFallbackReply(code) {
  if (code === 'unsupported_action') return '❌ Sinshoboye gukora icyo gikorwa kuri iyi serivisi ubu.';
  return '⚠️ Sinshoboye kugera kuri serivisi ubu. Gerageza nyuma.';
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/api/conversations', (_req, res) => res.json(listConversations()));

app.get('/api/actions', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  res.json(listActions(limit));
});

app.get('/api/stats', (_req, res) => res.json(getStats()));

app.get('/api/export', (_req, res) => {
  res.json({ exportedAt: new Date().toISOString(), data: exportAllData() });
});

app.post('/api/data/clear', (_req, res) => {
  clearAllData();
  res.json({ ok: true });
});


app.get('/api/conversations/:providerId', (req, res) => res.json(getConversationHistory(req.params.providerId)));

app.post('/api/chat', async (req, res) => {
  const { messages, providerId = 'ejochat', regenerate = false, mode = 'chat', lang = 'rw' } = req.body ?? {};
  if (!API_KEY) return res.status(500).json({ error: 'EJOCHAT_API_KEY ntihari mu .env' });
  if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: 'messages ntizitangwa' });
  try {
    const conversation = getOrCreateConversation(providerId);
    if (regenerate) deleteLastAssistantMessage(conversation.id);
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser && lastMessageContent(conversation.id) !== lastUser.content) {
      appendMessage(conversation.id, 'user', lastUser.content);
    }
    const first = await callEjoChat(messages, mode === 'do' ? SYSTEM_DO_PROMPT : SYSTEM_TOOL_PROMPT);
    console.log(`[ejochat] first call request_id=${first.requestId} latency_ms=${first.latencyMs}`);
    const marker = first.content.match(TOOL_MARKER);
    if (!marker) {
      appendMessage(conversation.id, 'assistant', first.content);
      return res.json({ reply: first.content, ui: null, conversationId: conversation.id });
    }

    const [, provider, action] = marker;
    const replyWithoutMarker = first.content.replace(TOOL_MARKER, '').trim();
    let normalized;
    try {
      const raw = await callN8n({ provider, action, messages });
      console.log(`[ejochat:tool] raw ${provider}:${action} ->`, JSON.stringify(raw));
      normalized = normalizeServiceResult({ provider, action, raw });
      console.log(`[ejochat:tool] normalized ->`, JSON.stringify(normalized));
      recordAction(conversation.id, provider, action, true);
    } catch (err) {
      console.error(`[ejochat:tool] service call failed ${provider}:${action}:`, err?.message ?? err);
      normalized = { ok: false, code: 'service_unavailable' };
      recordAction(conversation.id, provider, action, false);
    }

    const toolMessages = [...messages, { role: 'assistant', content: replyWithoutMarker }];
    const prompt = answerPrompt(detectUserLanguage(messages));
    if (normalized.ok) {
      const final = await callEjoChat(
        [...toolMessages, { role: 'user', content: `Aya ni amakuru avuye mu serivisi yasabwe: ${describeForEjoChat(normalized)}. Subiza umukoresha.` }],
        prompt,
      );
      appendMessage(conversation.id, 'assistant', final.content, normalized.data);
      return res.json({ reply: final.content, ui: normalized.data, conversationId: conversation.id });
    }
    try {
      const final = await callEjoChat(
        [...toolMessages, { role: 'user', content: errorCodeToHint(normalized.code) }],
        prompt,
      );
      appendMessage(conversation.id, 'assistant', final.content);
      return res.json({ reply: final.content, ui: null, conversationId: conversation.id });
    } catch (err) {
      console.error(`[ejochat:tool] fallback phrasing failed:`, err?.message ?? err);
      const fallback = staticFallbackReply(normalized.code);
      appendMessage(conversation.id, 'assistant', fallback);
      return res.json({ reply: fallback, ui: null, conversationId: conversation.id });
    }
  } catch (err) {
    console.error(`[ejochat] request failed:`, err?.message ?? err);
    if (err?.code === 'RATE_LIMITED') return res.status(429).json({ error: 'quota_exceeded', reply: QUOTA_REPLIES[lang] ?? QUOTA_REPLIES.rw });
    res.status(502).json({ error: String(err?.message ?? err) });
  }
});

const QUOTA_REPLIES = {
  rw: '⚠️ AI yarushywe kuri uyu munsi — igihe cyo gukoresha kirangiye. Gerageza ejo.',
  en: '⚠️ The AI has reached its daily limit — the usage time is over. Try again tomorrow.',
  fr: '⚠️ L\'IA a atteint sa limite quotidienne — le temps d\'utilisation est écoulé. Réessayez demain.',
};

function parseJsonLoose(text) {
  const cleaned = String(text ?? '').replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { return null; }
}

const DISCOVER_PROMPT = discoverPrompt();
const DISCOVER_KEYWORDS = [
  ['passport', ['passport', 'pasiporo', 'passeport']],
  ['birth-certificate', ['amavuko', 'kivuko', 'birth certificate']],
  ['divorce-certificate', ['divorce', 'gutandukana']],
  ['mutuelle', ['mutuelle', 'mituweli', 'ubwishingizi bw\'ubuzima']],
  ['pension', ['pension', 'pansiyo', 'izabukuru', 'retirement']],
  ['tax-registration', ['tin', 'kwiyandikisha mu misoro', 'umusoro']],
  ['tax-clearance', ['tax clearance', 'clearance', 'icyemezo cy\'imisoro']],
  ['driving-license', ['permis', 'driving', 'ubushoferi']],
  ['police-report', ['police', 'icyamaganwa', 'rapport']],
  ['business-registration', ['business', 'ubucuruzi', 'entreprise', 'kwiyandikisha']],
  ['certificate-verification', ['kugenzura', 'verification', 'kureba niba']],
];
function matchServiceByKeywords(text) {
  const lower = String(text).toLowerCase();
  for (const [id, keys] of DISCOVER_KEYWORDS) if (keys.some(k => lower.includes(k))) return servicesKb.find(s => s.id === id) ?? null;
  return null;
}

app.post('/api/discover', async (req, res) => {
  const { text } = req.body ?? {};
  if (!API_KEY) return res.status(500).json({ error: 'EJOCHAT_API_KEY ntihari mu .env' });
  if (!text || !String(text).trim()) return res.status(400).json({ error: 'text ntitangwa' });
  try {
    const first = await callEjoChat([{ role: 'user', content: String(text).trim() }], DISCOVER_PROMPT);
    console.log(`[discover] request_id=${first.requestId} raw=`, first.content);
    const parsed = parseJsonLoose(first.content);
    const service = parsed?.serviceId ? servicesKb.find(s => s.id === parsed.serviceId) ?? null : null;
    if (service) {
      console.log(`[discover] matched -> ${service.id} (${service.providerId})`);
      return res.json({ status: 'matched', understanding: parsed.understanding ?? 'Ndumva icyo ushaka.', category: parsed.category ?? service.category, service });
    }
    const fallback = matchServiceByKeywords(text);
    if (fallback) {
      console.log(`[discover] fallback keyword match -> ${fallback.id}`);
      return res.json({ status: 'matched', understanding: parsed?.understanding ?? 'Ndumva icyo ushaka.', category: parsed?.category ?? fallback.category, service: fallback });
    }
    console.log(`[discover] no match ->`, JSON.stringify(parsed));
    return res.json({
      status: 'clarify',
      understanding: parsed?.understanding ?? 'Ntabwo ntahuye neza n\'icyo ushaka.',
      clarification: Array.isArray(parsed?.clarification) ? parsed.clarification.slice(0, 3) : [],
    });
  } catch (err) {
    console.error(`[discover] request failed:`, err?.message ?? err);
    if (err?.code === 'RATE_LIMITED') return res.status(429).json({ error: 'quota_exceeded' });
    res.status(502).json({ error: String(err?.message ?? err) });
  }
});

const port = process.env.PORT ?? 3001;
app.listen(port, () => console.log(`EjoFlow server listening on http://localhost:${port}`));