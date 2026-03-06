import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getTimeRemaining } from '../utils/animations';

gsap.registerPlugin(ScrollTrigger);

const WEDDING_DATE = '2026-06-06T17:00:00';

function FlipNumber({ value, label }) {
  const prevRef  = useRef(value);
  const cardRef  = useRef(null);
  const frontRef = useRef(null);
  const backRef  = useRef(null);

  useEffect(() => {
    if (prevRef.current !== value) {
      // Flip animation
      const tl = gsap.timeline();
      tl.to(cardRef.current, {
        rotateX: -90,
        duration: 0.25,
        ease: 'power2.in',
        transformOrigin: 'top center',
      })
      .to(cardRef.current, {
        rotateX: 0,
        duration: 0.25,
        ease: 'power2.out',
        transformOrigin: 'bottom center',
      });
      prevRef.current = value;
    }
  }, [value]);

  const display = String(value).padStart(2, '0');

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Card */}
      <div
        ref={cardRef}
        style={{
          width: 'clamp(70px,18vw,110px)',
          height: 'clamp(80px,20vw,130px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(5,13,10,0.85)',
          border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: '6px',
          position: 'relative',
          overflow: 'hidden',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(201,168,76,0.1)',
        }}
      >
        {/* Shimmer line across middle */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '1px',
            background: 'rgba(201,168,76,0.35)',
            transform: 'translateY(-50%)',
          }}
        />
        {/* Number */}
        <span
          ref={frontRef}
          className="text-shimmer"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 300,
            fontSize: 'clamp(2.5rem,8vw,5rem)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          {display}
        </span>
        {/* Subtle glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      </div>
      {/* Label */}
      <p
        style={{
          fontFamily: 'Jost, sans-serif',
          fontWeight: 200,
          fontSize: '0.6rem',
          letterSpacing: '0.45em',
          color: 'rgba(201,168,76,0.7)',
          textTransform: 'uppercase',
          marginTop: '0.75rem',
        }}
      >
        {label}
      </p>
    </div>
  );
}

function Separator() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        paddingBottom: '2rem',
        alignSelf: 'center',
      }}
    >
      {[0,1].map(i => (
        <div
          key={i}
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: '#c9a84c',
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
}

export default function CountdownSection() {
  const sectionRef = useRef(null);
  const [time, setTime]   = useState(() => getTimeRemaining(WEDDING_DATE));
  const [visible, setVisible] = useState(false);

  const tick = useCallback(() => {
    setTime(getTimeRemaining(WEDDING_DATE));
  }, []);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => setVisible(true),
      });

      // Stagger reveal children
      gsap.from('.countdown-item', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
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
    <section
      ref={sectionRef}
      style={{
        background: '#050d0a',
        padding: 'clamp(5rem,12vw,9rem) clamp(1.5rem,5vw,4rem)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background watermark */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <p
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(6rem,25vw,18rem)',
            fontWeight: 300,
            color: 'rgba(201,168,76,0.06)',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            lineHeight: 1,
          }}
        >
          06.06.26
        </p>
      </div>

      <div style={{ position: 'relative', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        {/* Section tag */}
        <p
          className="countdown-item section-tag"
          style={{ marginBottom: '0.75rem', color: '#c9a84c' }}
        >
          Counting Down To
        </p>

        {/* Title */}
        <h2
          className="countdown-item section-title"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(2rem,6vw,3.5rem)',
            fontWeight: 400,
            color: '#faf8f0',
            marginBottom: '0.5rem',
          }}
        >
          Our Special Day
        </h2>

        <p
          className="countdown-item"
          style={{
            fontFamily: 'Jost, sans-serif',
            fontWeight: 200,
            fontSize: '0.85rem',
            color: 'rgba(250,248,240,0.45)',
            letterSpacing: '0.15em',
            marginBottom: '3.5rem',
          }}
        >
          Saturday, June 6, 2026 &nbsp;·&nbsp; Lebanon
        </p>

        {/* Timer */}
        <div
          className="countdown-item"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 'clamp(0.5rem,3vw,1.5rem)',
            flexWrap: 'wrap',
          }}
        >
          <FlipNumber value={time.days}    label="Days"    />
          <Separator />
          <FlipNumber value={time.hours}   label="Hours"   />
          <Separator />
          <FlipNumber value={time.minutes} label="Minutes" />
          <Separator />
          <FlipNumber value={time.seconds} label="Seconds" />
        </div>

        {/* Decorative bottom line */}
        <div
          className="countdown-item"
          style={{
            width: '1px',
            height: '60px',
            background: 'linear-gradient(to bottom, #c9a84c, transparent)',
            margin: '3.5rem auto 0',
          }}
        />
      </div>
    </section>
  );
}
