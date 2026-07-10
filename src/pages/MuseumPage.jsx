import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import LinkText from '../components/LinkText';
import { useLang } from '../contexts/LangContext';
import { useSaved } from '../contexts/SavedContext';
import { CITIES, CITY_KM, epithets  } from '../data/museums';
import { useMuseums } from '../contexts/MuseumsContext';
import QuizPlayer from '../components/QuizPlayer';
import ExpositionPlayer from '../components/ExpositionPlayer';
import { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../config';

const MON_SHORT = {
  ru: ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'],
  uz: ['yan','fev','mar','apr','may','iyn','iyl','avg','sen','okt','noy','dek'],
  en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
};

function fmtDateNews(iso, lang) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const months = {
    ru: ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
    uz: ['yanvar','fevral','mart','aprel','may','iyun','iyul','avgust','sentabr','oktabr','noyabr','dekabr'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  };
  const mo = (months[lang] || months.en)[d.getMonth()] || '';
  return lang === 'en' ? `${mo} ${d.getDate()}, ${d.getFullYear()}` : `${d.getDate()} ${mo} ${d.getFullYear()}`;
}

function distKm(a, b) {
  if (a.city === b.city) return ({ kokand: 2.0, margilan: 1.2, fergana: 0.8 })[a.city] || 1.5;
  const k1 = a.city + '|' + b.city, k2 = b.city + '|' + a.city;
  return CITY_KM[k1] ?? CITY_KM[k2] ?? 50;
}

export default function MuseumPage() {
  // ── ALL HOOKS MUST BE AT THE TOP — no early returns before this block ──
  const { museums, loading } = useMuseums();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { lang, t } = useLang();
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const { isSaved, toggleSave, markVisited } = useSaved();
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);

  const museum = museums.find(m => m.id === id) || null;

  const heroImages = useMemo(() => {
    if (!museum?.heroImage) return [];
    try {
      return museum.heroImage.startsWith('[')
        ? JSON.parse(museum.heroImage)
        : [museum.heroImage];
    } catch {
      return [museum.heroImage];
    }
  }, [museum?.heroImage]);

  useEffect(() => {
    if (museum) markVisited(museum.id);
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [rN, rE] = await Promise.all([
          fetch(`${API_URL}/api/museums/${id}/news?lang=${lang}`),
          fetch(`${API_URL}/api/museums/${id}/events?lang=${lang}`),
        ]);
        if (rN.ok) setNews(await rN.json());
        if (rE.ok) setEvents(await rE.json());
      } catch (_) {}
    };
    load();
  }, [id, lang]);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImgIdx(prev => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);
  // ── END HOOKS ──

  if (loading) return <div style={{padding:48, textAlign:'center', color:'var(--muted)'}}>Loading museums...</div>;
  if (!museum) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>Museum not found</div>;

  const showQuiz = searchParams.get('quiz') === 'true';
  const showVisit = searchParams.get('visit') === 'true';

  if (showQuiz) return <QuizPlayer museum={museum} onBack={() => setSearchParams({})} />;
  if (showVisit) return <ExpositionPlayer museum={museum} onExit={() => setSearchParams({})} />;

  const _raw = museum[lang] || museum.uz || museum.ru || museum.en;
  if (!_raw) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>Loading localized data...</div>;
  const _fb = museum.ru || museum.en || museum.uz || {};
  const loc = new Proxy(_raw, {
    get(target, key) {
      const v = target[key];
      if (v === undefined || v === null || v === '') return _fb[key] ?? v;
      return v;
    }
  });

  const saved = isSaved(museum.id);
  const epithet = epithets[museum.id]?.[lang] || '';
  const cityName = CITIES[museum.city]?.[lang] || '';

  let nearestName = '', nearestKm = 0, bestKm = Infinity;
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
          <p style={{ fontSize: 18, lineHeight: 1.75, color: 'var(--fg)', margin: '0 0 44px' }}><LinkText text={loc.bio} /></p>

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

          {/* Zavqiy companion section — shown only on Muqimiy page */}
          {museum.id === 'muqimiy' && (() => {
            const zavqiy = museums.find(m => m.id === 'zavqiy');
            if (!zavqiy) return null;
            const zLoc = zavqiy[lang] || zavqiy.uz || {};
            const zBio = (zLoc.bio || '').substring(0, 220).trimEnd();
            const sectionLabel = { uz: 'Shu hujrada', ru: 'Также в этой хужре', en: 'Also in this complex' }[lang] || 'Также в этой хужре';
            const moreLabel   = { uz: 'Batafsil', ru: 'Подробнее', en: 'Learn more' }[lang] || 'Подробнее';
            const tourLabel   = { uz: 'Virtual tur', ru: 'Виртуальный тур', en: 'Virtual tour' }[lang] || 'Виртуальный тур';
            return (
              <div style={{ marginTop: 60, border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <div style={{ padding: '18px 28px', borderBottom: '1px solid var(--line)', background: 'var(--surface2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 26, height: 1, background: 'var(--accent)', display: 'block' }} />
                  <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--accent)' }}>{sectionLabel}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr' }}>
                  {zavqiy.heroImage && (
                    <div style={{ overflow: 'hidden', minHeight: 220 }}>
                      <img
                        src={`${API_URL}${zavqiy.heroImage}`}
                        alt={zLoc.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div style={{ padding: '28px 30px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>{zLoc.role}</div>
                    <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 30, lineHeight: 1.05, margin: '0 0 5px', color: 'var(--fg)' }}>{zLoc.name}</h3>
                    <div style={{ fontSize: 14, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 16 }}>
                      {zavqiy.birth}–{zavqiy.death} · {zLoc.lifespan}
                    </div>
                    <p style={{ fontSize: 15.5, lineHeight: 1.72, color: 'var(--fg)', margin: '0 0 24px' }}>
                      {zBio}{zBio.length >= 220 ? '…' : ''}
                    </p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => navigate('/museum/zavqiy')}
                        style={{ fontFamily: 'var(--font-ui)', cursor: 'pointer', border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', padding: '10px 22px', borderRadius: 99, fontSize: 14, fontWeight: 600 }}
                      >{moreLabel} →</button>
                      <button
                        onClick={() => navigate('/museum/zavqiy?visit=true')}
                        style={{ fontFamily: 'var(--font-ui)', cursor: 'pointer', border: 'none', background: 'var(--accent)', color: 'var(--accent-fg)', padding: '10px 22px', borderRadius: 99, fontSize: 14, fontWeight: 600 }}
                      >{tourLabel}</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* News section — Nafis style */}
          {news.length > 0 && (
            <div style={{ marginTop: 60 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 26, height: 1, background: 'var(--accent)', display: 'block' }} />
                  <h2 style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent)', margin: 0 }}>{t.museumNews || 'Новости музея'}</h2>
                </div>
                <Link to="/news" style={{ fontFamily: 'var(--font-ui)', color: 'var(--muted)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>{t.allNewsLink || 'Все новости'} →</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
                {news.map(n => (
                  <div key={n.id} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '22px 24px' }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 9 }}>{fmtDateNews(n.created_at, lang)}</div>
                    <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 21, lineHeight: 1.15, color: 'var(--fg)', margin: '0 0 9px' }}>{n.title}</h3>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.6, color: 'var(--muted)', margin: 0 }}><LinkText text={n.content} /></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events section — Nafis style */}
          {events.length > 0 && (
            <div style={{ marginTop: 52 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 26, height: 1, background: 'var(--accent)', display: 'block' }} />
                  <h2 style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent)', margin: 0 }}>{t.museumEvents || 'События и выставки'}</h2>
                </div>
                <Link to="/events" style={{ fontFamily: 'var(--font-ui)', color: 'var(--muted)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>{t.allEventsLink || 'Все события'} →</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {events.map(ev => {
                  const p = (ev.date || '').split('-');
                  const day = p[2] ? String(+p[2]) : '';
                  const monthShort = p[1] ? (MON_SHORT[lang] || MON_SHORT.en)[+p[1] - 1] || '' : '';
                  return (
                    <div key={ev.id} style={{ display: 'grid', gridTemplateColumns: '78px 1fr', gap: 20, alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '18px 22px' }}>
                      <div style={{ textAlign: 'center', borderRight: '1px solid var(--line)', paddingRight: 16 }}>
                        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 30, color: 'var(--accent)', lineHeight: 1 }}>{day}</div>
                        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: 3 }}>{monthShort}</div>
                      </div>
                      <div>
                        {ev.time && <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{ev.time}</div>}
                        <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 20, lineHeight: 1.15, color: 'var(--fg)', margin: '0 0 5px' }}>{ev.title}</h3>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.55, color: 'var(--muted)', margin: 0 }}>{ev.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
