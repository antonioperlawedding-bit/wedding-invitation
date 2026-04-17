import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useConfig } from '../i18n/useConfig';

gsap.registerPlugin(ScrollTrigger);

export default function InterludeSection() {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const config = useConfig();

  const image = config.ui.interlude?.image;
  if (!image) return null;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(imageRef.current, {
        scale: 1.04,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ position: 'relative' }}
    >
      {/* ─── Image block ─── */}
      <div
        style={{
          position: 'relative',
          height: '60vh',
          minHeight: '350px',
          maxHeight: '600px',
          clipPath: 'inset(0)',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '100vh',
          overflow: 'hidden',
          zIndex: 0,
        }}>
          <div
            ref={imageRef}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 30%',
              willChange: 'transform',
            }}
          />
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.12) 40%, rgba(0,0,0,0.3) 100%)',
            pointerEvents: 'none',
          }} />
          {/* Warm edge glow */}
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            boxShadow: 'inset 0 0 80px 20px rgba(255,215,140,0.1)',
          }} />
        </div>
      </div>

      {/* ─── Top curved overlay (previous section color curves into image) ─── */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        lineHeight: 0,
        zIndex: 3,
        pointerEvents: 'none',
      }}>
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: 'clamp(35px, 5vw, 70px)' }}
        >
          <path
            d="M0,0 L0,30 Q360,80 720,80 Q1080,80 1440,30 L1440,0 Z"
            fill="#f5f0e8"
          />
          <path
            d="M0,30 Q360,80 720,80 Q1080,80 1440,30"
            fill="none"
            stroke="rgba(135,169,107,0.25)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* ─── Bottom curved overlay (next section color curves into image) ─── */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        lineHeight: 0,
        zIndex: 3,
        pointerEvents: 'none',
      }}>
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: 'clamp(35px, 5vw, 70px)' }}
        >
          <path
            d="M0,80 L0,50 Q360,0 720,0 Q1080,0 1440,50 L1440,80 Z"
            fill="#f5f0e8"
          />
          <path
            d="M0,50 Q360,0 720,0 Q1080,0 1440,50"
            fill="none"
            stroke="rgba(135,169,107,0.25)"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </section>
  );
}