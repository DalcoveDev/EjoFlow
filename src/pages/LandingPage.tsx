import { ArrowRight, CheckCircle2, Lock, MessageSquareText, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/LanguageContext';
export function LandingPage() {
  const { t, t2 } = useI18n();
  const steps = [
    { icon: MessageSquareText, title: t('land.step1t'), text: t('land.step1x') },
    { icon: Zap, title: t('land.step2t'), text: t('land.step2x') },
    { icon: CheckCircle2, title: t('land.step3t'), text: t('land.step3x') },
  ];
  return <div className="min-h-screen bg-ejo-canvas">
    <header className="fixed inset-x-0 top-0 z-30 border-b border-ejo-border bg-white/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 md:px-8">
      <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-ejo-blue"><span className="grid size-7 place-items-center rounded-full bg-ejo-blue text-lg text-white">e</span><span className="hidden min-[380px]:inline">Ejo<span className="text-ejo-green">Flow</span></span></Link>
      <nav className="ml-auto hidden items-center gap-5 text-xs font-bold text-ejo-muted md:flex"><a href="#ikora" className="hover:text-ejo-blue">{t('land.navHow')}</a><Link to="/app" className="hover:text-ejo-blue">{t('land.navOpen')}</Link></nav>
      <Link to="/app" className="ml-auto inline-flex items-center gap-1.5 bg-ejo-green px-4 py-2.5 text-xs font-bold text-white hover:bg-[#116747] md:ml-0">{t('land.navOpen')} <ArrowRight size={14}/></Link>
    </div></header>
    <section className="bg-ejo-blue pb-16 pt-28 text-white md:pb-24 md:pt-36"><div className="mx-auto max-w-6xl px-4 md:px-8">
      <p className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1 text-[10px] font-bold tracking-[1.5px]"><Sparkles size={12}/> {t('land.badge')}</p>
      <h1 className="mt-6 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">{t('land.h1a')} <span className="text-[#9ee3c4]">{t('land.h1b')}</span></h1>
      <p className="mt-5 max-w-xl leading-7 text-blue-100/90">{t('land.sub')}</p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link to="/app" className="inline-flex items-center gap-2 bg-ejo-green px-6 py-3.5 font-display text-sm font-bold text-white hover:bg-[#116747]">{t('land.cta1')} <ArrowRight size={16}/></Link>
        <a href="#ikora" className="inline-flex items-center gap-2 border border-white/40 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10">{t('land.cta2')}</a>
      </div>
      <ul className="mt-12 grid max-w-3xl gap-3 text-[11px] font-bold sm:grid-cols-3">
        <li className="flex items-center gap-2 border-t-2 border-ejo-green/60 pt-3"><ShieldCheck size={15} className="text-[#9ee3c4]"/> {t('land.b1')}</li>
        <li className="flex items-center gap-2 border-t-2 border-ejo-green/60 pt-3"><Lock size={15} className="text-[#9ee3c4]"/> {t('land.b2')}</li>
        <li className="flex items-center gap-2 border-t-2 border-ejo-green/60 pt-3"><CheckCircle2 size={15} className="text-[#9ee3c4]"/> {t('land.b3')}</li>
      </ul>
    </div></section>
    <section id="ikora" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:px-8 md:py-20">
      <p className="eyebrow">{t('land.howEyebrow')}</p><h2 className="max-w-xl font-display text-2xl font-bold tracking-tight md:text-3xl">{t('land.howTitle')}</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">{steps.map(({ icon: Icon, title, text }, index) => <article key={title} className="border border-ejo-border bg-white p-6">
        <span className="grid size-11 place-items-center rounded-full bg-[#dcece5] text-ejo-green"><Icon size={21}/></span>
        <small className="mt-5 block font-display text-[10px] font-bold tracking-[1px] text-ejo-muted">{t2('land.stepN', { n: String(index + 1) })}</small>
        <h3 className="mt-1 font-display text-base font-bold">{title}</h3>
        <p className="mt-2 text-xs leading-5 text-ejo-muted">{text}</p>
      </article>)}</div>
    </section>
    <section className="bg-ejo-blue"><div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 md:flex-row md:items-center md:justify-between md:px-8">
      <div><p className="eyebrow text-blue-100/80">{t('land.ctaEyebrow')}</p><h2 className="max-w-xl font-display text-2xl font-bold text-white">{t('land.ctaTitle')}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-blue-100/90">{t('land.ctaText')}</p></div>
      <Link to="/app" className="inline-flex shrink-0 items-center gap-2 bg-ejo-green px-6 py-3.5 font-display text-sm font-bold text-white hover:bg-[#116747]">{t('land.navOpen')} <ArrowRight size={16}/></Link>
    </div></section>
    <footer className="border-t border-ejo-border bg-white"><div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
      <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-ejo-blue"><span className="grid size-6 place-items-center rounded-full bg-ejo-blue text-sm text-white">e</span>Ejo<span className="text-ejo-green">Flow</span></Link>
      <p className="text-[10px] leading-4 text-ejo-muted">{t('land.footerNote')}<br/>{t('land.footerYear')}</p>
      <nav className="flex gap-4 text-[10px] font-bold text-ejo-blue"><Link to="/app/akazi-kanjye" className="hover:text-ejo-green">{t('nav.myWork')}</Link><Link to="/app" className="hover:text-ejo-green">{t('nav.services')}</Link><Link to="/app/binkorere" className="hover:text-ejo-green">{t('nav.binkorere')}</Link><Link to="/app/menya-serivisi" className="hover:text-ejo-green">{t('nav.menya')}</Link><Link to="/app/ibikorwa" className="hover:text-ejo-green">{t('nav.activity')}</Link><Link to="/app/ubufasha" className="hover:text-ejo-green">{t('nav.help')}</Link></nav>
    </div></footer>
  </div>;
}