import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useConfig } from '../i18n/useConfig';
import { useLang } from '../i18n/LanguageContext';
import churchImg from '../assets/st-charbel-church.png';
import hotelImg from '../assets/massabki-hotel.png';

gsap.registerPlugin(ScrollTrigger);

/* ── Venue illustration icons ── */
const CeremonyIcon = () => (
  <img
    src={churchImg}
    alt="Mar Charbel Church"
    style={{ width: '90px', height: '90px', objectFit: 'contain', display: 'block' }}
  />
);

const ReceptionIcon = () => (
  <img
    src={hotelImg}
    alt="Massabki Hotel"
    style={{ width: '90px', height: '90px', objectFit: 'contain', display: 'block' }}
  />
);

function EventCard({ event, label, subLabel, icon, dateStr, viewMapText }) {
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
      <div className="ev-anim" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
        {icon}
      </div>

      {/* Label */}
      <p className="ev-anim" style={{
        fontFamily: 'Jost, sans-serif', fontWeight: 200,
        fontSize: '0.62rem', letterSpacing: '0.45em',
        color: '#87A96B', textTransform: 'uppercase', marginBottom: subLabel ? '0.35rem' : '0.75rem',
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
      {/* <p className="ev-anim" style={{
        fontFamily: '"Cormorant Garamond", serif', fontWeight: 400,
        fontSize: '1rem', color: 'rgba(58,46,34,0.55)',
        marginBottom: '1rem',
      }}>
        {event.address}
      </p> */}

      {/* Time */}
      <p className="ev-anim" style={{
        fontFamily: '"Cormorant Garamond", serif', fontWeight: 400,
        fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', color: '#87A96B',
        letterSpacing: '0.1em', marginBottom: '0.75rem',
      }} dir="ltr">
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
        background: '#eaf3e2',
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
            subLabel={t('events.churchLabel')}
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