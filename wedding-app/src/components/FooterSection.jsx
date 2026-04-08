import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import config from '@config';

gsap.registerPlugin(ScrollTrigger);

export default function FooterSection() {
  const sectionRef = useRef(null);
  const quoteRef   = useRef(null);
  const namesRef   = useRef(null);
  const dateRef    = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from([quoteRef.current, namesRef.current, dateRef.current], {
        y: 40,
        opacity: 0,
        duration: 1.1,
        stagger: 0.2,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={sectionRef}
      style={{
        background: '#1e3518',
        padding: 'clamp(2rem,8vw,9rem) clamp(1rem,4vw,4rem)',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Radial glow background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(107,122,21,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
        {/* Ornamental top */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: 'clamp(1.5rem,4vw,3rem)',
          }}
        >
          <div style={{ height: '1px', width: '80px', background: 'linear-gradient(to right, transparent, rgba(204,158,36,0.4))' }} />
          <div style={{ color: '#cc9e24', fontSize: '0.8rem', opacity: 0.7 }}>✦</div>
          <div style={{ height: '1px', width: '80px', background: 'linear-gradient(to left, transparent, rgba(204,158,36,0.4))' }} />
        </div>

        {/* Poem / quote */}
        <blockquote
          ref={quoteRef}
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(1.2rem,3.5vw,1.8rem)',
            color: 'rgba(250,248,240,0.6)',
            lineHeight: 1.8,
            marginBottom: 'clamp(1.5rem,4vw,3rem)',
          }}
        >
          &ldquo;{config.ui.footer.quote}&rdquo;
        </blockquote>

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '60px',
            background: 'linear-gradient(to bottom, #cc9e24, transparent)',
            margin: '0 auto clamp(1.5rem,4vw,3rem)',
          }}
        />

        {/* Couple names */}
        <div ref={namesRef} style={{ marginBottom: '1rem' }}>
          <p
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 300,
              fontSize: 'clamp(2rem,6vw,3.5rem)',
              color: '#faf8f0',
              letterSpacing: '0.05em',
            }}
          >
            {config.couple.groom.firstName}{' '}
            <span style={{ color: '#cc9e24', fontStyle: 'italic' }}>&amp;</span>
            {' '}{config.couple.bride.firstName}
          </p>
        </div>

        {/* Date */}
        <div ref={dateRef} style={{ marginBottom: 'clamp(1.5rem,5vw,3.5rem)' }}>
          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 200,
              fontSize: '0.7rem',
              letterSpacing: '0.5em',
              color: 'rgba(204,158,36,0.6)',
              textTransform: 'uppercase',
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
            gap: 'clamp(0.75rem, 3vw, 2rem)',
            flexWrap: 'wrap',
            marginBottom: 'clamp(1.5rem,4vw,3rem)',
          }}
        >
          {/* <a
            href={`mailto:${config.events.rsvp.email}`}
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 200,
              fontSize: '0.72rem',
              letterSpacing: '0.15em',
              color: 'rgba(204,158,36,0.6)',
              textDecoration: 'none',
              transition: 'color 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#cc9e24'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(204,158,36,0.6)'}
          >
            {config.events.rsvp.email}
          </a>
          <span style={{ color: 'rgba(204,158,36,0.3)', fontSize: '0.7rem' }}>·</span> */}
          <a
            href={`https://wa.me/${config.events.rsvp.phone1.replace(/[\s+]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 200,
              fontSize: '0.72rem',
              letterSpacing: '0.15em',
              color: 'rgba(204,158,36,0.6)',
              textDecoration: 'none',
              transition: 'color 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#cc9e24'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(204,158,36,0.6)'}
          >
            {config.events.rsvp.phone1}
          </a>
          <span style={{ color: 'rgba(204,158,36,0.3)', fontSize: '0.7rem' }}>·</span>
          <a
            href={`https://wa.me/${config.events.rsvp.phone2.replace(/[\s+]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 200,
              fontSize: '0.72rem',
              letterSpacing: '0.15em',
              color: 'rgba(204,158,36,0.6)',
              textDecoration: 'none',
              transition: 'color 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#cc9e24'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(204,158,36,0.6)'}
          >
            {config.events.rsvp.phone2}
          </a>
        </div>

        {/* Bottom ornament */}
        <div
          style={{
            borderTop: '1px solid rgba(204,158,36,0.1)',
            paddingTop: '2rem',
          }}
        >
          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 100,
              fontSize: '0.65rem',
              letterSpacing: '0.3em',
              color: 'rgba(250, 248, 240, 0.76)',
              textTransform: 'uppercase',
            }}
          >
            Made with ♡ for {config.couple.bride.firstName} &amp; {config.couple.groom.firstName}
          </p>
        </div>
      </div>
    </footer>
  );
}
