import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useConfig } from '../i18n/useConfig';
import { useLang } from '../i18n/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

/* ── Elegant SVG icons ── */
const CeremonyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <circle cx="24" cy="24" r="23" stroke="#87A96B" strokeWidth="0.8" fill="none" />
    {/* Church silhouette */}
    <path d="M17 36 L17 22 L24 15 L31 22 L31 36" stroke="#87A96B" strokeWidth="1.1" strokeLinejoin="round" fill="rgba(135,169,107,0.05)" />
    {/* Cross */}
    <line x1="24" y1="9" x2="24" y2="15" stroke="#87A96B" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="21.5" y1="11.5" x2="26.5" y2="11.5" stroke="#87A96B" strokeWidth="1.2" strokeLinecap="round" />
    {/* Arched door */}
    <path d="M21.5 36 L21.5 30 C21.5 28 22.8 27 24 27 C25.2 27 26.5 28 26.5 30 L26.5 36" stroke="#87A96B" strokeWidth="1" fill="rgba(135,169,107,0.1)" />
    {/* Rose window */}
    <circle cx="24" cy="23" r="2" stroke="#87A96B" strokeWidth="0.7" fill="rgba(135,169,107,0.1)" />
    <circle cx="24" cy="23" r="0.7" fill="#87A96B" opacity="0.15" />
    {/* Small side windows */}
    <rect x="19" y="25" width="1.5" height="2.5" rx="0.75" stroke="#87A96B" strokeWidth="0.5" fill="rgba(135,169,107,0.08)" opacity="0.6" />
    <rect x="27.5" y="25" width="1.5" height="2.5" rx="0.75" stroke="#87A96B" strokeWidth="0.5" fill="rgba(135,169,107,0.08)" opacity="0.6" />
  </svg>
);

const ReceptionIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <circle cx="24" cy="24" r="23" stroke="#87A96B" strokeWidth="0.8" fill="none" />
    {/* Left champagne flute */}
    <path d="M16 11 L15.3 20 C15.1 22 16.5 23 18 23" stroke="#87A96B" strokeWidth="1" strokeLinecap="round" fill="none" />
    <path d="M20 11 L20.7 20 C20.9 22 19.5 23 18 23" stroke="#87A96B" strokeWidth="1" strokeLinecap="round" fill="none" />
    <path d="M16 16 C16 16 15.5 20 15.5 21 C15.5 22.2 16.8 22.8 18 22.8 C19.2 22.8 20.5 22.2 20.5 21 C20.5 20 20 16 20 16Z" fill="rgba(135,169,107,0.1)" />
    <line x1="18" y1="23" x2="18" y2="32" stroke="#87A96B" strokeWidth="0.9" strokeLinecap="round" />
    <path d="M15.5 32.5 L20.5 32.5" stroke="#87A96B" strokeWidth="1" strokeLinecap="round" />
    {/* Right champagne flute */}
    <path d="M28 11 L27.3 20 C27.1 22 28.5 23 30 23" stroke="#87A96B" strokeWidth="1" strokeLinecap="round" fill="none" />
    <path d="M32 11 L32.7 20 C32.9 22 31.5 23 30 23" stroke="#87A96B" strokeWidth="1" strokeLinecap="round" fill="none" />
    <path d="M28 16 C28 16 27.5 20 27.5 21 C27.5 22.2 28.8 22.8 30 22.8 C31.2 22.8 32.5 22.2 32.5 21 C32.5 20 32 16 32 16Z" fill="rgba(135,169,107,0.1)" />
    <line x1="30" y1="23" x2="30" y2="32" stroke="#87A96B" strokeWidth="0.9" strokeLinecap="round" />
    <path d="M27.5 32.5 L32.5 32.5" stroke="#87A96B" strokeWidth="1" strokeLinecap="round" />
    {/* Clink sparkle */}
    <path d="M22 12 L26 12" stroke="#87A96B" strokeWidth="0.6" strokeLinecap="round" opacity="0.45" />
    <path d="M24 10 L24 14" stroke="#87A96B" strokeWidth="0.6" strokeLinecap="round" opacity="0.45" />
    <path d="M22.5 10.5 L25.5 13.5" stroke="#87A96B" strokeWidth="0.4" strokeLinecap="round" opacity="0.25" />
    <path d="M25.5 10.5 L22.5 13.5" stroke="#87A96B" strokeWidth="0.4" strokeLinecap="round" opacity="0.25" />
    {/* Small heart */}
    <path d="M22.5 36 C22.5 35 23.5 34.5 24 35.3 C24.5 34.5 25.5 35 25.5 36 C25.5 37 24 38 24 38 C24 38 22.5 37 22.5 36Z" fill="#87A96B" opacity="0.2" />
  </svg>
);

