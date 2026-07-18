import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMuseums } from '../contexts/MuseumsContext';
import { useLang } from '../contexts/LangContext';
import { API_URL } from '../config';
import { CITIES } from '../data/museums';

/* ── 5-stop route (print guide) ─────────────────────────────────── */
const ROUTE_STOPS = [
  { id: 'muqimiy',          stop: 1, mapLon: 70.9321, mapLat: 40.5284 },
  { id: 'hamza',            stop: 2, mapLon: 70.9438, mapLat: 40.5351 },
  { id: 'uvaysi',           stop: 3, mapLon: 71.7132, mapLat: 40.4765 },
  { id: 'vohidov_memorial', stop: 4, mapLon: 71.7225, mapLat: 40.4703 },
  { id: 'haziniy',          stop: 5, mapLon: 71.7892, mapLat: 40.3842 },
];

/* ── translations ────────────────────────────────────────────────── */
const TL = {
  ru: {
    printLabel: "ЛИТЕРАТУРНЫЙ МАРШРУТ · FARG'ONA VODIYSI",
    title1: 'Маршрут', title2: 'поэтов',
    sub: 'SHOIRLAR MARSHRUTI',
    meta: 'Ферганская долина  •  2 дня  •  5 музеев',
    desc: 'Путешествие по литературным домам-музеям Коканда, Маргилана и Ферганы — от Мукими до Эркина Вахидова и Хазини.\n5 поэтов, пять домов, одна долина.',
    schemaTitle: 'СХЕМА МАРШРУТА', siteUrl: 'fargonaabadiymeros.uz/route',
    pageTitle: '5 остановок, две долины дней',
    scanHint: 'Отсканируйте QR у каждой карточки — и откройте страницу музея',
    kokandSec: "QO'QON  ·  ОСТАНОВКИ 1–2",
    otherSec: "MARG'ILON  ·  OLTIARIQ  ·  FARG'ONA  ·  ОСТАНОВКИ 3–5",
    totalKm: '≈ 77 КМ', totalMeta: '2 дня · 5 музеев · пешком и на машине',
    buildRoute: 'Отсканируйте, чтобы построить полный маршрут по долине',
    addressL: 'АДРЕС', hoursL: 'ЧАСЫ', entryL: 'ВХОД',
    dlBtn: '↓ Скачать PDF', dlLoading: 'Генерируем PDF…',
    backBtn: '← Маршрут',
    footer: 'Дом-музеи Ферганы  ·  ПЯТЬ ПОЭТОВ · ПЯТЬ ДОМОВ · ОДНА ДОЛИНА',
    filename: 'marshrut-poetov-ru.pdf',
  },
  uz: {
    printLabel: "ADABIY MARSHRUT · FARG'ONA VODIYSI",
    title1: 'Shoirlar', title2: 'Marshruti',
    sub: 'SHOIRLAR MARSHRUTI',
    meta: "Farg'ona vodiysi  •  2 kun  •  5 muzey",
    desc: "Qo'qon, Marg'ilon va Farg'onaning adabiy uy-muzeylariga sayohat — Muqimiydan Erkin Vohidov va Xaziniyga qadar.\n5 shoir, beshta uy, bitta vodiy.",
    schemaTitle: 'MARSHRUT SXEMASI', siteUrl: 'fargonaabadiymeros.uz/route',
    pageTitle: '5 bekat, ikki vodiy kunlari',
    scanHint: "Har bir kartochkadagi QR-kodni skanlang — muzey sahifasini oching",
    kokandSec: "QO'QON  ·  1–2-BEKATLAR",
    otherSec: "MARG'ILON  ·  OLTIARIQ  ·  FARG'ONA  ·  3–5-BEKATLAR",
    totalKm: '≈ 77 KM', totalMeta: '2 kun · 5 muzey · piyoda va mashinada',
    buildRoute: "Vodiy bo'ylab to'liq marshrut tuzish uchun skanlang",
    addressL: 'MANZIL', hoursL: 'ISH VAQTI', entryL: 'KIRISH',
    dlBtn: '↓ PDF yuklab olish', dlLoading: "PDF tayyorlanmoqda…",
    backBtn: '← Marshrut',
    footer: "Farg'ona uy-muzeylari  ·  BESH SHOIR · BESHTA UY · BITTA VODIY",
    filename: 'marshrut-poetov-uz.pdf',
  },
  en: {
    printLabel: "LITERARY ROUTE · FARG'ONA VODIYSI",
    title1: "Poets'", title2: 'Route',
    sub: 'SHOIRLAR MARSHRUTI',
    meta: 'Fergana Valley  •  2 days  •  5 museums',
    desc: "A journey through the literary house-museums of Kokand, Margilan and Fergana — from Muqimiy to Erkin Vohidov and Haziniy.\n5 poets, five homes, one valley.",
    schemaTitle: 'ROUTE SCHEMA', siteUrl: 'fargonaabadiymeros.uz/route',
    pageTitle: '5 stops, two valley days',
    scanHint: "Scan the QR at each card to open the museum page",
    kokandSec: 'KOKAND  ·  STOPS 1–2',
    otherSec: 'MARGILAN  ·  OLTIARIQ  ·  FERGANA  ·  STOPS 3–5',
    totalKm: '≈ 77 KM', totalMeta: '2 days · 5 museums · on foot and by car',
    buildRoute: 'Scan to build the full route across the valley',
    addressL: 'ADDRESS', hoursL: 'HOURS', entryL: 'ENTRY',
    dlBtn: '↓ Download PDF', dlLoading: 'Generating PDF…',
    backBtn: '← Route',
    footer: "Fergana House-Museums  ·  FIVE POETS · FIVE HOMES · ONE VALLEY",
    filename: 'poets-route-en.pdf',
  },
};

