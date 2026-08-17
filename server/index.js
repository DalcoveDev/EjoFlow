import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { normalizeServiceResult, describeForEjoChat, errorCodeToHint } from './normalizer.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const EJOCHAT_URL = process.env.EJOCHAT_URL ?? 'https://api.ejolabs.com/api/v1/subiza';
const API_KEY = process.env.EJOCHAT_API_KEY;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL ?? '';
const TOOL_MARKER = /\[\[TOOL:([a-z0-9_-]+):([a-z0-9_-]+)\]\]/;

const SYSTEM_TOOL_PROMPT = 'Uri umufasha wa EjoFlow. Iyo umukoresha asaba ibintu bikeneye amakuru aturuka mu muyoboro utandukanye (nk\'amasoko ya Gmail), sobanura ibyo wifuza mu gisubizo cyawe kandi ugasozwa n\'umurongo umwe: [[TOOL:providerId:action]] — urugero: [[TOOL:gmail:read_inbox]]. Niba utakeneye akamenyetso, ntawo ushyiramo.';
const SYSTEM_ANSWER_PROMPT = `Uri umufasha wa EjoFlow. Ufite amakuru yujuje ubusabe bw'umukoresha — usubize ukoresheje gusa ayo makuru.
Amabwiriza:
- Ntukoreshe amagambo y'itekiniki imbere: "provider", "action", "n8n", "webhook", "API", "endpoint", "workflow", "JSON", "status", "serivisi y'itekiniki", "ikora", "umuyoboro".
- Niba amakuru ari urutonde, yashyire mu mpando nkeya ku muntu: umwanditsi/umutumye, insanganyamatsiko, igihe, n'incamake ngufi.
- Niba amakuru yerekana ko gikorwa kitakorwa, binyeze mu kinyabupfura.`;

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
  if (code === 'unsupported_action') return 'Sinshoboye gukora icyo gikorwa kuri iyi serivisi ubu.';
  return 'Sinshoboye kugera kuri serivisi ubu. Gerageza nyuma.';
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body ?? {};
  if (!API_KEY) return res.status(500).json({ error: 'EJOCHAT_API_KEY ntihari mu .env' });
  if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: 'messages ntizitangwa' });
  try {
    const first = await callEjoChat(messages, SYSTEM_TOOL_PROMPT);
    console.log(`[ejochat] first call request_id=${first.requestId} latency_ms=${first.latencyMs}`);
    const marker = first.content.match(TOOL_MARKER);
    if (!marker) return res.json({ reply: first.content });

    const [, provider, action] = marker;
    const replyWithoutMarker = first.content.replace(TOOL_MARKER, '').trim();
    let normalized;
    try {
      const raw = await callN8n({ provider, action, messages });
      console.log(`[ejochat:tool] raw ${provider}:${action} ->`, JSON.stringify(raw));
      normalized = normalizeServiceResult({ provider, action, raw });
      console.log(`[ejochat:tool] normalized ->`, JSON.stringify(normalized));
    } catch (err) {
      console.error(`[ejochat:tool] service call failed ${provider}:${action}:`, err?.message ?? err);
      normalized = { ok: false, code: 'service_unavailable' };
    }

    const toolMessages = [...messages, { role: 'assistant', content: replyWithoutMarker }];
    const prompt = answerPrompt(detectUserLanguage(messages));
    if (normalized.ok) {
      const final = await callEjoChat(
        [...toolMessages, { role: 'user', content: `Aya ni amakuru avuye mu serivisi yasabwe: ${describeForEjoChat(normalized)}. Subiza umukoresha.` }],
        prompt,
      );
      return res.json({ reply: final.content, ui: normalized.data });
    }
    try {
      const final = await callEjoChat(
        [...toolMessages, { role: 'user', content: errorCodeToHint(normalized.code) }],
        prompt,
      );
      return res.json({ reply: final.content });
    } catch (err) {
      console.error(`[ejochat:tool] fallback phrasing failed:`, err?.message ?? err);
      return res.json({ reply: staticFallbackReply(normalized.code) });
    }
  } catch (err) {
    console.error(`[ejochat] request failed:`, err?.message ?? err);
    res.status(502).json({ error: String(err?.message ?? err) });
  }
});

const port = process.env.PORT ?? 3001;
app.listen(port, () => console.log(`EjoFlow server listening on http://localhost:${port}`));