import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLang } from '../contexts/LangContext';
import { useMuseums } from '../contexts/MuseumsContext';
import { API_URL } from '../config';
import { CITIES } from '../data/museums';
import { useIsMobile } from '../hooks/useMediaQuery';

/* ── fixed route data ─────────────────────────────────────────── */
const ROUTE = [
  { id: 'hamza',            coords: [40.5351, 70.9438], day: 1 },
  { id: 'muqimiy',          coords: [40.5284, 70.9321], day: 1 },
  { id: 'haziniy',          coords: [40.5432, 70.8341], day: 1 },
  { id: 'uvaysi',           coords: [40.4765, 71.7132], day: 2 },
  { id: 'vohidov_memorial', coords: [40.4703, 71.7225], day: 2 },
  { id: 'vohidov_house',    coords: [40.3833, 71.5167], day: 2 },
];

const YANDEX_URL = `https://yandex.com/maps/?rtext=${ROUTE.map(r => r.coords.join(',')).join('~')}&rtn=0&rtt=auto&lang=ru_RU`;
const GOOGLE_URL = `https://www.google.com/maps/dir/${ROUTE.map(r => r.coords.join(',')).join('/')}`;

const QUOTES = {
  uz: {
    hamza:            '"Yangi hayot — yangi qo\'shiq talab qiladi."',
    muqimiy:          '"So\'z — xalq ko\'ngliga yetadigan yo\'l."',
    haziniy:          '"Sukunat — eng chuqur she\'r."',
    uvaysi:           '"Sevgi — tilsiz ham gapiradi."',
    vohidov_memorial: '"O\'zbegim — mehr va g\'ururning so\'zi."',
    vohidov_house:    '"Shu yerda tug\'ildim, shu yerda — ilhom topardim."',
  },
  ru: {
    hamza:            '"Новая жизнь требует новой песни."',
    muqimiy:          '"Слово — это путь к сердцу народа."',
    haziniy:          '"Молчание — самая глубокая поэзия."',
    uvaysi:           '"Любовь говорит даже без слов."',
    vohidov_memorial: '"Ўзбегим — слово любви и гордости."',
    vohidov_house:    '"Здесь я родился, здесь нашёл вдохновение."',
  },
  en: {
    hamza:            '"A new life calls for a new song."',
    muqimiy:          '"A word is the path to the people\'s heart."',
    haziniy:          '"Silence is the deepest poetry."',
    uvaysi:           '"Love speaks even without words."',
    vohidov_memorial: '"O\'zbegim — a word of love and pride."',
    vohidov_house:    '"Here I was born, here I found inspiration."',
  },
};

const DAY = {
  uz: { 1: '1-kun · Qo\'qon', 2: '2-kun · Marg\'ilon & Oltiariq' },
  ru: { 1: 'День 1 · Коканд', 2: 'День 2 · Маргилан & Олтиарик' },
  en: { 1: 'Day 1 · Kokand',  2: 'Day 2 · Margilan & Oltiariq'   },
};

const HERO_LABEL = {
  uz: ['Shoir­lar Marshru­ti', '2 kun, 6 muzey, asrlar ilhomi', '↓ pastga suring'],
  ru: ['Маршрут Поэтов',       '2 дня, 6 музеев, века вдохновения', '↓ листайте вниз'],
  en: ["Poets' Route",          '2 days, 6 museums, centuries of inspiration', '↓ scroll down'],
};

const STOP_LABEL = {
  uz: (n) => `${n}-bekat`,
  ru: (n) => `Остановка ${n}`,
  en: (n) => `Stop ${n}`,
};

const VISIT_LABEL = {
  uz: 'Muzey sahifasi →',
  ru: 'Страница музея →',
  en: 'Museum page →',
};

const CTA = {
  uz: { ready: 'Marshrutingiz tayyor', sub: "Xaritada oching yoki PDF-qo'llanma yuklab oling.", yandex: 'Yandex Xarita', google: 'Google Maps', qrTitle: 'Muzeylar QR-kodlari', qrSub: 'Muzey sahifasiga kirish uchun skanerlang', pdfTitle: "PDF-qo'llanma", pdfSub: "Adreslar, ish vaqtlari, QR-kodlar — chop etish uchun.", pdfBtn: "PDF yuklab olish", soon: "PDF tez orada qo'shiladi" },
  ru: { ready: 'Маршрут готов', sub: 'Откройте на карте или скачайте PDF-гид.', yandex: 'Яндекс Карты', google: 'Google Maps', qrTitle: 'QR-коды музеев', qrSub: 'Отсканируйте для перехода к странице музея', pdfTitle: 'PDF-гид', pdfSub: 'Адреса, часы работы, QR-коды — всё для распечатки.', pdfBtn: 'Скачать PDF', soon: 'PDF-гид скоро появится' },
  en: { ready: 'Your route is ready', sub: 'Open on a map or download the PDF guide.', yandex: 'Yandex Maps', google: 'Google Maps', qrTitle: 'Museum QR Codes', qrSub: 'Scan to visit each museum page', pdfTitle: 'PDF Guide', pdfSub: 'Addresses, hours, QR codes — everything to print.', pdfBtn: 'Download PDF', soon: 'PDF guide coming soon' },
};

