import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useSaved } from '../contexts/SavedContext';
import { CITIES, CITY_KM, epithets  } from '../data/museums';
import { useMuseums } from '../contexts/MuseumsContext';
import QuizPlayer from '../components/QuizPlayer';
import ExpositionPlayer from '../components/ExpositionPlayer';
import { useState, useEffect } from 'react';
import { API_URL } from '../config';

function distKm(a, b) {
  if (a.city === b.city) return ({ kokand: 2.0, margilan: 1.2, fergana: 0.8 })[a.city] || 1.5;
  const k1 = a.city + '|' + b.city, k2 = b.city + '|' + a.city;
  return CITY_KM[k1] ?? CITY_KM[k2] ?? 50;
}

export default function MuseumPage() {
  const { museums, loading } = useMuseums();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { lang, t } = useLang();
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const { isSaved, toggleSave, markVisited } = useSaved();
  if (loading) return <div style={{padding:48, textAlign:'center', color:'var(--muted)'}}>Loading museums...</div>;

  const museum = museums.find(m => m.id === id);
  useEffect(() => { if (museum) markVisited(museum.id); window.scrollTo(0, 0); }, [id, museum, markVisited]);

  if (!museum) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>Museum not found</div>;

  const showQuiz = searchParams.get('quiz') === 'true';
  const showVisit = searchParams.get('visit') === 'true';

  if (showQuiz) return <QuizPlayer museum={museum} onBack={() => setSearchParams({})} />;
  if (showVisit) return <ExpositionPlayer museum={museum} onExit={() => setSearchParams({})} />;

  const loc = museum[lang] || museum.uz || museum.ru || museum.en;
  
  if (!loc) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>Loading localized data...</div>;

  const saved = isSaved(museum.id);
  const epithet = epithets[museum.id]?.[lang] || '';
  const cityName = CITIES[museum.city]?.[lang] || '';

  // Find nearest
  let nearestName = '', nearestKm = 0;
  let bestKm = Infinity;
  museums.forEach(o => {
    if (o.id === museum.id) return;
    const km = distKm(museum, o);
    if (km < bestKm) { 
      bestKm = km; 
      const oLoc = o[lang] || o.uz || o.ru || o.en || o;
      nearestName = oLoc.name || 'Museum'; 
      nearestKm = Math.round(km * 10) / 10; 
    }
  });

  // Parse hero images list
  let heroImages = [];
  try {
    if (museum.heroImage) {
      if (museum.heroImage.startsWith('[')) {
        heroImages = JSON.parse(museum.heroImage);
      } else {
        heroImages = [museum.heroImage];
      }
    }
  } catch (e) {
    heroImages = [museum.heroImage];
  }

  // Auto slide interval
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImgIdx(prev => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const saveStyle = saved
    ? { background: 'var(--accent)', color: 'var(--accent-fg)', border: '1px solid var(--accent)' }
    : { background: 'color-mix(in srgb, var(--surface) 84%, transparent)', color: 'var(--fg)', border: '1px solid var(--line)', backdropFilter: 'blur(4px)' };

  return (
    <section style={{ maxWidth: 1180, margin: '0 auto', padding: '22px 24px 90px', animation: 'fhFade .4s ease both' }}>
      <button onClick={() => navigate('/')} style={{ fontFamily: 'var(--font-ui)', cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: 14, padding: '6px 0', marginBottom: 18 }}>{t.backToList}</button>

      <div style={{ position: 'relative', height: 'min(52vh, 440px)', width: '100%', overflow: 'hidden', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {heroImages.length > 0 ? (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {heroImages.map((img, idx) => (
              <img
                key={idx}
                src={`${API_URL}${img}`}
                alt={`${loc.name} ${idx + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  position: 'absolute',
                  inset: 0,
                  opacity: activeImgIdx === idx ? 1 : 0,
                  transition: 'opacity 0.8s ease-in-out'
                }}
              />
            ))}
            {heroImages.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveImgIdx(prev => (prev - 1 + heroImages.length) % heroImages.length); }} 
                  style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, fontSize: 20 }}
                >
                  ‹
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveImgIdx(prev => (prev + 1) % heroImages.length); }} 
                  style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, fontSize: 20 }}
                >
                  ›
                </button>
                {/* Dots indicator */}
                <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 10 }}>
                  {heroImages.map((_, idx) => (
                    <div 
                      key={idx} 
                      onClick={(e) => { e.stopPropagation(); setActiveImgIdx(idx); }}
                      style={{ width: 8, height: 8, borderRadius: '50%', background: activeImgIdx === idx ? 'var(--accent)' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'background .3s' }} 
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ color: 'var(--muted)', fontFamily: 'var(--font-ui)', fontSize: 14, letterSpacing: '.1em' }}>{t.photoHere}</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 28 }}>
        <div style={{ maxWidth: 660 }}>
          <div style={{ fontSize: 11.5, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>{cityName} · {loc.role}</div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.03, color: 'var(--fg)', margin: '0 0 12px', letterSpacing: '-.01em' }}>{loc.name}</h1>
          <div style={{ fontSize: 20, color: 'var(--fg)', fontWeight: 600 }}>{loc.owner}</div>
          <div style={{ fontSize: 15, color: 'var(--muted)', marginTop: 5, fontStyle: 'italic' }}>{epithet} · {loc.lifespan}</div>
        </div>
        <div style={{ display: 'flex', gap: 11, flexWrap: 'wrap' }}>
          <button onClick={(e) => { e.stopPropagation(); toggleSave(museum.id); }} style={{ fontFamily: 'var(--font-ui)', cursor: 'pointer', fontSize: 15, fontWeight: 600, padding: '13px 22px', borderRadius: 99, transition: 'all .2s', ...saveStyle }}>{saved ? t.saved : t.save}</button>
          <button onClick={() => setSearchParams({ visit: 'true' })} style={{ fontFamily: 'var(--font-ui)', cursor: 'pointer', border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', padding: '13px 22px', borderRadius: 99, fontSize: 15, fontWeight: 600 }}>{t.enterVisit || 'Виртуальный тур'}</button>
          {loc.quiz && loc.quiz.length > 0 && (
            <button onClick={() => setSearchParams({ quiz: 'true' })} className="btn-primary">{t.takeQuiz}</button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 38, marginTop: 46, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 16px' }}>
            <span style={{ width: 26, height: 1, background: 'var(--accent)' }} />
            <h2 style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent)', margin: 0 }}>{t.biography}</h2>
          </div>
          <p style={{ fontSize: 18, lineHeight: 1.75, color: 'var(--fg)', margin: '0 0 44px' }}>{loc.bio}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 22px' }}>
            <span style={{ width: 26, height: 1, background: 'var(--accent)' }} />
            <h2 style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent)', margin: 0 }}>{t.timelineOfLife}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {loc.events.map((e, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '86px 1fr', gap: 20, paddingBottom: 24 }}>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 20, color: 'var(--accent)', textAlign: 'right', paddingTop: 1 }}>{e.year}</div>
                <div style={{ borderLeft: '2px solid var(--line)', paddingLeft: 22, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -6, top: 6, width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)' }} />
                  <div style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--fg)' }}>{e.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 80 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--fg)', margin: '0 0 18px' }}>{t.museumInfo}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[['address', loc.info?.address], ['founded', loc.info?.founded], ['hours', loc.info?.hours], ['entry', loc.info?.entry], ['phone', loc.info?.phone]].map(([key, val]) => (
                <div key={key}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.13em', color: 'var(--muted)', marginBottom: 3 }}>{t[key]}</div>
                  <div style={{ fontSize: 14.5, color: 'var(--fg)' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
          <div onClick={() => navigate('/map')} style={{ cursor: 'pointer', background: 'var(--accent)', color: 'var(--accent-fg)', borderRadius: 'var(--radius)', padding: '22px 24px' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.14em', opacity: .85, marginBottom: 8 }}>{t.nearest}</div>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 21, marginBottom: 4 }}>{nearestName}</div>
            <div style={{ fontSize: 14, opacity: .9 }}>{t.distance}: {nearestKm} {t.km} · {t.openMap} →</div>
          </div>
        </aside>
      </div>
    </section>
  );
}
