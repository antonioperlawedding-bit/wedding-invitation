import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useConfig } from '../i18n/useConfig';

gsap.registerPlugin(ScrollTrigger);

/* ── Icon map: polished SVGs inside circles ── */
const ICONS = {
  guests: (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {/* Center person */}
      <circle cx="16" cy="8.5" r="3.2" stroke="#87A96B" strokeWidth="1.4" fill="rgba(135,169,107,0.12)" />
      <path d="M8.5 26 C8.5 21.5 11 18 16 18 C21 18 23.5 21.5 23.5 26" stroke="#87A96B" strokeWidth="1.4" strokeLinecap="round" fill="rgba(135,169,107,0.07)" />
      {/* Left person */}
      <circle cx="6.5" cy="11" r="2.2" stroke="#87A96B" strokeWidth="1" fill="rgba(135,169,107,0.08)" opacity="0.65" />
      <path d="M2 26 C2 22.5 3.5 20 6.5 20 C9 20 10.5 21.5 11 23" stroke="#87A96B" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.55" />
      {/* Right person */}
      <circle cx="25.5" cy="11" r="2.2" stroke="#87A96B" strokeWidth="1" fill="rgba(135,169,107,0.08)" opacity="0.65" />
      <path d="M30 26 C30 22.5 28.5 20 25.5 20 C23 20 21.5 21.5 21 23" stroke="#87A96B" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.55" />
      {/* Small heart between heads */}
      <path d="M15 4.5 C15 3.5 16 3 16.5 3.8 C17 3 18 3.5 18 4.5 C18 5.5 16.5 6.5 16.5 6.5 C16.5 6.5 15 5.5 15 4.5Z" fill="#87A96B" opacity="0.2" />
    </svg>
  ),
  church: (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {/* Cross */}
      <line x1="16" y1="1" x2="16" y2="7" stroke="#87A96B" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="13.5" y1="3.5" x2="18.5" y2="3.5" stroke="#87A96B" strokeWidth="1.4" strokeLinecap="round" />
      {/* Steeple */}
      <path d="M11 13 L16 7 L21 13" stroke="#87A96B" strokeWidth="1.3" strokeLinejoin="round" fill="rgba(135,169,107,0.06)" />
      {/* Main building */}
      <rect x="11" y="13" width="10" height="16" stroke="#87A96B" strokeWidth="1.3" fill="rgba(135,169,107,0.05)" />
      {/* Side wings */}
      <rect x="5" y="18" width="6" height="11" stroke="#87A96B" strokeWidth="1" fill="rgba(135,169,107,0.04)" />
      <rect x="21" y="18" width="6" height="11" stroke="#87A96B" strokeWidth="1" fill="rgba(135,169,107,0.04)" />
      {/* Arched door */}
      <path d="M14 29 L14 23.5 C14 21.5 15 20.5 16 20.5 C17 20.5 18 21.5 18 23.5 L18 29" stroke="#87A96B" strokeWidth="1.2" fill="rgba(135,169,107,0.1)" />
      {/* Rose window */}
      <circle cx="16" cy="16.5" r="1.8" stroke="#87A96B" strokeWidth="0.9" fill="rgba(135,169,107,0.12)" />
      <circle cx="16" cy="16.5" r="0.6" fill="#87A96B" opacity="0.15" />
      {/* Side windows */}
      <path d="M7 21 L7 23.5 C7 24 7.5 24.5 8 24.5 C8.5 24.5 9 24 9 23.5 L9 21" stroke="#87A96B" strokeWidth="0.7" fill="rgba(135,169,107,0.08)" opacity="0.6" />
      <path d="M23 21 L23 23.5 C23 24 23.5 24.5 24 24.5 C24.5 24.5 25 24 25 23.5 L25 21" stroke="#87A96B" strokeWidth="0.7" fill="rgba(135,169,107,0.08)" opacity="0.6" />
    </svg>
  ),
  drinks: (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {/* Left flute */}
      <path d="M9 3 L8.2 13 C8 15 9.5 16.5 11 16.5" stroke="#87A96B" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M13 3 L13.8 13 C14 15 12.5 16.5 11 16.5" stroke="#87A96B" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M9 9 C9 9 8.5 13 8.5 14 C8.5 15.5 9.8 16 11 16 C12.2 16 13.5 15.5 13.5 14 C13.5 13 13 9 13 9Z" fill="rgba(135,169,107,0.1)" />
      <line x1="11" y1="16.5" x2="11" y2="24" stroke="#87A96B" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M8 24.5 L14 24.5" stroke="#87A96B" strokeWidth="1.2" strokeLinecap="round" />
      {/* Right flute */}
      <path d="M19 3 L18.2 13 C18 15 19.5 16.5 21 16.5" stroke="#87A96B" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M23 3 L23.8 13 C24 15 22.5 16.5 21 16.5" stroke="#87A96B" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M19 9 C19 9 18.5 13 18.5 14 C18.5 15.5 19.8 16 21 16 C22.2 16 23.5 15.5 23.5 14 C23.5 13 23 9 23 9Z" fill="rgba(135,169,107,0.1)" />
      <line x1="21" y1="16.5" x2="21" y2="24" stroke="#87A96B" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M18 24.5 L24 24.5" stroke="#87A96B" strokeWidth="1.2" strokeLinecap="round" />
      {/* Clink sparkle */}
      <path d="M14.5 5 L17.5 5" stroke="#87A96B" strokeWidth="0.7" strokeLinecap="round" opacity="0.5" />
      <path d="M16 3.5 L16 6.5" stroke="#87A96B" strokeWidth="0.7" strokeLinecap="round" opacity="0.5" />
      <path d="M14.8 3.8 L17.2 6.2" stroke="#87A96B" strokeWidth="0.5" strokeLinecap="round" opacity="0.3" />
      <path d="M17.2 3.8 L14.8 6.2" stroke="#87A96B" strokeWidth="0.5" strokeLinecap="round" opacity="0.3" />
      {/* Bubbles */}
      <circle cx="10" cy="11" r="0.5" fill="#87A96B" opacity="0.3" />
      <circle cx="12" cy="8" r="0.4" fill="#87A96B" opacity="0.2" />
      <circle cx="20.5" cy="10" r="0.5" fill="#87A96B" opacity="0.3" />
      <circle cx="22" cy="7" r="0.4" fill="#87A96B" opacity="0.2" />
      {/* Heart between glasses */}
      <path d="M15 27 C15 26 16 25.5 16.5 26.3 C17 25.5 18 26 18 27 C18 28 16.5 29 16.5 29 C16.5 29 15 28 15 27Z" fill="#87A96B" opacity="0.18" />
    </svg>
  ),
  dinner: (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {/* Plate outer rim */}
      <ellipse cx="16" cy="18" rx="11" ry="9" stroke="#87A96B" strokeWidth="1.3" fill="rgba(135,169,107,0.03)" />
      {/* Plate inner rim */}
      <ellipse cx="16" cy="18" rx="7.5" ry="6" stroke="#87A96B" strokeWidth="0.6" fill="rgba(135,169,107,0.06)" opacity="0.6" />
      {/* Cloche / Dome lid */}
      <path d="M8 16 C8 9 11 5 16 5 C21 5 24 9 24 16" stroke="#87A96B" strokeWidth="1.3" strokeLinecap="round" fill="rgba(135,169,107,0.05)" />
      <line x1="7" y1="16" x2="25" y2="16" stroke="#87A96B" strokeWidth="1.3" strokeLinecap="round" />
      {/* Cloche handle */}
      <circle cx="16" cy="4" r="1.2" stroke="#87A96B" strokeWidth="1" fill="rgba(135,169,107,0.1)" />
      {/* Steam wisps */}
      <path d="M13 2.5 C13 1.5 12.5 1 13 0.5" stroke="#87A96B" strokeWidth="0.6" strokeLinecap="round" opacity="0.25" />
      <path d="M19 2.5 C19 1.5 19.5 1 19 0.5" stroke="#87A96B" strokeWidth="0.6" strokeLinecap="round" opacity="0.25" />
      {/* Fork (left) */}
      <path d="M2 7 L2 26" stroke="#87A96B" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M1 7 L1 11" stroke="#87A96B" strokeWidth="0.6" strokeLinecap="round" opacity="0.7" />
      <path d="M3 7 L3 11" stroke="#87A96B" strokeWidth="0.6" strokeLinecap="round" opacity="0.7" />
      {/* Knife (right) */}
      <path d="M30 7 L30 26" stroke="#87A96B" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M30 7 C31.5 7 31.5 9.5 31 11.5 L30 12.5" stroke="#87A96B" strokeWidth="0.8" strokeLinecap="round" fill="rgba(135,169,107,0.06)" />
    </svg>
  ),
  dance: (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {/* Lead dancer */}
      <circle cx="12" cy="6.5" r="2.5" stroke="#87A96B" strokeWidth="1.3" fill="rgba(135,169,107,0.1)" />
      <path d="M12 9 C12 9 11.5 13 11 15 L9 22" stroke="#87A96B" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12 15 L14 22" stroke="#87A96B" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12 11 L7 13.5" stroke="#87A96B" strokeWidth="1.2" strokeLinecap="round" />
      {/* Follow dancer */}
      <circle cx="21" cy="5.5" r="2.5" stroke="#87A96B" strokeWidth="1.3" fill="rgba(135,169,107,0.1)" />
      <path d="M21 8 C21 8 21.5 12 22 14 L24.5 21" stroke="#87A96B" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M21 14 L18.5 21" stroke="#87A96B" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M21 10 L26 12" stroke="#87A96B" strokeWidth="1.2" strokeLinecap="round" />
      {/* Held hands arch */}
      <path d="M7 13.5 C8 11 10 10 12.5 10 C15 10 17 10 19.5 10 C22 10 24 11 26 12" stroke="#87A96B" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.35" />
      {/* Flowing dress detail */}
      <path d="M22 14 C23 17 25.5 20 25 21.5 C24.5 22.5 23 22 22 22 C20.5 22 19 21.5 18.5 21" stroke="#87A96B" strokeWidth="0.7" strokeLinecap="round" fill="rgba(135,169,107,0.06)" opacity="0.5" />
      {/* Music notes */}
      <path d="M27 2 L27 6 C27 7.2 25.8 7.5 25.5 7 C25.2 6.5 26 5.5 27 6" stroke="#87A96B" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.35" />
      <path d="M5 3 L5 6.5 C5 7.5 3.8 7.8 3.5 7.3 C3.2 6.8 4 5.8 5 6.5" stroke="#87A96B" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.3" />
      {/* Sparkle accents */}
      <circle cx="16" cy="3" r="0.5" fill="#87A96B" opacity="0.2" />
      <path d="M16 1.5 L16 4.5" stroke="#87A96B" strokeWidth="0.4" strokeLinecap="round" opacity="0.15" />
      <path d="M14.5 3 L17.5 3" stroke="#87A96B" strokeWidth="0.4" strokeLinecap="round" opacity="0.15" />
      {/* Floor / stage line */}
      <path d="M6 26 C10 25 22 25 26 26" stroke="#87A96B" strokeWidth="0.6" strokeLinecap="round" opacity="0.2" />
    </svg>
  ),
};

