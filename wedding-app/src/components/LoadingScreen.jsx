import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function LoadingScreen({ onComplete }) {
  const rootRef  = useRef(null);
  const doneRef  = useRef(false);
  const [ready, setReady] = useState(false); // true when spinner phase is done

  // Phase 1: show spinner for MIN_DISPLAY_MS, then reveal tap prompt
  useEffect(() => {
    if (doneRef.current) return;

    const preloader = document.getElementById('preloader');
    if (preloader) preloader.remove();

    document.documentElement.style.overflow = 'hidden';

    const MIN_DISPLAY_MS = 1200;
    const pageStart = window.__loadStart || Date.now();
    const elapsed   = Date.now() - pageStart;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

    const id = setTimeout(() => setReady(true), remaining);
    return () => {
      clearTimeout(id);
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Phase 2: user taps → fade out → call onComplete
  const handleTap = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    const root = rootRef.current;
    document.documentElement.style.overflow = '';
    gsap.to(root, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        if (root) root.style.display = 'none';
        onComplete();
      },
    });
  };

  return (
    <div
      ref={rootRef}
      onClick={handleTap}
      onTouchStart={handleTap}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#f2f8ec',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        pointerEvents: 'all',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <style>{`
        @keyframes spin-petals {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-center {
          0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.8; }
          50%       { transform: translate(-50%,-50%) scale(1.15); opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tap-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.04); }
        }
      `}</style>

      {/* Spinner */}
      <div style={{ position: 'relative', width: '56px', height: '56px' }}>
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          style={{ animation: 'spin-petals 2.4s linear infinite' }}
        >
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse
              key={i}
              cx="28" cy="8" rx="3.5" ry="7"
              fill="#87A96B"
              opacity={0.3 + (i / 8) * 0.7}
              transform={`rotate(${i * 45} 28 28)`}
            />
          ))}
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: '10px', height: '10px',
          borderRadius: '50%',
          background: '#87A96B',
          animation: 'pulse-center 1.6s ease-in-out infinite',
        }} />
      </div>

      {/* Tap prompt — only shown after spinner phase */}
      {ready && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.4rem',
          animation: 'fade-in-up 0.6s ease forwards',
        }}>
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(1.1rem, 4vw, 1.35rem)',
            fontWeight: 400,
            color: '#4a5e3a',
            margin: 0,
            letterSpacing: '0.04em',
            animation: 'tap-pulse 2s ease-in-out infinite',
          }}>
            Tap to enter
          </p>
        </div>
      )}
    </div>
  );
}