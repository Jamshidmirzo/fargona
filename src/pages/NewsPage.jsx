import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
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

const tagStyle = (isValley) =>
  'font-family:var(--font-ui);font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;' +
  'padding:4px 11px;border-radius:99px;white-space:nowrap;display:inline-block;' +
  (isValley
    ? 'background:var(--surface2);color:var(--accent);'
    : 'background:var(--accent);color:var(--accent-fg);');

export default function NewsPage() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/museums/all-news?lang=${lang}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setNews(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [lang]);

  return (
    <section style={{ maxWidth: 1080, margin: '0 auto', padding: isMobile ? '18px 16px 60px' : '26px 40px 100px', animation: 'fhFade .4s ease both' }}>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>
        {t.nav?.news || 'Новости'}
      </div>
      <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 500, fontSize: 'clamp(32px,5vw,60px)', lineHeight: 1.02, color: 'var(--fg)', margin: '0 0 12px', letterSpacing: '-.01em' }}>
        {t.newsTitle || 'Новости музеев'}
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 40px', maxWidth: 600, fontWeight: 300 }}>
        {t.newsText}
      </p>

      {loading && (
        <div style={{ color: 'var(--muted)', fontFamily: 'var(--font-ui)', fontSize: 14, padding: '40px 0' }}>…</div>
      )}

      {!loading && news.length === 0 && (
        <div style={{ border: '1px dashed var(--line)', borderRadius: 'var(--radius)', padding: '60px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 15.5 }}>
          {t.noNews}
        </div>
      )}

      {!loading && news.length > 0 && (
        <div>
          {news.map(n => (
            <div key={n.id} onClick={() => navigate(`/news/${n.id}`)} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '170px 1fr', gap: isMobile ? 12 : 34, padding: isMobile ? '22px 4px' : '34px 6px', borderTop: '1px solid var(--line)', alignItems: 'start', cursor: 'pointer' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 12 }}>
                  {fmtDate(n.created_at, lang)}
                </div>
                <span style={{ ...(n.museum_name ? {} : {}), fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', padding: '4px 11px', borderRadius: 99, whiteSpace: 'nowrap', display: 'inline-block', background: n.museum_name ? 'var(--accent)' : 'var(--surface2)', color: n.museum_name ? 'var(--accent-fg)' : 'var(--accent)' }}>
                  {n.museum_name || t.allValley}
                </span>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 500, fontSize: 'clamp(22px,2.8vw,34px)', lineHeight: 1.08, color: 'var(--fg)', margin: '0 0 12px', letterSpacing: '-.005em' }}>
                  {n.title}
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 16.5, lineHeight: 1.7, color: 'var(--muted)', margin: 0, maxWidth: 640 }}>
                  {n.content}
                </p>
                {n.museum_id && (
                  <button onClick={() => navigate(`/museum/${n.museum_id}`)} style={{ marginTop: 14, fontFamily: 'var(--font-ui)', cursor: 'pointer', background: 'transparent', border: 'none', padding: 0, color: 'var(--accent)', fontSize: 13, fontWeight: 600, letterSpacing: '.04em' }}>
                    {n.museum_name} · {t.readMore} →
                  </button>
                )}
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--line)' }} />
        </div>
      )}
    </section>
  );
}
