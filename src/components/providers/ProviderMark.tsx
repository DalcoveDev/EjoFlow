import type { ProviderCategory } from '../../types';
const tones: Record<ProviderCategory, string> = {
  government: 'rounded-sm bg-ejo-blue',
  communication: 'rounded-full bg-[#485d42]',
  business: 'rounded-sm bg-ejo-green',
  personal: 'rounded-sm bg-[#705342]',
  ai: 'rounded-sm bg-[#52616B]',
};
export function ProviderMark({ mark, category, size }: { mark: string; category: ProviderCategory; size?: 'sm' | 'md' | 'lg' }) { const sizing = size === 'lg' ? 'size-14 text-3xl' : size === 'md' ? 'size-11 text-2xl' : 'size-9 text-lg'; return <span className={`grid shrink-0 place-items-center ${tones[category]} ${sizing} font-display font-extrabold text-white`}>{mark}</span> }