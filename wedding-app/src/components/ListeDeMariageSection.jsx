import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import config from '@config';

gsap.registerPlugin(ScrollTrigger);

export default function ListeDeMariageSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.mariage-header > *', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      });

      gsap.from('.mariage-card', {
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.mariage-card',
          start: 'top 82%',
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="liste-mariage"
      ref={sectionRef}
      style={{
        background: '#0a1a12',
        padding: 'clamp(5rem,12vw,9rem) clamp(1.5rem,5vw,5rem)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: '-2rem',
          right: '-1rem',
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 'clamp(6rem,20vw,16rem)',
          fontWeight: 300,
          color: 'rgba(250,248,240,0.025)',
          pointerEvents: 'none',
          userSelect: 'none',
          lineHeight: 1,
        }}
      >
        Wish
      </div>

      {/* Radial glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(201,168,76,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div
          className="mariage-header"
          style={{ textAlign: 'center', marginBottom: 'clamp(3rem,8vw,4.5rem)' }}
        >
          <p className="section-tag" style={{ marginBottom: '0.75rem' }}>
            Liste de Mariage
          </p>
          <h2
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 400,
              fontSize: 'clamp(2.2rem,6vw,4rem)',
              color: '#faf8f0',
            }}
          >
            Our Wish List
          </h2>
          <div
            style={{
              width: '60px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)',
              margin: '1.5rem auto 0',
            }}
          />
        </div>

        {/* Card */}
        <div
          className="mariage-card"
          style={{
            border: '1px solid rgba(201,168,76,0.25)',
            padding: 'clamp(2rem,5vw,3.5rem)',
            background: 'rgba(201,168,76,0.03)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Gold top accent line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #c9a84c, #f0d080, #c9a84c, transparent)',
            }}
          />

          {/* Message */}
          <p
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontSize: 'clamp(1.05rem,2.5vw,1.3rem)',
              color: 'rgba(250,248,240,0.72)',
              lineHeight: 1.9,
              marginBottom: '2.5rem',
              textAlign: 'center',
            }}
          >
            Your presence on our special day is the greatest gift of all.
            Should you wish to honor us with a gesture of generosity,
            we invite you to contribute to our shared future through our Wish Account.
          </p>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2.5rem',
            }}
          >
            <div
              style={{
                flex: 1,
                height: '1px',
                background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.35))',
              }}
            />
            <span style={{ color: '#c9a84c', fontSize: '0.7rem', opacity: 0.7 }}>✦</span>
            <div
              style={{
                flex: 1,
                height: '1px',
                background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.35))',
              }}
            />
          </div>

          {/* Account details */}
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontFamily: 'Jost, sans-serif',
                fontWeight: 200,
                fontSize: '0.62rem',
                letterSpacing: '0.45em',
                color: '#c9a84c',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              Wish Account &nbsp;·&nbsp; OMT
            </p>

            <p
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontWeight: 400,
                fontSize: 'clamp(1.8rem,5vw,2.8rem)',
                color: '#faf8f0',
                letterSpacing: '0.1em',
                marginBottom: '0.5rem',
              }}
            >
              {config.events.rsvp.phone1}
            </p>

            <p
              style={{
                fontFamily: 'Jost, sans-serif',
                fontWeight: 200,
                fontSize: '0.75rem',
                color: 'rgba(250,248,240,0.45)',
                letterSpacing: '0.2em',
              }}
            >
              Antonio &amp; Perla Tannoury
            </p>
          </div>

          {/* Bottom note */}
          <div
            style={{
              marginTop: '2.5rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(201,168,76,0.1)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'Jost, sans-serif',
                fontWeight: 200,
                fontSize: '0.72rem',
                color: 'rgba(250,248,240,0.35)',
                letterSpacing: '0.1em',
                lineHeight: 1.8,
              }}
            >
              For any questions or assistance with the transfer,
              <br />
              please do not hesitate to reach out to us.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
