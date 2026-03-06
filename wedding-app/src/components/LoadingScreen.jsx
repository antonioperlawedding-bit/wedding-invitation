import { useEffect, useRef, useState, Suspense } from 'react';
import gsap from 'gsap';
import GoldenRings from './three/GoldenRings';

export default function LoadingScreen({ onComplete }) {
  const rootRef     = useRef(null);
  const progressRef = useRef(null);
  const [canvasReady, setCanvasReady] = useState(false);

  // On mount: remove HTML preloader, lock scroll, start progress animation
  useEffect(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.remove();
    document.documentElement.style.overflow = 'hidden';

    if (progressRef.current) {
      gsap.fromTo(progressRef.current, { scaleX: 0 }, {
        scaleX: 1,
        duration: 3.2,
        ease: 'power2.inOut',
        transformOrigin: 'left',
      });
    }

    return () => { document.documentElement.style.overflow = ''; };
  }, []);

  // Once 3D rings are visible, show them for a minimum time then fade out
  useEffect(() => {
    if (!canvasReady) return;

    const MIN_DISPLAY_MS = 3400;
    const timeout = setTimeout(() => {
      gsap.to(rootRef.current, {
        opacity: 0,
        duration: 0.9,
        ease: 'power2.inOut',
        onComplete: () => {
          document.documentElement.style.overflow = '';
          onComplete();
        },
      });
    }, MIN_DISPLAY_MS);

    return () => clearTimeout(timeout);
  }, [canvasReady, onComplete]);

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        overflow: 'hidden',
        pointerEvents: 'all',
        background: 'radial-gradient(ellipse 70% 60% at 50% 45%, #0c2418 0%, #06120e 70%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.8rem',
      }}
    >
      {/* 3D Golden Rings — the main visual, visible the entire loading time */}
      <div
        style={{
          width: 'min(340px, 85vw)',
          height: '240px',
          opacity: canvasReady ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      >
        <Suspense fallback={null}>
          <GoldenRings onReady={() => setCanvasReady(true)} />
        </Suspense>
      </div>

      {/* Simple SVG fallback while Three.js canvas initializes */}
      {!canvasReady && (
        <div style={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="60" height="60" viewBox="0 0 100 100" style={{ animation: 'spin 1.2s linear infinite' }}>
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="3"/>
            <circle cx="50" cy="50" r="42" fill="none" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round" strokeDasharray="80 200"/>
          </svg>
        </div>
      )}

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
          Perla{' '}
          <span style={{ color: '#c9a84c', fontStyle: 'italic' }}>&amp;</span>
          {' '}Antonio
        </p>
        <p style={{
          fontFamily: 'Jost, sans-serif',
          fontWeight: 200,
          fontSize: '0.7rem',
          letterSpacing: '0.5em',
          color: 'rgba(201,168,76,0.7)',
          textTransform: 'uppercase',
          marginTop: '0.5rem',
        }}>
          Are Getting Married
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
        June 6 · 2026
      </p>

      {/* Progress bar */}
      <div style={{
        width: '160px',
        height: '1px',
        background: 'rgba(201,168,76,0.2)',
        borderRadius: 1,
        overflow: 'hidden',
        marginTop: '0.5rem',
      }}>
        <div
          ref={progressRef}
          style={{
            height: '100%',
            width: '100%',
            background: 'linear-gradient(90deg, #c9a84c, #f0d080)',
            borderRadius: 1,
            transform: 'scaleX(0)',
            transformOrigin: 'left',
          }}
        />
      </div>
    </div>
  );
}
