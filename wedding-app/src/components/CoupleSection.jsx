import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useConfig } from '../i18n/useConfig';
import { useLang } from '../i18n/LanguageContext';
import { useDriveImages, driveThumbUrl } from '../hooks/useDriveImages';

gsap.registerPlugin(ScrollTrigger);

function PersonCard({ person, role, roleKey, photo, objectPosition, t }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current?.querySelectorAll('.person-anim') ?? [], {
        y: 30, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'expo.out',
        scrollTrigger: { trigger: cardRef.current, start: 'top 78%' },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={cardRef} style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      {/* Full-width photo with torn edges */}
      <div className="person-anim torn-edge-bottom" style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4/5',
        maxHeight: '500px',
        overflow: 'hidden',
      }}>
        {photo ? (
          <img
            src={photo}
            alt={person.firstName}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              objectPosition: objectPosition || 'center top', display: 'block',
            }}
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(160deg, #f5f0e8 0%, #ede6d6 40%, #e0d4be 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'clamp(5rem, 15vw, 10rem)',
            fontFamily: '"Playfair Display", serif', fontWeight: 300,
            color: 'rgba(139,115,85,0.2)', userSelect: 'none',
          }}>
            {person.firstName[0]}
          </div>
        )}
      </div>

      {/* Text content */}
      <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem)', textAlign: 'center' }}>
        <p className="person-anim" style={{
          fontFamily: 'Jost, sans-serif', fontWeight: 200,
          fontSize: '0.62rem', letterSpacing: '0.45em',
          color: '#8B7355', textTransform: 'uppercase', marginBottom: '0.5rem',
        }}>
          {role}
        </p>
        <h3 className="person-anim" style={{
          fontFamily: '"Playfair Display", serif', fontWeight: 400, fontStyle: 'italic',
          fontSize: 'clamp(2rem, 6vw, 3rem)', color: '#3a2e22',
          lineHeight: 1.1, marginBottom: '0.25rem',
        }}>
          {person.firstName}
        </h3>
        <p className="person-anim" style={{
          fontFamily: '"Cormorant Garamond", serif', fontWeight: 300,
          fontSize: '1rem', color: 'rgba(58,46,34,0.5)',
          letterSpacing: '0.1em', marginBottom: '1rem',
        }}>
          {person.fullName}
        </p>
        <p className="person-anim" style={{
          fontFamily: 'Jost, sans-serif', fontWeight: 300,
          fontSize: '0.88rem', color: 'rgba(58,46,34,0.65)',
          lineHeight: 1.85, maxWidth: '440px', margin: '0 auto',
        }}>
          {person.bio}
        </p>
        {/* Parents */}
        {person.parentsDisplay && (
          <div className="person-anim" style={{ marginTop: '1.25rem' }}>
            <div style={{
              width: '30px', height: '1px', margin: '0 auto 0.75rem',
              background: 'linear-gradient(90deg, transparent, rgba(139,115,85,0.3), transparent)',
            }} />
            <p style={{
              fontFamily: 'Jost, sans-serif', fontWeight: 200,
              fontSize: '0.6rem', letterSpacing: '0.35em',
              color: '#8B7355', textTransform: 'uppercase', marginBottom: '0.3rem',
            }}>
              {roleKey === 'bride' ? t('couple.daughterOf') : t('couple.sonOf')}
            </p>
            <p style={{
              fontFamily: '"Cormorant Garamond", serif', fontWeight: 400,
              fontStyle: 'italic', fontSize: '0.95rem', color: 'rgba(58,46,34,0.6)',
            }}>
              {person.parentsDisplay}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoupleSection() {
  const sectionRef = useRef(null);
  const config = useConfig();
  const { t } = useLang();
  const driveRoot = config.google_drive?.root_folder_id;
  const { images: driveFiles } = useDriveImages(driveRoot, 'couple');
  const imgPos = config.imagePositions || {};

  const findDrivePhoto = (keyword) => {
    const file = driveFiles.find(f => f.name?.toLowerCase().includes(keyword));
    return file ? driveThumbUrl(file.id, 'w1600') : null;
  };

  const groomPhoto = findDrivePhoto('groom') || findDrivePhoto('antonio');
  const bridePhoto = findDrivePhoto('bride') || findDrivePhoto('perla');

  return (
    <section
      id="couple"
      ref={sectionRef}
      style={{
        background: '#faf8f0',
        padding: 'clamp(2rem, 6vw, 5rem) 0 clamp(1rem, 3vw, 2.5rem)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 6vw, 4rem)', padding: '0 clamp(1rem, 4vw, 3rem)' }}>
        <p className="section-tag" style={{ marginBottom: '0.75rem' }}>{t('couple.tag')}</p>
        <h2 style={{
          fontFamily: '"Cormorant Garamond", serif', fontWeight: 400,
          fontSize: 'clamp(2rem, 6vw, 3.5rem)', color: '#3a2e22',
        }}>
          {t('couple.title')}
        </h2>
        <div style={{
          width: '60px', height: '1px', margin: '1.25rem auto 0',
          background: 'linear-gradient(90deg, transparent, #8B7355, transparent)',
        }} />
      </div>

      {/* The Groom */}
      <PersonCard
        person={config.couple.groom}
        role={t('couple.groom')}
        roleKey="groom"
        photo={groomPhoto}
        objectPosition={imgPos.couple_groom}
        t={t}
      />

      {/* Center heart divider */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(1.5rem, 4vw, 3rem) 0', gap: '1rem',
      }}>
        <div style={{ width: '60px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(139,115,85,0.3))' }} />
        <span style={{ color: '#C41E3A', fontSize: '1.2rem', opacity: 0.5 }}>♡</span>
        <div style={{ width: '60px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(139,115,85,0.3))' }} />
      </div>

      {/* The Bride */}
      <PersonCard
        person={config.couple.bride}
        role={t('couple.bride')}
        roleKey="bride"
        photo={bridePhoto}
        objectPosition={imgPos.couple_bride}
        t={t}
      />
    </section>
  );
}