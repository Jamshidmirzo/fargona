import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { API_URL } from '../config';

const MON_SHORT = {
  ru: ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'],
  uz: ['yan','fev','mar','apr','may','iyn','iyl','avg','sen','okt','noy','dek'],
  en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
};

function parseEventDate(iso) {
  if (!iso) return { day: '', month: '' };
  const p = iso.split('-');
  return { day: p[2] ? String(+p[2]) : '', monthIdx: p[1] ? +p[1] - 1 : -1 };
}

export default function EventsPage() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/museums/all-events?lang=${lang}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setEvents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [lang]);

  return (
    <section style={{ maxWidth: 1080, margin: '0 auto', padding: '26px 40px 100px', animation: 'fhFade .4s ease both' }}>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>
        {t.nav?.events || 'Афиша'}
      </div>
      <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 500, fontSize: 'clamp(32px,5vw,60px)', lineHeight: 1.02, color: 'var(--fg)', margin: '0 0 12px', letterSpacing: '-.01em' }}>
        {t.eventsTitle || 'Афиша событий'}
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 40px', maxWidth: 600, fontWeight: 300 }}>
        {t.eventsText}
      </p>

      {loading && (
        <div style={{ color: 'var(--muted)', fontFamily: 'var(--font-ui)', fontSize: 14, padding: '40px 0' }}>…</div>
      )}

      {!loading && events.length === 0 && (
        <div style={{ border: '1px dashed var(--line)', borderRadius: 'var(--radius)', padding: '60px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 15.5 }}>
          {t.noEvents}
        </div>
      )}

      {!loading && events.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {events.map(e => {
            const { day, monthIdx } = parseEventDate(e.date);
            const monthShort = monthIdx >= 0 ? (MON_SHORT[lang] || MON_SHORT.en)[monthIdx] || '' : '';
            const hasTime = !!e.time;
            const tagBg = e.museum_name ? 'var(--accent)' : 'var(--surface2)';
            const tagColor = e.museum_name ? 'var(--accent-fg)' : 'var(--accent)';
            return (
              <div key={e.id} onClick={() => navigate(`/events/${e.id}`)} style={{ display: 'grid', gridTemplateColumns: '104px 1fr', gap: 28, alignItems: 'stretch', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '24px 26px', cursor: 'pointer', transition: 'border-color .2s' }} onMouseEnter={ev => ev.currentTarget.style.borderColor='var(--accent)'} onMouseLeave={ev => ev.currentTarget.style.borderColor='var(--line)'}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid var(--line)', paddingRight: 20 }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 44, color: 'var(--accent)', lineHeight: .95 }}>{day}</div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: 5 }}>{monthShort}</div>
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', padding: '4px 11px', borderRadius: 99, background: tagBg, color: tagColor }}>
                      {e.museum_name || t.allValley}
                    </span>
                    {hasTime && (
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>{e.time}</span>
                    )}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 'clamp(21px,2.4vw,28px)', lineHeight: 1.12, color: 'var(--fg)', margin: '0 0 8px' }}>
                    {e.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.6, color: 'var(--muted)', margin: 0, maxWidth: 640 }}>
                    {e.description}
                  </p>
                  {e.museum_id && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg)', cursor: 'pointer' }} onClick={() => navigate(`/museum/${e.museum_id}`)}>
                      <span style={{ width: 6, height: 6, background: 'var(--accent)', transform: 'rotate(45deg)', flexShrink: 0, display: 'inline-block' }} />
                      {e.museum_name}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
