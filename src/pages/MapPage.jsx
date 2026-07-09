import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useLang } from '../contexts/LangContext';
import { CITIES, CITY_KM, MUSEUM_COORDS  } from '../data/museums';
import { useMuseums } from '../contexts/MuseumsContext';
import { useNavigate } from 'react-router-dom';

function distKm(a, b) {
  if (a.city === b.city) return ({ kokand: 2, margilan: 1.2, fergana: 0.8 })[a.city] || 1.5;
  const k1 = a.city + '|' + b.city, k2 = b.city + '|' + a.city;
  return CITY_KM[k1] ?? CITY_KM[k2] ?? 50;
}

function createIcon(isSelected, museum) {
  const imgHtml = museum?.heroImage 
    ? `<img src="http://localhost:3000${museum.heroImage}" style="width:100%; height:100%; object-fit:cover;" />` 
    : '';
  
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: ${isSelected ? 48 : 36}px;
        height: ${isSelected ? 48 : 36}px;
        border-radius: 50%;
        background: var(--surface2);
        border: ${isSelected ? 3 : 2}px solid var(--accent);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3) ${isSelected ? ', 0 0 0 4px rgba(176,79,40,0.2)' : ''};
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--muted);
        font-size: 10px;
        z-index: ${isSelected ? 999 : 1};
      ">
        ${imgHtml}
      </div>
      ${isSelected ? `<div style="
        position: absolute;
        bottom: -8px; left: 50%;
        transform: translateX(-50%);
        width: 0; height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid var(--accent);
      "></div>` : ''}
    `,
    iconSize: [isSelected ? 48 : 36, isSelected ? 48 : 36],
    iconAnchor: [isSelected ? 24 : 18, isSelected ? 48 : 36],
    popupAnchor: [0, isSelected ? -50 : -38]
  });
}

import { useTheme } from '../contexts/ThemeContext';

export default function MapPage() {
  const { museums, loading } = useMuseums();
  const { lang, t } = useLang();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  if (loading) return <div style={{padding:48, textAlign:'center', color:'var(--muted)'}}>Loading museums...</div>;
  const center = [40.48, 71.35];

  const selectedMuseum = selected ? museums.find(m => m.id === selected) : null;
  let nearestName = '', nearestKm = 0;
  if (selectedMuseum) {
    let best = Infinity;
    museums.forEach(o => {
      if (o.id === selectedMuseum.id) return;
      const km = haversineKm(MUSEUM_COORDS[selectedMuseum.id]?.[0], MUSEUM_COORDS[selectedMuseum.id]?.[1], MUSEUM_COORDS[o.id]?.[0], MUSEUM_COORDS[o.id]?.[1]);
      if (km < best) { 
        best = km; 
        nearestName = (o[lang] || o.uz || o.ru || o.en || o).name; 
        nearestKm = Math.round(km * 10) / 10; 
      }
    });
  }

  return (
    <section style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 24px 90px', animation: 'fhFade .4s ease both' }}>
      <div style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>{t.nav.map}</div>
      <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 'clamp(30px, 4.4vw, 48px)', color: 'var(--fg)', margin: '0 0 8px' }}>{t.mapTitle}</h1>
      <p style={{ fontSize: 16, color: 'var(--muted)', margin: '0 0 26px', maxWidth: 560 }}>{t.mapText}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--line)', height: 500 }}>
          <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%', background: 'var(--surface2)' }} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url={theme === 'dark' 
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}
            />
            {museums.map(m => {
              const customIcon = createIcon(m.id === selected, m);
              return (
              <Marker key={m.id} position={MUSEUM_COORDS[m.id] || [40, 71]} icon={customIcon} eventHandlers={{ click: () => setSelected(m.id) }}>
                <Popup className="fh-popup" autoPan={false}>
                  <div style={{ padding: '6px 2px', minWidth: 200 }}>
                    <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, color: 'var(--fg)', lineHeight: 1.2 }}>{(m[lang] || m.uz || m.ru || m.en || m).name}</div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{(m[lang] || m.uz || m.ru || m.en || m).owner}</div>
                    <button onClick={() => navigate(`/museum/${m.id}`)} className="btn-primary" style={{ marginTop: 12, width: '100%', padding: '6px 0', fontSize: 12, borderRadius: 6 }}>{t.visitMuseum}</button>
                  </div>
                </Popup>
              </Marker>
            );
            })}
          </MapContainer>
        </div>

        <div style={{ minHeight: 120 }}>
          {selectedMuseum ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden', animation: 'fhRise .4s cubic-bezier(0.2, 0.8, 0.2, 1) both', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
              {selectedMuseum.heroImage ? (
                 <div style={{ width: '100%', height: 180, overflow: 'hidden' }}>
                   <img src={`http://localhost:3000${selectedMuseum.heroImage}`} alt={(selectedMuseum[lang] || selectedMuseum.uz || selectedMuseum.ru || selectedMuseum.en || selectedMuseum).name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 </div>
              ) : null}
              <div style={{ padding: 26 }}>
                <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>{CITIES[selectedMuseum.city]?.[lang]}</div>
                <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 25, color: 'var(--fg)', margin: '0 0 5px', lineHeight: 1.1 }}>{(selectedMuseum[lang] || selectedMuseum.uz || selectedMuseum.ru || selectedMuseum.en || selectedMuseum).name}</h3>
                <div style={{ fontSize: 14.5, color: 'var(--fg)', fontWeight: 600 }}>{(selectedMuseum[lang] || selectedMuseum.uz || selectedMuseum.ru || selectedMuseum.en || selectedMuseum).owner}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3, fontStyle: 'italic' }}>{(selectedMuseum[lang] || selectedMuseum.uz || selectedMuseum.ru || selectedMuseum.en || selectedMuseum).lifespan}</div>
                <div style={{ height: 1, background: 'var(--line)', margin: '18px 0' }} />
                <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>{t.nearest}</div>
                <div style={{ fontSize: 15, color: 'var(--fg)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {nearestName} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({nearestKm} {t.km})</span>
                </div>
                <button onClick={() => navigate(`/museum/${selectedMuseum.id}`)} className="btn-primary" style={{ width: '100%', marginTop: 22, padding: '12px', fontSize: 14 }}>{t.readMore} →</button>
              </div>
            </div>
          ) : (
            <div style={{ border: '1px dashed var(--line)', borderRadius: 'var(--radius)', padding: '36px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 14.5, lineHeight: 1.5 }}>{t.mapText}</div>
          )}
        </div>
      </div>
    </section>
  );
}
