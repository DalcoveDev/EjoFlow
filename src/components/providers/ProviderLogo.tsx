import { useState } from 'react'; import { ProviderMark } from './ProviderMark';
export function ProviderLogo({ id, mark, website, size = 'md' }: { id: string; mark: string; website?: string; size?: 'sm' | 'md' | 'lg' }) {
  const [broken, setBroken] = useState(false);
  const sizing = size === 'lg' ? 'size-14' : size === 'sm' ? 'size-9' : 'size-11';
  if (!website || broken) return <ProviderMark mark={mark} id={id} size={size}/>;
  return <span className={`grid shrink-0 place-items-center overflow-hidden rounded-sm border border-ejo-border bg-white ${sizing}`}><img src={`https://www.google.com/s2/favicons?domain=${website}&sz=128`} alt="" loading="lazy" decoding="async" onError={() => setBroken(true)} className="size-full object-contain"/></span>;
}