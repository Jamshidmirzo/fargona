import { createContext, useContext, useState, useEffect } from 'react';
import { useLang } from './LangContext';
import { API_URL } from '../config';

const MuseumsContext = createContext();

export function MuseumsProvider({ children }) {
  const { lang } = useLang();
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/museums?lang=${lang}`)
      .then(res => res.json())
      .then(data => {
        setMuseums(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch museums:', err);
        setLoading(false);
      });
  }, [lang]);

  return (
    <MuseumsContext.Provider value={{ museums, loading }}>
      {children}
    </MuseumsContext.Provider>
  );
}

export const useMuseums = () => useContext(MuseumsContext);
