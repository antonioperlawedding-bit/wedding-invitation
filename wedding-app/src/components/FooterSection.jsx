import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useConfig } from '../i18n/useConfig';
import { useLang } from '../i18n/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export default function FooterSection() {
  const sectionRef = useRef(null);
  const quoteRef = useRef(null);
  const namesRef = useRef(null);
  const dateRef = useRef(null);
  const config = useConfig();
  const { t } = useLang();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from([quoteRef.current, namesRef.current, dateRef.current], {
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
        background: '#162F24',
        padding: 'clamp(3rem,8vw,7rem) clamp(1rem,4vw,3rem) clamp(1.5rem,4vw,3.5rem)',
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
          background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(135,169,107,0.08) 0%, transparent 70%)',
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
          <div style={{ color: '#87A96B', fontSize: '0.7rem', opacity: 0.6 }}>✦</div>
          <div style={{ height: '1px', width: '60px', background: 'linear-gradient(to left, transparent, rgba(135,169,107,0.4))' }} />
        </div>

        {/* Quote */}
        <blockquote
          ref={quoteRef}
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(1.1rem,3vw,1.6rem)',
            color: 'rgba(250,248,240,0.55)',
            lineHeight: 1.8,
            marginBottom: 'clamp(1.5rem,4vw,2.5rem)',
          }}
        >
          &ldquo;{config.ui.footer.quote}&rdquo;
        </blockquote>

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '48px',
            background: 'linear-gradient(to bottom, rgba(135,169,107,0.5), transparent)',
            margin: '0 auto clamp(1.5rem,4vw,2.5rem)',
          }}
        />

        {/* Couple names */}
        <div ref={namesRef} style={{ marginBottom: '0.75rem' }}>
          <p
            style={{
              fontFamily: '"Playfair Display", "Cormorant Garamond", serif',
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: 'clamp(1.8rem,5vw,3rem)',
              color: '#faf8f0',
              letterSpacing: '0.04em',
            }}
          >
            {config.couple.groom.firstName}{' '}
            <span style={{ color: '#A8D8A0', fontWeight: 300 }}>&amp;</span>
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
              color: 'rgba(135,169,107,0.6)',
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
            marginBottom: 'clamp(1.5rem,4vw,2.5rem)',
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
              color: 'rgba(135,169,107,0.6)',
              textDecoration: 'none',
              transition: 'color 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#87A96B'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(135,169,107,0.6)'}
          >
            {config.events.rsvp.phone1}
          </a>
          <span style={{ color: 'rgba(135,169,107,0.3)', fontSize: '0.7rem' }}>·</span>
          <a
            href={`https://wa.me/${config.events.rsvp.phone2.replace(/[\s+]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 200,
              fontSize: '0.72rem',
              letterSpacing: '0.12em',
              color: 'rgba(135,169,107,0.6)',
              textDecoration: 'none',
              transition: 'color 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#87A96B'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(135,169,107,0.6)'}
          >
            {config.events.rsvp.phone2}
          </a>
        </div>

        {/* Bottom credit */}
        <div style={{ borderTop: '1px solid rgba(135,169,107,0.1)', paddingTop: '1.5rem' }}>
          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 100,
              fontSize: '0.65rem',
              letterSpacing: '0.25em',
              color: 'rgba(250,248,240,0.5)',
              textTransform: 'uppercase',
            }}
          >
            {t('footer.madeWith')} {config.couple.bride.firstName} &amp; {config.couple.groom.firstName}
          </p>
        </div>
      </div>
    </footer>
  );
}