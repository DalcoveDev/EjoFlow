import { Compass, MessageSquareText, Search, ShieldCheck, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProviderCard, type ProviderActivity } from '../components/providers/ProviderCard';
import { ProviderMarquee } from '../components/providers/ProviderMarquee';
import { providerService } from '../services/providerService';
import { memoryService, type ConversationSummary, type SystemStats } from '../services/memoryService';
import { useI18n } from '../i18n/LanguageContext';
import type { Provider, ProviderCategory } from '../types';
const categoryFilters: [ProviderCategory | 'all', string][] = [['all', 'filt.all'], ['government', 'filt.gov'], ['communication', 'filt.comm'], ['business', 'filt.biz'], ['personal', 'filt.pers'], ['ai', 'filt.ai']];
export function ProviderDashboardPage() {
  const { t } = useI18n();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [category, setCategory] = useState<ProviderCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const [convs, setConvs] = useState<ConversationSummary[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    providerService.list().then(setProviders);
    memoryService.conversations().then(setConvs);
    memoryService.stats().then(setStats);
  }, []);
  const activityByProvider = useMemo(() => {
    const map = new Map<string, ProviderActivity>();
    convs.forEach(c => { map.set(c.provider_id, { count: c.message_count, preview: c.last_message ?? '', updatedAt: c.updated_at }); });
    return map;
  }, [convs]);
  const visible = useMemo(() => providers.filter(provider => (category === 'all' || provider.category === category) && (provider.name.toLowerCase().includes(query.toLowerCase()) || provider.domain.toLowerCase().includes(query.toLowerCase()) || provider.description.toLowerCase().includes(query.toLowerCase()))), [providers, category, query]);
  const select = (provider: Provider) => { navigate('/app/serivisi/' + provider.id); };
  return <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-10 md:py-12"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div className="max-w-2xl"><p className="eyebrow">{t('dash.eyebrow')}</p><h2 className="font-display text-2xl font-bold tracking-tight md:text-[28px]">{t('dash.title')}</h2><p className="mt-2 max-w-xl leading-6 text-ejo-muted">{t('dash.subtitle')}</p></div><div className="flex flex-wrap items-center gap-2"><Link to="/app/binkorere" className="inline-flex items-center gap-1.5 border border-ejo-green bg-ejo-green px-4 py-2.5 font-display text-xs font-bold text-white hover:bg-[#116747]"><Zap size={14}/> Binkorere AI</Link><Link to="/app/menya-serivisi" className="inline-flex items-center gap-1.5 border border-ejo-blue bg-ejo-blue px-4 py-2.5 font-display text-xs font-bold text-white hover:bg-[#0d304c]"><Compass size={14}/> Menya Serivisi</Link></div></div>{stats && <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="flex items-center gap-3 border border-t-[3px] border-t-ejo-blue bg-white p-4"><MessageSquareText className="shrink-0 text-ejo-green" size={18}/><span><strong className="block font-display text-xl font-bold">{stats.conversations}</strong><small className="text-[10px] text-ejo-muted">{t('dash.stat1')}</small></span></div><div className="flex items-center gap-3 border border-t-[3px] border-t-ejo-blue bg-white p-4"><Zap className="shrink-0 text-ejo-green" size={18}/><span><strong className="block font-display text-xl font-bold">{stats.actions}</strong><small className="text-[10px] text-ejo-muted">{t('dash.stat2')}</small></span></div><div className="flex items-center gap-3 border border-t-[3px] border-t-ejo-blue bg-white p-4"><ShieldCheck className="shrink-0 text-ejo-green" size={18}/><span><strong className="block font-display text-xl font-bold">{stats.actionsOk}</strong><small className="text-[10px] text-ejo-muted">{t('dash.stat3')}</small></span></div></div>}{providers.length > 0 && <ProviderMarquee providers={providers} onSelect={select}/>}<section className="mt-9"><div className="section-heading"><div><p className="eyebrow">{t('dash.sectionEyebrow')}</p><h3>{t('dash.sectionTitle')}</h3></div><label className="flex w-44 items-center gap-1 border-b border-[#91a8a1] pb-1 text-ejo-green focus-within:border-ejo-blue"><Search size={15}/><input value={query} onChange={event => setQuery(event.target.value)} aria-label={t('dash.search')} placeholder={t('dash.search')} className="w-full bg-transparent text-xs outline-none"/></label></div><div className="flex flex-wrap gap-2 border-y border-ejo-border py-3" aria-label="Shungura serivisi z'ubwoko">{categoryFilters.map(([value, label]) => <button onClick={() => setCategory(value)} key={value} className={`border px-3 py-2 text-xs font-bold ${category === value ? 'border-ejo-green bg-[#f1f7f4] text-ejo-green' : 'border-ejo-border bg-white text-ejo-blue hover:border-ejo-green'}`}>{t(label)}</button>)}</div>{visible.length ? <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{visible.map(provider => <ProviderCard provider={provider} selected={false} onSelect={select} activity={activityByProvider.get(provider.id) ?? null} key={provider.id}/>)}</div> : <div className="mt-5 border border-dashed border-[#b9c9c4] bg-white p-8 text-center"><Search className="mx-auto text-ejo-green"/><h4 className="mt-2 font-display font-bold">{t('dash.emptyTitle')}</h4><p className="mt-1 text-xs text-ejo-muted">{t('dash.emptyText')}</p><button onClick={() => { setQuery(''); setCategory('all'); }} className="mt-3 border border-ejo-blue px-3 py-2 text-xs font-bold text-ejo-blue">{t('dash.clear')}</button></div>}</section></main>;
}