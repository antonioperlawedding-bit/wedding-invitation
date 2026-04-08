import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import config from '@config';

export default function LoadingScreen({ onComplete }) {
  const rootRef      = useRef(null);
  const curtainTopRef= useRef(null);
  const curtainBotRef= useRef(null);
  const doneRef      = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;
    const root = rootRef.current;
    const curtainTop = curtainTopRef.current;
    const curtainBot = curtainBotRef.current;

    // Remove the static HTML preloader now that React has mounted
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.remove();

    // Prevent scroll during loading
    document.documentElement.style.overflow = 'hidden';

    // Minimum time the loading screen should stay visible (from first paint, not React mount)
    const MIN_DISPLAY_MS = 2800;
    const pageStart = window.__loadStart || Date.now();
    const elapsed = Date.now() - pageStart;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

    gsap.set(curtainTop, { yPercent: 0 });
    gsap.set(curtainBot, { yPercent: 0 });

    const tl = gsap.timeline({
      delay: remaining / 1000,
      onComplete: () => {
        doneRef.current = true;
        document.documentElement.style.overflow = '';
        // Hide the entire loading screen after curtains are off-screen
        if (root) root.style.display = 'none';
        onComplete();
      },
    });

    tl
      // Curtain exit — top half flies up, bottom flies down
      .to(curtainTop, {
        yPercent: -102,
        duration: 1.0,
        ease: 'expo.inOut',
      })
      .to(curtainBot, {
        yPercent: 102,
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
          background: '#1a2e14',
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
          background: '#1a2e14',
          zIndex: 2,
        }}
      />

      {/* ── Content layer (behind curtains — same as preloader) ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: '#1a2e14',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
        }}
      >
        {/* Interlocking rings */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 100, position: 'relative' }}>
          <div style={{ position: 'relative', zIndex: 1, transform: 'translateX(-28px)' }}>
            <svg width="80" height="80" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(204,158,36,0.25)" strokeWidth="3"/>
              <circle cx="50" cy="50" r="45" fill="none" stroke="#cc9e24" strokeWidth="3" strokeLinecap="round" strokeDasharray="283" strokeDashoffset="0"/>
            </svg>
          </div>
          <div style={{
            position: 'absolute',
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '1.5rem',
            fontWeight: 300,
            color: '#cc9e24',
            letterSpacing: '0.1em',
            zIndex: 3,
          }}>♡</div>
          <div style={{ position: 'relative', zIndex: 0, transform: 'translateX(28px)' }}>
            <svg width="80" height="80" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(204,158,36,0.25)" strokeWidth="3"/>
              <circle cx="50" cy="50" r="45" fill="none" stroke="#f9cc01" strokeWidth="3" strokeLinecap="round" strokeDasharray="283" strokeDashoffset="0"/>
            </svg>
          </div>
        </div>

        {/* Names */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(1.8rem, 6vw, 3rem)',
            fontWeight: 300,
            color: '#faf8f0',
            letterSpacing: '0.08em',
            lineHeight: 1.2,
          }}>
            {config.couple.groom.firstName}{' '}
            <span style={{ color: '#cc9e24', fontStyle: 'italic' }}>&amp;</span>
            {' '}{config.couple.bride.firstName}
          </p>
          <p style={{
            fontFamily: 'Jost, sans-serif',
            fontWeight: 200,
            fontSize: '0.7rem',
            letterSpacing: '0.5em',
            color: 'rgba(204,158,36,0.7)',
            textTransform: 'uppercase',
            marginTop: '0.5rem',
          }}>
            {config.ui.loading.subtitle}
          </p>
        </div>

        {/* Date */}
        <p style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: '1.1rem',
          fontWeight: 400,
          color: '#c9a84c',
          letterSpacing: '0.3em',
        }}>
          {config.wedding.dateFormatted}
        </p>

        {/* Progress bar (already filled by now) */}
        <div style={{
          width: '160px',
          height: '1px',
          background: 'rgba(201,168,76,0.2)',
          borderRadius: 1,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: '100%',
            background: 'linear-gradient(90deg, #c9a84c, #f0d080)',
            borderRadius: 1,
          }} />
        </div>
      </div>
    </div>
  );
}
