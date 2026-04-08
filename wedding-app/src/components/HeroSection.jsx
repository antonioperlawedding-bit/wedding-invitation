import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ParticleField from './three/ParticleField';
import { SplitChars } from '../utils/animations';
import config from '@config';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const sectionRef  = useRef(null);
  const bgLayerRef  = useRef(null);
  const midLayerRef = useRef(null);
  const contentRef  = useRef(null);
  const tagRef      = useRef(null);
  const titleRef    = useRef(null);
  const dividerRef  = useRef(null);
  const parentsRef  = useRef(null);
  const dateRef     = useRef(null);
  const locationRef = useRef(null);
  const scrollIndRef= useRef(null);
  const overlayRef  = useRef(null);
  const glowRef     = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // === ENTRANCE ANIMATIONS ===
      const chars = titleRef.current?.querySelectorAll('.char') ?? [];

      const entranceTl = gsap.timeline({ delay: 0.2 });
      entranceTl
        .from(tagRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: 'expo.out',
        })
        .from(chars, {
          yPercent: 110,
          opacity: 0,
          rotateX: -60,
          duration: 1.4,
          stagger: { each: 0.04, from: 'start' },
          ease: 'expo.out',
          transformOrigin: 'bottom center',
        }, '-=0.3')
        .from(dividerRef.current, {
          scaleX: 0,
          opacity: 0,
          duration: 0.8,
          ease: 'expo.out',
        }, '-=0.5')
        .from(parentsRef.current, {
          opacity: 0,
          y: 16,
          duration: 0.7,
          ease: 'expo.out',
        }, '-=0.5')
        .from(dateRef.current, {
          opacity: 0,
          y: 20,
          scale: 0.95,
          duration: 0.7,
          ease: 'expo.out',
        }, '-=0.4')
        .from(locationRef.current, {
          opacity: 0,
          y: 16,
          duration: 0.6,
          ease: 'expo.out',
        }, '-=0.3')
        .from(scrollIndRef.current, {
          opacity: 0,
          y: 10,
          duration: 0.5,
          ease: 'expo.out',
        }, '-=0.1');

      // === ENHANCED 3D PARALLAX ON SCROLL ===
      // Background particle layer — deep, slowest
      gsap.to(bgLayerRef.current, {
        yPercent: 50,
        scale: 1.15,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          scrub: 1.2,
          start: 'top top',
          end: 'bottom top',
        },
      });

      // Mid decorative layer — moderate depth
      gsap.to(midLayerRef.current, {
        yPercent: 25,
        rotateX: 2,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          scrub: 1,
          start: 'top top',
          end: 'bottom top',
        },
      });

      // Ambient glow pulse follows scroll
      gsap.to(glowRef.current, {
        scale: 1.6,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          scrub: 1.5,
          start: 'top top',
          end: '70% top',
        },
      });

      // Content — 3D perspective lift and fade as user scrolls
      gsap.to(contentRef.current, {
        yPercent: -15,
        rotateX: 8,
        scale: 0.92,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          scrub: 1,
          start: 'top top',
          end: '55% top',
        },
      });

      // Vignette overlay darkens as we leave
      gsap.to(overlayRef.current, {
        opacity: 0.85,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          scrub: 1,
          start: '40% top',
          end: 'bottom top',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollDown = () => {
    if (window.__lenis) {
      window.__lenis.scrollTo(window.innerHeight);
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      ref={sectionRef}
      style={{
        position: 'relative',
        height: '100svh',
        minHeight: '500px',
        overflow: 'hidden',
        background: '#1a2e14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1000px',
      }}
    >
      {/* ── Particle field (deepest, slowest parallax) ── */}
      <div
        ref={bgLayerRef}
        style={{
          position: 'absolute',
          inset: '-30% -10%',
          willChange: 'transform',
        }}
      >
        <ParticleField count={1400} />
      </div>

      {/* ── Ambient center glow ── */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 'min(600px, 80vw)',
          height: 'min(600px, 80vw)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(204,158,36,0.12) 0%, rgba(156,175,19,0.06) 40%, transparent 70%)',
          filter: 'blur(40px)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* ── Gradient overlays ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 60% at 50% 40%, rgba(107,122,21,0.2) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 30% 70%, rgba(204,158,36,0.08) 0%, transparent 60%),
            linear-gradient(to bottom, rgba(26,46,20,0.2) 0%, transparent 40%, rgba(26,46,20,0.9) 100%)
          `,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* ── Mid decorative layer — floating leaf motifs (CSS) ── */}
      <div
        ref={midLayerRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          overflow: 'hidden',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Left vine ornament */}
        <svg
          style={{
            position: 'absolute',
            left: 'clamp(1rem,4vw,3rem)',
            top: '15%',
            opacity: 0.22,
            width: 'clamp(40px, 6vw, 80px)',
          }}
          viewBox="0 0 60 200" fill="none"
        >
          <path
            d="M30 200 C30 160 10 140 15 110 C20 80 40 70 35 40 C30 10 20 5 30 0"
            stroke="#cc9e24"
            strokeWidth="1.5"
            fill="none"
          />
          {[40,80,120,160].map((y,i) => (
            <ellipse
              key={i}
              cx={i%2===0?20:40}
              cy={y}
              rx="12"
              ry="7"
              fill="#9caf13"
              opacity={0.6}
              transform={`rotate(${i%2===0?-20:20} ${i%2===0?20:40} ${y})`}
            />
          ))}
        </svg>

        {/* Right vine ornament */}
        <svg
          style={{
            position: 'absolute',
            right: 'clamp(1rem,4vw,3rem)',
            top: '15%',
            opacity: 0.22,
            width: 'clamp(40px, 6vw, 80px)',
            transform: 'scaleX(-1)',
          }}
          viewBox="0 0 60 200" fill="none"
        >
          <path
            d="M30 200 C30 160 10 140 15 110 C20 80 40 70 35 40 C30 10 20 5 30 0"
            stroke="#cc9e24"
            strokeWidth="1.5"
            fill="none"
          />
          {[40,80,120,160].map((y,i) => (
            <ellipse
              key={i}
              cx={i%2===0?20:40}
              cy={y}
              rx="12"
              ry="7"
              fill="#9caf13"
              opacity={0.6}
              transform={`rotate(${i%2===0?-20:20} ${i%2===0?20:40} ${y})`}
            />
          ))}
        </svg>

        {/* Floating corner accents */}
        <div style={{
          position: 'absolute',
          top: 'clamp(2rem,6vw,5rem)',
          left: 'clamp(2rem,6vw,5rem)',
          width: '40px',
          height: '40px',
          borderTop: '1px solid rgba(204,158,36,0.3)',
          borderLeft: '1px solid rgba(204,158,36,0.3)',
          opacity: 0.5,
        }} />
        <div style={{
          position: 'absolute',
          top: 'clamp(2rem,6vw,5rem)',
          right: 'clamp(2rem,6vw,5rem)',
          width: '40px',
          height: '40px',
          borderTop: '1px solid rgba(204,158,36,0.3)',
          borderRight: '1px solid rgba(204,158,36,0.3)',
          opacity: 0.5,
        }} />
        <div style={{
          position: 'absolute',
          bottom: 'clamp(2rem,6vw,5rem)',
          left: 'clamp(2rem,6vw,5rem)',
          width: '40px',
          height: '40px',
          borderBottom: '1px solid rgba(204,158,36,0.3)',
          borderLeft: '1px solid rgba(204,158,36,0.3)',
          opacity: 0.5,
        }} />
        <div style={{
          position: 'absolute',
          bottom: 'clamp(2rem,6vw,5rem)',
          right: 'clamp(2rem,6vw,5rem)',
          width: '40px',
          height: '40px',
          borderBottom: '1px solid rgba(204,158,36,0.3)',
          borderRight: '1px solid rgba(204,158,36,0.3)',
          opacity: 0.5,
        }} />
      </div>

      {/* ── Scroll-exit vignette ── */}
      <div
        ref={overlayRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: '#1a2e14',
          zIndex: 3,
          pointerEvents: 'none',
          opacity: 0,
        }}
      />

      {/* ── Main content (foreground) ── */}
      <div
        ref={contentRef}
        style={{
          position: 'relative',
          zIndex: 4,
          textAlign: 'center',
          padding: '0 clamp(1.5rem,5vw,4rem)',
          width: '100%',
          maxWidth: '900px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Tag */}
        <p
          ref={tagRef}
          style={{
            fontFamily: 'Jost, sans-serif',
            fontWeight: 200,
            fontSize: '0.7rem',
            letterSpacing: '0.55em',
            color: 'rgba(204,158,36,0.85)',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
          }}
        >
          {config.ui.hero.tag}
        </p>

        {/* Names — the biggest visual element */}
        <h1
          ref={titleRef}
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 300,
            fontSize: 'clamp(3.2rem,13vw,9.5rem)',
            lineHeight: 1.0,
            color: '#faf8f0',
            letterSpacing: '-0.01em',
            overflow: 'hidden',
            transformStyle: 'preserve-3d',
          }}
        >
          <span style={{ display: 'block' }}>
            <SplitChars text={config.couple.groom.firstName} />
          </span>
          <span
            style={{
              display: 'block',
              fontStyle: 'italic',
              fontSize: '0.55em',
              fontWeight: 300,
              color: '#cc9e24',
              letterSpacing: '0.12em',
              margin: '0.2em 0',
            }}
          >
            &amp;
          </span>
          <span style={{ display: 'block' }}>
            <SplitChars text={config.couple.bride.firstName} />
          </span>
        </h1>

        {/* Golden divider */}
        <div
          ref={dividerRef}
          style={{
            width: 'clamp(80px,20vw,160px)',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #cc9e24, #f9cc01, #cc9e24, transparent)',
            margin: '2rem auto',
          }}
        />

        {/* Parents */}
        <p
          ref={parentsRef}
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 400,
            fontStyle: 'italic',
            fontSize: 'clamp(0.95rem,2.5vw,1.2rem)',
            color: 'rgba(250,248,240,0.65)',
            letterSpacing: '0.05em',
            marginBottom: '2rem',
          }}
        >
          <span style={{ display: 'block' }}>{config.couple.groom.parentsDisplay}</span>
          <span style={{ display: 'block' }}>{config.couple.bride.parentsDisplay}</span>
        </p>

        {/* Date */}
        <div ref={dateRef} style={{ marginBottom: '1rem' }}>
          <p
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 500,
              fontSize: 'clamp(1.6rem,5vw,2.8rem)',
              color: '#faf8f0',
              letterSpacing: '0.06em',
            }}
          >
            {config.wedding.dateFormatted}
          </p>
        </div>

        {/* Location */}
        <p
          ref={locationRef}
          style={{
            fontFamily: 'Jost, sans-serif',
            fontWeight: 200,
            fontSize: '0.72rem',
            letterSpacing: '0.45em',
            color: 'rgba(204,158,36,0.7)',
            textTransform: 'uppercase',
            marginBottom: 'clamp(1.5rem,5vw,3.5rem)',
          }}
        >
          {config.wedding.locationFull.split(' · ').reduce((acc, part, i) => {
            if (i > 0) acc.push(<span key={`sep-${i}`}>&nbsp;·&nbsp;</span>);
            acc.push(<span key={`loc-${i}`}>{part}</span>);
            return acc;
          }, [])}
        </p>

        {/* Scroll indicator */}
        <div
          ref={scrollIndRef}
          onClick={scrollDown}
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.6rem',
            cursor: 'pointer',
            opacity: 0.6,
            transition: 'opacity 0.3s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
        >
          <span
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 200,
              fontSize: '0.62rem',
              letterSpacing: '0.45em',
              color: '#cc9e24',
              textTransform: 'uppercase',
            }}
          >
            Scroll
          </span>
          <div className="scroll-indicator" />
        </div>
      </div>

      {/* Vertical year text — left edge */}
      <div
        style={{
          position: 'absolute',
          left: 'clamp(0.8rem,2vw,1.5rem)',
          bottom: '4rem',
          zIndex: 4,
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          transform: 'rotate(180deg)',
          fontFamily: 'Jost, sans-serif',
          fontWeight: 100,
          fontSize: '0.62rem',
          letterSpacing: '0.4em',
          color: 'rgba(204,158,36,0.4)',
          textTransform: 'uppercase',
        }}
      >
        {config.wedding.location} · {config.wedding.year}
      </div>

      {/* Vertical "Made For Each Other" — right edge */}
      <div
        style={{
          position: 'absolute',
          right: 'clamp(0.8rem,2vw,1.5rem)',
          bottom: '4rem',
          zIndex: 4,
          writingMode: 'vertical-rl',
          fontFamily: '"Cormorant Garamond", serif',
          fontWeight: 300,
          fontStyle: 'italic',
          fontSize: '0.75rem',
          letterSpacing: '0.25em',
          color: 'rgba(250,248,240,0.2)',
        }}
      >
        {config.ui.hero.sideTextLeft}
      </div>
    </section>
  );
}
