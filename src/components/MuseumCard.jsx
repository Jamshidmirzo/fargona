import { useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useSaved } from '../contexts/SavedContext';
import { epithets, CITIES } from '../data/museums';

export default function MuseumCard({ museum, index, useCardView = false }) {
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const { isSaved, toggleSave } = useSaved();
  const loc = museum[lang] || museum.uz || museum.ru || museum.en || museum;
  if (!loc) return null;
  const saved = isSaved(museum.id);
  const epithet = epithets[museum.id]?.[lang] || '';
  const cityName = CITIES[museum.city]?.[lang] || '';

  if (useCardView) {
    // Keep a card version for SavedPage and PassportPage
    return (
      <article
        onClick={() => navigate(`/museum/${museum.id}`)}
        style={{
          cursor: 'pointer', background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column',
          height: '100%', transition: 'transform .2s ease, box-shadow .2s ease',
          animation: 'slideUp .6s ease both',
          animationDelay: `${index * 0.1}s`
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 24px 44px -28px rgba(0,0,0,.45)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
      >
        <div style={{ position: 'relative', height: 212, width: '100%', overflow: 'hidden', background: 'var(--surface2)', borderRadius: '40px 40px 0 0' }}>
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--font-ui)', letterSpacing: '.1em'
          }}>
            {museum.heroImage ? (
              <img src={`http://localhost:3000${museum.heroImage}`} alt={loc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : t.photoHere}
          </div>
          <div style={{
            position: 'absolute', top: 12, left: 14,
            fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15,
            color: 'var(--accent-fg)', background: 'var(--accent)',
            width: 34, height: 34, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5
          }}>{String(index + 1).padStart(2, '0')}</div>
          <button
            onClick={(e) => { e.stopPropagation(); toggleSave(museum.id); }}
            style={{
              position: 'absolute', top: 12, right: 12, zIndex: 5,
              fontFamily: 'var(--font-ui)', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              padding: '8px 13px', borderRadius: 99, transition: 'all .2s',
              ...(saved
                ? { background: 'var(--accent)', color: 'var(--accent-fg)', border: '1px solid var(--accent)' }
                : { background: 'color-mix(in srgb, var(--surface) 84%, transparent)', color: 'var(--fg)', border: '1px solid var(--line)', backdropFilter: 'blur(4px)' })
            }}
          >{saved ? t.saved : t.save}</button>
        </div>
        <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent)' }}>{loc.info?.address?.split(',')[0] || ''}</div>
          <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 24, color: 'var(--fg)', margin: 0, lineHeight: 1.12 }}>{loc.name}</h3>
          <div style={{ fontSize: 15, color: 'var(--fg)', fontWeight: 600 }}>{loc.owner}</div>
          <div style={{ fontSize: 13.5, color: 'var(--muted)', fontStyle: 'italic' }}>{epithet}</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, color: 'var(--muted)', letterSpacing: '.03em' }}>{loc.role} · {loc.lifespan}</div>
          <div style={{ marginTop: 'auto', paddingTop: 14, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{t.readMore} →</div>
        </div>
      </article>
    );
  }

  // NAFIS list item layout for HomePage
  return (
    <div
      className="nfrow"
      onClick={() => navigate(`/museum/${museum.id}`)}
      style={{
        cursor: 'pointer', display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 34, alignItems: 'center', padding: '38px 6px', borderTop: '1px solid var(--line)', animation: 'slideUp .6s ease both', animationDelay: `${index * 0.1}s`
      }}
    >
      <div style={{ fontFamily: 'var(--font-head)', fontStyle: 'italic', fontWeight: 400, fontSize: 30, color: 'var(--accent)' }}>
        {String(index + 1).padStart(2, '0')}
      </div>
      <div>
        <h3 className="nfname" style={{ fontFamily: 'var(--font-head)', fontWeight: 500, fontSize: 'clamp(26px, 3.6vw, 46px)', lineHeight: 1.05, color: 'var(--fg)', margin: 0, letterSpacing: '-.01em', transition: 'color .35s' }}>
          {loc.name}
        </h3>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--muted)', marginTop: 9, fontStyle: 'italic', fontWeight: 300 }}>
          {loc.owner} — {epithet}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10.5, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>
            {cityName}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
            {loc.lifespan}
          </div>
        </div>
        <span className="nfarrow" style={{ fontFamily: 'var(--font-head)', fontSize: 28, color: 'var(--accent)', opacity: 0, transform: 'translateX(-10px)', transition: 'opacity .35s, transform .35s' }}>
          →
        </span>
      </div>
    </div>
  );
}
