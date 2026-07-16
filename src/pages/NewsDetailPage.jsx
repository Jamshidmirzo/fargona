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

function fmtDate(iso, lang) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const mo = (MONTHS[lang] || MONTHS.en)[d.getMonth()] || '';
  const day = d.getDate(), year = d.getFullYear();
  return lang === 'en' ? `${mo} ${day}, ${year}` : `${day} ${mo} ${year}`;
}

export default function NewsDetailPage() {
  const { id } = useParams();
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/museums/news/${id}?lang=${lang}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setNews(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, lang]);

  if (loading) return <div style={{ padding: 80, textAlign: 'center', color: 'var(--muted)' }}>…</div>;
  if (!news) return (
    <div style={{ padding: 80, textAlign: 'center', color: 'var(--muted)' }}>
      <div style={{ marginBottom: 20 }}>Новость не найдена</div>
      <button onClick={() => navigate('/news')} style={{ background: 'var(--accent)', border: 'none', color: 'var(--accent-fg)', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>← Все новости</button>
    </div>
  );

  return (
    <article style={{ maxWidth: 780, margin: '0 auto', padding: isMobile ? '20px 16px 60px' : '32px 40px 100px', animation: 'fhFade .4s ease both' }}>
      <button
        onClick={() => navigate('/news')}
        style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-ui)', letterSpacing: '.06em', textTransform: 'uppercase', padding: 0, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 6 }}
      >
        ← {t.nav?.news || 'Новости'}
      </button>

      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        {news.museum_name && (
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 99, background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            {news.museum_name}
          </span>
        )}
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)', fontStyle: 'italic' }}>
          {fmtDate(news.created_at, lang)}
        </span>
      </div>

      <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 500, fontSize: 'clamp(28px, 4.5vw, 52px)', lineHeight: 1.05, color: 'var(--fg)', margin: '0 0 32px', letterSpacing: '-.01em' }}>
        {news.title}
      </h1>

      {news.image && (
        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 36, maxHeight: 480 }}>
          <img src={`${API_URL}${news.image}`} alt={news.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      <div style={{ fontFamily: 'var(--font-body)', fontSize: 18, lineHeight: 1.8, color: 'var(--fg)', whiteSpace: 'pre-wrap' }}>
        <LinkText text={news.content} />
      </div>

      {news.museum_id && (
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--line)' }}>
          <button
            onClick={() => navigate(`/museum/${news.museum_id}`)}
            style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--fg)', padding: '12px 24px', borderRadius: 'var(--radius)', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, letterSpacing: '.04em', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {news.museum_name} · {t.readMore} →
          </button>
        </div>
      )}
    </article>
  );
}
