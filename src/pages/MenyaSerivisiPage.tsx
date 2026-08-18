import { ArrowLeft, ArrowRight, Briefcase, Car, CheckCircle2, Compass, FileText, HeartPulse, Landmark, ListChecks, LoaderCircle, Receipt, Sparkles, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProviderLogo } from '../components/providers/ProviderLogo';
import { providers } from '../data/providers';
import { discoverService } from '../services/discoverService';
import { useI18n } from '../i18n/LanguageContext';
import type { DiscoverResult, ServiceGuide } from '../types';
const providerById = new Map(providers.map(p => [p.id, p]));
const categoryKey = (c: string) => ({ 'Serivisi za Leta': 'cat.gov', 'Ubuzima': 'cat.health', 'Inyandiko': 'cat.docs', 'Imisoro': 'cat.tax', 'Imiryango': 'cat.family', 'Ubucuruzi': 'cat.biz', 'Imirimo': 'cat.jobs', 'Ubwikorezi': 'cat.transport', 'Ibindi': 'cat.other' }[c] ?? c);
const categories = [
  { label: 'cat.gov', icon: Landmark },
  { label: 'cat.health', icon: HeartPulse },
  { label: 'cat.docs', icon: FileText },
  { label: 'cat.tax', icon: Receipt },
  { label: 'cat.family', icon: Users },
  { label: 'cat.biz', icon: Briefcase },
  { label: 'cat.jobs', icon: ListChecks },
  { label: 'cat.transport', icon: Car },
  { label: 'cat.other', icon: Sparkles },
];
function Stepper({ active, t }: { active: number; t: (k: string) => string }) {
  const steps = ['menya.step1', 'menya.step2', 'menya.step3'];
  return <ol className="flex items-center gap-2" aria-label="Intambwe">{
    steps.map((s, i) => <li className="flex items-center gap-2" key={s}>
      <span className={`grid size-7 place-items-center rounded-full border text-[11px] font-bold ${i === active ? 'border-ejo-green bg-[#f1f7f4] text-ejo-green ring-4 ring-[#dcece5]' : i < active ? 'border-ejo-green bg-ejo-green text-white' : 'border-[#bfcfca] bg-white text-ejo-muted'}`}>{i < active ? <CheckCircle2 size={13}/> : i + 1}</span>
      <span className={`text-[11px] font-bold ${i === active ? 'text-ejo-ink' : 'text-ejo-muted'}`}>{t(s)}</span>
      {i < steps.length - 1 && <span className="h-px w-6 bg-ejo-border"/>}
    </li>)
  }</ol>;
}
function GuideSection({ label, value, list, t }: { label: string; value?: string | null; list?: string[] | null; t: (k: string) => string }) {
  const has = value || (list && list.length > 0);
  return <section className="border border-ejo-border bg-white p-5"><p className="eyebrow">{t(label)}</p>{has ? (list ? <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-ejo-ink">{list.map((x, i) => <li key={i}>{x}</li>)}</ul> : <p className="mt-2 break-words text-xs leading-5 text-ejo-ink">{value}</p>) : <p className="mt-2 text-xs leading-5 text-ejo-muted">{t('menya.trust')}</p>}</section>;
}
function ProviderLine({ providerId }: { providerId: string }) {
  const p = providerById.get(providerId);
  if (!p) return <span className="text-xs font-semibold text-ejo-ink">{providerId}</span>;
  return <span className="flex items-center gap-2.5"><ProviderLogo id={p.id} mark={p.mark} category={p.category} website={p.website} size="sm"/><span className="text-xs font-semibold text-ejo-ink">{p.name}</span></span>;
}
export function MenyaSerivisiPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [view, setView] = useState<'ask' | 'thinking' | 'result' | 'guide' | 'error'>('ask');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<DiscoverResult | null>(null);
  const [guide, setGuide] = useState<ServiceGuide | null>(null);
  const [lastText, setLastText] = useState('');
  useEffect(() => { if (view !== 'guide') window.scrollTo({ top: 0 }); }, [view]);
  async function run(text: string) {
    const value = text.trim();
    if (!value) return;
    setLastText(value);
    setView('thinking');
    const res = await discoverService.discover(value);
    if (!res) { setView('error'); return; }
    setResult(res);
    if (res.status === 'matched') setGuide(res.service ?? null);
    setView('result');
  }
  function submit() { run(input); setInput(''); }
  const activeStep = view === 'guide' ? 2 : view === 'result' ? 1 : 0;
  const svc = view === 'result' && result?.status === 'matched' ? result.service : null;
  const service = svc ?? guide;
  const provider = service ? providerById.get(service.providerId) : null;
  return <main className="mx-auto max-w-[1120px] px-4 py-8 md:px-10 md:py-12"><div className="mb-8"><Stepper active={activeStep} t={t}/></div>{view === 'ask' && <><header className="max-w-2xl"><p className="eyebrow">{t('menya.eyebrow')}</p><h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">{t('nav.menya')}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-ejo-muted">{t('menya.subtitle')}</p></header><section className="mt-8"><label className="block"><span className="sr-only">{t('menya.placeholder')}</span><textarea value={input} onChange={e => setInput(e.target.value)} rows={3} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }} placeholder={t('menya.placeholder')} className="w-full resize-none border border-[#a9bdb6] border-l-[3px] border-l-ejo-green bg-white p-4 text-sm leading-6 outline-none focus:border-ejo-green focus-visible:outline-2 focus-visible:outline-ejo-green md:p-5"/></label><div className="mt-3 flex flex-wrap items-center gap-3"><button onClick={submit} disabled={!input.trim()} className="inline-flex items-center gap-2 bg-ejo-blue px-6 py-3 font-display text-sm font-bold text-white hover:bg-[#0d304c] disabled:cursor-not-allowed disabled:bg-[#8fa4b0]">{t('menya.btn')}<ArrowRight size={16}/></button><span className="text-[10px] text-ejo-muted">{t('menya.hint')}</span></div></section><section className="mt-9"><div className="section-heading"><div><p className="eyebrow">{t('menya.catEyebrow')}</p><h3>{t('menya.catTitle')}</h3></div></div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-9">{categories.map(c => <button key={c.label} onClick={() => run(t(c.label))} className="flex flex-col items-center gap-2 border border-ejo-border bg-white px-2 py-4 text-center hover:border-ejo-green"><c.icon size={18} className="text-ejo-green"/><span className="text-[10px] font-bold leading-4 text-ejo-ink">{t(c.label)}</span></button>)}</div></section><section className="mt-9 border-l-[3px] border-l-ejo-green bg-white p-6"><div className="flex items-start gap-4"><Compass className="mt-0.5 shrink-0 text-ejo-green" size={22}/><div><h3 className="font-display text-base font-bold">{t('menya.noteTitle')}</h3><p className="mt-1.5 max-w-xl text-xs leading-5 text-ejo-muted">{t('menya.noteText')}</p><p className="mt-3 text-xs leading-5 text-ejo-muted">{t('menya.note2a')} <strong className="text-ejo-ink">{t('menya.note2b')}</strong> <Link to="/app/binkorere" className="font-bold text-ejo-blue hover:text-ejo-green">{t('menya.noteBink')}</Link></p></div></div></section></>}{view === 'thinking' && <div className="flex flex-col items-center gap-4 py-24 text-center"><span className="grid size-14 place-items-center rounded-xl bg-[#52616B] text-white"><span className="font-display text-xl font-extrabold">C</span></span><p className="flex items-center gap-2 text-xs text-ejo-muted"><LoaderCircle className="animate-spin text-ejo-green" size={15}/> {t('menya.thinking')}</p></div>}{view === 'error' && <section className="mx-auto max-w-md border-l-[3px] border-l-ejo-error bg-white p-6 text-center"><h2 className="font-display text-lg font-bold">{t('menya.errTitle')}</h2><p className="mt-2 text-xs leading-5 text-ejo-muted">{t('menya.errText')}</p><button onClick={() => setView('ask')} className="mt-4 inline-flex items-center gap-1 border border-ejo-blue px-4 py-2.5 font-display text-xs font-bold text-ejo-blue hover:bg-ejo-canvas">{t('menya.retry')}</button></section>}{view === 'result' && result && <div className="mx-auto max-w-2xl space-y-5">{result.status === 'clarify' ? <><section className="border-l-[3px] border-l-ejo-green bg-white p-6"><p className="text-sm leading-6 text-ejo-ink">{result.understanding}</p><p className="mt-4 eyebrow">{t('menya.clarify')}</p>{result.clarification && result.clarification.length > 0 ? <div className="mt-3 flex flex-wrap gap-2">{result.clarification.map(opt => <button key={opt} onClick={() => run(`${lastText} — ${opt}`)} className="border border-ejo-border bg-white px-4 py-2.5 text-xs font-bold text-ejo-blue hover:border-ejo-green hover:text-ejo-green">{opt}</button>)}</div> : <div className="mt-3"><textarea value={input} onChange={e => setInput(e.target.value)} rows={2} placeholder={t('menya.clarifyPlaceholder')} className="w-full resize-none border border-[#a9bdb6] p-3 text-sm leading-6 outline-none focus:border-ejo-green"/><button onClick={submit} disabled={!input.trim()} className="mt-2 inline-flex items-center gap-1.5 bg-ejo-blue px-4 py-2.5 font-display text-xs font-bold text-white hover:bg-[#0d304c] disabled:cursor-not-allowed disabled:bg-[#8fa4b0]">{t('menya.resubmit')}<ArrowRight size={13}/></button></div>}</section><button onClick={() => setView('ask')} className="inline-flex items-center gap-1 text-xs font-bold text-ejo-blue hover:text-ejo-green"><ArrowLeft size={14}/> {t('menya.back')}</button></> : svc && <><section className="border-l-[3px] border-l-ejo-green bg-white p-6"><p className="text-sm leading-6 text-ejo-ink">"{result.understanding}"</p></section><section className="border border-t-[3px] border-t-ejo-blue bg-white p-6"><p className="eyebrow">{t('menya.resultEyebrow')}</p><h2 className="mt-1 font-display text-xl font-bold">{svc.name}</h2><div className="mt-4 space-y-3 border-t border-ejo-border pt-4"><p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs"><span className="font-bold text-ejo-muted">{t('menya.providerLabel')}</span><ProviderLine providerId={svc.providerId}/></p><p className="text-xs"><span className="font-bold text-ejo-muted">{t('menya.categoryLabel')}</span> <span className="font-semibold text-ejo-ink">{t(categoryKey(result.category ?? svc.category))}</span></p><p className="text-xs"><span className="font-bold text-ejo-muted">{t('menya.reasonLabel')}</span> <span className="text-ejo-muted">{t('menya.reasonText')}</span></p></div></section><div className="grid gap-2 sm:grid-cols-3"><button onClick={() => setView('guide')} className="inline-flex items-center justify-center gap-1.5 border border-ejo-blue px-4 py-3 font-display text-xs font-bold text-ejo-blue hover:bg-ejo-canvas">{t('menya.btnRequirements')}</button><button onClick={() => setView('guide')} className="inline-flex items-center justify-center gap-1.5 border border-ejo-blue px-4 py-3 font-display text-xs font-bold text-ejo-blue hover:bg-ejo-canvas">{t('menya.btnHow')}</button><button onClick={() => navigate(`/app/ibiganiro/${svc.providerId}`)} className="inline-flex items-center justify-center gap-1.5 border border-ejo-green bg-ejo-green px-4 py-3 font-display text-xs font-bold text-white hover:bg-[#116747]">{t('menya.btnStart')}</button></div></>}</div>}{view === 'guide' && service && <div className="mx-auto max-w-3xl space-y-5"><button onClick={() => setView('result')} className="inline-flex items-center gap-1 text-xs font-bold text-ejo-blue hover:text-ejo-green"><ArrowLeft size={14}/> {t('menya.back')}</button><header className="border border-t-[3px] border-t-ejo-green bg-white p-6"><p className="eyebrow">{t(categoryKey(service.category))}</p><h1 className="mt-1 font-display text-2xl font-bold">{service.name}</h1><div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs"><span className="font-bold text-ejo-muted">{t('menya.providerLabel')}</span><ProviderLine providerId={service.providerId}/></div></header><div className="grid gap-3 md:grid-cols-2"><GuideSection label="menya.guide1" value={service.description} t={t}/><GuideSection label="menya.guide2" value={service.whoCanUse} t={t}/><GuideSection label="menya.guide3" list={service.documents} t={t}/><GuideSection label="menya.guide4" list={service.infoNeeded} t={t}/><GuideSection label="menya.guide5" list={service.steps} t={t}/><GuideSection label="menya.guide6" value={service.fees} t={t}/><GuideSection label="menya.guide7" value={service.processingTime} t={t}/><GuideSection label="menya.guide8" value={service.access} t={t}/></div><div className="border border-[#d3e5dd] bg-[#f1f7f4] p-5"><p className="text-[10px] leading-4 text-[#355a50]">{t('menya.guideNote')}</p><button onClick={() => navigate(`/app/ibiganiro/${service.providerId}`)} className="mt-4 inline-flex items-center gap-2 bg-ejo-green px-6 py-3 font-display text-sm font-bold text-white hover:bg-[#116747]">{t('menya.btnStart')}<ArrowRight size={16}/></button></div></div>}</main>;
}