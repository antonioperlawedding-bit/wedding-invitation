import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import config from '@config';
import { useLang } from '../i18n/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const NAV_HREFS = config.navigation.map(n => ({ href: n.href, highlight: n.highlight }));
const NAV_KEYS = ['ourStory', 'ceremony', 'schedule', 'gallery', 'rsvp'];

export default function Navigation() {
  const navRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang, t, isAr } = useLang();

  const navItems = NAV_HREFS.map((item, i) => ({
    ...item,
    label: t(`nav.${NAV_KEYS[i]}`),
  }));

  const fontFamily = isAr ? '"Tajawal", sans-serif' : 'Jost, sans-serif';

  useEffect(() => {
    const nav = navRef.current;
    gsap.set(nav, { y: -80, opacity: 0 });

    ScrollTrigger.create({
      start: 'top -80px',
      onEnter: () => gsap.to(nav, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }),
      onLeaveBack: () => gsap.to(nav, { y: -80, opacity: 0, duration: 0.4, ease: 'power2.in' }),
    });

    return () => ScrollTrigger.getAll().forEach(t => {
      if (t.vars?.id === 'nav') t.kill();
    });
  }, []);

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

  useEffect(() => {
    const menu = mobileMenuRef.current;
    if (!menu) return;
    if (menuOpen) {
      gsap.fromTo(menu, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' });
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
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(250,248,240,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(135,169,107,0.15)',
      }}
    >
      {/* Monogram */}
      <button
        onClick={() => scrollTo('#hero')}
        style={{
          fontFamily: '"Playfair Display", "Cormorant Garamond", serif',
          fontSize: '1.2rem',
          fontWeight: 400,
          fontStyle: 'italic',
          color: '#87A96B',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          letterSpacing: '0.1em',
        }}
      >
        {config.couple.groom.firstName.charAt(0)}&nbsp;&amp;&nbsp;{config.couple.bride.firstName.charAt(0)}
      </button>

      {/* Desktop links */}
      <style>{`
        @media (max-width: 767px) { .nav-links { display: none !important; } }
        @media (min-width: 768px) { .nav-hamburger { display: none !important; } }
      `}</style>
      <ul
        className="nav-links"
        style={{ gap: '2.5rem', listStyle: 'none', display: 'flex', alignItems: 'center' }}
      >
        {navItems.map((item) => (
          <li key={item.href}>
            {item.highlight ? (
              <button
                onClick={() => scrollTo(item.href)}
                style={{
                  fontFamily,
                  fontSize: isAr ? '0.78rem' : '0.7rem',
                  fontWeight: 400,
                  letterSpacing: isAr ? '0' : '0.3em',
                  textTransform: isAr ? 'none' : 'uppercase',
                  color: '#fff',
                  background: '#87A96B',
                  border: 'none',
                  padding: '0.45rem 1.4rem',
                  borderRadius: '0.35rem',
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
                  fontFamily,
                  fontSize: isAr ? '0.78rem' : '0.7rem',
                  fontWeight: 300,
                  letterSpacing: isAr ? '0' : '0.25em',
                  textTransform: isAr ? 'none' : 'uppercase',
                  color: 'rgba(58,46,32,0.6)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.3s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#87A96B'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(58,46,32,0.6)'}
              >
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Right side: always-visible language toggle + mobile hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={() => { setLang(isAr ? 'en' : 'ar'); setMenuOpen(false); }}
          style={{
            fontFamily: isAr ? 'Jost, sans-serif' : '"Tajawal", sans-serif',
            fontSize: '0.72rem',
            fontWeight: 400,
            color: 'rgba(58,46,32,0.55)',
            background: 'none',
            border: '1px solid rgba(135,169,107,0.3)',
            borderRadius: '0.3rem',
            padding: '0.3rem 0.7rem',
            cursor: 'pointer',
            transition: 'all 0.3s',
            letterSpacing: '0.05em',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#87A96B'; e.currentTarget.style.color = '#87A96B'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(135,169,107,0.3)'; e.currentTarget.style.color = 'rgba(58,46,32,0.55)'; }}
        >
          {isAr ? 'EN' : 'عربي'}
        </button>

        {/* Hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '4px',
            height: '100%',
          }}
          aria-label="Menu"
        >
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              display: 'block',
              width: '22px',
              height: '1.5px',
              background: '#87A96B',
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
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          ref={mobileMenuRef}
          className="nav-hamburger"
          style={{
            position: 'absolute',
            top: '60px',
            left: 0,
            right: 0,
            background: 'rgba(250,248,240,0.97)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(135,169,107,0.15)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem',
          }}
        >
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollTo(item.href)}
              style={{
                fontFamily,
                fontSize: isAr ? '0.9rem' : '0.82rem',
                fontWeight: 300,
                letterSpacing: isAr ? '0' : '0.2em',
                textTransform: isAr ? 'none' : 'uppercase',
                color: item.highlight ? '#87A96B' : 'rgba(58,46,32,0.7)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: isAr ? 'right' : 'left',
                padding: '0.6rem 0',
                borderBottom: '1px solid rgba(135,169,107,0.08)',
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