import { ArrowRight, CheckCircle2, Lock, MessageSquareText, Search, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useState } from 'react'; import { Link } from 'react-router-dom';
const groups: { name: string; note: string; items: { name: string; domain: string; fallback?: boolean }[] }[] = [
  { name: "Irembo n'ibiro bya Leta", note: 'Serivisi rusange za Leta y’u Rwanda', items: [
    { name: 'Irembo', domain: 'irembo.gov.rw' }, { name: 'RRA', domain: 'rra.gov.rw' }, { name: 'NIDA', domain: 'nida.gov.rw' }, { name: 'RSSB', domain: 'rssb.rw' }, { name: 'RDB', domain: 'rdb.rw' }, { name: 'NESA', domain: 'nesa.gov.rw' }, { name: 'MIFOTRA', domain: 'mifotra.gov.rw' }, { name: 'WASAC', domain: 'wasac.rw' }, { name: 'EUCL', domain: 'eucl.rw' }, { name: 'RURA', domain: 'rura.rw' }, { name: 'Zigama CSS', domain: 'zigamacss.rw' },
  ] },
  { name: 'Amabanki n’ubwishyu bwo mu Rwanda', note: 'Amabanki, mobile money n’amafaranga', items: [
    { name: 'Bank of Kigali', domain: 'bk.rw' }, { name: 'Equity Bank', domain: 'equitygroupholdings.com' }, { name: 'KCB Bank', domain: 'kcb.rw', fallback: true }, { name: 'Ecobank', domain: 'ecobank.com' }, { name: 'I&M Bank', domain: 'imbankgroup.com' }, { name: 'BPR Bank', domain: 'bprbank.rw', fallback: true }, { name: 'PostBank', domain: 'postbank.rw', fallback: true }, { name: 'Cogebanque', domain: 'cogebanque.co.rw', fallback: true }, { name: 'MTN Mobile Money', domain: 'mtn.com' }, { name: 'Airtel Money', domain: 'airtel.co.rw' },
  ] },
  { name: 'Email & konti', note: 'Abagenzuzi b’email bakunzwe', items: [
    { name: 'Gmail', domain: 'gmail.com' }, { name: 'Outlook', domain: 'outlook.com' }, { name: 'Yahoo Mail', domain: 'mail.yahoo.com' }, { name: 'Proton Mail', domain: 'proton.me' }, { name: 'Zoho Mail', domain: 'zoho.com' }, { name: 'iCloud Mail', domain: 'icloud.com' }, { name: 'GMX', domain: 'gmx.com' }, { name: 'AOL Mail', domain: 'aol.com' }, { name: 'Tutanota', domain: 'tuta.io' }, { name: 'Mail.com', domain: 'mail.com' },
  ] },
  { name: 'Ibiganiro & messaging', note: 'Imbuga zohereza no gukorana', items: [
    { name: 'WhatsApp', domain: 'whatsapp.com' }, { name: 'Telegram', domain: 'telegram.org' }, { name: 'Slack', domain: 'slack.com' }, { name: 'Microsoft Teams', domain: 'microsoft.com' }, { name: 'Zoom', domain: 'zoom.us' }, { name: 'Signal', domain: 'signal.org' }, { name: 'Discord', domain: 'discord.com' }, { name: 'Messenger', domain: 'messenger.com' }, { name: 'Skype', domain: 'skype.com' },
  ] },
  { name: 'Ubwishyu ku rwego mpuzamahanga', note: 'Amakarita, wallets na payment platforms', items: [
    { name: 'PayPal', domain: 'paypal.com' }, { name: 'Stripe', domain: 'stripe.com' }, { name: 'Visa', domain: 'visa.com' }, { name: 'Mastercard', domain: 'mastercard.com' }, { name: 'Apple Pay', domain: 'apple.com' }, { name: 'Google Pay', domain: 'google.com' }, { name: 'M-Pesa', domain: 'safaricom.co.ke' }, { name: 'Wave', domain: 'wave.com' }, { name: 'Chipper Cash', domain: 'chippercash.com' }, { name: 'Flutterwave', domain: 'flutterwave.com' }, { name: 'Paystack', domain: 'paystack.com' }, { name: 'Wise', domain: 'wise.com' },
  ] },
  { name: 'Inganda za terefone', note: 'Ba operator b’itangazamakuru', items: [
    { name: 'Vodafone', domain: 'vodafone.com' }, { name: 'Orange', domain: 'orange.com' }, { name: 'Safaricom', domain: 'safaricom.co.ke' }, { name: 'Telkom', domain: 'telkom.co.ke' }, { name: 'Tigo', domain: 'tigo.rw' },
  ] },
];
const steps = [
  { icon: MessageSquareText, title: 'Sobanura icyo ushaka', text: 'Andika icyifuzo cyawe mu kiganiro, nk’uko ubivuga — nta formulaires nyinshi.' },
  { icon: Zap, title: 'EjoFlow ikuyobora', text: 'Ihuza serivisi ikenewe muri Irembo, amabanki, email n’izindi — intambwe ku yindi.' },
  { icon: CheckCircle2, title: 'Emeza mbere ya byose', text: 'Usuzuma amakuru, wemeze — nta mafaranga yoherezwa utabyemeje.' },
];
function ProviderLogo({ name, domain, fallback }: { name: string; domain: string; fallback?: boolean }) {
  const [broken, setBroken] = useState(false);
  return <div className="flex min-w-0 items-center gap-2.5 border border-ejo-border bg-white px-4 py-3" title={name}>
    {broken || fallback
      ? <span className="grid size-7 shrink-0 place-items-center rounded bg-ejo-blue font-display text-xs font-extrabold text-white">{name[0]}</span>
      : <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt="" loading="lazy" decoding="async" onError={() => setBroken(true)} className="size-7 shrink-0"/>
    }<span className="truncate text-xs font-semibold text-ejo-ink">{name}</span>
  </div>;
}
export function LandingPage() {
  return <div className="min-h-screen bg-ejo-canvas">
    <header className="fixed inset-x-0 top-0 z-30 border-b border-ejo-border bg-white/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 md:px-8">
      <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-ejo-blue"><span className="grid size-7 place-items-center rounded-full bg-ejo-blue text-lg text-white">e</span><span className="hidden min-[380px]:inline">Ejo<span className="text-ejo-green">Flow</span></span></Link>
      <nav className="ml-auto hidden items-center gap-5 text-xs font-bold text-ejo-muted md:flex"><a href="#ikora" className="hover:text-ejo-blue">Ikora ute</a><a href="#serivisi" className="hover:text-ejo-blue">Serivisi zifatanije</a><Link to="/app" className="hover:text-ejo-blue">Fungura app</Link></nav>
      <Link to="/app" className="ml-auto inline-flex items-center gap-1.5 bg-ejo-green px-4 py-2.5 text-xs font-bold text-white hover:bg-[#116747] md:ml-0">Fungura app <ArrowRight size={14}/></Link>
    </div></header>
    <section className="bg-ejo-blue pb-16 pt-28 text-white md:pb-24 md:pt-36"><div className="mx-auto max-w-6xl px-4 md:px-8">
      <p className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1 text-[10px] font-bold tracking-[1.5px]"><Sparkles size={12}/> SUPER-APP YA SERIVISI · RWANDA &amp; ISI YOSE</p>
      <h1 className="mt-6 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">Serivisi zose, <span className="text-[#9ee3c4]">ahantu hamwe.</span></h1>
      <p className="mt-5 max-w-xl leading-7 text-blue-100/90">EjoFlow yegeranya serivisi za Leta, amabanki, mobile money, email n’ubwishyu — mu kiganiro kimwe. Ikubwira intambwe n’izindi, ikamanika amakuru akenewe, kandi nta kintu ikora utari wabemeje.</p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link to="/app" className="inline-flex items-center gap-2 bg-ejo-green px-6 py-3.5 font-display text-sm font-bold text-white hover:bg-[#69b894]">Tangira nonaha <ArrowRight size={16}/></Link>
        <a href="#serivisi" className="inline-flex items-center gap-2 border border-white/40 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10">Reba serivisi zifatanije</a>
      </div>
      <ul className="mt-12 grid max-w-3xl gap-3 text-[11px] font-bold sm:grid-cols-3">
        <li className="flex items-center gap-2 border-t-2 border-ejo-green/60 pt-3"><ShieldCheck size={15} className="text-[#9ee3c4]"/> Ugenzura intambwe zose</li>
        <li className="flex items-center gap-2 border-t-2 border-ejo-green/60 pt-3"><Lock size={15} className="text-[#9ee3c4]"/> Amakuru yawe ararinzwe</li>
        <li className="flex items-center gap-2 border-t-2 border-ejo-green/60 pt-3"><CheckCircle2 size={15} className="text-[#9ee3c4]"/> Nta mafaranga utabyemeje</li>
      </ul>
    </div></section>
    <section id="ikora" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:px-8 md:py-20">
      <p className="eyebrow">IKORA ITE?</p><h2 className="max-w-xl font-display text-2xl font-bold tracking-tight md:text-3xl">Intambwe eshatu gusa, uhereye ku kiganiro.</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">{steps.map(({ icon: Icon, title, text }, index) => <article key={title} className="border border-ejo-border bg-white p-6">
        <span className="grid size-11 place-items-center rounded-full bg-[#dcece5] text-ejo-green"><Icon size={21}/></span>
        <small className="mt-5 block font-display text-[10px] font-bold tracking-[1px] text-ejo-muted">INTAMBWE {index + 1}</small>
        <h3 className="mt-1 font-display text-base font-bold">{title}</h3>
        <p className="mt-2 text-xs leading-5 text-ejo-muted">{text}</p>
      </article>)}</div>
    </section>
    <section id="serivisi" className="scroll-mt-20 border-t border-ejo-border bg-white py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <p className="eyebrow">SERIVISI ZIFATANIJE</p><h2 className="max-w-2xl font-display text-2xl font-bold tracking-tight md:text-3xl">Birenze 50 by’ibiro bya Leta, amabanki, email n’ubwishyu — mu Rwanda no ku isi.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ejo-muted">EjoFlow ifatanya na serivisi ukoresha buri munsi. Ibiti byose bikorwa mu kiganiro kimwe, ugakurikirana aho byageze.</p>
        {groups.map(group => <section key={group.name} className="mt-12 first:mt-8">
          <div className="flex flex-wrap items-end justify-between gap-2 border-b border-ejo-border pb-3">
            <h3 className="font-display text-lg font-bold">{group.name}</h3><small className="text-[10px] font-bold tracking-[.8px] text-ejo-muted">{group.note.toUpperCase()}</small>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{group.items.map(item => <ProviderLogo key={item.name} name={item.name} domain={item.domain} fallback={item.fallback}/>)}</div>
        </section>)}
        <p className="mt-10 flex items-center gap-2 text-[11px] text-ejo-muted"><Search size={14} className="text-ejo-green"/> N’izindi nyinshi ziraza mu gihe kizaza — igerageza rya demo ririmo serivisi zihariye.</p>
      </div>
    </section>
    <section className="bg-ejo-blue"><div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 md:flex-row md:items-center md:justify-between md:px-8">
      <div><p className="eyebrow text-blue-100/80">BEHERA GUHEREZA IBYIFUZO</p><h2 className="max-w-xl font-display text-2xl font-bold text-white">Ufite icyifuzo? Limbika, EjoFlow irakorera.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-blue-100/90">Nta kwandika amafishi, nta kwiga uburyo buri serivisi — sobanura gusa icyo ushaka gukora.</p></div>
      <Link to="/app" className="inline-flex shrink-0 items-center gap-2 bg-ejo-green px-6 py-3.5 font-display text-sm font-bold text-white hover:bg-[#69b894]">Fungura app <ArrowRight size={16}/></Link>
    </div></section>
    <footer className="border-t border-ejo-border bg-white"><div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
      <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-ejo-blue"><span className="grid size-6 place-items-center rounded-full bg-ejo-blue text-sm text-white">e</span>Ejo<span className="text-ejo-green">Flow</span></Link>
      <p className="text-[10px] leading-4 text-ejo-muted">EjoFlow — demo ya serivisi zegeranyije. Amabara y’ibiro n’amabanki akoreshwa mu cyo kwerekana gusa.<br/>© 2026 · Rwanda &amp; isi yose</p>
      <nav className="flex gap-4 text-[10px] font-bold text-ejo-blue"><Link to="/app" className="hover:text-ejo-green">Serivisi zanjye</Link><Link to="/app/ibikorwa" className="hover:text-ejo-green">Ibikorwa</Link><Link to="/app/ubufasha" className="hover:text-ejo-green">Ubufasha</Link></nav>
    </div></footer>
  </div>;
}