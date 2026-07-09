import { useLang } from '../contexts/LangContext';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer style={{ borderTop: '2px solid var(--line)', padding: '30px 24px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginBottom: 12 }}>
        <span style={{ width: 8, height: 8, background: 'var(--indigo)', transform: 'rotate(45deg)', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, background: 'var(--accent)', transform: 'rotate(45deg)', display: 'inline-block' }} />
        <span style={{ width: 8, height: 8, background: 'var(--gold)', transform: 'rotate(45deg)', display: 'inline-block' }} />
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', color: 'var(--muted)', fontSize: 12.5, letterSpacing: '.08em' }}>
        {t.siteName} · {t.siteSub}
      </div>
    </footer>
  );
}