function TimelineItem({ item, index, totalItems }) {
  const itemRef = useRef(null);

  useEffect(() => {
    if (!itemRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(itemRef.current, {
        y: 30, opacity: 0, duration: 0.8, ease: 'expo.out',
        scrollTrigger: { trigger: itemRef.current, start: 'top 85%' },
      });
    });
    return () => ctx.revert();
  }, []);

  const isLast = index === totalItems - 1;

  return (
    <div ref={itemRef} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      position: 'relative', paddingBottom: isLast ? 0 : 'clamp(2rem, 5vw, 3.5rem)',
    }}>
      {/* Circular icon */}
      <div style={{
        width: '56px', height: '56px', borderRadius: '50%',
        border: '1.5px solid #87A96B', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.8)', zIndex: 2,
        boxShadow: '0 2px 12px rgba(135,169,107,0.1)',
      }}>
        {ICONS[item.icon] || ICONS.guests}
      </div>

      {/* Content */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <p style={{
          fontFamily: '"Cormorant Garamond", serif', fontWeight: 500,
          fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', color: '#87A96B',
          letterSpacing: '0.05em', marginBottom: '0.3rem',
        }}>
          {item.time}
        </p>
        <h4 style={{
          fontFamily: '"Playfair Display", serif', fontWeight: 500,
          fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', color: '#3a2e22',
          marginBottom: '0.3rem',
        }}>
          {item.title}
        </h4>
        <p style={{
          fontFamily: 'Jost, sans-serif', fontWeight: 300,
          fontSize: '0.82rem', color: 'rgba(58,46,34,0.5)',
          maxWidth: '280px', lineHeight: 1.6,
        }}>
          {item.description}
        </p>
      </div>

      {/* Vertical connecting line (not on last item) */}
      {!isLast && (
        <div style={{
          position: 'absolute', bottom: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: '1px', height: 'clamp(2rem, 5vw, 3.5rem)',
          background: 'linear-gradient(to bottom, rgba(135,169,107,0.35), rgba(135,169,107,0.05))',
        }} />
      )}
    </div>
  );
}

