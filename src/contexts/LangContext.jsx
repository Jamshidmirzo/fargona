import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ui } from '../data/i18n';

import { API_URL } from '../config';

const LangContext = createContext();

function unflatten(data) {
  const result = { uz: {}, ru: {}, en: {} };
  for (const item of data) {
    const key = item.key;
    const keys = key.split('.');
    
    ['uz', 'ru', 'en'].forEach(l => {
      let current = result[l];
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (i === keys.length - 1) {
          current[k] = item[l] || '';
        } else {
          current[k] = current[k] || {};
          current = current[k];
        }
      }
    });
  }
  
  // Quick fix: copy static halls array back to nested structure since it shouldn't be overridden if missing
  ['uz', 'ru', 'en'].forEach(l => {
    if (!result[l].halls && ui[l]?.halls) {
      result[l].halls = ui[l].halls;
    }
  });
  
  return result;
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem('fh_lang') || 'uz'; } catch { return 'uz'; }
  });
  const [dynamicUi, setDynamicUi] = useState(ui);

  useEffect(() => {
    try { localStorage.setItem('fh_lang', lang); } catch {}
    document.documentElement.lang = lang === 'uz' ? 'uz' : lang === 'ru' ? 'ru' : 'en';
  }, [lang]);

  useEffect(() => {
    fetch(`${API_URL}/api/site-translations`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDynamicUi(unflatten(data));
        }
      })
      .catch(err => console.error('Failed to load dynamic translations', err));
  }, []);

  const refreshTranslations = () => {
    fetch(`${API_URL}/api/site-translations`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDynamicUi(unflatten(data));
        }
      })
      .catch(err => console.error(err));
  };

  const setLang = (code) => setLangState(code);
  const t = useMemo(() => dynamicUi[lang] || dynamicUi.uz, [dynamicUi, lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t, refreshTranslations }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
