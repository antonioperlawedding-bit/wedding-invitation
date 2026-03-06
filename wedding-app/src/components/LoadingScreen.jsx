import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function LoadingScreen({ onComplete }) {
  const rootRef      = useRef(null);
  const ring1Ref     = useRef(null);
  const ring2Ref     = useRef(null);
  const monogramRef  = useRef(null);
  const namesRef     = useRef(null);
  const dateRef      = useRef(null);
  const progressRef  = useRef(null);
  const curtainTopRef= useRef(null);
  const curtainBotRef= useRef(null);

  useEffect(() => {
    const root       = rootRef.current;
    const ring1      = ring1Ref.current;
    const ring2      = ring2Ref.current;
    const monogram   = monogramRef.current;
    const names      = namesRef.current;
    const dateEl     = dateRef.current;
    const progressEl = progressRef.current;
    const curtainTop = curtainTopRef.current;
    const curtainBot = curtainBotRef.current;

    // Prevent scroll during loading
    document.documentElement.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.style.overflow = '';
        onComplete();
      },
    });

    // Start rings off-screen
    gsap.set(ring1, { x: -180 });
    gsap.set(ring2, { x:  180 });
    gsap.set([monogram, names, dateEl], { opacity: 0, y: 20 });
    gsap.set(progressEl, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(curtainTop, { yPercent: 0 });
    gsap.set(curtainBot, { yPercent: 0 });

    tl
      // Rings slide in and interlock
      .to(ring1, { x: -28, duration: 1.0, ease: 'expo.out' })
      .to(ring2, { x:  28, duration: 1.0, ease: 'expo.out' }, '<')
      // Draw ring strokes
      .to('.loading-ring-stroke', {
        strokeDashoffset: 0,
        duration: 1.0,
        stagger: 0.1,
        ease: 'power2.inOut',
      }, '-=0.6')
      // Monogram pops in
      .to(monogram, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'back.out(1.7)',
      }, '-=0.2')
      // Names reveal
      .to(names, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'expo.out',
      }, '-=0.1')
      // Date
      .to(dateEl, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'expo.out',
      }, '-=0.3')
      // Progress bar fills
      .to(progressEl, {
        scaleX: 1,
        duration: 1.6,
        ease: 'power2.inOut',
      }, '-=0.1')
      // Short pause
      .to({}, { duration: 0.3 })
      // Curtain exit — top half flies up, bottom flies down
      .to(curtainTop, {
        yPercent: -102,
        duration: 1.0,
        ease: 'expo.inOut',
      })
      .to(curtainBot, {
        yPercent:  102,
        duration: 1.0,
        ease: 'expo.inOut',
      }, '<');

    return () => {
      tl.kill();
      document.documentElement.style.overflow = '';
    };
  }, [onComplete]);

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        overflow: 'hidden',
        pointerEvents: 'all',
      }}
    >
      {/* ── Curtain top half ── */}
      <div
        ref={curtainTopRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: '#050d0a',
          zIndex: 2,
        }}
      />
      {/* ── Curtain bottom half ── */}
      <div
        ref={curtainBotRef}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: '#050d0a',
          zIndex: 2,
        }}
      />

      {/* ── Content (sits between the curtain halves) ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: '#050d0a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
        }}
      >
        {/* Interlocking rings */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 100 }}>
          {/* Ring Left */}
          <div ref={ring1Ref} style={{ position: 'relative', zIndex: 1 }}>
            <svg width="80" height="80" viewBox="0 0 100 100">
              <circle
                className="loading-ring-stroke"
                cx="50" cy="50" r="45"
                fill="none"
                stroke="rgba(201,168,76,0.25)"
                strokeWidth="3"
              />
              <circle
                className="loading-ring-stroke"
                cx="50" cy="50" r="45"
                fill="none"
                stroke="#c9a84c"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset="283"
              />
            </svg>
          </div>

          {/* Monogram between rings */}
          <div
            ref={monogramRef}
            style={{
              position: 'absolute',
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: '1.5rem',
              fontWeight: 300,
              color: '#c9a84c',
              letterSpacing: '0.1em',
              zIndex: 3,
            }}
          >
            ♡
          </div>

          {/* Ring Right */}
          <div ref={ring2Ref} style={{ position: 'relative', zIndex: 0 }}>
            <svg width="80" height="80" viewBox="0 0 100 100">
              <circle
                className="loading-ring-stroke"
                cx="50" cy="50" r="45"
                fill="none"
                stroke="rgba(201,168,76,0.25)"
                strokeWidth="3"
              />
              <circle
                className="loading-ring-stroke"
                cx="50" cy="50" r="45"
                fill="none"
                stroke="#f0d080"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset="283"
              />
            </svg>
          </div>
        </div>

        {/* Names */}
        <div ref={namesRef} style={{ textAlign: 'center' }}>
          <p
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(1.8rem, 6vw, 3rem)',
              fontWeight: 300,
              color: '#faf8f0',
              letterSpacing: '0.08em',
              lineHeight: 1.2,
            }}
          >
            Perla{' '}
            <span style={{ color: '#c9a84c', fontStyle: 'italic' }}>&amp;</span>
            {' '}Antonio
          </p>
          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 200,
              fontSize: '0.7rem',
              letterSpacing: '0.5em',
              color: 'rgba(201,168,76,0.7)',
              textTransform: 'uppercase',
              marginTop: '0.5rem',
            }}
          >
            Are Getting Married
          </p>
        </div>

        {/* Date */}
        <div ref={dateRef} style={{ textAlign: 'center' }}>
          <p
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: '1.1rem',
              fontWeight: 400,
              color: '#c9a84c',
              letterSpacing: '0.3em',
            }}
          >
            June 6 · 2026
          </p>
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: '160px',
            height: '1px',
            background: 'rgba(201,168,76,0.2)',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <div
            ref={progressRef}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #c9a84c, #f0d080)',
              borderRadius: 1,
            }}
          />
        </div>
      </div>
    </div>
  );
}
