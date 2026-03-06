import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ParticleField from './three/ParticleField';
import { SplitChars } from '../utils/animations';

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
          duration: 1.4,
          stagger: { each: 0.04, from: 'start' },
          ease: 'expo.out',
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

      // === PARALLAX ON SCROLL ===
      // Background particle layer moves slowest
      gsap.to(bgLayerRef.current, {
        yPercent: 35,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          scrub: 1,
          start: 'top top',
          end: 'bottom top',
        },
      });

      // Mid decorative layer — slightly faster
      gsap.to(midLayerRef.current, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          scrub: 1,
          start: 'top top',
          end: 'bottom top',
        },
      });

      // Content fades out and rises as user scrolls
      gsap.to(contentRef.current, {
        yPercent: 12,
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
        opacity: 0.7,
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
        minHeight: '600px',
        overflow: 'hidden',
        background: '#081a13',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* ── Particle field (deepest, slowest parallax) ── */}
      <div
        ref={bgLayerRef}
        style={{
          position: 'absolute',
          inset: '-20% 0',
          willChange: 'transform',
        }}
      >
        <ParticleField count={1800} />
      </div>

      {/* ── Gradient overlays ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 60% at 50% 40%, rgba(45,106,79,0.25) 0%, transparent 70%),
            linear-gradient(to bottom, rgba(8,26,19,0.2) 0%, transparent 40%, rgba(8,26,19,0.85) 100%)
          `,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* ── Animated aurora glow ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '120%',
            height: '120%',
            top: '-10%',
            left: '-10%',
            background: `
              radial-gradient(ellipse 40% 35% at 30% 50%, rgba(201,168,76,0.08) 0%, transparent 70%),
              radial-gradient(ellipse 35% 40% at 70% 45%, rgba(45,106,79,0.12) 0%, transparent 70%),
              radial-gradient(ellipse 30% 25% at 50% 30%, rgba(240,208,128,0.06) 0%, transparent 60%)
            `,
            animation: 'auroraFloat 12s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* ── Mid decorative layer — floating leaf motifs (CSS) ── */}
      <div
        ref={midLayerRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {/* Left vine ornament */}
        <svg
          style={{
            position: 'absolute',
            left: 'clamp(1rem,4vw,3rem)',
            top: '15%',
            opacity: 0.18,
            width: 'clamp(40px, 6vw, 80px)',
          }}
          viewBox="0 0 60 200" fill="none"
        >
          <path
            d="M30 200 C30 160 10 140 15 110 C20 80 40 70 35 40 C30 10 20 5 30 0"
            stroke="#c9a84c"
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
              fill="#40916c"
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
            opacity: 0.18,
            width: 'clamp(40px, 6vw, 80px)',
            transform: 'scaleX(-1)',
          }}
          viewBox="0 0 60 200" fill="none"
        >
          <path
            d="M30 200 C30 160 10 140 15 110 C20 80 40 70 35 40 C30 10 20 5 30 0"
            stroke="#c9a84c"
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
              fill="#40916c"
              opacity={0.6}
              transform={`rotate(${i%2===0?-20:20} ${i%2===0?20:40} ${y})`}
            />
          ))}
        </svg>
      </div>

      {/* ── Scroll-exit vignette ── */}
      <div
        ref={overlayRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: '#081a13',
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
            color: 'rgba(201,168,76,0.8)',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
          }}
        >
          Together We Begin
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
          }}
        >
          <span style={{ display: 'block' }}>
            <SplitChars text="Perla" />
          </span>
          <span
            style={{
              display: 'block',
              fontStyle: 'italic',
              fontSize: '0.55em',
              fontWeight: 300,
              color: '#c9a84c',
              letterSpacing: '0.12em',
              margin: '0.2em 0',
            }}
          >
            &amp;
          </span>
          <span style={{ display: 'block' }}>
            <SplitChars text="Antonio" />
          </span>
        </h1>

        {/* Golden divider */}
        <div
          ref={dividerRef}
          style={{
            width: 'clamp(80px,20vw,160px)',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #c9a84c, #f0d080, #c9a84c, transparent)',
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
          <span style={{ display: 'block' }}>Mr. &amp; Mrs. Hayek Atallah</span>
          <span style={{ display: 'block' }}>Mr. &amp; Mrs. Tannoury Tannoury</span>
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
            Saturday, June 6
            <span style={{ color: '#c9a84c' }}>,</span>
            {' '}2026
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
            color: 'rgba(201,168,76,0.7)',
            textTransform: 'uppercase',
            marginBottom: '3.5rem',
          }}
        >
          Lebanon &nbsp;·&nbsp; Qaa El Rim &nbsp;·&nbsp; Chtaura
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
              color: '#c9a84c',
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
          color: 'rgba(201,168,76,0.4)',
          textTransform: 'uppercase',
        }}
      >
        Lebanon · 2026
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
        Made for Each Other
      </div>
    </section>
  );
}
