import { createContext, useContext, useState, useEffect } from 'react';
import { useLang } from './LangContext';
import { API_URL } from '../config';

const MuseumsContext = createContext();

export function MuseumsProvider({ children }) {
  const { lang } = useLang();
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only show loading spinner on first load (no data yet)
    if (museums.length === 0) setLoading(true);
    fetch(`${API_URL}/api/museums?lang=${lang}`)
      .then(res => res.json())
      .then(data => {
        setMuseums(data.filter(m => m.id !== 'zavqiy'));
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
