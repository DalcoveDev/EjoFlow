import { ArrowLeft, Check, ChevronDown, Copy, Globe, LoaderCircle, Mail, Mic, RotateCcw, Send, ShieldCheck, Sparkles, Square } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ProviderLogo } from '../components/providers/ProviderLogo';
import { EmailListCard } from '../components/chat/EmailListCard';
import { providerService } from '../services/providerService';
import { useConversation, type ConversationItem } from '../hooks/useConversation';
import { useI18n } from '../i18n/LanguageContext';
import type { Provider } from '../types';
const botName = 'EjoChat';
function ProviderContext({ provider }: { provider: Provider | null }) {
  const { t } = useI18n();
  return <aside className="border-r border-ejo-border bg-white p-5"><p className="eyebrow">{t('chat.providerEyebrow')}</p>{provider ? <div className="mt-2 flex items-center gap-3"><ProviderLogo id={provider.id} mark={provider.mark} category={provider.category} website={provider.website} size="md"/><span><strong className="block font-display text-lg">{provider.name}</strong><small className="text-[10px] text-ejo-muted">{provider.domain}</small></span></div> : <p className="mt-2 text-xs leading-5 text-ejo-muted">{t('chat.generic')}</p>}{provider && provider.capabilities.length > 0 && <div className="mt-6 hidden border-t border-ejo-border pt-4 lg:block"><p className="eyebrow">{t('chat.capabilities')}</p><ul className="mt-2 space-y-2">{provider.capabilities.map(cap => <li className="flex items-center gap-2 text-xs font-semibold text-ejo-blue" key={cap.id}><Check size={14} className="text-ejo-green"/> {cap.name}</li>)}</ul></div>}</aside>;
}
function ServicePath({ phase }: { phase: string }) {
  const { t } = useI18n();
  const path = [t('chat.path1'), t('chat.path2'), t('chat.path3'), t('chat.path4'), t('chat.path5')];
  const active = phase === 'question' ? 0 : phase === 'processing' ? 1 : 2;
  return <aside className="border-l border-ejo-border bg-white p-5"><p className="eyebrow">{t('chat.pathEyebrow')}</p><h3 className="font-display text-base font-bold">{t('chat.pathTitle')}</h3><ol className="mt-5">{path.map((step, index) => { const done = index < active; const isActive = index === active; return <li className="relative flex min-h-14 gap-3 after:absolute after:left-[13px] after:top-7 after:h-6 after:w-px after:bg-ejo-border last:after:hidden" key={step}><span className={`grid size-7 place-items-center rounded-full border text-[11px] font-bold ${done ? 'border-ejo-green bg-ejo-green text-white' : isActive ? 'border-ejo-green bg-[#f1f7f4] text-ejo-green ring-4 ring-[#dcece5]' : 'border-[#bfcfca] bg-white text-ejo-muted'}`}>{done ? <Check size={13}/> : index + 1}</span><span><strong className="block text-xs">{step}</strong><small className="block text-[10px] text-ejo-muted">{isActive ? t('chat.stepHere') : t('chat.stepLater')}</small></span></li>; })}</ol><div className="mt-7 border-t border-ejo-border pt-4 text-[10px] leading-4 text-ejo-muted"><strong className="text-ejo-ink">{t('chat.secure')}</strong><br/>{t('chat.noPay')}</div></aside>;
}
function InlineMarkdown(text: string, key: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0; let m; let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) nodes.push(<strong key={`${key}${i}`}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('`')) nodes.push(<code key={`${key}${i}`} className="rounded-sm bg-[#eef2f1] px-1 py-0.5 font-mono text-[11px] text-ejo-blue">{tok.slice(1, -1)}</code>);
    else if (tok.startsWith('[')) { const mm = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/); nodes.push(<a key={`${key}${i}`} href={mm?.[2]} target="_blank" rel="noreferrer" className="text-ejo-blue underline">{mm?.[1]}</a>); }
    else nodes.push(<em key={`${key}${i}`}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length; i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let list: { type: 'ul' | 'ol'; items: string[] } | null = null;
  const flush = (key: string) => { if (list) { const items = list.items; blocks.push(list.type === 'ul' ? <ul key={key} className="my-1.5 list-disc space-y-1 pl-5">{items.map((it, j) => <li key={j}>{InlineMarkdown(it, `li${key}${j}`)}</li>)}</ul> : <ol key={key} className="my-1.5 list-decimal space-y-1 pl-5">{items.map((it, j) => <li key={j}>{InlineMarkdown(it, `li${key}${j}`)}</li>)}</ol>); list = null; } };
  lines.forEach((line, idx) => {
    const ul = line.match(/^\s*[-*•]\s+(.+)$/);
    const ol = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (ul || ol) {
      const type = ul ? 'ul' : 'ol';
      if (!list || list.type !== type) { flush(`l${idx}`); list = { type, items: [] }; }
      list.items.push((ul ?? ol)![1]);
      return;
    }
    flush(`l${idx}`);
    const t = line.trim();
    if (!t) return;
    if (t.startsWith('#')) blocks.push(<h4 key={`h${idx}`} className="pt-1 font-display text-sm font-bold text-ejo-ink">{InlineMarkdown(t.replace(/^#+\s*/, ''), `h${idx}`)}</h4>);
    else blocks.push(<p key={`p${idx}`} className="break-words">{InlineMarkdown(t, `p${idx}`)}</p>);
  });
  flush(`l${lines.length}`);
  return <div className="space-y-1.5">{blocks}</div>;
}
function EjoChatAvatar({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'size-8 text-base' : 'size-7 text-sm';
  return <span className={`grid ${cls} shrink-0 place-items-center rounded-sm bg-[#52616B] text-white`}><span className="font-display font-extrabold">C</span></span>;
}
const LONG_LIMIT = 420;
function truncateAtWord(text: string, limit: number) {
  const cut = text.slice(0, limit);
  const idx = cut.lastIndexOf(' ');
  return idx > limit * 0.6 ? cut.slice(0, idx) : cut;
}
function AssistantMessage({ item, onCopy, copied, onRegenerate }: { item: ConversationItem; onCopy: () => void; copied: boolean; onRegenerate: () => void }) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const long = item.text.length > LONG_LIMIT;
  const shown = long && !expanded ? truncateAtWord(item.text, LONG_LIMIT) : item.text;
  return <div className="flex gap-3"><EjoChatAvatar/><div className="min-w-0 flex-1 space-y-2"><strong className="block text-[11px] font-bold text-ejo-ink">{botName}</strong><div className="text-xs leading-6 text-ejo-ink"><MarkdownText text={shown}/></div>{long && <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-[11px] font-bold text-ejo-blue hover:text-ejo-green">{expanded ? t('chat.collapse') : t('chat.readMore')}<ChevronDown size={13} className={`transition-transform ${expanded ? 'rotate-180' : ''}`}/></button>}{item.ui?.type === 'email_list' && <EmailListCard data={item.ui}/>}<div className="flex gap-1 pt-0.5"><button onClick={onCopy} aria-label="Igiraho" className="grid size-7 place-items-center rounded-sm text-ejo-muted hover:bg-ejo-canvas hover:text-ejo-blue">{copied ? <Check size={13} className="text-ejo-green"/> : <Copy size={13}/>}</button><button onClick={onRegenerate} aria-label="Subiza nanone" className="grid size-7 place-items-center rounded-sm text-ejo-muted hover:bg-ejo-canvas hover:text-ejo-blue"><RotateCcw size={13}/></button></div></div></div>;
}
function MessageView({ item, onCopy, copied, onRegenerate }: { item: ConversationItem; onCopy: () => void; copied: boolean; onRegenerate: () => void }) {
  if (item.type === 'user') return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end"><div className="max-w-[85%] whitespace-pre-wrap break-words rounded-lg bg-ejo-blue px-4 py-2.5 text-xs leading-5 text-white sm:max-w-md">{item.text}</div></motion.div>;
  if (item.type === 'error') return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start"><div className="max-w-[85%] break-words whitespace-pre-wrap rounded-lg border-l-[3px] border-ejo-error bg-[#fff5f5] px-4 py-2.5 text-xs leading-5 text-[#722525] sm:max-w-md">{item.text}</div></motion.div>;
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><AssistantMessage item={item} onCopy={onCopy} copied={copied} onRegenerate={onRegenerate}/></motion.div>;
}
export function ConversationWorkspacePage() {
  const { providerId = 'ejochat' } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [provider, setProvider] = useState<Provider | null>(null);
  useEffect(() => { providerService.getById(providerId).then(p => setProvider(p)); }, [providerId]);
  const { items, phase, typing, loading, answer, regenerate } = useConversation(providerId);
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [items, typing]);
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q');
  const autoSent = useRef(false);
  useEffect(() => {
    if (q && !loading && !autoSent.current) {
      autoSent.current = true;
      answer(q);
      setSearchParams({}, { replace: true });
    }
  }, [q, loading, answer, setSearchParams]);
  function send() { if (!input.trim()) return; answer(input); setInput(''); if (taRef.current) taRef.current.style.height = 'auto'; }
  const [listening, setListening] = useState(false);
  const [voiceHint, setVoiceHint] = useState(false);
  const recRef = useRef<{ stop: () => void } | null>(null);
  useEffect(() => () => { recRef.current?.stop(); }, []);
  function toggleVoice() {
    const SR = (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;
    if (!SR) { setVoiceHint(true); setTimeout(() => setVoiceHint(false), 3000); return; }
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const rec = new SR() as { lang: string; interimResults: boolean; maxAlternatives: number; start: () => void; stop: () => void; onresult: ((e: { results?: { [i: number]: { [j: number]: { transcript?: string } } } }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => { const text = e.results?.[0]?.[0]?.transcript ?? ''; if (text) setInput(v => (v ? v + ' ' : '') + text); };
    rec.onend = () => setListening(false);
    rec.onerror = () => { setListening(false); setVoiceHint(true); setTimeout(() => setVoiceHint(false), 3000); };
    rec.start();
    recRef.current = rec;
    setListening(true);
  }
  async function copy(text: string, id: string) { try { await navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 1500); } catch { /* clipboard unavailable */ } }
  const suggestions = [
    { icon: Mail, label: t('chat.sug1') },
    { icon: Sparkles, label: t('chat.sug2') },
    { icon: ShieldCheck, label: t('chat.sug3') },
    { icon: Globe, label: t('chat.sug4') },
  ];
  return <main className="fixed inset-x-0 top-16 bottom-[68px] mx-auto flex max-w-[1440px] flex-col md:top-[72px] lg:static lg:h-auto lg:min-h-[calc(100vh-72px)] lg:grid lg:grid-cols-[220px_minmax(0,1fr)_260px]"><div className="hidden lg:block"><ProviderContext provider={provider}/></div><section className="flex min-h-0 flex-1 flex-col bg-ejo-canvas lg:min-h-[620px]"><header className="flex shrink-0 items-center gap-3 border-b border-ejo-border bg-white px-4 py-3 md:px-6"><button onClick={() => navigate('/app')} aria-label="Subira" className="grid size-9 place-items-center rounded-sm text-ejo-blue hover:bg-ejo-canvas lg:hidden"><ArrowLeft size={18}/></button>{provider ? <ProviderLogo id={provider.id} mark={provider.mark} category={provider.category} website={provider.website} size="sm"/> : <EjoChatAvatar/>}<div className="min-w-0"><strong className="block truncate font-display text-sm font-bold">{provider ? `${t('chat.with')} ${provider.name}` : botName}</strong><small className="flex items-center gap-1.5 text-[10px] text-ejo-muted"><span className="size-1.5 rounded-full bg-ejo-green"/>{t('chat.online')}</small></div><div className="ml-auto flex items-center gap-3"><Link to="/app/menya-serivisi" className="hidden text-xs font-bold text-ejo-blue hover:text-ejo-green sm:block">{t('nav.menya')}</Link><Link to="/app" className="hidden text-xs font-bold text-ejo-blue hover:text-ejo-green sm:block">{t('nav.services')} →</Link></div></header><div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8"><div className="mx-auto max-w-3xl space-y-6">{items.length === 0 && !loading && <div className="flex min-h-full flex-col items-center justify-center gap-6 py-10 text-center"><span className="grid size-14 place-items-center rounded-xl bg-[#52616B] text-white"><span className="font-display text-xl font-extrabold">C</span></span><div><h3 className="font-display text-xl font-bold text-ejo-ink">{t('chat.hello')}</h3><p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-ejo-muted">{t('chat.emptySub')}</p></div><div className="grid w-full gap-2 sm:grid-cols-2">{suggestions.map(s => <button key={s.label} onClick={() => answer(s.label)} className="flex items-start gap-2.5 border border-ejo-border bg-white p-3 text-left text-xs font-semibold text-ejo-ink hover:border-ejo-green hover:text-ejo-blue"><s.icon size={16} className="mt-0.5 shrink-0 text-ejo-green"/>{s.label}</button>)}</div></div>}{loading && <div className="flex items-center gap-2 py-4 text-xs text-ejo-muted"><LoaderCircle className="animate-spin text-ejo-green" size={15}/> {t('chat.loading')}</div>}<AnimatePresence initial={false}>{items.map(item => <MessageView item={item} key={item.id} onCopy={() => copy(item.text, item.id)} copied={copiedId === item.id} onRegenerate={regenerate}/>)}</AnimatePresence>{typing && <div className="flex items-center gap-3"><EjoChatAvatar/><div className="flex items-center gap-1.5 rounded-lg border border-ejo-border bg-white px-3 py-3">{['0ms', '150ms', '300ms'].map((d, i) => <span key={i} className="size-1.5 animate-bounce rounded-full bg-ejo-green" style={{ animationDelay: d }}/>)}</div></div>}<div ref={bottomRef}/></div></div><footer className="shrink-0 border-t border-ejo-border bg-white px-4 py-3 md:px-6"><div className="mx-auto max-w-3xl"><label className="flex items-end gap-2 rounded-lg border border-[#a9bdb6] border-l-[3px] border-l-ejo-green bg-white p-2 focus-within:border-ejo-green"><textarea ref={taRef} value={input} onChange={e => setInput(e.target.value)} rows={1} onInput={() => { const ta = taRef.current; if (!ta) return; ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'; }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={t('chat.placeholder')} className="max-h-40 w-full resize-none bg-transparent py-1.5 text-xs leading-5 outline-none"/><button onClick={toggleVoice} aria-label={t('chat.voice')} className={`grid size-8 shrink-0 place-items-center rounded-full ${listening ? 'bg-ejo-amber text-[#3d2f0a]' : 'text-ejo-blue hover:bg-ejo-canvas'}`}>{listening ? <Square size={14}/> : <Mic size={15}/>}</button><button onClick={send} disabled={!input.trim() || typing} aria-label="Ohereza" className="grid size-8 shrink-0 place-items-center rounded-full bg-ejo-green text-white disabled:cursor-not-allowed disabled:bg-[#a8b8b3]"><Send size={15}/></button></label><p className="mt-2 text-center text-[10px] text-ejo-muted">{voiceHint ? t('chat.voiceHint') : t('chat.note')}</p></div></footer></section><div className="hidden lg:block"><ServicePath phase={phase}/></div></main>;
}