export default function TimelineSection() {
  const sectionRef = useRef(null);
  const config = useConfig();
  const timeline = config.events.timeline;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.timeline-header-child', {
        y: 30, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="timeline"
      ref={sectionRef}
      className="watermark-rose"
      style={{
        background: '#faf8f0',
        padding: 'clamp(3rem, 8vw, 7rem) clamp(1.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3.5rem)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem, 6vw, 4rem)' }}>
          <p className="section-tag timeline-header-child" style={{ marginBottom: '0.75rem' }}>
            {config.ui.timeline.tag}
          </p>
          <h2 className="timeline-header-child" style={{
            fontFamily: '"Cormorant Garamond", serif', fontWeight: 400,
            fontSize: 'clamp(2rem, 6vw, 3.5rem)', color: '#3a2e22',
          }}>
            {config.ui.timeline.title}
          </h2>
          <p className="timeline-header-child" style={{
            fontFamily: 'Jost, sans-serif', fontWeight: 200,
            fontSize: '0.82rem', color: 'rgba(58,46,34,0.45)',
            marginTop: '0.75rem', letterSpacing: '0.15em',
          }}>
            {config.wedding.dateFormatted}
          </p>
          <div style={{
            width: '60px', height: '1px', margin: '1.25rem auto 0',
            background: 'linear-gradient(90deg, transparent, #87A96B, transparent)',
          }} />
        </div>

        {/* Timeline items */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {timeline.map((item, i) => (
            <TimelineItem key={i} item={item} index={i} totalItems={timeline.length} />
          ))}
        </div>
      </div>
    </section>
  );
}