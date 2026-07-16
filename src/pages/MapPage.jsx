import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLang } from '../contexts/LangContext';
import { useTheme } from '../contexts/ThemeContext';
import { CITIES, MUSEUM_COORDS } from '../data/museums';
import { useMuseums } from '../contexts/MuseumsContext';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useIsMobile } from '../hooks/useMediaQuery';

/* ── tile layers ──────────────────────────────────────────────── */
const TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark:  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};

/* ── city groups — warm vintage palette ───────────────────────── */
const CITY_COLOR = { kokand: '#8B4513', margilan: '#3D6B5E', fergana: '#6B3A5E' };

/* ── map fly-to on select ─────────────────────────────────────── */
function FlyTo({ coords }) {
  const map = useMap();
  const prev = useRef(null);
  useEffect(() => {
    if (!coords || coords === prev.current) return;
    prev.current = coords;
    map.flyTo(coords, 14, { duration: 1.2, easeLinearity: 0.25 });
  }, [coords?.toString()]);
  return null;
}

/* ── custom marker ────────────────────────────────────────────── */
function makeMarker(m, isActive, langData, apiUrl) {
  let img = '';
  if (m.heroImage) {
    try {
      const src = m.heroImage.startsWith('[') ? JSON.parse(m.heroImage)[0] : m.heroImage;
      if (src) img = `${apiUrl}${src}`;
    } catch {}
  }
  const name  = langData?.name  || m.id;
  const color = CITY_COLOR[m.city] || '#C17B3A';
  const size  = isActive ? 54 : 42;

  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
        <div style="
          width:${size}px;height:${size}px;border-radius:50%;
          border:${isActive ? 3 : 2.5}px solid ${color};
          box-shadow:0 ${isActive ? 6 : 3}px ${isActive ? 20 : 10}px rgba(0,0,0,.28)
                     ${isActive ? `,0 0 0 5px ${color}33` : ''};
          overflow:hidden;background:#f0ece8;
          transition:all .3s;
          ${img ? '' : `display:flex;align-items:center;justify-content:center;`}
        ">
          ${img
            ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover;filter:sepia(.5) saturate(.7) contrast(.9);" />`
            : `<svg width="${size * .45}" height="${size * .45}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
          }
        </div>
        <div style="
          background:#f5ead6;
          color:${color};font-size:10px;font-weight:800;
          padding:2px 9px;border-radius:3px;white-space:nowrap;
          box-shadow:0 2px 8px rgba(0,0,0,.28);
          border:1px solid ${color}55;
          max-width:130px;overflow:hidden;text-overflow:ellipsis;
          letter-spacing:.03em;
          opacity:${isActive ? 1 : 0.88};
        ">${name}</div>
      </div>
    `,
    iconSize:   [140, size + 28],
    iconAnchor: [70, size + 4],
  });
}

/* ── labels ───────────────────────────────────────────────────── */
const LABELS = {
  uz: { title: 'Muzeylar xaritasi', sub: 'Muzeyga bosing — batafsil ma\'lumot chiqadi', visit: 'Muzeyga o\'tish →', nearest: 'Eng yaqin muzey', km: 'km', cityFilter: 'Shahar bo\'yicha' },
  ru: { title: 'Карта музеев',       sub: 'Кликните на музей — появится подробная карточка', visit: 'Перейти к музею →', nearest: 'Ближайший музей', km: 'км', cityFilter: 'По городу' },
  en: { title: 'Museums Map',        sub: 'Click a museum to see details', visit: 'Go to museum →', nearest: 'Nearest museum', km: 'km', cityFilter: 'By city' },
};

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function getHeroSrc(m) {
  if (!m?.heroImage) return null;
  try {
    if (m.heroImage.startsWith('[')) {
      const a = JSON.parse(m.heroImage); return a[0] ? `${API_URL}${a[0]}` : null;
    }
    return `${API_URL}${m.heroImage}`;
  } catch { return null; }
}

