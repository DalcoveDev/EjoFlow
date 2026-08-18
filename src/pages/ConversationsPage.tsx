import { ChevronRight, LoaderCircle, MessageSquareText, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProviderLogo } from '../components/providers/ProviderLogo';
import { providers } from '../data/providers';
import { memoryService, timeAgo, type ConversationSummary } from '../services/memoryService';
import { useI18n } from '../i18n/LanguageContext';
const providerById = new Map(providers.map(p => [p.id, p]));
export function ConversationsPage() {
  const { t, t2 } = useI18n();
  const [convs, setConvs] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  useEffect(() => { memoryService.conversations().then(c => { setConvs(c); setLoading(false); }); }, []);
  const visible = convs.filter(c => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const name = c.provider_id === 'binkorere' ? 'Binkorere AI' : providerById.get(c.provider_id)?.name ?? 'EjoChat';
    return name.toLowerCase().includes(q) || (c.last_message ?? '').toLowerCase().includes(q);
  });
  return <main className="mx-auto max-w-[1120px] px-4 py-8 md:px-10 md:py-12"><header className="mb-8"><p className="eyebrow">{t('conv.eyebrow')}</p><h2 className="font-display text-2xl font-bold">{t('conv.title')}</h2><p className="mt-2 text-sm text-ejo-muted">{t('conv.subtitle')}</p></header>{loading ? <div className="flex items-center gap-2 py-10 text-xs text-ejo-muted"><LoaderCircle className="animate-spin text-ejo-green" size={15}/> {t('conv.loading')}</div> : convs.length === 0 ? <section className="border border-dashed border-[#b9c9c4] bg-white p-10 text-center"><MessageSquareText className="mx-auto text-ejo-green" size={26}/><h3 className="mt-4 font-display text-lg font-bold">{t('conv.emptyTitle')}</h3><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-ejo-muted">{t('conv.emptyText')}</p><Link to="/app" className="mt-5 inline-flex items-center gap-1 border border-ejo-blue bg-ejo-blue px-4 py-2.5 font-display text-xs font-bold text-white hover:bg-[#0d304c]">{t('conv.start')}<ChevronRight size={15}/></Link></section> : <><label className="mb-5 flex w-full max-w-sm items-center gap-2 border border-[#a9bdb6] border-l-[3px] border-l-ejo-green bg-white px-3 py-2.5"><Search size={15} className="shrink-0 text-ejo-green"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('conv.search')} className="w-full bg-transparent text-xs outline-none"/></label>{visible.length === 0 ? <section className="border border-dashed border-[#b9c9c4] bg-white p-8 text-center"><Search className="mx-auto text-ejo-green" size={22}/><h3 className="mt-2 font-display text-sm font-bold">{t('conv.searchEmpty')}</h3></section> : <ul className="space-y-3">{visible.map(c => { const p = providerById.get(c.provider_id); const isBink = c.provider_id === 'binkorere'; return <li key={c.id}><Link to={isBink ? '/app/binkorere' : `/app/ibiganiro/${c.provider_id}`} className="flex items-center gap-4 border border-ejo-border bg-white p-4 hover:border-ejo-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-ejo-green">{p ? <ProviderLogo id={p.id} mark={p.mark} category={p.category} website={p.website}/> : <span className={`grid size-10 place-items-center rounded-sm text-white ${isBink ? 'bg-ejo-green' : 'bg-[#52616B]'}`}><span className="font-display font-extrabold">{isBink ? 'B' : 'C'}</span></span>}<div className="min-w-0 flex-1"><strong className="block font-display text-sm">{isBink ? 'Binkorere AI' : p?.name ?? 'EjoChat'}</strong>{c.last_message ? <p className="mt-1 truncate text-xs text-ejo-muted">{c.last_message}</p> : <p className="mt-1 text-xs text-ejo-muted">{t('conv.noMessage')}</p>}</div><span className="shrink-0 text-right text-[10px] leading-4 text-ejo-muted">{timeAgo(c.updated_at)}<small className="mt-0.5 block font-bold text-ejo-blue">{t2('conv.meta', { m: String(c.message_count), a: String(c.action_count) })}</small></span><ChevronRight size={16} className="shrink-0 text-ejo-green"/></Link></li>; })}</ul>}</>}</main>;
}