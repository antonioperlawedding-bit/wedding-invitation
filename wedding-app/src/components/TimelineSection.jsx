import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import config from '@config';

gsap.registerPlugin(ScrollTrigger);

export default function TimelineSection() {
  const sectionRef = useRef(null);
  const pathRef    = useRef(null);
  const itemsRef   = useRef([]);

  const timeline = config.events.timeline;

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ── Header ── */
      gsap.from('.timeline-header-child', {
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

      /* ── SVG path draw ── */
      if (pathRef.current) {
        const pathLength = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, {
          strokeDasharray:  pathLength,
          strokeDashoffset: pathLength,
        });
        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            end:   'bottom 80%',
            scrub: 1.5,
          },
        });
      }

      /* ── Each timeline item ── */
      itemsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.from(el, {
          x: i % 2 === 0 ? -50 : 50,
          opacity: 0,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 82%',
          },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="timeline"
      ref={sectionRef}
      style={{
        background: '#1e3518',
        padding: 'clamp(2rem,8vw,9rem) clamp(1rem,4vw,5rem)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Large background text watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: '-2rem',
          right: '-2rem',
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 'clamp(6rem, 20vw, 16rem)',
          fontWeight: 300,
          color: 'rgba(250,248,240,0.025)',
          pointerEvents: 'none',
          userSelect: 'none',
          lineHeight: 1,
        }}
      >
        Day
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem,8vw,5rem)' }}>
          <p className="section-tag timeline-header-child" style={{ marginBottom: '0.75rem' }}>
            {config.ui.timeline.tag}
          </p>
          <h2
            className="timeline-header-child"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 400,
              fontSize: 'clamp(2.2rem,6vw,4rem)',
              color: '#faf8f0',
            }}
          >
            {config.ui.timeline.title}
          </h2>
          <p
            className="timeline-header-child"
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 200,
              fontSize: '0.82rem',
              color: 'rgba(250,248,240,0.4)',
              marginTop: '0.75rem',
              letterSpacing: '0.15em',
            }}
          >
            {config.wedding.dateFormatted}
          </p>
        </div>

        {/* Timeline items */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
          }}
        >
          {/* SVG vertical path */}
          <svg
            className="timeline-svg"
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              transform: 'translateX(-50%)',
              width: '2px',
              height: '100%',
              overflow: 'visible',
              pointerEvents: 'none',
              zIndex: 0,
            }}
            viewBox="0 0 2 100"
            preserveAspectRatio="none"
          >
            <path
              ref={pathRef}
              d="M1 0 L1 100"
              stroke="url(#lineGrad)"
              strokeWidth="1"
              fill="none"
            />
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="rgba(204,158,36,0)" />
                <stop offset="30%"  stopColor="rgba(204,158,36,0.6)" />
                <stop offset="70%"  stopColor="rgba(204,158,36,0.6)" />
                <stop offset="100%" stopColor="rgba(204,158,36,0)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Mobile responsive styles */}
          <style>{`
            @media (max-width: 640px) {
              .timeline-row { justify-content: flex-start !important; }
              .timeline-card { width: calc(100% - 2rem) !important; margin-left: 2rem !important; margin-right: 0 !important; text-align: left !important; }
              .timeline-dot  { left: 0 !important; transform: translate(0,-50%) !important; }
              .timeline-svg  { left: 0 !important; transform: none !important; }
            }
          `}</style>

          {timeline.map((item, i) => {
            const isLeft  = i % 2 === 0;
            return (
              <div
                key={i}
                ref={el => (itemsRef.current[i] = el)}
                className="timeline-row"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: isLeft ? 'flex-end' : 'flex-start',
                  padding: 'clamp(1.5rem,4vw,2.5rem) 0',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {/* Dot */}
                <div
                  className="timeline-dot"
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    border: '2px solid #cc9e24',
                    background: '#1e3518',
                    zIndex: 2,
                    boxShadow: '0 0 12px rgba(204,158,36,0.4)',
                  }}
                />

                {/* Card */}
                <div
                  className="timeline-card"
                  style={{
                    width: 'calc(50% - 2.5rem)',
                    padding: 'clamp(1.2rem,3vw,1.8rem)',
                    background: 'rgba(250,248,240,0.04)',
                    border: '1px solid rgba(204,158,36,0.18)',
                    ...(isLeft ? { marginRight: '2.5rem', textAlign: 'right' } : { marginLeft: '2.5rem', textAlign: 'left' }),
                    position: 'relative',
                  }}
                >
                  {/* Time */}
                  <p
                    style={{
                      fontFamily: 'Jost, sans-serif',
                      fontWeight: 200,
                      fontSize: '0.62rem',
                      letterSpacing: '0.45em',
                      color: '#cc9e24',
                      textTransform: 'uppercase',
                      marginBottom: '0.4rem',
                    }}
                  >
                    {item.time}
                  </p>
                  {/* Title */}
                  <h4
                    style={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontWeight: 400,
                      fontSize: 'clamp(1.1rem,2.5vw,1.4rem)',
                      color: '#faf8f0',
                      marginBottom: '0.4rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {item.title}
                  </h4>
                  {/* Description */}
                  <p
                    style={{
                      fontFamily: 'Jost, sans-serif',
                      fontWeight: 300,
                      fontSize: '0.78rem',
                      color: 'rgba(250,248,240,0.45)',
                      lineHeight: 1.65,
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
