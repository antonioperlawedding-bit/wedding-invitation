import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import config from '@config';

gsap.registerPlugin(ScrollTrigger);

/* ── Elegant SVG icons (no emojis) ── */
const CeremonyIcon = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
    <line x1="17" y1="3" x2="17" y2="31" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="9" y1="11" x2="25" y2="11" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ReceptionIcon = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
    <path d="M10 4 C9 10 9 16 14 19 L14 28" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M20 4 C21 10 21 16 16 19 L16 28" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="11" y1="28" x2="19" y2="28" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="14" cy="8" r="1" fill="#c9a84c" opacity="0.7"/>
    <circle cx="20" cy="6" r="0.8" fill="#c9a84c" opacity="0.7"/>
  </svg>
);

/* ── CSS 3D tilt card ── */
function EventCard({ event, label, icon }) {
  const cardRef    = useRef(null);
  const glowRef    = useRef(null);
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width  / 2;
    const cy = rect.height / 2;
    const rotY =  ((x - cx) / cx) * 10;
    const rotX = -((y - cy) / cy) * 8;

    gsap.to(card, {
      rotateX: rotX,
      rotateY: rotY,
      duration: 0.3,
      ease: 'power2.out',
      transformStyle: 'preserve-3d',
      transformPerspective: 800,
    });

    // Move glow to cursor position
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        left: `${(x / rect.width) * 100}%`,
        top:  `${(y / rect.height) * 100}%`,
        duration: 0.3,
      });
    }
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: 'expo.out',
    });
    setHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        background: 'rgba(250,248,240,0.03)',
        border: '1px solid rgba(201,168,76,0.25)',
        padding: 'clamp(2rem,5vw,3.5rem)',
        maxWidth: '480px',
        width: '100%',
        overflow: 'hidden',
        cursor: 'pointer',
        willChange: 'transform',
        transition: 'box-shadow 0.4s ease',
        boxShadow: hovered
          ? '0 20px 60px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(201,168,76,0.4)'
          : '0 8px 30px rgba(0,0,0,0.2)',
      }}
    >
      {/* Glow effect */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          left: '50%',
          top: '50%',
        }}
      />

      {/* Top accent line (animates on hover) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #c9a84c, #f0d080, #c9a84c, transparent)',
          transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'transform 0.5s ease',
          transformOrigin: 'center',
        }}
      />

      {/* Icon */}
      <div
        style={{
          marginBottom: '1.5rem',
          fontSize: '2.2rem',
        }}
      >
        {icon}
      </div>

      {/* Label */}
      <p
        style={{
          fontFamily: 'Jost, sans-serif',
          fontWeight: 200,
          fontSize: '0.62rem',
          letterSpacing: '0.5em',
          color: '#c9a84c',
          textTransform: 'uppercase',
          marginBottom: '0.75rem',
        }}
      >
        {label}
      </p>

      {/* Venue */}
      <h3
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontWeight: 400,
          fontSize: 'clamp(1.6rem,4vw,2.2rem)',
          color: '#faf8f0',
          lineHeight: 1.2,
          marginBottom: '0.5rem',
        }}
      >
        {event.venue}
      </h3>

      {/* Date / time */}
      <p
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontStyle: 'italic',
          fontSize: '1.05rem',
          color: 'rgba(250,248,240,0.55)',
          marginBottom: '1.5rem',
        }}
      >
        Saturday, June 6, 2026 &nbsp;·&nbsp; {event.time}
      </p>

      {/* Address */}
      <p
        style={{
          fontFamily: 'Jost, sans-serif',
          fontWeight: 300,
          fontSize: '0.82rem',
          color: 'rgba(250,248,240,0.45)',
          lineHeight: 1.6,
          marginBottom: '2rem',
        }}
      >
        {event.address}
      </p>

      {/* Description */}
      <p
        style={{
          fontFamily: 'Jost, sans-serif',
          fontWeight: 300,
          fontSize: '0.82rem',
          color: 'rgba(250,248,240,0.4)',
          lineHeight: 1.6,
          marginBottom: '2rem',
        }}
      >
        {event.description}
      </p>

      <a
        href={event.mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontFamily: 'Jost, sans-serif',
          fontWeight: 300,
          fontSize: '0.7rem',
          letterSpacing: '0.35em',
          color: '#c9a84c',
          textDecoration: 'none',
          textTransform: 'uppercase',
          borderBottom: '1px solid rgba(201,168,76,0.4)',
          paddingBottom: '0.25rem',
          transition: 'color 0.3s, border-color 0.3s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = '#f0d080';
          e.currentTarget.style.borderColor = '#f0d080';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = '#c9a84c';
          e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)';
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        View on Map
      </a>
    </div>
  );
}

export default function EventsSection() {
  const sectionRef   = useRef(null);
  const ceremonRef   = useRef(null);
  const receptionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section tag + title entrance
      gsap.from('.events-header > *', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      });

      // Cards slide in from opposite sides
      gsap.from(ceremonRef.current, {
        x: -80,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: ceremonRef.current,
          start: 'top 80%',
        },
      });

      gsap.from(receptionRef.current, {
        x: 80,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: receptionRef.current,
          start: 'top 80%',
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="events"
      ref={sectionRef}
      style={{
        background: '#143526',
        padding: 'clamp(5rem,12vw,9rem) clamp(1.5rem,5vw,5rem)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background grid ornament */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div
          className="events-header"
          style={{ textAlign: 'center', marginBottom: 'clamp(3rem,8vw,5rem)' }}
        >
          <p className="section-tag" style={{ marginBottom: '0.75rem' }}>
            Join Us
          </p>
          <h2
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 400,
              fontSize: 'clamp(2.2rem,6vw,4rem)',
              color: '#faf8f0',
            }}
          >
            The Celebration
          </h2>
          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 200,
              fontSize: '0.82rem',
              color: 'rgba(250,248,240,0.4)',
              letterSpacing: '0.15em',
              marginTop: '0.75rem',
            }}
          >
            Two moments. One magical day.
          </p>
        </div>

        {/* Cards */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'clamp(2rem,5vw,4rem)',
            justifyContent: 'center',
          }}
        >
          <div ref={ceremonRef}>
            <EventCard
              event={config.events.ceremony}
              label="The Ceremony"
              icon={<CeremonyIcon />}
            />
          </div>
          <div ref={receptionRef}>
            <EventCard
              event={config.events.reception}
              label="The Reception"
              icon={<ReceptionIcon />}
            />
          </div>
        </div>

        {/* Connecting divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: 'clamp(3rem,8vw,5rem)',
          }}
        >
          <div style={{ height: '1px', flex: 1, maxWidth: '200px', background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.4))' }} />
          <div
            style={{
              width: '36px',
              height: '36px',
              border: '1px solid rgba(201,168,76,0.35)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              color: 'rgba(201,168,76,0.6)',
            }}
          >
            ♡
          </div>
          <div style={{ height: '1px', flex: 1, maxWidth: '200px', background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.4))' }} />
        </div>
      </div>
    </section>
  );
}
