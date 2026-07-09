import { useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { CITIES, MUSEUM_COORDS } from '../data/museums';
import { useMuseums } from '../contexts/MuseumsContext';

// Real Haversine distance for GPS calculations
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function RoutePage() {
  const { museums, loading } = useMuseums();
  const { lang, t } = useLang();
  const [routeIds, setRouteIds] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [userLoc, setUserLoc] = useState(null); // {lat, lon}

  if (loading) return <div style={{padding:48, textAlign:'center', color:'var(--muted)'}}>Loading museums...</div>;

  const toggleStop = (id) => {
    setRouteIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const buildSmartRoute = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setUserLoc({ lat: latitude, lon: longitude });

        // 1. Calculate distance from user to all museums
        let unvisited = museums.map(m => {
          const coords = MUSEUM_COORDS[m.id];
          const dist = coords ? haversineKm(latitude, longitude, coords[0], coords[1]) : Infinity;
          return { ...m, distToUser: dist };
        });

        if (unvisited.length === 0) return;

        // 2. Greedy algorithm to find shortest path
        let smartRoute = [];
        // Find nearest first
        unvisited.sort((a, b) => a.distToUser - b.distToUser);
        let current = unvisited.shift();
        smartRoute.push(current.id);

        while (unvisited.length > 0) {
          // Find closest to current
          unvisited.forEach(u => {
            const c1 = MUSEUM_COORDS[current.id];
            const c2 = MUSEUM_COORDS[u.id];
            u.tempDist = (c1 && c2) ? haversineKm(c1[0], c1[1], c2[0], c2[1]) : Infinity; 
          });
          unvisited.sort((a, b) => a.tempDist - b.tempDist);
          current = unvisited.shift();
          smartRoute.push(current.id);
        }

        setRouteIds(smartRoute);
      },
      (err) => {
        setIsLocating(false);
        setGpsError('Unable to retrieve your location. Please check permissions.');
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const routeMuseums = routeIds.map(id => museums.find(m => m.id === id));
  let totalKm = 0;
  
  // Add distance from user to first museum if userLoc exists
  if (userLoc && routeMuseums.length > 0) {
    const firstCoords = MUSEUM_COORDS[routeMuseums[0].id];
    if (firstCoords) {
      totalKm += haversineKm(userLoc.lat, userLoc.lon, firstCoords[0], firstCoords[1]);
    }
  }

  for (let i = 0; i < routeMuseums.length - 1; i++) {
    const c1 = MUSEUM_COORDS[routeMuseums[i].id];
    const c2 = MUSEUM_COORDS[routeMuseums[i+1].id];
    if (c1 && c2) {
      totalKm += haversineKm(c1[0], c1[1], c2[0], c2[1]);
    }
  }
  totalKm = Math.round(totalKm * 10) / 10;
  const totalMin = Math.round(totalKm * 1.5); // ~40km/h avg speed within/between cities
  const hr = Math.floor(totalMin / 60);
  const mn = totalMin % 60;

  return (
    <section style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 24px 90px', animation: 'fhFade .4s ease both' }}>
      <div style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>{t.nav.route}</div>
      <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 'clamp(30px, 4.4vw, 48px)', color: 'var(--fg)', margin: '0 0 8px' }}>{t.routeTitle}</h1>
      <p style={{ fontSize: 16, color: 'var(--muted)', margin: '0 0 34px', maxWidth: 560 }}>{t.routeText}</p>

      {/* Smart Route Action Bar */}
      <div style={{ background: 'color-mix(in srgb, var(--accent) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)', borderRadius: 'var(--radius)', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, animation: 'fhRise .5s ease' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 24, margin: '0 0 8px', color: 'var(--fg)' }}>Smart GPS Tourist Guide</h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 15, maxWidth: 400 }}>Let our algorithm build the perfect optimal route starting directly from your physical location.</p>
          {gpsError && <div style={{ color: '#D32F2F', fontSize: 13, marginTop: 8, fontWeight: 600 }}>{gpsError}</div>}
        </div>
        <button 
          onClick={buildSmartRoute} 
          disabled={isLocating}
          className="btn-primary" 
          style={{ padding: '16px 28px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 10, position: 'relative', overflow: 'hidden' }}
        >
          {isLocating ? (
            <span style={{ animation: 'pulse 1s infinite' }}>Locating...</span>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
              Build Optimal Route
            </>
          )}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40, alignItems: 'start' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 20, color: 'var(--fg)', margin: '0 0 16px' }}>{t.allMuseums}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {museums.map(m => {
              const inRoute = routeIds.includes(m.id);
              return (
                <div key={m.id} onClick={() => toggleStop(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'var(--surface)', border: `1.5px solid ${inRoute ? 'var(--accent)' : 'var(--line)'}`, borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all .2s' }}>
                  <div style={{ width: 22, height: 22, borderRadius: 4, border: `2px solid ${inRoute ? 'var(--accent)' : 'var(--muted)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: inRoute ? 'var(--accent)' : 'transparent' }}>
                    {inRoute && <span style={{ color: 'var(--accent-fg)', fontSize: 14 }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--muted)', marginBottom: 2 }}>{CITIES[m.city]?.[lang]}</div>
                    <div style={{ fontSize: 16, color: 'var(--fg)', fontWeight: 600 }}>{(m[lang] || m.uz || m.ru || m.en || m).name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 'calc(var(--radius) * 1.5)', padding: '36px 32px' }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 24, color: 'var(--fg)', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span>{t.yourRoute}</span>
              <span style={{ fontSize: 15, fontFamily: 'var(--font-ui)', fontWeight: 600, background: 'var(--accent)', color: 'var(--accent-fg)', padding: '2px 10px', borderRadius: 99 }}>{routeIds.length}</span>
            </h3>

            {routeIds.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: 15, fontStyle: 'italic' }}>{t.selectToBuild}</div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                  {userLoc && (
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', opacity: 0.8 }}>
                       <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                       </div>
                       <div>
                         <div style={{ fontSize: 14.5, color: 'var(--fg)', fontWeight: 600 }}>Your Location</div>
                         <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>GPS Start Point</div>
                       </div>
                    </div>
                  )}
                  {routeMuseums.map((m, i) => (
                    <div key={m.id} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--accent)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-head)', flexShrink: 0 }}>{i + 1}</div>
                      <div>
                        <div style={{ fontSize: 14.5, color: 'var(--fg)', fontWeight: 600 }}>{(m[lang] || m.uz || m.ru || m.en || m).name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{CITIES[m.city]?.[lang]}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, borderTop: '1px solid var(--line)', paddingTop: 24 }}>
                  <div>
                    <div style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--muted)', marginBottom: 4 }}>{t.distance}</div>
                    <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-head)', color: 'var(--fg)' }}>{totalKm} {t.km}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--muted)', marginBottom: 4 }}>{t.estTime}</div>
                    <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-head)', color: 'var(--fg)' }}>{hr > 0 ? `${hr}${t.hr} ` : ''}{mn}{t.min}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
