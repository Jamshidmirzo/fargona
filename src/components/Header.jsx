import { NavLink } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';

export default function Header() {
  const { lang, setLang, t } = useLang();
  const { theme, setMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: t.nav.home },
    { to: '/map', label: t.nav.map },
    { to: '/timeline', label: t.nav.timeline },
    { to: '/route', label: t.nav.route },
    { to: '/saved', label: t.nav.saved },
    { to: '/news', label: t.nav.news },
    { to: '/events', label: t.nav.events },
  ];

  const segStyle = (active) => ({
    fontFamily: 'var(--font-ui)', cursor: 'pointer', border: 'none',
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? 'var(--accent-fg)' : 'var(--muted)',
    padding: '6px 13px', borderRadius: '99px', fontSize: '12px',
    fontWeight: 600, letterSpacing: '.04em', whiteSpace: 'nowrap', transition: 'all .2s'
  });

  const navStyle = (isActive) => ({
    fontFamily: 'var(--font-ui)', cursor: 'pointer',
    background: isActive ? 'var(--surface2)' : 'transparent',
    border: 'none', padding: '9px 15px', borderRadius: '99px',
    fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap',
    color: isActive ? 'var(--fg)' : 'var(--muted)',
    textDecoration: 'none', transition: 'all .2s'
  });

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'color-mix(in srgb, var(--bg) 90%, transparent)',
      backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)'
    }}>
      <div style={{
        maxWidth: 1240, margin: '0 auto', padding: '18px 40px',
        display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap'
      }}>
        <NavLink to="/" style={{ display: 'block', textDecoration: 'none', marginRight: 'auto', lineHeight: 1 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 21, letterSpacing: '.01em', color: 'var(--fg)' }}>{t.siteName}</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, color: 'var(--muted)', letterSpacing: '.34em', textTransform: 'uppercase', marginTop: 4, fontWeight: 500 }}>Nafis · Fargʻona</div>
        </NavLink>

        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          display: 'none', background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--fg)', fontSize: 24, padding: 4
        }} className="mobile-menu-btn">☰</button>

        <nav style={{ display: 'flex', gap: 4, overflowX: 'auto', maxWidth: '100%' }} className="main-nav">
          {navItems.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}
              style={({ isActive }) => navStyle(isActive)}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 3, padding: 3, background: 'var(--surface2)', borderRadius: 99 }}>
            {['uz', 'ru', 'en'].map(code => (
              <button key={code} onClick={() => setLang(code)} style={segStyle(code === lang)}>
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 3, padding: 3, background: 'var(--surface2)', borderRadius: 99 }}>
            {[['light', t.light], ['dark', t.dark]].map(([k, lb]) => (
              <button key={k} onClick={() => setMode(k)} style={segStyle(k === theme)}>{lb}</button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
