import { Bot, ListChecks, Store, type LucideIcon } from 'lucide-react'; import { useState } from 'react'; import { ProviderMark } from './ProviderMark'; import type { ProviderCategory } from '../../types';
const nativeIcons: Partial<Record<string, LucideIcon>> = { ejochat: Bot, tasks: ListChecks, ejobusiness: Store };
const nativeTone: Record<string, string> = { ejochat: 'bg-[#52616B]', tasks: 'bg-[#705342]', ejobusiness: 'bg-ejo-green' };
export function ProviderLogo({ id, mark, category, website, size = 'md' }: { id: string; mark: string; category: ProviderCategory; website?: string; size?: 'sm' | 'md' | 'lg' }) {
  const [broken, setBroken] = useState(false);
  const sizing = size === 'lg' ? 'size-14' : size === 'sm' ? 'size-9' : 'size-11';
  const iconSize = size === 'lg' ? 26 : size === 'sm' ? 17 : 21;
  const Icon = nativeIcons[id];
  if (Icon) return <span className={`grid shrink-0 place-items-center rounded-sm ${nativeTone[id]} ${sizing} text-white`}><Icon size={iconSize} strokeWidth={2.2}/></span>;
  if (!website || broken) return <ProviderMark mark={mark} category={category} size={size}/>;
  return <span className={`grid shrink-0 place-items-center overflow-hidden rounded-sm border border-ejo-border bg-white ${sizing}`}><img src={`https://www.google.com/s2/favicons?domain=${website}&sz=128`} alt="" loading="lazy" decoding="async" onError={() => setBroken(true)} className="size-full object-contain"/></span>;
}