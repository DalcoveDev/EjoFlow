import { CircleHelp, Lock, MessageSquareText, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/LanguageContext';
export function HelpPage() {
  const { t } = useI18n();
  const steps = [
    { icon: MessageSquareText, title: t('help.step1t'), text: t('help.step1x') },
    { icon: Sparkles, title: t('help.step2t'), text: t('help.step2x') },
    { icon: ShieldCheck, title: t('help.step3t'), text: t('help.step3x') },
  ];
  const faqs = [
    { q: t('help.faq1q'), a: t('help.faq1a') },
    { q: t('help.faq2q'), a: t('help.faq2a') },
    { q: t('help.faq3q'), a: t('help.faq3a') },
    { q: t('help.faq4q'), a: t('help.faq4a') },
  ];
  return <main className="mx-auto max-w-[1120px] px-4 py-8 md:px-10 md:py-12"><header className="mb-8"><p className="eyebrow">{t('help.eyebrow')}</p><h2 className="font-display text-2xl font-bold">{t('help.title')}</h2><p className="mt-2 text-sm text-ejo-muted">{t('help.subtitle')}</p></header><section className="mb-8 grid gap-3 md:grid-cols-3">{steps.map((s, i) => <article className="border border-t-[3px] border-t-ejo-green bg-white p-5" key={s.title}><s.icon className="text-ejo-green" size={20}/><h3 className="mt-3 font-display text-sm font-bold"><span className="mr-1 text-ejo-green">{i + 1}.</span>{s.title}</h3><p className="mt-2 text-xs leading-5 text-ejo-muted">{s.text}</p></article>)}</section><section className="border border-ejo-border bg-white p-6"><h3 className="flex items-center gap-2 font-display text-base font-bold"><CircleHelp className="text-ejo-green" size={18}/> {t('help.faqTitle')}</h3><div className="mt-4 divide-y divide-ejo-border">{faqs.map(f => <details className="group py-3" key={f.q}><summary className="cursor-pointer list-none text-xs font-bold text-ejo-ink marker:hidden group-open:text-ejo-blue">{f.q}</summary><p className="mt-2 text-xs leading-5 text-ejo-muted">{f.a}</p></details>)}</div></section><section className="mt-6 flex flex-col items-start justify-between gap-4 border border-[#d3e5dd] bg-[#f1f7f4] p-5 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><Lock className="shrink-0 text-ejo-green" size={18}/><p className="text-xs leading-5 text-[#355a50]"><strong className="block text-sm">{t('help.ctaTitle')}</strong>{t('help.ctaText')}</p></div><Link to="/app/ibiganiro/ejochat" className="shrink-0 border border-ejo-blue bg-ejo-blue px-4 py-2.5 font-display text-xs font-bold text-white hover:bg-[#0d304c]">{t('help.ctaBtn')}</Link></section></main>;
}