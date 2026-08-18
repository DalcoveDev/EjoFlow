import { Bell, CheckCircle2, ChevronRight, LoaderCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { providers } from '../../data/providers';
import { useI18n } from '../../i18n/LanguageContext';
import { memoryService, timeAgo, type ActionRecord } from '../../services/memoryService';
const SEEN_KEY = 'ejoflow.notifSeen';
const providerById = new Map(providers.map(p => [p.id, p]));
function providerName(id: string) { return id === 'binkorere' ? 'Binkorere AI' : providerById.get(id)?.name ?? 'EjoChat'; }
function actionLabel(action: string, t: (k: string) => string) { return t(`act.lbl.${action}`) === `act.lbl.${action}` ? t('act.lbl.other') : t(`act.lbl.${action}`); }
export function NotificationBell() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ActionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [seen, setSeen] = useState<number>(() => Number(localStorage.getItem(SEEN_KEY) ?? 0));
  useEffect(() => { let cancelled = false; memoryService.actions(20).then(a => { if (!cancelled) { setItems(a); setLoading(false); } }); return () => { cancelled = true; }; }, []);
  const unread = items.filter(a => new Date(a.created_at).getTime() > seen).length;
  function openBell() { const next = !open; setOpen(next); if (next) { const now = Date.now(); localStorage.setItem(SEEN_KEY, String(now)); setSeen(now); } }
  return <div className="relative"><button onClick={openBell} aria-expanded={open} aria-label={t('ui.bell')} className="relative grid size-11 place-items-center text-ejo-blue"><Bell size={19}/>{unread > 0 && <span className="absolute right-3 top-3 size-2 rounded-full bg-ejo-amber ring-2 ring-white"/>}</button>{open && <div className="absolute right-0 top-12 z-40 w-80 border border-ejo-border bg-white shadow-[0_10px_24px_rgba(23,37,47,.12)]"><div className="flex items-center justify-between border-b border-ejo-border px-4 py-3"><strong className="font-display text-sm">{t('ui.bell')}</strong>{unread > 0 && <span className="rounded-full bg-ejo-amber px-2 py-0.5 text-[10px] font-bold text-[#3d2f0a]">{unread}</span>}</div><div className="max-h-80 overflow-y-auto">{loading ? <div className="flex items-center gap-2 p-6 text-xs text-ejo-muted"><LoaderCircle className="animate-spin text-ejo-green" size={15}/>…</div> : items.length === 0 ? <div className="p-6 text-center text-xs text-ejo-muted">{t('notif.empty')}</div> : <ul className="divide-y divide-ejo-border">{items.slice(0, 10).map(a => <li key={a.id}><button onClick={() => { setOpen(false); navigate('/app/ibikorwa'); }} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-ejo-canvas">{a.ok === 1 ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-ejo-green"/> : <XCircle size={16} className="mt-0.5 shrink-0 text-ejo-error"/>}<span className="min-w-0 flex-1"><strong className="block truncate text-xs font-bold text-ejo-ink">{providerName(a.provider_id)}</strong><span className="block truncate text-[11px] text-ejo-muted">{actionLabel(a.action, t)}</span><small className="text-[10px] text-[#8fa09b]">{timeAgo(a.created_at)}</small></span></button></li>)}</ul>}</div><button onClick={() => { setOpen(false); navigate('/app/ibikorwa'); }} className="flex w-full items-center justify-center gap-1 border-t border-ejo-border py-2.5 text-[11px] font-bold text-ejo-blue hover:bg-ejo-canvas">{t('notif.all')}<ChevronRight size={13}/></button></div>}</div>;
}