import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useConfig } from '../i18n/useConfig';
import { useLang } from '../i18n/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export default function FooterSection() {
  const sectionRef = useRef(null);
  const namesRef = useRef(null);
  const dateRef = useRef(null);
  const config = useConfig();
  const { t } = useLang();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from([namesRef.current, dateRef.current], {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.18,
        ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={sectionRef}
      style={{
        background: '#87A96B',
        padding: 'clamp(1.5rem,4vw,2.5rem) clamp(1rem,4vw,3rem)',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Subtle radial warmth */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(255,255,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
        {/* Top ornament */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: 'clamp(1.5rem,4vw,2.5rem)',
          }}
        >
          <div style={{ height: '1px', width: '60px', background: 'linear-gradient(to right, transparent, rgba(135,169,107,0.4))' }} />
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>✦</div>
          <div style={{ height: '1px', width: '60px', background: 'linear-gradient(to left, transparent, rgba(135,169,107,0.4))' }} />
        </div>

        {/* Couple names */}
        <div ref={namesRef} style={{ marginBottom: '0.75rem' }}>
          <p
            style={{
              fontFamily: '"Playfair Display", "Cormorant Garamond", serif',
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: 'clamp(1.8rem,5vw,3rem)',
              color: '#fff',
              letterSpacing: '0.04em',
            }}
          >
            {config.couple.groom.firstName}{' '}
            <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 300 }}>&amp;</span>
            {' '}{config.couple.bride.firstName}
          </p>
        </div>

        {/* Date */}
        <div ref={dateRef} style={{ marginBottom: 'clamp(1.5rem,4vw,3rem)' }}>
          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 200,
              fontSize: '0.7rem',
              letterSpacing: '0.45em',
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            {config.wedding.dateFormatted}
          </p>
        </div>

        {/* Contact row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'clamp(0.75rem,3vw,1.5rem)',
            flexWrap: 'wrap',
            marginBottom: 'clamp(1rem,3vw,1.5rem)',
          }}
        >
          <a
            href={`https://wa.me/${config.events.rsvp.phone1.replace(/[\s+]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 200,
              fontSize: '0.72rem',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.85)',
              textDecoration: 'none',
              transition: 'color 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
            dir="ltr"
          >
            {config.events.rsvp.phone1}
          </a>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>·</span>
          <a
            href={`https://wa.me/${config.events.rsvp.phone2.replace(/[\s+]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 200,
              fontSize: '0.72rem',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.85)',
              textDecoration: 'none',
              transition: 'color 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
            dir="ltr"
          >
            {config.events.rsvp.phone2}
          </a>
        </div>

        {/* Bottom credit */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.18)', paddingTop: '1rem' }}>
          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 100,
              fontSize: '0.65rem',
              letterSpacing: '0.25em',
              color: 'rgba(255,255,255,0.9)',
              textTransform: 'uppercase',
            }}
          >
            {t('footer.madeWith').split('♡').map((part, idx, arr) =>
              idx === 0 ? (
                <span key={idx}>{part}</span>
              ) : (
                <span key={idx}>
                  <span style={{ color: 'rgb(255, 227, 100)' }}>♡</span>
                  {part}
                </span>
              )
            )}
            {' '}{config.couple.bride.firstName} &amp; {config.couple.groom.firstName}
          </p>
        </div>
      </div>
    </footer>
  );
}