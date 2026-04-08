import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import config from '@config';

gsap.registerPlugin(ScrollTrigger);

const NAV_ITEMS = config.navigation;

export default function Navigation() {
  const navRef     = useRef(null);
  const mobileMenuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    // Hide initially — reveal after hero
    gsap.set(nav, { y: -80, opacity: 0 });

    ScrollTrigger.create({
      start: 'top -80px',
      onEnter:      () => gsap.to(nav, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }),
      onLeaveBack:  () => gsap.to(nav, { y: -80, opacity: 0, duration: 0.4, ease: 'power2.in' }),
    });

    return () => ScrollTrigger.getAll().forEach(t => {
      if (t.vars?.id === 'nav') t.kill();
    });
  }, []);

  // Smooth scroll using Lenis if available, fallback to native
  const scrollTo = (href) => {
    setMenuOpen(false);
    const target = document.querySelector(href);
    if (!target) return;
    if (window.__lenis) {
      window.__lenis.scrollTo(target, { offset: -60 });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Mobile menu animation
  useEffect(() => {
    const menu = mobileMenuRef.current;
    if (!menu) return;
    if (menuOpen) {
      gsap.fromTo(menu,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' }
      );
    } else {
      gsap.to(menu, { opacity: 0, y: -10, duration: 0.25, ease: 'power2.in' });
    }
  }, [menuOpen]);

  return (
    <nav
      ref={navRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '0 clamp(1.5rem,5vw,4rem)',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(26,46,20,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(204,158,36,0.15)',
      }}
    >
      {/* Logo / Monogram */}
      <button
        onClick={() => scrollTo('#hero')}
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: '1.4rem',
          fontWeight: 400,
          color: '#cc9e24',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          letterSpacing: '0.1em',
        }}
      >
        {config.couple.groom.firstName.charAt(0)}&nbsp;&amp;&nbsp;{config.couple.bride.firstName.charAt(0)}
      </button>

      {/* Desktop links — display controlled by className only to avoid override */}
      <style>{`
        @media (max-width: 767px) { .nav-links { display: none !important; } }
        @media (min-width: 768px) { .nav-hamburger { display: none !important; } }
      `}</style>
      <ul
        className="nav-links"
        style={{
          gap: '2.5rem',
          listStyle: 'none',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            {item.highlight ? (
              <button
                onClick={() => scrollTo(item.href)}
                style={{
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '0.72rem',
                  fontWeight: 300,
                  letterSpacing: '0.35em',
                  textTransform: 'uppercase',
                  color: '#1a2e14',
                  background: 'linear-gradient(135deg,#f9cc01,#cc9e24)',
                  border: 'none',
                  padding: '0.45rem 1.4rem',
                  cursor: 'pointer',
                  transition: 'opacity 0.3s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {item.label}
              </button>
            ) : (
              <button
                onClick={() => scrollTo(item.href)}
                style={{
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '0.72rem',
                  fontWeight: 300,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: 'rgba(250,248,240,0.7)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.3s',
                  position: 'relative',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#cc9e24'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(250,248,240,0.7)'}
              >
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Mobile hamburger */}
      <button
        className="nav-hamburger"
        onClick={() => setMenuOpen(o => !o)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          padding: '4px',
        }}
        aria-label="Menu"
      >
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              display: 'block',
              width: '24px',
              height: '1px',
              background: '#cc9e24',
              transition: 'all 0.3s ease',
              transform: menuOpen
                ? i === 0 ? 'rotate(45deg) translate(4px,4px)'
                : i === 2 ? 'rotate(-45deg) translate(4px,-4px)'
                : 'scaleX(0)'
                : 'none',
              opacity: menuOpen && i === 1 ? 0 : 1,
            }}
          />
        ))}
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          ref={mobileMenuRef}
          className="nav-hamburger"
          style={{
            position: 'absolute',
            top: '64px',
            left: 0,
            right: 0,
            background: 'rgba(26,46,20,0.97)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(204,158,36,0.15)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
          }}
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollTo(item.href)}
              style={{
                fontFamily: 'Jost, sans-serif',
                fontSize: '0.85rem',
                fontWeight: 300,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: item.highlight ? '#cc9e24' : 'rgba(250,248,240,0.8)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                padding: '0.5rem 0',
                borderBottom: '1px solid rgba(201,168,76,0.1)',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
