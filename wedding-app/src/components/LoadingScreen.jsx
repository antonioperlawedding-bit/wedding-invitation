import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function LoadingScreen({ onComplete }) {
  const rootRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;
    const root = rootRef.current;

    const preloader = document.getElementById('preloader');
    if (preloader) preloader.remove();

    document.documentElement.style.overflow = 'hidden';

    const MIN_DISPLAY_MS = 1200;
    const pageStart = window.__loadStart || Date.now();
    const elapsed = Date.now() - pageStart;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

    const tl = gsap.timeline({
      delay: remaining / 1000,
    });

    tl.to(root, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: () => {
        doneRef.current = true;
        document.documentElement.style.overflow = '';
        if (root) root.style.display = 'none';
        onComplete();
      },
    });

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
        background: '#f2f8ec',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'all',
      }}
    >
      {/* Themed spinner — sunflower-inspired rotating petals */}
      <div style={{ position: 'relative', width: '56px', height: '56px' }}>
        <style>{`
          @keyframes spin-petals {
            to { transform: rotate(360deg); }
          }
          @keyframes pulse-center {
            0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.8; }
            50% { transform: translate(-50%,-50%) scale(1.15); opacity: 1; }
          }
        `}</style>
        {/* Rotating petals ring */}
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          style={{ animation: 'spin-petals 2.4s linear infinite' }}
        >
          {Array.from({ length: 8 }, (_, i) => {
            const angle = i * 45;
            const opacity = 0.3 + (i / 8) * 0.7;
            return (
              <ellipse
                key={i}
                cx="28"
                cy="8"
                rx="3.5"
                ry="7"
                fill="#87A96B"
                opacity={opacity}
                transform={`rotate(${angle} 28 28)`}
              />
            );
          })}
        </svg>
        {/* Center dot */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#87A96B',
            animation: 'pulse-center 1.6s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
}