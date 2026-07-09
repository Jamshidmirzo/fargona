import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ui } from '../data/i18n';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem('fh_lang') || 'uz'; } catch { return 'uz'; }
  });

  useEffect(() => {
    try { localStorage.setItem('fh_lang', lang); } catch {}
    document.documentElement.lang = lang === 'uz' ? 'uz' : lang === 'ru' ? 'ru' : 'en';
  }, [lang]);

  const setLang = (code) => setLangState(code);
  const t = useMemo(() => ui[lang] || ui.uz, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