/* ── component ─────────────────────────────────────────────────── */
export default function MapPage() {
  const { museums, loading } = useMuseums();
  const { lang, t }         = useLang();
  const { theme }           = useTheme();
  const isMobile            = useIsMobile();
  const navigate            = useNavigate();
  const [selected, setSelected] = useState(null);
  const [cityFilter, setCityFilter] = useState('all');

  const L2 = LABELS[lang] || LABELS.ru;

  if (loading) return <div style={{ padding: 64, textAlign: 'center', color: 'var(--muted)' }}>…</div>;

  const allMuseums    = museums;
  const filteredList  = cityFilter === 'all' ? allMuseums : allMuseums.filter(m => m.city === cityFilter);
  const selectedM     = selected ? allMuseums.find(m => m.id === selected) : null;
  const selectedCoords = selectedM ? (selectedM.coords || MUSEUM_COORDS[selectedM.id] || null) : null;
  const heroSrc        = getHeroSrc(selectedM);

  /* nearest */
  let nearestName = '', nearestKm = 0;
  if (selectedM) {
    const c1 = selectedM.coords || MUSEUM_COORDS[selectedM.id];
    if (c1) {
      let best = Infinity;
      allMuseums.forEach(o => {
        if (o.id === selectedM.id) return;
        const c2 = o.coords || MUSEUM_COORDS[o.id];
        if (!c2) return;
        const d = haversineKm(c1[0], c1[1], c2[0], c2[1]);
        if (d < best) { best = d; nearestName = (o[lang] || o.uz || {}).name; nearestKm = Math.round(d * 10) / 10; }
      });
    }
  }

  const cities = [...new Set(allMuseums.map(m => m.city))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>

      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <div style={{ padding: isMobile ? '10px 16px' : '14px 28px', borderBottom: '1px solid var(--line)', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--fg)', margin: 0 }}>{L2.title}</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '2px 0 0' }}>{L2.sub}</p>
        </div>

        {/* city filter pills */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em', marginRight: 4 }}>{L2.cityFilter}:</span>
          {['all', ...cities].map(c => {
            const label = c === 'all' ? (lang === 'uz' ? 'Hammasi' : lang === 'en' ? 'All' : 'Все') : (CITIES[c]?.[lang] || c);
            const active = cityFilter === c;
            return (
              <button key={c} onClick={() => setCityFilter(c)} style={{ padding: '5px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--font-ui)', cursor: 'pointer', border: `1.5px solid ${active ? CITY_COLOR[c] || 'var(--accent)' : 'var(--line)'}`, background: active ? (CITY_COLOR[c] || 'var(--accent)') : 'transparent', color: active ? '#fff' : 'var(--muted)', transition: 'all .2s' }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── BODY: map + sidebar ─────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 340px',
        gridTemplateRows: isMobile ? '55vh 1fr' : 'none',
        overflow: 'hidden'
      }}>

        {/* MAP */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <MapContainer
            center={[40.48, 71.25]}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url={theme === 'dark' ? TILES.dark : TILES.light} />
            {/* vintage parchment style */}
            <style>{`
              .leaflet-tile-pane {
                filter: ${theme === 'dark'
                  ? 'sepia(.35) saturate(.65) brightness(.82) contrast(.88)'
                  : 'sepia(.72) saturate(.48) brightness(.97) contrast(.84) hue-rotate(-6deg)'
                };
              }
              .leaflet-container {
                background: ${theme === 'dark' ? '#1a1410' : '#e8dcc8'};
              }
            `}</style>
            <FlyTo coords={selectedCoords} />

            {allMuseums.map(m => {
              const coords  = m.coords || MUSEUM_COORDS[m.id];
              if (!coords) return null;
              const isActive = m.id === selected;
              const langData = m[lang] || m.uz || m.ru || {};
              return (
                <Marker
                  key={m.id}
                  position={coords}
                  icon={makeMarker(m, isActive, langData, API_URL)}
                  eventHandlers={{ click: () => setSelected(prev => prev === m.id ? null : m.id) }}
                  zIndexOffset={isActive ? 1000 : 0}
                />
              );
            })}
          </MapContainer>

          {/* legend */}
          <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'color-mix(in srgb, var(--surface) 92%, transparent)', backdropFilter: 'blur(8px)', border: '1px solid var(--line)', borderRadius: 12, padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 6, zIndex: 999 }}>
            {Object.entries(CITY_COLOR).map(([city, color]) => (
              <div key={city} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--fg)', fontWeight: 500 }}>{CITIES[city]?.[lang] || city}</span>
              </div>
            ))}
          </div>

          {/* museum count badge */}
          <div style={{ position: 'absolute', top: 16, left: 16, background: 'var(--accent)', color: 'var(--accent-fg)', borderRadius: 99, padding: '5px 14px', fontSize: 12.5, fontWeight: 700, fontFamily: 'var(--font-ui)', zIndex: 999, boxShadow: '0 2px 10px rgba(0,0,0,.18)' }}>
            {allMuseums.length} {lang === 'uz' ? 'muzey' : lang === 'en' ? 'museums' : 'музеев'}
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ borderLeft: '1px solid var(--line)', overflowY: 'auto', background: 'var(--surface2)', display: 'flex', flexDirection: 'column' }}>

          {/* selected museum card */}
          {selectedM ? (
            <div style={{ borderBottom: '1px solid var(--line)', animation: 'fhRise .3s ease' }}>
              {heroSrc && (
                <div style={{ height: 160, overflow: 'hidden' }}>
                  <img src={heroSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ padding: '20px 22px' }}>
                <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: CITY_COLOR[selectedM.city] || 'var(--accent)', marginBottom: 6, fontWeight: 700 }}>
                  {CITIES[selectedM.city]?.[lang]}
                </div>
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 800, color: 'var(--fg)', margin: '0 0 4px', lineHeight: 1.1 }}>
                  {(selectedM[lang] || selectedM.uz || {}).name}
                </h2>
                <div style={{ fontSize: 13.5, color: 'var(--fg)', fontWeight: 600 }}>{(selectedM[lang] || selectedM.uz || {}).owner}</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', fontStyle: 'italic', marginTop: 2 }}>{(selectedM[lang] || selectedM.uz || {}).lifespan}</div>

                {/* info */}
                {(() => {
                  const info = (selectedM[lang] || selectedM.uz || {}).info || {};
                  return (
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {info.hours && <InfoRow icon="clock">{info.hours}</InfoRow>}
                      {info.entry && <InfoRow icon="ticket">{info.entry}</InfoRow>}
                      {info.address && <InfoRow icon="pin">{info.address}</InfoRow>}
                    </div>
                  );
                })()}

                {nearestName && (
                  <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10 }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--muted)', marginBottom: 4 }}>{L2.nearest}</div>
                    <div style={{ fontSize: 13.5, color: 'var(--fg)', fontWeight: 600 }}>{nearestName} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>· {nearestKm} {L2.km}</span></div>
                  </div>
                )}

                <button onClick={() => navigate(`/museum/${selectedM.id}`)} className="btn-primary" style={{ width: '100%', marginTop: 18, padding: '11px', fontSize: 14, borderRadius: 10 }}>
                  {L2.visit}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '28px 22px', borderBottom: '1px solid var(--line)' }}>
              <div style={{ border: '1.5px dashed var(--line)', borderRadius: 12, padding: '28px 20px', textAlign: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" style={{ marginBottom: 10 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5 }}>{L2.sub}</div>
              </div>
            </div>
          )}

          {/* museum list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredList.map(m => {
              const name   = (m[lang] || m.uz || {}).name || m.id;
              const isAct  = m.id === selected;
              const color  = CITY_COLOR[m.city] || 'var(--accent)';
              const hero   = getHeroSrc(m);
              return (
                <div key={m.id} onClick={() => setSelected(prev => prev === m.id ? null : m.id)} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 20px', cursor: 'pointer', borderBottom: '1px solid var(--line)', background: isAct ? 'color-mix(in srgb, var(--accent) 7%, var(--surface2))' : 'transparent', borderLeft: `3px solid ${isAct ? color : 'transparent'}`, transition: 'all .2s' }}>
                  {/* thumb */}
                  <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', background: 'var(--surface)', border: `1.5px solid ${isAct ? color : 'var(--line)'}`, flexShrink: 0 }}>
                    {hero ? <img src={hero} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                    <div style={{ fontSize: 11, color, marginTop: 2, fontWeight: 600 }}>{CITIES[m.city]?.[lang] || m.city}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── InfoRow helper ───────────────────────────────────────────── */
const ROW_ICONS = {
  clock:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  ticket: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
  pin:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
};
function InfoRow({ icon, children }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, color: 'var(--muted)' }}>
      <span style={{ marginTop: 1, flexShrink: 0, color: 'var(--accent)' }}>{ROW_ICONS[icon]}</span>
      {children}
    </div>
  );
}
