import { NavLink, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
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

  useEffect(() => { if (!isMobile) setMenuOpen(false); }, [isMobile]);

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

  // The drawer must live OUTSIDE <header>: header has backdrop-filter which
  // creates a stacking context, and that turns any inner position:fixed into
  // "fixed relative to the header" (a 60px strip), making the drawer
  // invisible. Portal to body keeps it truly full-viewport.
  const drawer = (isMobile && menuOpen) ? createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) setMenuOpen(false); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
        animation: 'fadeIn .18s ease both',
      }}
    >
      {/* Top bar inside the drawer with close button */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid var(--line)',
        background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 1,
      }}>
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 17, color: 'var(--fg)' }}>{t.siteName}</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 8, color: 'var(--muted)', letterSpacing: '.34em', textTransform: 'uppercase', marginTop: 4, fontWeight: 500 }}>Nafis · Fargʻona</div>
        </div>
        <button
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
          style={{ background: 'var(--surface2)', border: '1px solid var(--line)', cursor: 'pointer', color: 'var(--fg)', width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>
        </button>
      </div>

      {/* Nav links */}
      <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            style={({ isActive }) => ({
              display: 'block', padding: '14px 16px',
              fontFamily: 'var(--font-ui)', fontSize: 17, fontWeight: 600,
              color: isActive ? 'var(--accent)' : 'var(--fg)',
              background: isActive ? 'var(--surface2)' : 'transparent',
              borderRadius: 12, textDecoration: 'none',
            })}
          >
            {n.label}
          </NavLink>
        ))}
      </nav>

      {/* Lang + theme */}
      <div style={{
        marginTop: 'auto', padding: '20px 20px 32px',
        borderTop: '1px solid var(--line)',
        display: 'flex', gap: 12, flexWrap: 'wrap',
      }}>
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
    </div>,
    document.body
  ) : null;

  return (
    <>
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
                cursor: 'pointer', color: 'var(--fg)', padding: 0,
                borderRadius: 10, display: 'flex', alignItems: 'center',
                justifyContent: 'center', width: 44, height: 44, flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" />
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
      </header>
      {drawer}
    </>
  );
}
