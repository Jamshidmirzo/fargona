import { createContext, useContext, useState, useCallback } from 'react';
import { API_URL } from '../config';

const SavedContext = createContext();

function readLS(key, def) {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; } catch { return def; }
}
function writeLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export function SavedProvider({ children }) {
  const [saved, setSaved] = useState(() => readLS('fh_saved', []));
  const [visited, setVisited] = useState(() => readLS('fh_visited', []));
  const [quizBest, setQuizBest] = useState(() => readLS('fh_best', {}));

  const toggleSave = useCallback((id) => {
    setSaved(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      writeLS('fh_saved', next);
      return next;
    });
  }, []);

  const markVisited = useCallback((id) => {
    setVisited(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      writeLS('fh_visited', next);
      return next;
    });
  }, []);

  const saveQuizScore = useCallback((id, score, total = 4) => {
    setQuizBest(prev => {
      if (prev[id] != null && prev[id] >= score) return prev;
      const next = { ...prev, [id]: score };
      writeLS('fh_best', next);

      // Async report score to backend quiz-stats
      let guestName = localStorage.getItem('fh_username');
      if (!guestName) {
        guestName = `Visitor_${Math.floor(100 + Math.random() * 900)}`;
        localStorage.setItem('fh_username', guestName);
      }
      fetch(`${API_URL}/api/museums/quiz-stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: guestName, museum_id: id, score, total })
      }).catch(err => console.error('Failed to report stats', err));

      return next;
    });
  }, []);

  const isSaved = useCallback((id) => saved.includes(id), [saved]);
  const isVisited = useCallback((id) => visited.includes(id), [visited]);
  const getBestScore = useCallback((id) => quizBest[id] ?? null, [quizBest]);

  const resetProgress = useCallback(() => {
    setSaved([]); setVisited([]); setQuizBest({});
    writeLS('fh_saved', []); writeLS('fh_visited', []); writeLS('fh_best', {});
  }, []);

  return (
    <SavedContext.Provider value={{
      saved, visited, quizBest,
      toggleSave, markVisited, saveQuizScore,
      isSaved, isVisited, getBestScore, resetProgress
    }}>
      {children}
    </SavedContext.Provider>
  );
}

export const useSaved = () => useContext(SavedContext);