/* ── geographic map ──────────────────────────────────────────────── */
/*
  Bounding box: lat 40.28–40.66, lon 70.70–71.95
  SVG: 210 × 130
*/
const MAP_W = 210, MAP_H = 130;
const LON0 = 70.70, LON1 = 71.95;
const LAT0 = 40.66, LAT1 = 40.28;

const gx = (lon) => ((lon - LON0) / (LON1 - LON0)) * MAP_W;
const gy = (lat) => ((LAT0 - lat) / (LAT0 - LAT1)) * MAP_H;

function GeoMap({ stops }) {
  // cities (large circles behind stops)
  const kokand   = { x: gx(70.9425), y: gy(40.5286) };
  const margilan = { x: gx(71.7144), y: gy(40.4733) };
  const fergana  = { x: gx(71.7892), y: gy(40.3842) };

  const pts = ROUTE_STOPS.map(r => ({ stop: r.stop, x: gx(r.mapLon), y: gy(r.mapLat) }));
  const routeLine = pts.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} width="100%" style={{ maxWidth: 420, display: 'block' }}>
      {/* ── valley floor ── */}
      <ellipse cx="118" cy="78" rx="97" ry="38" fill="#c49a5e" opacity=".10" />
      <ellipse cx="118" cy="78" rx="97" ry="38" fill="none" stroke="#c49a5e" strokeWidth=".5" opacity=".28" strokeDasharray="2 2" />

      {/* ── north mountain range (Chatkal / Kurama) ── */}
      <path d="M0,28 L10,14 L20,24 L30,10 L40,20 L52,6 L62,18 L74,4 L84,16 L96,2 L108,12 L120,1 L132,11 L144,2 L156,10 L168,1 L180,9 L192,2 L210,10 L210,0 L0,0 Z"
        fill="#c49a5e" opacity=".08" />
      <path d="M0,28 L10,14 L20,24 L30,10 L40,20 L52,6 L62,18 L74,4 L84,16 L96,2 L108,12 L120,1 L132,11 L144,2 L156,10 L168,1 L180,9 L192,2 L210,10"
        fill="none" stroke="#c49a5e" strokeWidth=".7" opacity=".45" />

      {/* ── south mountain range (Alay) ── */}
      <path d="M0,112 L14,124 L28,110 L42,122 L56,108 L72,120 L88,107 L104,121 L120,108 L136,122 L152,106 L168,120 L184,108 L198,122 L210,110 L210,130 L0,130 Z"
        fill="#c49a5e" opacity=".08" />
      <path d="M0,112 L14,124 L28,110 L42,122 L56,108 L72,120 L88,107 L104,121 L120,108 L136,122 L152,106 L168,120 L184,108 L198,122 L210,110"
        fill="none" stroke="#c49a5e" strokeWidth=".7" opacity=".45" />

      {/* ── Syr Darya river ── */}
      <path d={`M${MAP_W},42 Q175,46 ${margilan.x},50 Q120,54 80,50 Q${kokand.x + 10},46 ${kokand.x},48 Q10,50 0,46`}
        fill="none" stroke="#6b86a8" strokeWidth="1.5" opacity=".65" strokeLinecap="round" />

      {/* ── grid lines (subtle) ── */}
      {[25, 50, 75, 100, 125, 150, 175].map(x => (
        <line key={x} x1={x} y1="0" x2={x} y2={MAP_H} stroke="#c49a5e" strokeWidth=".2" opacity=".18" />
      ))}
      {[32, 65, 97].map(y => (
        <line key={y} x1="0" y1={y} x2={MAP_W} y2={y} stroke="#c49a5e" strokeWidth=".2" opacity=".18" />
      ))}

      {/* ── city halos ── */}
      {[kokand, margilan, fergana].map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r="9" fill="#c49a5e" opacity=".10" />
      ))}

      {/* ── route dashed line ── */}
      <polyline points={routeLine} fill="none" stroke="#c49a5e" strokeWidth="1.5" strokeDasharray="3.5 2.5" opacity=".9" />

      {/* ── distance label ── */}
      <text x={gx(71.3)} y={gy(40.5) - 4} fontSize="4.5" fill="#c49a5e" fontFamily="Manrope,sans-serif" textAnchor="middle" opacity=".85">65 км</text>

      {/* ── city labels ── */}
      <text x={kokand.x - 2} y={kokand.y - 11} fontSize="5.8" fill="#f1e8d6" fontFamily="Manrope,sans-serif" fontWeight="600" textAnchor="middle">Qo'qon</text>
      <text x={margilan.x}   y={margilan.y - 11} fontSize="5.8" fill="#f1e8d6" fontFamily="Manrope,sans-serif" fontWeight="600" textAnchor="middle">Marg'ilon</text>
      <text x={fergana.x + 2} y={fergana.y + 16} fontSize="5.8" fill="#f1e8d6" fontFamily="Manrope,sans-serif" fontWeight="600" textAnchor="middle">Farg'ona</text>

      {/* ── stop circles ── */}
      {pts.map(p => (
        <g key={p.stop} transform={`translate(${p.x},${p.y})`}>
          <circle r="7.5" fill="#c49a5e" />
          <text textAnchor="middle" dy="4.8" fontSize="8" fontWeight="700" fill="#1a110b" fontFamily="Playfair Display,serif">{p.stop}</text>
        </g>
      ))}

      {/* ── compass ── */}
      <g transform="translate(197,16)">
        <circle r="6" fill="none" stroke="#c49a5e" strokeWidth=".55" opacity=".7" />
        <path d="M0,-5 L1.8,1 L0,-0.6 L-1.8,1 Z" fill="#c49a5e" />
        <text x="0" y="-6.8" fontSize="3.8" fill="#c49a5e" opacity=".8" fontFamily="Manrope,sans-serif" textAnchor="middle">N</text>
      </g>

      {/* ── scale bar ── */}
      <g transform="translate(10,122)">
        <line x1="0" y1="0" x2="29" y2="0" stroke="#c49a5e" strokeWidth=".7" opacity=".6" />
        <line x1="0" y1="-2" x2="0" y2="2" stroke="#c49a5e" strokeWidth=".7" opacity=".6" />
        <line x1="29" y1="-2" x2="29" y2="2" stroke="#c49a5e" strokeWidth=".7" opacity=".6" />
        <text x="0" y="6" fontSize="3.6" fill="#c49a5e" opacity=".7" fontFamily="Manrope,sans-serif">0</text>
        <text x="29" y="6" fontSize="3.6" fill="#c49a5e" opacity=".7" fontFamily="Manrope,sans-serif" textAnchor="end">20 km</text>
      </g>
    </svg>
  );
}

