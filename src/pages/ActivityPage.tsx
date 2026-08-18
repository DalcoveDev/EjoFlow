import { CheckCircle2, History, LoaderCircle, Search, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProviderLogo } from '../components/providers/ProviderLogo';
import { providers } from '../data/providers';
import { formatDateTime, memoryService, type ActionRecord } from '../services/memoryService';
import { useI18n } from '../i18n/LanguageContext';
const providerById = new Map(providers.map(p => [p.id, p]));
function friendlyAction(action: string, t: (k: string) => string) { return t(`act.lbl.${action}`) === `act.lbl.${action}` ? t('act.lbl.other') : t(`act.lbl.${action}`); }
export function ActivityPage() {
  const { t } = useI18n();
  const [actions, setActions] = useState<ActionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  useEffect(() => { memoryService.actions().then(a => { setActions(a); setLoading(false); }); }, []);
  const okCount = actions.filter(a => a.ok === 1).length;
  const visible = actions.filter(a => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (providerById.get(a.provider_id)?.name ?? 'EjoChat').toLowerCase().includes(q) || friendlyAction(a.action, t).toLowerCase().includes(q);
  });
  return <main className="mx-auto max-w-[1120px] px-4 py-8 md:px-10 md:py-12"><header className="mb-8"><p className="eyebrow">{t('act.eyebrow')}</p><h2 className="font-display text-2xl font-bold">{t('act.title')}</h2><p className="mt-2 text-sm text-ejo-muted">{t('act.subtitle')}</p></header>{loading ? <div className="flex items-center gap-2 py-10 text-xs text-ejo-muted"><LoaderCircle className="animate-spin text-ejo-green" size={15}/> {t('act.loading')}</div> : actions.length === 0 ? <section className="border border-dashed border-[#b9c9c4] bg-white p-10 text-center"><History className="mx-auto text-ejo-green" size={26}/><h3 className="mt-4 font-display text-lg font-bold">{t('act.emptyTitle')}</h3><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-ejo-muted">{t('act.emptyText')}</p><Link to="/app" className="mt-5 inline-flex items-center gap-1 border border-ejo-blue bg-ejo-blue px-4 py-2.5 font-display text-xs font-bold text-white hover:bg-[#0d304c]">{t('act.start')}</Link></section> : <><div className="mb-5 flex flex-wrap items-center gap-2"><label className="flex w-full max-w-sm items-center gap-2 border border-[#a9bdb6] border-l-[3px] border-l-ejo-green bg-white px-3 py-2.5"><Search size={15} className="shrink-0 text-ejo-green"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('act.search')} className="w-full bg-transparent text-xs outline-none"/></label><span className="border border-[#d3e5dd] bg-[#f1f7f4] px-3 py-2 text-xs font-bold text-[#355a50]">{t('act.all')}: {actions.length}</span><span className="border border-[#d3e5dd] bg-[#f1f7f4] px-3 py-2 text-xs font-bold text-[#355a50]">{t('act.ok')}: {okCount}</span><span className="border border-[#ecd7a7] bg-[#fff7e7] px-3 py-2 text-xs font-bold text-[#77541b]">{t('act.bad')}: {actions.length - okCount}</span></div>{visible.length === 0 ? <section className="border border-dashed border-[#b9c9c4] bg-white p-8 text-center"><Search className="mx-auto text-ejo-green" size={22}/><h3 className="mt-2 font-display text-sm font-bold">{t('act.searchEmpty')}</h3></section> : <ul className="space-y-3">{visible.map(a => { const p = providerById.get(a.provider_id); const ok = a.ok === 1; return <li key={a.id} className="flex items-center gap-4 border border-ejo-border bg-white p-4">{ok ? <CheckCircle2 className="shrink-0 text-ejo-green" size={18}/> : <XCircle className="shrink-0 text-ejo-error" size={18}/>}{p ? <ProviderLogo id={p.id} mark={p.mark} category={p.category} website={p.website} size="sm"/> : <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-[#52616B] text-white"><span className="font-display text-sm font-extrabold">C</span></span>}<div className="min-w-0 flex-1"><strong className="block text-xs font-bold">{p?.name ?? 'EjoChat'} — {friendlyAction(a.action, t)}</strong><small className={`mt-0.5 block text-[10px] ${ok ? 'text-ejo-green' : 'text-ejo-error'}`}>{ok ? t('act.okStatus') : t('act.badStatus')}</small></div><time className="shrink-0 text-[10px] text-ejo-muted">{formatDateTime(a.created_at)}</time></li>; })}</ul>}</>}</main>;
}