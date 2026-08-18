import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { langNames, translations, type Lang } from './translations';
interface I18n { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string; t2: (key: string, vars: Record<string, string>) => string }
const Ctx = createContext<I18n | null>(null);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try { const saved = localStorage.getItem('ejoflow.lang'); return saved === 'en' || saved === 'fr' || saved === 'rw' ? saved : 'rw'; } catch { return 'rw'; }
  });
  useEffect(() => {
    try { localStorage.setItem('ejoflow.lang', lang); } catch { /* ignore */ }
    document.documentElement.lang = lang;
  }, [lang]);
  const t = (key: string) => translations[lang]?.[key] ?? translations.rw[key] ?? key;
  const t2 = (key: string, vars: Record<string, string>) => Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), t(key));
  const setLang = (l: Lang) => setLangState(l);
  return <Ctx.Provider value={{ lang, setLang, t, t2 }}>{children}</Ctx.Provider>;
}
export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useI18n must be used within LanguageProvider');
  return ctx;
}
export { langNames };
export type { Lang };