/* ── helpers ─────────────────────────────────────────────────────── */
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
const routeQr = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=20190f&bgcolor=ffffff&data=${encodeURIComponent('https://fargonaabadiymeros.uz/route')}`;
const qrUrl = (id) => `https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=20190f&bgcolor=ffffff&data=${encodeURIComponent(`https://fargonaabadiymeros.uz/museum/${id}`)}`;

function SectionLabel({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '0 0 14px' }}>
      <div style={{ height: 1, width: 28, background: '#a2683d', flexShrink: 0 }} />
      <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 8.5, letterSpacing: '.22em', textTransform: 'uppercase', color: '#a2683d', whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ height: 1, flex: 1, background: '#ddd1bd' }} />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
      <span style={{ fontFamily: 'Manrope,sans-serif', fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: '#a99a7e', flexShrink: 0, paddingTop: 2 }}>{label}</span>
      <span style={{ fontFamily: 'Spectral,serif', fontSize: 11.5, color: '#20190f', lineHeight: 1.4 }}>{value}</span>
    </div>
  );
}

function MuseumCard({ stop, lang, tl }) {
  const cityName = (CITIES[stop.city]?.[lang] || stop.city || '').toUpperCase();
  return (
    <div className="pdf-avoid-break" style={{ background: '#ffffff', border: '1px solid #ddd1bd', borderRadius: 5, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 8, pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <div style={{ height: 72, background: '#ece4d5', borderRadius: 3, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {stop.hero
          ? <img src={stop.hero} alt={stop.name} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontFamily: 'Manrope,sans-serif', fontSize: 8.5, color: '#a99a7e', letterSpacing: '.06em' }}>фото музея</span>}
      </div>

      <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
        <div style={{ width: 19, height: 19, borderRadius: '50%', background: '#a2683d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 700, fontSize: 9.5, color: '#fff' }}>{stop.stop}</span>
        </div>
        <span style={{ fontFamily: 'Manrope,sans-serif', fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: '#a2683d', fontWeight: 700 }}>{cityName}</span>
      </div>

      <div>
        <h3 style={{ fontFamily: 'Playfair Display,serif', fontWeight: 700, fontSize: 14.5, color: '#20190f', margin: '0 0 2px', lineHeight: 1.18 }}>{stop.name}</h3>
        <div style={{ fontFamily: 'Spectral,serif', fontSize: 10.5, color: '#7c7059', fontStyle: 'italic' }}>{stop.owner}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {stop.info.address && <InfoRow label={tl.addressL} value={stop.info.address} />}
        {stop.info.hours   && <InfoRow label={tl.hoursL}   value={stop.info.hours} />}
        {stop.info.entry   && <InfoRow label={tl.entryL}   value={stop.info.entry} />}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #ece4d5', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ background: '#fff', border: '1px solid #ddd1bd', padding: 3, borderRadius: 3, flexShrink: 0 }}>
          <img src={qrUrl(stop.id)} alt="QR" width={42} height={42} crossOrigin="anonymous" />
        </div>
        <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 8, color: '#a99a7e', lineHeight: 1.45, wordBreak: 'break-all' }}>
          fargonaabadiymeros.uz/<wbr />museum/{stop.id}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ tl }) {
  return (
    <div className="pdf-avoid-break" style={{ background: '#a2683d', borderRadius: 5, padding: '18px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <div>
        <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.7)', marginBottom: 7 }}>ВЕСЬ МАРШРУТ</div>
        <div style={{ fontFamily: 'Playfair Display,serif', fontWeight: 800, fontSize: 28, color: '#fff', lineHeight: 1, marginBottom: 5 }}>{tl.totalKm}</div>
        <div style={{ fontFamily: 'Spectral,serif', fontSize: 11.5, color: 'rgba(255,255,255,.85)', lineHeight: 1.5 }}>{tl.totalMeta}</div>
      </div>
      <div style={{ marginTop: 18 }}>
        <p style={{ fontFamily: 'Spectral,serif', fontSize: 10.5, color: 'rgba(255,255,255,.8)', margin: '0 0 9px', lineHeight: 1.5 }}>{tl.buildRoute}</p>
        <div style={{ background: '#fff', padding: 5, borderRadius: 3, display: 'inline-block' }}>
          <img src={routeQr} alt="Route QR" width={60} height={60} crossOrigin="anonymous" />
        </div>
      </div>
    </div>
  );
}

/* ── main component ──────────────────────────────────────────────── */
export default function RoutePrintPage() {
  const { museums } = useMuseums();
  const { lang }    = useLang();
  const navigate    = useNavigate();
  const pdfRef      = useRef(null);
  const [dlState, setDlState] = useState('idle'); // idle | loading | done
  const tl = TL[lang] || TL.ru;

  const stops = useMemo(() => ROUTE_STOPS.map(r => {
    const m = museums.find(x => x.id === r.id);
    if (!m) return null;
    const loc = m[lang] || m.uz || m.ru || m.en || m;
    return { ...r, name: loc.name || r.id, owner: loc.owner || '', info: loc.info || {}, hero: getHero(m), city: m.city };
  }).filter(Boolean), [museums, lang]);

  const kokandStops = stops.filter(s => s.stop <= 2);
  const otherStops  = stops.filter(s => s.stop > 2);

  const handleDownload = async () => {
    if (dlState === 'loading') return;
    setDlState('loading');
    try {
      // Wait for every <img> inside the PDF area to finish loading.
      // Without this, html2canvas snapshots QR codes (and any late-loading
      // photos) before they are on screen, leaving empty white squares.
      const imgs = pdfRef.current ? Array.from(pdfRef.current.querySelectorAll('img')) : [];
      await Promise.all(imgs.map(img => (
        img.complete && img.naturalHeight !== 0
          ? Promise.resolve()
          : new Promise(resolve => {
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
            })
      )));

      const { default: html2pdf } = await import('html2pdf.js');
      await html2pdf()
        .set({
          margin: 0,
          filename: tl.filename,
          image: { type: 'jpeg', quality: 0.93 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: false, letterRendering: true, imageTimeout: 20000 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
          // `after` breaks the page *after* each element with .pdf-page-break,
          // which is what we want: cover ends → new page for cards.
          // Using `before` here produced a blank first page because the class
          // was on the cover itself.
          pagebreak: { mode: ['css', 'legacy'], after: '.pdf-page-break', avoid: '.pdf-avoid-break' },
        })
        .from(pdfRef.current)
        .save();
    } catch (e) {
      console.error(e);
    }
    setDlState('done');
    setTimeout(() => setDlState('idle'), 3000);
  };

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          header, footer { display: none !important; }
          body { margin: 0 !important; background: #fff !important; }
          .pdf-page-break { page-break-after: always; break-after: page; }
          @page { margin: 0; size: A4 landscape; }
        }
      `}</style>

      {/* ── top controls ── */}
      <div className="no-print" style={{
        position: 'sticky', top: 0, zIndex: 99,
        background: 'var(--bg)', borderBottom: '1px solid var(--line)',
        padding: '11px 32px', display: 'flex', gap: 12, alignItems: 'center',
      }}>
        <button onClick={() => navigate('/route')} style={{ fontFamily: 'var(--font-ui)', cursor: 'pointer', background: 'transparent', border: '1px solid var(--line)', color: 'var(--muted)', padding: '8px 18px', borderRadius: 99, fontSize: 13, fontWeight: 600 }}>
          {tl.backBtn}
        </button>
        <button
          onClick={handleDownload}
          disabled={dlState === 'loading'}
          style={{ fontFamily: 'var(--font-ui)', cursor: dlState === 'loading' ? 'wait' : 'pointer', border: 'none', background: dlState === 'done' ? '#4c8c4a' : 'var(--accent)', color: 'var(--accent-fg)', padding: '8px 22px', borderRadius: 99, fontSize: 13, fontWeight: 700, opacity: dlState === 'loading' ? .7 : 1, transition: 'all .2s' }}
        >
          {dlState === 'loading' ? tl.dlLoading : dlState === 'done' ? '✓ PDF' : tl.dlBtn}
        </button>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11.5, color: 'var(--muted)' }}>A4 · landscape</span>
      </div>

      {/* ── PDF content ── */}
      <div ref={pdfRef} style={{ background: '#f4efe6' }}>

        {/* PAGE 1: dark cover */}
        <div className="pdf-page-break" style={{
          background: '#2b2520', display: 'grid', gridTemplateColumns: '1fr 1fr',
          minHeight: 530, pageBreakAfter: 'always',
        }}>
          {/* left */}
          <div style={{ padding: '52px 44px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 9, letterSpacing: '.26em', textTransform: 'uppercase', color: '#c49a5e', marginBottom: 28 }}>{tl.printLabel}</div>
            <div style={{ fontFamily: 'Playfair Display,Georgia,serif', fontWeight: 400, fontSize: 62, lineHeight: .94, color: '#f1e8d6', marginBottom: 18, letterSpacing: '-.01em' }}>
              <div>{tl.title1}</div>
              <div>{tl.title2}</div>
            </div>
            <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: '#c49a5e', marginBottom: 14 }}>{tl.sub}</div>
            <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 12, color: '#a99a7e', marginBottom: 22 }}>{tl.meta}</div>
            <p style={{ fontFamily: 'Spectral,Georgia,serif', fontSize: 14, lineHeight: 1.72, color: '#c8baa4', margin: '0 0 30px', maxWidth: 340, fontWeight: 300, whiteSpace: 'pre-line' }}>{tl.desc}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
              {stops.map(s => (
                <div key={s.id} style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 700, fontSize: 13, color: '#c49a5e', width: 16, flexShrink: 0 }}>{s.stop}</span>
                  <div>
                    <span style={{ fontFamily: 'Spectral,serif', fontSize: 13, color: '#f1e8d6' }}>{s.name}</span>
                    <span style={{ fontFamily: 'Manrope,sans-serif', fontSize: 10, color: '#7a6854', marginLeft: 9 }}>{(CITIES[s.city]?.[lang] || '').toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 'auto' }}>
              <div style={{ background: '#fff', padding: 5, borderRadius: 4 }}>
                <img src={routeQr} alt="QR" width={52} height={52} crossOrigin="anonymous" />
              </div>
              <div>
                <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 10.5, color: '#c49a5e', letterSpacing: '.05em' }}>{tl.siteUrl}</div>
                <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 9.5, color: '#7a6854', marginTop: 3 }}>2026</div>
              </div>
            </div>
          </div>

          {/* right: geographic map */}
          <div style={{ background: '#1e1408', padding: '44px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 8.5, letterSpacing: '.3em', textTransform: 'uppercase', color: '#7a6854', marginBottom: 22 }}>{tl.schemaTitle}</div>
            <GeoMap stops={stops} />
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {stops.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 19, height: 19, borderRadius: '50%', background: '#c49a5e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 700, fontSize: 9.5, color: '#1a110b' }}>{s.stop}</span>
                  </div>
                  <span style={{ fontFamily: 'Spectral,serif', fontSize: 12, color: '#f1e8d6', flex: 1 }}>{s.name}</span>
                  <span style={{ fontFamily: 'Manrope,sans-serif', fontSize: 9.5, color: '#7a6854' }}>{CITIES[s.city]?.[lang] || ''}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PAGE 2: Kokand stops (1–2 + summary) */}
        <div className="pdf-page-break" style={{ background: '#f4efe6', padding: '40px 34px', minHeight: 530 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 8.5, letterSpacing: '.22em', textTransform: 'uppercase', color: '#c49a5e', marginBottom: 6 }}>5 ОСТАНОВОК</div>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontWeight: 700, fontSize: 28, color: '#20190f', margin: 0, lineHeight: 1.08 }}>{tl.pageTitle}</h2>
            </div>
            <p style={{ fontFamily: 'Spectral,serif', fontSize: 12, color: '#7c7059', margin: 0, lineHeight: 1.55, maxWidth: 260, textAlign: 'right' }}>{tl.scanHint}</p>
          </div>

          <SectionLabel label={tl.kokandSec} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 13 }}>
            {kokandStops.map(s => <MuseumCard key={s.id} stop={s} lang={lang} tl={tl} />)}
            <SummaryCard tl={tl} />
          </div>
        </div>

        {/* PAGE 3: Margilan / Fergana stops (3–5) */}
        <div style={{ background: '#f4efe6', padding: '40px 34px', minHeight: 530 }}>
          <SectionLabel label={tl.otherSec} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 13 }}>
            {otherStops.map(s => <MuseumCard key={s.id} stop={s} lang={lang} tl={tl} />)}
          </div>

          <div style={{ marginTop: 28, borderTop: '1px solid #ddd1bd', paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 8.5, color: '#a99a7e', letterSpacing: '.1em', textTransform: 'uppercase' }}>{tl.footer}</div>
            <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 8.5, color: '#a99a7e' }}>fargonaabadiymeros.uz  •  2026</div>
          </div>
        </div>

      </div>
    </>
  );
}
