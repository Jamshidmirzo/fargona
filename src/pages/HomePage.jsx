import { useState, useMemo } from 'react';
import { useLang } from '../contexts/LangContext';
import { useMuseums } from '../contexts/MuseumsContext';
import MuseumCard from '../components/MuseumCard';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useIsMobile } from '../hooks/useMediaQuery';

const SORT_LABELS = {
  ru: { default: 'По умолчанию', name: 'По названию', city: 'По городу', era: 'По эпохе' },
  uz: { default: 'Standart', name: 'Nomi bo\'yicha', city: 'Shahar bo\'yicha', era: 'Davr bo\'yicha' },
  en: { default: 'Default', name: 'By name', city: 'By city', era: 'By era' },
};

function sortMuseums(museums, sortBy, lang) {
  if (sortBy === 'default') return museums;
  const list = [...museums];
  if (sortBy === 'name') {
    list.sort((a, b) => {
      const na = (a[lang] || a.uz || {}).name || '';
      const nb = (b[lang] || b.uz || {}).name || '';
      return na.localeCompare(nb);
    });
  } else if (sortBy === 'city') {
    list.sort((a, b) => (a.city || '').localeCompare(b.city || ''));
  } else if (sortBy === 'era') {
    list.sort((a, b) => (a.birth || 9999) - (b.birth || 9999));
  }
  return list;
}

