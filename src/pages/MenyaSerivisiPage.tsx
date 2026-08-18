import { ArrowLeft, ArrowRight, Briefcase, Car, CheckCircle2, Compass, FileText, HeartPulse, Landmark, ListChecks, LoaderCircle, Receipt, Sparkles, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProviderLogo } from '../components/providers/ProviderLogo';
import { providers } from '../data/providers';
import { discoverService } from '../services/discoverService';
import type { DiscoverResult, ServiceGuide } from '../types';
const providerById = new Map(providers.map(p => [p.id, p]));
const categories = [
  { label: 'Serivisi za Leta', icon: Landmark },
  { label: 'Ubuzima', icon: HeartPulse },
  { label: 'Inyandiko', icon: FileText },
  { label: 'Imisoro', icon: Receipt },
  { label: 'Imiryango', icon: Users },
  { label: 'Ubucuruzi', icon: Briefcase },
  { label: 'Imirimo', icon: ListChecks },
  { label: 'Ubwikorezi', icon: Car },
  { label: 'Ibindi', icon: Sparkles },
];
const steps = ['Sobanura', 'Menya serivisi', 'Tangira'];
const trustNote = 'Amakuru kuri iki gice ntabwo turayemeza.';
function Stepper({ active }: { active: number }) {
  return <ol className="flex items-center gap-2" aria-label="Intambwe">{
    steps.map((s, i) => <li className="flex items-center gap-2" key={s}>
      <span className={`grid size-7 place-items-center rounded-full border text-[11px] font-bold ${i === active ? 'border-ejo-green bg-[#f1f7f4] text-ejo-green ring-4 ring-[#dcece5]' : i < active ? 'border-ejo-green bg-ejo-green text-white' : 'border-[#bfcfca] bg-white text-ejo-muted'}`}>{i < active ? <CheckCircle2 size={13}/> : i + 1}</span>
      <span className={`text-[11px] font-bold ${i === active ? 'text-ejo-ink' : 'text-ejo-muted'}`}>{s}</span>
      {i < steps.length - 1 && <span className="h-px w-6 bg-ejo-border"/>}
    </li>)
  }</ol>;
}
function GuideSection({ label, value, list }: { label: string; value?: string | null; list?: string[] | null }) {
  const has = value || (list && list.length > 0);
  return <section className="border border-ejo-border bg-white p-5"><p className="eyebrow">{label}</p>{has ? (list ? <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-ejo-ink">{list.map((x, i) => <li key={i}>{x}</li>)}</ul> : <p className="mt-2 break-words text-xs leading-5 text-ejo-ink">{value}</p>) : <p className="mt-2 text-xs leading-5 text-ejo-muted">{trustNote}</p>}</section>;
}
function ProviderLine({ providerId }: { providerId: string }) {
  const p = providerById.get(providerId);
  if (!p) return <span className="text-xs font-semibold text-ejo-ink">{providerId}</span>;
  return <span className="flex items-center gap-2.5"><ProviderLogo id={p.id} mark={p.mark} category={p.category} website={p.website} size="sm"/><span className="text-xs font-semibold text-ejo-ink">{p.name}</span></span>;
}
export function MenyaSerivisiPage() {
  const navigate = useNavigate();
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
  return <main className="mx-auto max-w-[1120px] px-4 py-8 md:px-10 md:py-12"><div className="mb-8"><Stepper active={activeStep}/></div>{view === 'ask' && <><header className="max-w-2xl"><p className="eyebrow">UMUYOBORO WA SERIVISI</p><h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">Menya Serivisi</h1><p className="mt-3 max-w-xl text-sm leading-6 text-ejo-muted">Ntugomba kumenya aho serivisi iboneka. Tubwire icyo ushaka gukora, EjoFlow izaguhitirira serivisi ikwiye.</p></header><section className="mt-8"><label className="block"><span className="sr-only">Icyo ushaka gukora</span><textarea value={input} onChange={e => setInput(e.target.value)} rows={3} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }} placeholder="Urashaka gukora iki? Sobanura mu magambo yawe..." className="w-full resize-none border border-[#a9bdb6] border-l-[3px] border-l-ejo-green bg-white p-4 text-sm leading-6 outline-none focus:border-ejo-green focus-visible:outline-2 focus-visible:outline-ejo-green md:p-5"/></label><div className="mt-3 flex flex-wrap items-center gap-3"><button onClick={submit} disabled={!input.trim()} className="inline-flex items-center gap-2 bg-ejo-blue px-6 py-3 font-display text-sm font-bold text-white hover:bg-[#0d304c] disabled:cursor-not-allowed disabled:bg-[#8fa4b0]">Sobanurira<ArrowRight size={16}/></button><span className="text-[10px] text-ejo-muted">Urugero: "Nshaka kubona passport" · "Nshaka kwishyura Mutuelle" · "Nshaka gutangira business"</span></div></section><section className="mt-9"><div className="section-heading"><div><p className="eyebrow">IBYICIRO BYIHUTA</p><h3>Hitamo icyiciro cya serivisi</h3></div></div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-9">{categories.map(c => <button key={c.label} onClick={() => run(c.label)} className="flex flex-col items-center gap-2 border border-ejo-border bg-white px-2 py-4 text-center hover:border-ejo-green"><c.icon size={18} className="text-ejo-green"/><span className="text-[10px] font-bold leading-4 text-ejo-ink">{c.label}</span></button>)}</div></section><section className="mt-9 border-l-[3px] border-l-ejo-green bg-white p-6"><div className="flex items-start gap-4"><Compass className="mt-0.5 shrink-0 text-ejo-green" size={22}/><div><h3 className="font-display text-base font-bold">Ntazi aho watangirira?</h3><p className="mt-1.5 max-w-xl text-xs leading-5 text-ejo-muted">Ntacyo bitwaye. Sobanura icyo ushaka gukora, EjoFlow izagufasha kumenya serivisi ikwiye n'umuyobozi wayo.</p><p className="mt-3 text-xs leading-5 text-ejo-muted">Ushaka ko ikorwa <strong className="text-ejo-ink">akikorera</strong> (nk'imenyesha zawe)? <Link to="/app/binkorere" className="font-bold text-ejo-blue hover:text-ejo-green">Koresha Binkorere AI →</Link></p></div></div></section></>}{view === 'thinking' && <div className="flex flex-col items-center gap-4 py-24 text-center"><span className="grid size-14 place-items-center rounded-xl bg-[#52616B] text-white"><span className="font-display text-xl font-extrabold">C</span></span><p className="flex items-center gap-2 text-xs text-ejo-muted"><LoaderCircle className="animate-spin text-ejo-green" size={15}/> EjoFlow iri gutahura serivisi ikenewe…</p></div>}{view === 'error' && <section className="mx-auto max-w-md border-l-[3px] border-l-ejo-error bg-white p-6 text-center"><h2 className="font-display text-lg font-bold">Ntacyo twabonye</h2><p className="mt-2 text-xs leading-5 text-ejo-muted">Ntabwo twashoboye guhuza n'icyo ushaka ubu. Gerageza ubanditse ukundi.</p><button onClick={() => setView('ask')} className="mt-4 inline-flex items-center gap-1 border border-ejo-blue px-4 py-2.5 font-display text-xs font-bold text-ejo-blue hover:bg-ejo-canvas">Gerageza nanone</button></section>}{view === 'result' && result && <div className="mx-auto max-w-2xl space-y-5">{result.status === 'clarify' ? <><section className="border-l-[3px] border-l-ejo-green bg-white p-6"><p className="text-sm leading-6 text-ejo-ink">{result.understanding}</p><p className="mt-4 eyebrow">NDASHAKA KUMENYA NTIBA USHAKA</p>{result.clarification && result.clarification.length > 0 ? <div className="mt-3 flex flex-wrap gap-2">{result.clarification.map(opt => <button key={opt} onClick={() => run(`${lastText} — ${opt}`)} className="border border-ejo-border bg-white px-4 py-2.5 text-xs font-bold text-ejo-blue hover:border-ejo-green hover:text-ejo-green">{opt}</button>)}</div> : <div className="mt-3"><textarea value={input} onChange={e => setInput(e.target.value)} rows={2} placeholder="Sobanura bundi bushobozi icyo ushaka gukora..." className="w-full resize-none border border-[#a9bdb6] p-3 text-sm leading-6 outline-none focus:border-ejo-green"/><button onClick={submit} disabled={!input.trim()} className="mt-2 inline-flex items-center gap-1.5 bg-ejo-blue px-4 py-2.5 font-display text-xs font-bold text-white hover:bg-[#0d304c] disabled:cursor-not-allowed disabled:bg-[#8fa4b0]">Ongera usobanure<ArrowRight size={13}/></button></div>}</section><button onClick={() => setView('ask')} className="inline-flex items-center gap-1 text-xs font-bold text-ejo-blue hover:text-ejo-green"><ArrowLeft size={14}/> Subira ku mwanya wa mbere</button></> : svc && <><section className="border-l-[3px] border-l-ejo-green bg-white p-6"><p className="text-sm leading-6 text-ejo-ink">"{result.understanding}"</p></section><section className="border border-t-[3px] border-t-ejo-blue bg-white p-6"><p className="eyebrow">SERIVISI ISHOBOZA KUGUFASHA</p><h2 className="mt-1 font-display text-xl font-bold">{svc.name}</h2><div className="mt-4 space-y-3 border-t border-ejo-border pt-4"><p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs"><span className="font-bold text-ejo-muted">Umutanga serivisi:</span><ProviderLine providerId={svc.providerId}/></p><p className="text-xs"><span className="font-bold text-ejo-muted">Icyiciro:</span> <span className="font-semibold text-ejo-ink">{result.category ?? svc.category}</span></p><p className="text-xs"><span className="font-bold text-ejo-muted">Impamvu:</span> <span className="text-ejo-muted">Niho iyi serivisi iboneka muri EjoFlow.</span></p></div></section><div className="grid gap-2 sm:grid-cols-3"><button onClick={() => setView('guide')} className="inline-flex items-center justify-center gap-1.5 border border-ejo-blue px-4 py-3 font-display text-xs font-bold text-ejo-blue hover:bg-ejo-canvas">Reba ibisabwa</button><button onClick={() => setView('guide')} className="inline-flex items-center justify-center gap-1.5 border border-ejo-blue px-4 py-3 font-display text-xs font-bold text-ejo-blue hover:bg-ejo-canvas">Menya uko bikorwa</button><button onClick={() => navigate(`/app/ibiganiro/${svc.providerId}`)} className="inline-flex items-center justify-center gap-1.5 border border-ejo-green bg-ejo-green px-4 py-3 font-display text-xs font-bold text-white hover:bg-[#116747]">Tangira Serivisi</button></div></>}</div>}{view === 'guide' && service && <div className="mx-auto max-w-3xl space-y-5"><button onClick={() => setView('result')} className="inline-flex items-center gap-1 text-xs font-bold text-ejo-blue hover:text-ejo-green"><ArrowLeft size={14}/> Subira</button><header className="border border-t-[3px] border-t-ejo-green bg-white p-6"><p className="eyebrow">{service.category}</p><h1 className="mt-1 font-display text-2xl font-bold">{service.name}</h1><div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs"><span className="font-bold text-ejo-muted">Umutanga serivisi:</span><ProviderLine providerId={service.providerId}/></div></header><div className="grid gap-3 md:grid-cols-2"><GuideSection label="IYI SERIVISI IKORA IKI?" value={service.description}/><GuideSection label="NDE USHOBOZA KUYIKORESHA?" value={service.whoCanUse}/><GuideSection label="INYANDIKO BISABWA" list={service.documents}/><GuideSection label="AMAKURU BISABA" list={service.infoNeeded}/><GuideSection label="INTAMBWE Z'IGIKORWA" list={service.steps}/><GuideSection label="AMAFARANGA" value={service.fees}/><GuideSection label="IGIHE GISABWA" value={service.processingTime}/><GuideSection label="AHO UBONEKA" value={service.access}/></div><div className="border border-[#d3e5dd] bg-[#f1f7f4] p-5"><p className="text-[10px] leading-4 text-[#355a50]">Amakuru yemejwe ya serivisi ni aya mafilika arimo. Niba icyiciro cyahariwe, bisobanura ko EjoFlow itarabyemeza ubu — reba umuyobozi ushinzwe serivisi mbere yo gukora.</p><button onClick={() => navigate(`/app/ibiganiro/${service.providerId}`)} className="mt-4 inline-flex items-center gap-2 bg-ejo-green px-6 py-3 font-display text-sm font-bold text-white hover:bg-[#116747]">Tangira Serivisi<ArrowRight size={16}/></button></div></div>}</main>;
}