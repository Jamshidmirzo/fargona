import { NavLink, useLocation } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useTheme } from '../contexts/ThemeContext';
import { useEffect, useState } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function Header() {
  const { lang, setLang, t } = useLang();
  const { theme, setMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  const navItems = [
    { to: '/', label: t.nav.home },
    { to: '/map', label: t.nav.map },
    { to: '/timeline', label: t.nav.timeline },
    { to: '/route', label: t.nav.route },
    { to: '/saved', label: t.nav.saved },
    { to: '/passport', label: t.nav.passport },
    { to: '/news', label: t.nav.news },
    { to: '/events', label: t.nav.events },
  ];

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [menuOpen]);

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
      position: 'sticky', top: 0, zIndex: 70,
      background: 'color-mix(in srgb, var(--bg) 90%, transparent)',
      backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)'
    }}>
      <div style={{
        maxWidth: 1240, margin: '0 auto',
        padding: isMobile ? '12px 16px' : '18px 40px',
        display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 24,
        flexWrap: 'wrap'
      }}>
        <NavLink to="/" style={{ display: 'block', textDecoration: 'none', marginRight: 'auto', lineHeight: 1 }}>
          <div style={{
            fontFamily: 'var(--font-head)', fontWeight: 600,
            fontSize: isMobile ? 17 : 21, letterSpacing: '.01em', color: 'var(--fg)'
          }}>{t.siteName}</div>
          <div style={{
            fontFamily: 'var(--font-ui)', fontSize: isMobile ? 8 : 9,
            color: 'var(--muted)', letterSpacing: '.34em',
            textTransform: 'uppercase', marginTop: 4, fontWeight: 500
          }}>Nafis · Fargʻona</div>
        </NavLink>

        {isMobile ? (
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            style={{
              background: 'var(--surface2)', border: '1px solid var(--line)',
              cursor: 'pointer', color: 'var(--fg)', padding: '8px 12px',
              borderRadius: 10, display: 'flex', alignItems: 'center',
              justifyContent: 'center', width: 44, height: 44
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              {menuOpen ? (
                <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>
              ) : (
                <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>
              )}
            </svg>
          </button>
        ) : (
          <>
            <nav style={{ display: 'flex', gap: 4, overflowX: 'auto', maxWidth: '100%' }}>
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
          </>
        )}
      </div>

      {isMobile && menuOpen && (
        <div className="mobile-drawer" onClick={(e) => { if (e.target === e.currentTarget) setMenuOpen(false); }}>
          {navItems.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) => 'mobile-drawer-link' + (isActive ? ' active' : '')}
            >
              {n.label}
            </NavLink>
          ))}

          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
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
      )}
    </header>
  );
}
