import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useConfig } from '../i18n/useConfig';
import { useLang } from '../i18n/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

function LocationCard({ data, label, viewMapText }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current?.querySelectorAll('.loc-anim') ?? [], {
        y: 30, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'expo.out',
        scrollTrigger: { trigger: cardRef.current, start: 'top 80%' },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={cardRef} style={{ textAlign: 'center', marginBottom: 'clamp(1.5rem, 4vw, 3rem)' }}>
      <h3 className="loc-anim" style={{
        fontFamily: '"Playfair Display", serif', fontWeight: 600,
        fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', color: '#3a2e22',
        marginBottom: '0.75rem',
      }}>
        {label}
      </h3>
      <p className="loc-anim" style={{
        fontFamily: 'Jost, sans-serif', fontWeight: 300,
        fontSize: '0.82rem', color: 'rgba(58,46,34,0.5)',
        letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.1rem',
      }}>
        {data.venue}
      </p>
      <p className="loc-anim" style={{
        fontFamily: '"Cormorant Garamond", serif', fontWeight: 400,
        fontSize: '1rem', color: 'rgba(58,46,34,0.65)',
        marginBottom: '0.0rem',
      }}>
        {data.address}
      </p>

      {data.mapUrl && (
        <a
          href={data.mapUrl}
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

export default function GatheringSection() {
  const sectionRef = useRef(null);
  const config = useConfig();
  const { t } = useLang();
  const gathering = config.events.gathering;

  if (!gathering) return null;

  return (
    <section
      id="gathering"
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
        <div style={{ textAlign: 'center', marginBottom: 'clamp(1.75rem, 5vw, 3.5rem)' }}>
          <p className="section-tag" style={{ marginBottom: '0.75rem' }}>
            {config.ui.gathering.tag}
          </p>
          <h2 style={{
            fontFamily: '"Cormorant Garamond", serif', fontWeight: 400,
            fontSize: 'clamp(2rem, 6vw, 3.5rem)', color: '#3a2e22',
          }}>
            {config.ui.gathering.title}
          </h2>
          <p style={{
            fontFamily: 'Jost, sans-serif', fontWeight: 300,
            fontSize: '0.82rem', color: 'rgba(58,46,34,0.45)',
            marginTop: '0.75rem', letterSpacing: '0.1em',
          }}>
            {config.wedding.dateFormatted}
          </p>
          <div style={{
            width: '60px', height: '1px', margin: '1rem auto 0',
            background: 'linear-gradient(90deg, transparent, #87A96B, transparent)',
          }} />
        </div>

        {/* Groom's location */}
        <LocationCard data={gathering.groom} label={config.ui.gathering.groomLabel} viewMapText={t('gathering.viewMap')} />

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '1rem', margin: 'clamp(3rem, 3vw, 2.25rem) 0',
        }}>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(135,169,107,0.4))' }} />
          <span style={{ color: '#87A96B', fontSize: '0.75rem', opacity: 0.7 }}>✦</span>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(135,169,107,0.4))' }} />
        </div>

        {/* Bride's location */}
        <LocationCard data={gathering.bride} label={config.ui.gathering.brideLabel} viewMapText={t('gathering.viewMap')} />
      </div>
    </section>
  );
}
