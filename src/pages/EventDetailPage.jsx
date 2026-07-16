import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import LinkText from '../components/LinkText';
import { API_URL } from '../config';
import { useIsMobile } from '../hooks/useMediaQuery';

const MONTHS = {
  ru: ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
  uz: ['yanvar','fevral','mart','aprel','may','iyun','iyul','avgust','sentabr','oktabr','noyabr','dekabr'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
};
const MON_SHORT = {
  ru: ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'],
  uz: ['yan','fev','mar','apr','may','iyn','iyl','avg','sen','okt','noy','dek'],
  en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
};

function parseDate(iso, lang) {
  if (!iso) return { day: '', month: '', full: '' };
  const p = iso.split('-');
  const day = p[2] ? String(+p[2]) : '';
  const monthIdx = p[1] ? +p[1] - 1 : -1;
  const month = monthIdx >= 0 ? (MON_SHORT[lang] || MON_SHORT.en)[monthIdx] : '';
  const fullMonth = monthIdx >= 0 ? (MONTHS[lang] || MONTHS.en)[monthIdx] : '';
  const year = p[0] || '';
  const full = lang === 'en' ? `${fullMonth} ${day}, ${year}` : `${day} ${fullMonth} ${year}`;
  return { day, month, full };
}

export default function EventDetailPage() {
  const { id } = useParams();
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/museums/events/${id}?lang=${lang}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setEvent(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, lang]);

  if (loading) return <div style={{ padding: 80, textAlign: 'center', color: 'var(--muted)' }}>…</div>;
  if (!event) return (
    <div style={{ padding: 80, textAlign: 'center', color: 'var(--muted)' }}>
      <div style={{ marginBottom: 20 }}>Событие не найдено</div>
      <button onClick={() => navigate('/events')} style={{ background: 'var(--accent)', border: 'none', color: 'var(--accent-fg)', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>← Афиша</button>
    </div>
  );

  const { day, month, full } = parseDate(event.date, lang);

  return (
    <article style={{ maxWidth: 780, margin: '0 auto', padding: isMobile ? '20px 16px 60px' : '32px 40px 100px', animation: 'fhFade .4s ease both' }}>
      <button
        onClick={() => navigate('/events')}
        style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-ui)', letterSpacing: '.06em', textTransform: 'uppercase', padding: 0, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 6 }}
      >
        ← {t.nav?.events || 'Афиша'}
      </button>

      {/* Date badge + meta */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap' }}>
        {day && (
          <div style={{ textAlign: 'center', background: 'color-mix(in srgb, var(--accent) 10%, var(--surface))', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', borderRadius: 12, padding: '14px 20px', minWidth: 72, flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 40, color: 'var(--accent)', lineHeight: 1 }}>{day}</div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: 4 }}>{month}</div>
          </div>
        )}
        <div style={{ paddingTop: 8 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
            {event.museum_name && (
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 99, background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                {event.museum_name}
              </span>
            )}
            {event.time && (
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}>{event.time}</span>
            )}
          </div>
          {full && <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--muted)', fontStyle: 'italic' }}>{full}</div>}
        </div>
      </div>

      <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 500, fontSize: 'clamp(28px, 4.5vw, 52px)', lineHeight: 1.05, color: 'var(--fg)', margin: '0 0 32px', letterSpacing: '-.01em' }}>
        {event.title}
      </h1>

      {event.image && (
        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 36, maxHeight: 480 }}>
          <img src={`${API_URL}${event.image}`} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      <div style={{ fontFamily: 'var(--font-body)', fontSize: 18, lineHeight: 1.8, color: 'var(--fg)', whiteSpace: 'pre-wrap' }}>
        <LinkText text={event.description} />
      </div>

      {event.museum_id && (
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--line)' }}>
          <button
            onClick={() => navigate(`/museum/${event.museum_id}`)}
            style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--fg)', padding: '12px 24px', borderRadius: 'var(--radius)', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, letterSpacing: '.04em', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {event.museum_name} · {t.readMore} →
          </button>
        </div>
      )}
    </article>
  );
}