export default function HomePage() {
  const { museums, loading } = useMuseums();
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('default');
  const isMobile = useIsMobile();

  const sortedMuseums = useMemo(() => sortMuseums(museums, sortBy, lang), [museums, sortBy, lang]);

  if (loading) return <div style={{padding:48, textAlign:'center', color:'var(--muted)'}}>Loading museums...</div>;
  const cityCount = new Set(museums.map(m => m.city)).size;
  const labels = SORT_LABELS[lang] || SORT_LABELS.ru;

  return (
    <main style={{ animation: 'fhFade .5s ease both' }}>
      {/* HERO */}
      <section style={{
        position: 'relative', maxWidth: 1240, margin: '0 auto',
        padding: isMobile ? '20px 16px 0' : '12px 40px 0'
      }}>
        <div style={{ position: 'absolute', top: '30%', left: '-2%', fontFamily: 'var(--font-head)', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(90px, 22vw, 300px)', color: 'var(--accent)', opacity: 0.06, pointerEvents: 'none', lineHeight: 0.72, zIndex: 0, letterSpacing: '-.02em' }}>
          Fargʻona
        </div>
        <div style={{
          position: 'relative', zIndex: 1, display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.05fr .95fr',
          gap: isMobile ? 32 : 56,
          alignItems: 'center',
          minHeight: isMobile ? 'auto' : '82vh'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: isMobile ? 20 : 34, animation: 'fhUp .7s ease both' }}>
              <span style={{ width: 38, height: 1, background: 'var(--accent)', display: 'inline-block' }}></span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '.32em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 500 }}>
                {t.siteSub}
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 500, fontSize: 'clamp(34px, 8vw, 84px)', lineHeight: 1.05, color: 'var(--fg)', margin: '0 0 20px', letterSpacing: '-.005em', textWrap: 'balance', animation: 'fhUp .9s ease both' }}>
              {t.heroTitle}
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? 16 : 18, lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 32px', maxWidth: 440, fontWeight: 300, textWrap: 'pretty', animation: 'fhUp 1.05s ease both' }}>
              {t.heroText}
            </p>
            <div style={{ display: 'flex', gap: isMobile ? 16 : 28, alignItems: 'center', flexWrap: 'wrap', animation: 'fhUp 1.2s ease both' }}>
              <button onClick={() => { const el = document.getElementById('museum-grid'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} style={{ fontFamily: 'var(--font-ui)', cursor: 'pointer', border: 'none', background: 'var(--accent)', color: 'var(--accent-fg)', padding: '15px 32px', borderRadius: 0, fontSize: 13, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                {t.explore}
              </button>
              <button onClick={() => navigate('/route')} style={{ fontFamily: 'var(--font-ui)', cursor: 'pointer', background: 'transparent', color: 'var(--fg)', border: 'none', padding: '6px 0', fontSize: 13, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--fg)' }}>
                {t.buildRoute}
              </button>
            </div>
          </div>

          <div style={{ animation: 'fhArch 1.2s cubic-bezier(.5,0,.2,1) both', display: 'flex', flexDirection: 'column', gap: 18, order: isMobile ? -1 : 0 }}>
            <div style={{
              position: 'relative',
              height: isMobile ? 'min(52vh, 420px)' : 'min(78vh, 644px)',
              border: '1px solid var(--line)',
              borderRadius: '50% 50% 4px 4px / 30% 30% 4px 4px',
              overflow: 'hidden', background: 'var(--surface2)'
            }}>
              <div style={{ position: 'absolute', inset: 9, border: '1px solid color-mix(in srgb, var(--accent) 45%, transparent)', borderRadius: '50% 50% 3px 3px / 30% 30% 3px 3px', zIndex: 4, pointerEvents: 'none' }}></div>
              <img src={`${API_URL}/uploads/al_farghani.jpg`} alt="Ahmad Al-Farghani" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, justifyContent: 'center' }}>
              <span style={{ width: 26, height: 1, background: 'var(--line)' }}></span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Fargʻona vodiysi · {museums.length} {t.museumsCount}
              </span>
              <span style={{ width: 26, height: 1, background: 'var(--line)' }}></span>
            </div>
          </div>
        </div>
      </section>

      {/* Ornamental divider */}
      <div style={{
        maxWidth: 1240, margin: '0 auto',
        padding: isMobile ? '48px 16px 0' : '70px 40px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: isMobile ? 12 : 20
      }}>
        <div style={{ flex: 1, maxWidth: 260, height: 1, background: 'var(--line)', transformOrigin: 'right', animation: 'fhLine 1s ease both' }}></div>
        <span style={{ width: 7, height: 7, background: 'var(--accent)', transform: 'rotate(45deg)', flex: 'none' }}></span>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
          {museums.length} · {t.museumsCount} · {cityCount} {lang === 'ru' ? 'города' : lang === 'uz' ? 'shahar' : 'cities'}
        </div>
        <span style={{ width: 7, height: 7, background: 'var(--accent)', transform: 'rotate(45deg)', flex: 'none' }}></span>
        <div style={{ flex: 1, maxWidth: 260, height: 1, background: 'var(--line)', transformOrigin: 'left', animation: 'fhLine 1s ease both' }}></div>
      </div>

      {/* INDEX */}
      <section id="museum-grid" style={{
        maxWidth: 1080, margin: '0 auto',
        padding: isMobile ? '40px 16px 60px' : '58px 40px 110px'
      }}>
        {/* Sort toolbar */}
        <div style={{
          display: 'flex', gap: 8,
          marginBottom: isMobile ? 24 : 36,
          flexWrap: isMobile ? 'nowrap' : 'wrap',
          overflowX: isMobile ? 'auto' : 'visible',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          paddingBottom: isMobile ? 4 : 0
        }}>
          {['default', 'name', 'city', 'era'].map(opt => (
            <button
              key={opt}
              onClick={() => setSortBy(opt)}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                padding: '7px 18px',
                borderRadius: 99,
                border: sortBy === opt ? 'none' : '1px solid var(--line)',
                background: sortBy === opt ? 'var(--accent)' : 'transparent',
                color: sortBy === opt ? 'var(--accent-fg)' : 'var(--muted)',
                cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              {labels[opt]}
            </button>
          ))}
        </div>
        <div>
          {sortedMuseums.map((m, i) => <MuseumCard key={m.id} museum={m} index={i} />)}
        </div>
        <div style={{ borderTop: '1px solid var(--line)' }}></div>
      </section>
    </main>
  );
}
