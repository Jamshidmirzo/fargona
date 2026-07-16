import { useLang } from '../contexts/LangContext';
import { useSaved } from '../contexts/SavedContext';
import { useMuseums } from '../contexts/MuseumsContext';
import MuseumCard from '../components/MuseumCard';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function SavedPage() {
  const { museums, loading } = useMuseums();
  const { t } = useLang();
  const { saved } = useSaved();
  const isMobile = useIsMobile();
  if (loading) return <div style={{padding:48, textAlign:'center', color:'var(--muted)'}}>Loading museums...</div>;

  const savedMuseums = museums.filter(m => saved.includes(m.id));

  return (
    <section style={{ maxWidth: 1180, margin: '0 auto', padding: isMobile ? '18px 16px 60px' : '26px 24px 90px', animation: 'fhFade .4s ease both' }}>
      <div style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>{t.nav.saved}</div>
      <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 'clamp(30px, 4.4vw, 48px)', color: 'var(--fg)', margin: '0 0 8px' }}>{t.savedTitle}</h1>
      <p style={{ fontSize: 16, color: 'var(--muted)', margin: '0 0 34px', maxWidth: 560 }}>{t.savedText}</p>

      {savedMuseums.length === 0 ? (
        <div style={{ padding: '60px 24px', textAlign: 'center', border: '1px dashed var(--line)', borderRadius: 'var(--radius)', background: 'var(--surface)' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--muted)' }}>★</div>
          <div style={{ fontSize: 16, color: 'var(--muted)' }}>{t.noSaved}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 26 }}>
          {savedMuseums.map((m, i) => <MuseumCard key={m.id} museum={m} index={i} useCardView={true} />)}
        </div>
      )}
    </section>
  );
}