function EventCard({ event, label, icon, dateStr, viewMapText }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current?.querySelectorAll('.ev-anim') ?? [], {
        y: 30, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'expo.out',
        scrollTrigger: { trigger: cardRef.current, start: 'top 80%' },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={cardRef}
      style={{
        background: 'rgba(255,255,255,0.6)',
        border: '1px solid rgba(135,169,107,0.2)',
        borderRadius: '12px',
        padding: 'clamp(2rem, 5vw, 3rem)',
        maxWidth: '520px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(135,169,107,0.06)',
      }}
    >
      {/* Top accent */}
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%', height: '2px',
        background: 'linear-gradient(90deg, transparent, #87A96B, transparent)',
        borderRadius: '0 0 2px 2px',
      }} />

      {/* Icon */}
      <div className="ev-anim" style={{ marginBottom: '1.25rem' }}>
        {icon}
      </div>

      {/* Label */}
      <p className="ev-anim" style={{
        fontFamily: 'Jost, sans-serif', fontWeight: 200,
        fontSize: '0.62rem', letterSpacing: '0.45em',
        color: '#87A96B', textTransform: 'uppercase', marginBottom: '0.75rem',
      }}>
        {label}
      </p>

      {/* Venue */}
      <h3 className="ev-anim" style={{
        fontFamily: '"Playfair Display", serif', fontWeight: 500,
        fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: '#3a2e22',
        lineHeight: 1.2, marginBottom: '0.5rem',
      }}>
        {event.venue}
      </h3>

      {/* Address */}
      <p className="ev-anim" style={{
        fontFamily: '"Cormorant Garamond", serif', fontWeight: 400,
        fontSize: '1rem', color: 'rgba(58,46,34,0.55)',
        marginBottom: '1rem',
      }}>
        {event.address}
      </p>

      {/* Time */}
      <p className="ev-anim" style={{
        fontFamily: '"Cormorant Garamond", serif', fontWeight: 400,
        fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', color: '#87A96B',
        letterSpacing: '0.1em', marginBottom: '0.75rem',
      }}>
        {event.time}
      </p>

      {/* Map button */}
      {event.mapUrl && (
        <a
          href={event.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            minWidth: '160px',
            marginTop: '0.75rem',
            marginBottom: '0.5rem',
            borderRadius: '0.35rem',
            padding: '0.875rem 2.5rem',
            fontFamily: 'Jost, sans-serif',
            fontWeight: 300,
            letterSpacing: '0.25em',
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            color: '#fff',
            background: '#87A96B',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {viewMapText}
        </a>
      )}
    </div>
  );
}

export default function EventsSection() {
  const sectionRef = useRef(null);
  const config = useConfig();
  const { t } = useLang();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.events-header > *', {
        y: 30, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="events"
      ref={sectionRef}
      className="watermark-sunflower"
      style={{
        background: '#f5f0e8',
        padding: 'clamp(3rem, 8vw, 7rem) clamp(1.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3.5rem)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="events-header" style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 6vw, 4rem)' }}>
          <p className="section-tag" style={{ marginBottom: '0.75rem' }}>
            {config.ui.events.tag}
          </p>
          <h2 style={{
            fontFamily: '"Cormorant Garamond", serif', fontWeight: 400,
            fontSize: 'clamp(2rem, 6vw, 3.5rem)', color: '#3a2e22',
          }}>
            {config.ui.events.title}
          </h2>
          <p style={{
            fontFamily: 'Jost, sans-serif', fontWeight: 300,
            fontSize: '0.82rem', color: 'rgba(58,46,34,0.45)',
            marginTop: '0.75rem', letterSpacing: '0.1em',
          }}>
            {config.ui.events.subtitle}
          </p>
          <div style={{
            width: '60px', height: '1px', margin: '1.25rem auto 0',
            background: 'linear-gradient(90deg, transparent, #87A96B, transparent)',
          }} />
        </div>

        {/* Ceremony */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
          <EventCard
            event={config.events.ceremony}
            label={config.ui.events.ceremonyLabel}
            icon={<CeremonyIcon />}
            dateStr={config.wedding.dateFormatted}
            viewMapText={t('events.viewMap')}
          />
        </div>

        {/* Connecting divider */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '1rem', marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
        }}>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(135,169,107,0.4))' }} />
          <span style={{ color: '#87A96B', fontSize: '0.7rem', opacity: 0.6 }}>✦</span>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(135,169,107,0.4))' }} />
        </div>

        {/* Reception */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <EventCard
            event={config.events.reception}
            label={config.ui.events.receptionLabel}
            icon={<ReceptionIcon />}
            dateStr={config.wedding.dateFormatted}
            viewMapText={t('events.viewMap')}
          />
        </div>
      </div>
    </section>
  );
}