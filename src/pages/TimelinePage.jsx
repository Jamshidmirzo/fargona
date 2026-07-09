import { useLang } from '../contexts/LangContext';
import { useMuseums } from '../contexts/MuseumsContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

export default function TimelinePage() {
  const { museums, loading } = useMuseums();
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [selectedM, setSelectedM] = useState('all');
  if (loading) return <div style={{padding:48, textAlign:'center', color:'var(--muted)'}}>Loading museums...</div>;

  // Collect all events
  let allEvents = [];
  museums.forEach(m => {
    if (selectedM !== 'all' && m.id !== selectedM) return;
    const loc = m[lang] || m.uz || m.ru || m.en || m;
    if (!loc.events) return;
    loc.events.forEach(e => {
      const y = parseInt(e.year.replace(/\D/g, ''), 10) || 0;
      allEvents.push({ ...e, y, m_id: m.id, m_name: loc.name, m_owner: loc.owner });
    });
  });
  allEvents.sort((a, b) => a.y - b.y);

  // Intersection Observer for scroll animations
  const observerRef = useRef(null);
  const lineRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    const items = document.querySelectorAll('.timeline-item');
    items.forEach(item => observerRef.current.observe(item));

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${(totalScroll / windowHeight) * 100}%`;
      setScrollProgress(totalScroll);
      if (lineRef.current) {
        lineRef.current.style.height = `max(0px, calc(${scroll} + 20%))`;
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [selectedM, allEvents.length]); // Re-run when events change

  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Parallax Background Shapes */}
      <div style={{ position: 'absolute', top: -100 + scrollProgress * 0.2, right: -100 + scrollProgress * 0.1, width: 400, height: 400, background: 'color-mix(in srgb, var(--accent) 5%, transparent)', borderRadius: '50%', filter: 'blur(60px)', zIndex: -1 }} />
      <div style={{ position: 'absolute', top: 500 - scrollProgress * 0.15, left: -150, width: 500, height: 500, background: 'color-mix(in srgb, var(--gold) 4%, transparent)', borderRadius: '50%', filter: 'blur(80px)', zIndex: -1 }} />

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 24px 90px', animation: 'fhFade .4s ease both' }}>
        <div style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>{t.nav.timeline}</div>
      <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 'clamp(30px, 4.4vw, 48px)', color: 'var(--fg)', margin: '0 0 8px' }}>{t.timelineTitle}</h1>
      <p style={{ fontSize: 16, color: 'var(--muted)', margin: '0 0 34px', maxWidth: 560 }}>{t.timelineText}</p>

      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16, marginBottom: 38 }} className="hide-scroll">
        <button onClick={() => setSelectedM('all')} style={{
          fontFamily: 'var(--font-ui)', cursor: 'pointer', padding: '8px 18px', borderRadius: 99, fontSize: 14, whiteSpace: 'nowrap', border: '1px solid var(--line)', transition: 'all .2s',
          ...(selectedM === 'all' ? { background: 'var(--accent)', color: 'var(--accent-fg)', borderColor: 'var(--accent)' } : { background: 'var(--surface)', color: 'var(--fg)' })
        }}>{t.allMuseums}</button>
        {museums.map(m => (
          <button key={m.id} onClick={() => setSelectedM(m.id)} style={{
            fontFamily: 'var(--font-ui)', cursor: 'pointer', padding: '8px 18px', borderRadius: 99, fontSize: 14, whiteSpace: 'nowrap', border: '1px solid var(--line)', transition: 'all .2s',
            ...(selectedM === m.id ? { background: 'var(--accent)', color: 'var(--accent-fg)', borderColor: 'var(--accent)' } : { background: 'var(--surface)', color: 'var(--fg)' })
          }}>{(m[lang] || m.uz || m.ru || m.en || m).owner}</button>
        ))}
      </div>

      <div style={{ position: 'relative', paddingLeft: 46 }}>
        <div style={{ position: 'absolute', top: 12, bottom: 0, left: 14, width: 2, background: 'var(--surface2)', overflow: 'hidden' }}>
          <div ref={lineRef} style={{ width: '100%', height: '0%', background: 'var(--accent)', transition: 'height 0.1s ease-out' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          {allEvents.map((e, i) => (
            <div key={i} className="timeline-item" style={{ position: 'relative' }}>
              <div className="timeline-dot" style={{ position: 'absolute', top: 6, left: -38, width: 14, height: 14, borderRadius: '50%', background: 'var(--surface)', border: '3px solid var(--surface2)', transition: 'all .4s .3s' }} />
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 24, color: 'var(--accent)', lineHeight: 1 }}>{e.year}</div>
              {selectedM === 'all' && <div style={{ fontSize: 11.5, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', margin: '8px 0 4px' }}>{e.m_name}</div>}
              <div style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--fg)', marginTop: selectedM === 'all' ? 0 : 8 }}>{e.text}</div>
              <div onClick={() => navigate(`/museum/${e.m_id}`)} style={{ display: 'inline-block', marginTop: 14, fontSize: 13, color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, padding: '6px 12px', borderRadius: 99, background: 'color-mix(in srgb, var(--accent) 10%, transparent)', transition: 'background .2s' }} onMouseEnter={e => e.currentTarget.style.background='color-mix(in srgb, var(--accent) 20%, transparent)'} onMouseLeave={e => e.currentTarget.style.background='color-mix(in srgb, var(--accent) 10%, transparent)'}>{t.readMore} →</div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