/* ── leaflet helpers ───────────────────────────────────────────── */
const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
});
const activeIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [30, 49], iconAnchor: [15, 49],
});

function MapFlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 14, { duration: 1.6, easeLinearity: 0.2 });
  }, [coords?.toString()]);
  return null;
}

/* ── helpers ───────────────────────────────────────────────────── */
function getHero(m) {
  if (!m?.heroImage) return null;
  try {
    if (m.heroImage.startsWith('[')) {
      const arr = JSON.parse(m.heroImage);
      return arr[0] ? `${API_URL}${arr[0]}` : null;
    }
    return `${API_URL}${m.heroImage}`;
  } catch { return null; }
}

/* ── component ─────────────────────────────────────────────────── */
export default function RoutePage() {
  const { museums, loading } = useMuseums();
  const { lang } = useLang();
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRefs = useRef([]);
  const isMobile = useIsMobile();

  const l   = CTA[lang]   || CTA.ru;
  const day = DAY[lang]   || DAY.ru;
  const q   = QUOTES[lang] || QUOTES.ru;
  const [heroTitle, heroSub, heroScroll] = HERO_LABEL[lang] || HERO_LABEL.ru;

  /* intersection observer — drives the map */
  useEffect(() => {
    const obs = sectionRefs.current.map((el, idx) => {
      if (!el) return null;
      const o = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActiveIdx(idx); },
        { threshold: 0.45 }
      );
      o.observe(el);
      return o;
    });
    return () => obs.forEach(o => o?.disconnect());
  }, [sectionRefs.current.length]);

  if (loading) return <div style={{ padding: 64, textAlign: 'center', color: 'var(--muted)' }}>…</div>;

  const routeMuseums = ROUTE.map(r => {
    const m = museums.find(x => x.id === r.id);
    return m ? { ...m, ...r } : null;
  }).filter(Boolean);

  const activeCoords = ROUTE[Math.min(activeIdx, ROUTE.length - 1)]?.coords;

  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden' }}>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <div style={{
        height: '100vh', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)',
        overflow: 'hidden',
      }}>
        {/* decorative big number backdrop */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'clamp(200px, 40vw, 480px)', fontFamily: 'var(--font-head)', fontWeight: 900,
          color: 'var(--accent)', opacity: 0.04, userSelect: 'none', lineHeight: 1,
        }}>6</div>

        {/* dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 18%, transparent) 1px, transparent 1px)',
          backgroundSize: '36px 36px', opacity: 0.5,
        }} />

        {/* accent gradient top-right */}
        <div style={{
          position: 'absolute', top: -120, right: -120,
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 20%, transparent), transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', textAlign: 'center', padding: '0 24px', maxWidth: 700 }}>
          <div style={{ fontSize: 11, letterSpacing: '.35em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 22, fontFamily: 'var(--font-ui)', fontWeight: 600 }}>
            Farg'ona vodiysi · Ферганская долина
          </div>

          <h1 style={{
            fontFamily: 'var(--font-head)', fontSize: 'clamp(46px, 8vw, 96px)',
            fontWeight: 900, color: 'var(--fg)', margin: '0 0 22px', lineHeight: 1.0,
          }}>
            {heroTitle}
          </h1>

          <p style={{ fontSize: 17, color: 'var(--muted)', margin: '0 auto 52px', lineHeight: 1.65, maxWidth: 440 }}>
            {heroSub}
          </p>

          {/* stop dots */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 60 }}>
            {ROUTE.map((r, i) => (
              <div key={r.id} style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '2px solid color-mix(in srgb, var(--accent) 45%, transparent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-head)',
                background: i === 0 ? 'var(--accent)' : 'transparent',
                color: i === 0 ? 'var(--accent-fg)' : 'var(--accent)',
              }}>{i + 1}</div>
            ))}
          </div>

          <div style={{ fontSize: 13, color: 'var(--muted)', letterSpacing: '.18em', textTransform: 'uppercase', animation: 'pulse 2s ease infinite' }}>
            {heroScroll}
          </div>
        </div>
      </div>

      {/* ── SCROLLYTELLING ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '42% 58%' }}>

        {/* STICKY MAP (desktop only) — on mobile it becomes a fixed-height
            hero block that scrolls with the rest of the page, so the user
            can freely scroll to the story sections below. */}
        <div style={{
          position: isMobile ? 'relative' : 'sticky',
          top: isMobile ? 'auto' : 0,
          height: isMobile ? 320 : '100vh',
          overflow: 'hidden',
          zIndex: 5,
          borderBottom: isMobile ? '1px solid var(--line)' : 'none',
        }}>
          <MapContainer
            center={ROUTE[0].coords}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            scrollWheelZoom={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapFlyTo coords={activeCoords} />
            {routeMuseums.map((m, i) => {
              const name = (m[lang] || m.uz || m.ru || m.en || m).name || m.id;
              return (
                <Marker key={m.id} position={m.coords} icon={i === activeIdx ? activeIcon : markerIcon}>
                  <Popup>{name}</Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* overlay: stop counter */}
          <div style={{
            position: 'absolute', top: 18, left: 18,
            background: 'color-mix(in srgb, var(--surface) 90%, transparent)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--line)',
            borderRadius: 12, padding: '10px 18px',
            display: 'flex', alignItems: 'baseline', gap: 4,
          }}>
            <span style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 800, color: 'var(--accent)' }}>
              {activeIdx + 1}
            </span>
            <span style={{ fontSize: 15, color: 'var(--muted)' }}>/ {routeMuseums.length}</span>
          </div>

          {/* overlay: day badge */}
          <div style={{
            position: 'absolute', bottom: 18, left: 18,
            background: 'var(--accent)', borderRadius: 99,
            padding: '7px 16px',
            color: 'var(--accent-fg)', fontFamily: 'var(--font-ui)',
            fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase',
          }}>
            {day[ROUTE[Math.min(activeIdx, ROUTE.length - 1)]?.day]}
          </div>

          {/* route line dots on map */}
          <div style={{
            position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {ROUTE.map((_, i) => (
              <div key={i} style={{
                width: i === activeIdx ? 10 : 6,
                height: i === activeIdx ? 10 : 6,
                borderRadius: '50%',
                background: i === activeIdx ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 30%, transparent)',
                border: '2px solid var(--accent)',
                transition: 'all .3s',
              }} />
            ))}
          </div>
        </div>

        {/* SCROLLABLE MUSEUM SECTIONS */}
        <div>
          {routeMuseums.map((m, idx) => {
            const name   = (m[lang] || m.uz || m.ru || m.en || m).name || m.id;
            const info   = ((m[lang] || m.uz || m.ru || m.en || m).info) || {};
            const hero   = getHero(m);
            const isFirstOfDay = idx === 0 || ROUTE[idx].day !== ROUTE[idx - 1].day;

            return (
              <div
                key={m.id}
                ref={el => { sectionRefs.current[idx] = el; }}
                style={{
                  minHeight: isMobile ? '70vh' : '100vh', position: 'relative',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  padding: isMobile ? '48px 20px' : '80px 52px',
                  borderBottom: '1px solid var(--line)',
                  overflow: 'hidden',
                }}
              >
                {/* bg photo tint */}
                {hero && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `url(${hero})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    opacity: 0.055, pointerEvents: 'none',
                  }} />
                )}

                {/* large ghost number */}
                <div style={{
                  position: 'absolute', top: 16, right: 36,
                  fontSize: 'clamp(100px, 18vw, 180px)',
                  fontFamily: 'var(--font-head)', fontWeight: 900,
                  color: 'var(--accent)', opacity: 0.09,
                  lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
                }}>
                  {idx + 1}
                </div>

                {/* day divider */}
                {isFirstOfDay && idx > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
                    <div style={{ height: 1, flex: 1, background: 'var(--line)' }} />
                    <span style={{ fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700 }}>
                      {day[ROUTE[idx].day]}
                    </span>
                    <div style={{ height: 1, flex: 1, background: 'var(--line)' }} />
                  </div>
                )}

                <div style={{ position: 'relative' }}>
                  {/* eyebrow */}
                  <div style={{ fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12, fontWeight: 700 }}>
                    {day[ROUTE[idx].day]} · {STOP_LABEL[lang]?.(idx + 1) || `Stop ${idx + 1}`}
                  </div>

                  {/* museum name */}
                  <h2 style={{
                    fontFamily: 'var(--font-head)',
                    fontSize: 'clamp(26px, 3.8vw, 44px)',
                    fontWeight: 900, color: 'var(--fg)',
                    margin: '0 0 20px', lineHeight: 1.08,
                  }}>
                    {name}
                  </h2>

                  {/* poet quote */}
                  <blockquote style={{
                    fontFamily: 'var(--font-head)', fontSize: 18,
                    fontStyle: 'italic', color: 'var(--accent)',
                    margin: '0 0 28px', padding: '0 0 0 18px',
                    borderLeft: '3px solid var(--accent)',
                    lineHeight: 1.55, maxWidth: 400,
                  }}>
                    {q[m.id] || ''}
                  </blockquote>

                  {/* info chips */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
                    {info.hours && (
                      <Chip icon="clock">{info.hours}</Chip>
                    )}
                    {info.entry && (
                      <Chip icon="ticket">{info.entry}</Chip>
                    )}
                    {info.address && (
                      <Chip icon="pin">{info.address}</Chip>
                    )}
                  </div>

                  {/* hero photo */}
                  {hero && (
                    <div style={{ borderRadius: 14, overflow: 'hidden', height: 180, marginBottom: 28, boxShadow: '0 4px 24px rgba(0,0,0,.12)' }}>
                      <img src={hero} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  {/* page link */}
                  <a href={`/museum/${m.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--accent)', textDecoration: 'none', fontWeight: 700, letterSpacing: '.03em' }}>
                    {VISIT_LABEL[lang] || VISIT_LABEL.ru}
                  </a>
                </div>
              </div>
            );
          })}

          {/* ── CTA SECTION ──────────────────────────────────── */}
          <div style={{
            minHeight: isMobile ? '80vh' : '100vh',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: isMobile ? '48px 20px' : '80px 52px',
            background: 'var(--surface2)',
          }}>
            <div style={{ fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16, fontWeight: 700 }}>
              {l.ready}
            </div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: 'var(--fg)', margin: '0 0 10px' }}>
              {lang === 'uz' ? '2 kun · 6 muzey' : lang === 'en' ? '2 days · 6 museums' : '2 дня · 6 музеев'}
            </h2>
            <p style={{ fontSize: 15, color: 'var(--muted)', margin: '0 0 40px', maxWidth: 380 }}>{l.sub}</p>

            {/* MAP BUTTONS */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 56 }}>
              <a
                href={YANDEX_URL} target="_blank" rel="noopener noreferrer"
                className="btn-primary"
                style={{ textDecoration: 'none', padding: '14px 26px', fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 10, borderRadius: 99 }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {l.yandex}
              </a>
              <a
                href={GOOGLE_URL} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: 'none', padding: '14px 26px', fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1.5px solid var(--line)', borderRadius: 99, color: 'var(--fg)', fontFamily: 'var(--font-ui)', fontWeight: 600 }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {l.google}
              </a>
            </div>

            {/* QR GRID */}
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 22, color: 'var(--fg)', margin: '0 0 6px' }}>{l.qrTitle}</h3>
            <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 24px' }}>{l.qrSub}</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
              {routeMuseums.map(m => {
                const name = (m[lang] || m.uz || m.ru || m.en || m).name || m.id;
                const pageUrl = `https://fargonaabadiymeros.uz/museum/${m.id}`;
                const qrSrc  = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=000000&bgcolor=ffffff&data=${encodeURIComponent(pageUrl)}`;
                return (
                  <div key={m.id} style={{
                    background: 'var(--surface)', border: '1px solid var(--line)',
                    borderRadius: 14, padding: '18px 14px', textAlign: 'center',
                  }}>
                    <div style={{ width: 110, height: 110, margin: '0 auto 12px', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line)', background: '#fff', padding: 4 }}>
                      <img src={qrSrc} alt={name} style={{ width: '100%', height: '100%' }} loading="lazy" />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg)', lineHeight: 1.3 }}>{name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      {CITIES[m.city]?.[lang] || m.city}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PDF CTA */}
            <div style={{
              background: 'color-mix(in srgb, var(--accent) 7%, var(--surface))',
              border: '1.5px solid color-mix(in srgb, var(--accent) 28%, transparent)',
              borderRadius: 18, padding: '28px 32px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 20, flexWrap: 'wrap',
            }}>
              <div>
                <h4 style={{ fontFamily: 'var(--font-head)', fontSize: 20, color: 'var(--fg)', margin: '0 0 5px' }}>{l.pdfTitle}</h4>
                <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0, maxWidth: 320 }}>{l.pdfSub}</p>
              </div>
              <button
                onClick={() => navigate('/route/print')}
                className="btn-primary"
                style={{ padding: '13px 26px', fontSize: 14.5, display: 'flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap', borderRadius: 99 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                {l.pdfBtn}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { opacity: .45; transform: translateY(0); }
          50%      { opacity: 1;   transform: translateY(4px); }
        }
      `}</style>
    </div>
  );
}

/* ── Chip helper ──────────────────────────────────────────────── */
const ICONS = {
  clock:  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  ticket: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
  pin:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
};
function Chip({ icon, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 12.5, color: 'var(--muted)',
      background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: 99, padding: '5px 13px',
    }}>
      {ICONS[icon]}
      {children}
    </div>
  );
}
