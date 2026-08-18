import { Check, Download, Trash2, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useI18n } from '../i18n/LanguageContext';
export function SettingsPage() {
  const { user, updateName } = useAuth();
  const { t } = useI18n();
  const [name, setName] = useState(user?.name ?? '');
  const [saved, setSaved] = useState(false);
  const [exported, setExported] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cleared, setCleared] = useState(false);
  async function saveName() { if (!name.trim()) return; await updateName(name); setSaved(true); setTimeout(() => setSaved(false), 2500); }
  async function doExport() {
    try {
      const res = await fetch('/api/export');
      const json = await res.json();
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ejoflow-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      setExported(true); setTimeout(() => setExported(false), 2500);
    } catch { /* export failed */ }
  }
  async function clearAll() {
    if (!confirming) { setConfirming(true); setTimeout(() => setConfirming(false), 5000); return; }
    try { await fetch('/api/data/clear', { method: 'POST' }); } catch { /* clear failed */ }
    setConfirming(false); setCleared(true); setTimeout(() => setCleared(false), 3000);
  }
  return <main className="mx-auto max-w-2xl px-4 py-8 md:px-10 md:py-12"><p className="eyebrow">{t('settings.eyebrow')}</p><h2 className="font-display text-2xl font-bold">{t('settings.title')}</h2><p className="mt-2 text-sm text-ejo-muted">{t('settings.subtitle')}</p><section className="mt-7 border border-ejo-border bg-white"><div className="border-b border-ejo-border p-5"><p className="eyebrow mb-2">{t('settings.nameTitle')}</p><p className="mb-3 text-xs text-ejo-muted">{t('settings.nameText')}</p><div className="flex gap-2"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#dcece5] text-ejo-green"><UserRound size={17}/></span><input value={name} onChange={e => setName(e.target.value)} placeholder={t('ui.user')} className="min-w-0 flex-1 border border-[#a9bdb6] border-l-[3px] border-l-ejo-green bg-white px-3 py-2.5 text-xs outline-none focus:border-ejo-green"/><button onClick={saveName} disabled={!name.trim()} className="shrink-0 border border-ejo-blue bg-ejo-blue px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0d304c] disabled:cursor-not-allowed disabled:bg-[#a8b8b3]">{saved ? <span className="inline-flex items-center gap-1"><Check size={13}/>{t('settings.saved')}</span> : t('settings.save')}</button></div></div><div className="border-b border-ejo-border p-5"><div className="flex items-start justify-between gap-3"><span><strong className="block font-display text-sm">{t('settings.exportTitle')}</strong><small className="mt-1 block text-xs text-ejo-muted">{t('settings.exportText')}</small></span><button onClick={doExport} className="shrink-0 border border-ejo-green bg-[#f1f7f4] px-4 py-2.5 text-xs font-bold text-ejo-green hover:bg-[#e2efe9]">{exported ? <span className="inline-flex items-center gap-1"><Check size={13}/>{t('settings.exportDone')}</span> : <span className="inline-flex items-center gap-1"><Download size={13}/>{t('settings.exportBtn')}</span>}</button></div></div><div className="p-5"><p className="mb-2 text-[10px] font-bold text-ejo-error">{t('settings.danger')}</p><div className="flex items-start justify-between gap-3"><span><strong className="block font-display text-sm">{t('settings.clearTitle')}</strong><small className="mt-1 block text-xs text-ejo-muted">{t('settings.clearText')}</small></span><button onClick={clearAll} className={`shrink-0 border px-4 py-2.5 text-xs font-bold ${confirming ? 'border-ejo-error bg-ejo-error text-white' : 'border-ejo-error text-ejo-error hover:bg-[#fff5f5]'}`}>{cleared ? t('settings.clearDone') : confirming ? t('settings.clearConfirm') : <span className="inline-flex items-center gap-1"><Trash2 size={13}/>{t('settings.clearBtn')}</span>}</button></div></div></section></main>;
}