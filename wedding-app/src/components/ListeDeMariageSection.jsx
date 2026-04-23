import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useConfig } from '../i18n/useConfig';

gsap.registerPlugin(ScrollTrigger);

export default function ListeDeMariageSection() {
  const sectionRef = useRef(null);
  const config = useConfig();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.mariage-header > *', {
        y: 30,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      });
      gsap.from('.mariage-card', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.mariage-card', start: 'top 82%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="liste-mariage"
      ref={sectionRef}
      className="watermark-rose"
      style={{
        background: '#f2f8ec',
        padding: 'clamp(3rem,8vw,7rem) clamp(1rem,4vw,3rem) clamp(1.5rem,4vw,3.5rem)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div
          className="mariage-header"
          style={{ textAlign: 'center', marginBottom: 'clamp(1.5rem,5vw,3.5rem)' }}
        >
          {/* <p className="section-tag" style={{ marginBottom: '0.75rem' }}>
            {config.ui.listeDeMariage.tag}
          </p> */}
          <h2
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 400,
              fontSize: 'clamp(2rem,5vw,3.5rem)',
              color: '#3a2e20',
            }}
          >
            {config.ui.listeDeMariage.title}
          </h2>
          {/* <div
            style={{
              width: '60px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #87A96B, transparent)',
              margin: '1.25rem auto 0',
            }}
          /> */}
        </div>

        {/* Card */}
        <div
          className="mariage-card"
          style={{
            border: '1px solid rgba(135,169,107,0.2)',
            borderRadius: '1rem',
            padding: 'clamp(2rem,5vw,3rem)',
            background: 'rgba(255,255,255,0.6)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '10%',
              right: '10%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #87A96B, transparent)',
              borderRadius: '0 0 2px 2px',
            }}
          />

          {/* Message */}
          {/* <p
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontSize: 'clamp(1.2rem,2.5vw,1.2rem)',
              color: 'rgba(58,46,32,0.7)',
              lineHeight: 1.9,
              marginBottom: '2rem',
              textAlign: 'center',
            }}
          >
            {config.ui.listeDeMariage.message}
          </p> */}

          {/* Divider */}
          {/* <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(135,169,107,0.3))' }} />
            <span style={{ color: '#87A96B', fontSize: '0.7rem', opacity: 0.6 }}>✦</span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(135,169,107,0.3))' }} />
          </div> */}

          {/* Account details */}
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontFamily: 'Jost, sans-serif',
                fontWeight: 300,
                fontSize: '0.62rem',
                letterSpacing: '0.4em',
                color: '#87A96B',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              {config.ui.listeDeMariage.accountLabel}
            </p>
            <p
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontWeight: 400,
                fontSize: 'clamp(1.3rem,4vw,2.4rem)',
                color: '#3a2e20',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
                wordBreak: 'break-all',
              }}
            >
              <a
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                {config.ui.listeDeMariage.accountNumber}
              </a>
            </p>
            <p
              style={{
                fontFamily: 'Jost, sans-serif',
                fontWeight: 300,
                fontSize: '0.75rem',
                color: 'rgba(58,46,32,0.5)',
                letterSpacing: '0.15em',
              }}
            >
              {config.ui.listeDeMariage.accountName}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}