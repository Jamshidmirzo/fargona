import { useLang } from '../contexts/LangContext';
import { useSaved } from '../contexts/SavedContext';
import { CITIES  } from '../data/museums';
import { useMuseums } from '../contexts/MuseumsContext';
import { useNavigate } from 'react-router-dom';

export default function PassportPage() {
  const { museums, loading } = useMuseums();
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const { visited, quizBest } = useSaved();
  if (loading) return <div style={{padding:48, textAlign:'center', color:'var(--muted)'}}>Loading museums...</div>;

  const total = museums.length;
  const visitedCount = museums.filter(m => visited.includes(m.id)).length;
  const pct = total ? Math.round((visitedCount / total) * 100) : 0;

  return (
    <section style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 24px 90px', animation: 'fhFade .4s ease both' }}>
      <div style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>{t.nav.passport}</div>
      <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 'clamp(30px, 4.4vw, 48px)', color: 'var(--fg)', margin: '0 0 8px' }}>{t.passportTitle}</h1>
      <p style={{ fontSize: 16, color: 'var(--muted)', margin: '0 0 34px', maxWidth: 560 }}>{t.passportText}</p>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, padding: '32px 36px', display: 'flex', alignItems: 'center', gap: 32, marginBottom: 46 }}>
        <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--surface2)', border: '4px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--accent)' }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 32, lineHeight: 1 }}>{pct}%</div>
        </div>
        <div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 24, color: 'var(--fg)', margin: '0 0 8px' }}>{t.visited}: {visitedCount} / {total}</h2>
          <div style={{ fontSize: 15, color: 'var(--muted)' }}>
            {visitedCount === 0 ? t.passportText : visitedCount === total ? t.resultGreat : t.resultGood}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
        {museums.map(m => {
          const isV = visited.includes(m.id);
          const score = quizBest[m.id];
          return (
            <div key={m.id} onClick={() => navigate(`/museum/${m.id}`)} style={{
              background: 'var(--surface)', border: `1px solid ${isV ? 'var(--accent)' : 'var(--line)'}`, borderRadius: 'var(--radius)', padding: 24, cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'transform .2s'
            }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = ''}>
              <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{CITIES[m.city]?.[lang]}</div>
              <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 18, color: 'var(--fg)', margin: '0 0 16px', lineHeight: 1.2, paddingRight: 40 }}>{(m[lang] || m.uz || m.ru || m.en || m).name}</h3>
              {isV ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--surface2)', padding: '6px 12px', borderRadius: 99, fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                  ✓ {t.visited}
                  {score != null && <span style={{ color: 'var(--fg)', marginLeft: 6 }}>· {t.quizTitle}: {score}/{((m[lang] || m.uz || m.ru || m.en || m).quiz || []).length}</span>}
                </div>
              ) : (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--surface2)', padding: '6px 12px', borderRadius: 99, fontSize: 12, color: 'var(--muted)' }}>
                  ? {t.notVisited}
                </div>
              )}
              {isV && (
                <div style={{ position: 'absolute', top: -10, right: -10, width: 70, height: 70, border: '3px solid var(--accent)', borderRadius: '50%', opacity: .15, transform: 'rotate(-15deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 14, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                  {t.visited}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
