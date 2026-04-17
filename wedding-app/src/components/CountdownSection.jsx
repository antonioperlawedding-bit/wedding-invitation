import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getTimeRemaining } from '../utils/animations';
import config from '@config';
import { useLang } from '../i18n/LanguageContext';
import { useConfig } from '../i18n/useConfig';

gsap.registerPlugin(ScrollTrigger);

const WEDDING_DATE = config.wedding.dateTime;

function FlipNumber({ value, label }) {
  const prevRef = useRef(value);
  const cardRef = useRef(null);

  useEffect(() => {
    if (prevRef.current !== value) {
      gsap.timeline()
        .to(cardRef.current, { rotateX: -90, duration: 0.25, ease: 'power2.in', transformOrigin: 'top center' })
        .to(cardRef.current, { rotateX: 0, duration: 0.25, ease: 'power2.out', transformOrigin: 'bottom center' });
      prevRef.current = value;
    }
  }, [value]);

  const display = String(value).padStart(2, '0');

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        ref={cardRef}
        style={{
          width: 'clamp(68px, 18vw, 100px)',
          height: 'clamp(78px, 20vw, 115px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.8)',
          border: '1px solid rgba(135,169,107,0.25)',
          borderRadius: '8px',
          position: 'relative',
          overflow: 'hidden',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          boxShadow: '0 4px 24px rgba(135,169,107,0.08)',
        }}
      >
        {/* Center line */}
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0, height: '1px',
          background: 'rgba(135,169,107,0.12)', transform: 'translateY(-50%)',
        }} />
        <span className="text-shimmer" style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontWeight: 300,
          fontSize: 'clamp(2.2rem, 7vw, 4rem)',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>
          {display}
        </span>
      </div>
      <p style={{
        fontFamily: 'Jost, sans-serif',
        fontWeight: 200,
        fontSize: '0.6rem',
        letterSpacing: '0.4em',
        textTransform: 'uppercase',
        color: '#87A96B',
        marginTop: '0.75rem',
      }}>
        {label}
      </p>
    </div>
  );
}

export default function CountdownSection() {
  const sectionRef = useRef(null);
  const cfg = useConfig();
  const { t, isAr } = useLang();
  const [time, setTime] = useState(() => getTimeRemaining(WEDDING_DATE));

  const tick = useCallback(() => setTime(getTimeRemaining(WEDDING_DATE)), []);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.countdown-header > *', {
        y: 30, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%' },
      });
      gsap.from('.countdown-cards > *', {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'expo.out',
        scrollTrigger: { trigger: '.countdown-cards', start: 'top 82%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="watermark-sunflower"
      style={{
        background: '#f5f0e8',
        padding: 'clamp(3rem, 8vw, 7rem) clamp(1rem, 4vw, 4rem) clamp(1.5rem, 4vw, 3.5rem)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="countdown-header" style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 6vw, 4rem)' }}>
          <p className="section-tag" style={{ marginBottom: '0.75rem' }}>
            {cfg.ui.countdown.tag}
          </p>
          <h2 style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 400,
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            color: '#3a2e22',
          }}>
            {cfg.ui.countdown.title}
          </h2>
          <div style={{
            width: '60px', height: '1px', margin: '1.25rem auto 0',
            background: 'linear-gradient(90deg, transparent, #87A96B, transparent)',
          }} />
        </div>

        {/* Cards */}
        <div
          className="countdown-cards"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'clamp(0.75rem, 3vw, 2rem)',
            flexWrap: 'wrap',
          }}
        >
          <FlipNumber value={time.days} label={t('countdown.days')} />
          <FlipNumber value={time.hours} label={t('countdown.hours')} />
          <FlipNumber value={time.minutes} label={t('countdown.minutes')} />
          <FlipNumber value={time.seconds} label={t('countdown.seconds')} />
        </div>
      </div>
    </section>
  );
}