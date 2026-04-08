import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import config from '@config';
import { useDriveImages, driveThumbUrl } from '../hooks/useDriveImages';

gsap.registerPlugin(ScrollTrigger);

/* ── Bio card with scroll reveal ── */
function PersonCard({ person, role, side, photo, objectPosition }) {
  const cardRef   = useRef(null);
  const imageRef  = useRef(null);
  const textRef   = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const fromX = side === 'left' ? -60 : 60;

      // Image slides in from side
      gsap.from(imageRef.current, {
        x: fromX,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 78%',
        },
      });

      // Text stagger reveal
      gsap.from(textRef.current.children, {
        y: 35,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 72%',
        },
      });
    });
    return () => ctx.revert();
  }, [side]);

  return (
    <div
      ref={cardRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        width: '100%',
        maxWidth: '480px',
      }}
    >
      {/* Portrait frame */}
      <div
        ref={imageRef}
        style={{
          position: 'relative',
          aspectRatio: '3/4',
          maxHeight: '520px',
          overflow: 'hidden',
        }}
      >
        {/* Gold border frame */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '1px solid rgba(204,158,36,0.5)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
        {/* Corner accents */}
        {['tl','tr','bl','br'].map(c => (
          <div
            key={c}
            style={{
              position: 'absolute',
              width: '24px',
              height: '24px',
              borderColor: '#cc9e24',
              borderStyle: 'solid',
              borderWidth: c.includes('t') ? '1px 0 0 0' : '0 0 1px 0',
              ...(c.includes('r') ? { borderRightWidth: '1px', right: -1 } : { borderLeftWidth: '1px', left: -1 }),
              ...(c.includes('t') ? { top: -1 } : { bottom: -1 }),
              zIndex: 3,
            }}
          />
        ))}
        {/* Photo — Drive image when available, initials placeholder otherwise */}
        {photo ? (
          <img
            src={photo}
            alt={person.firstName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: objectPosition || 'center top',
              display: 'block',
            }}
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: role === 'Bride'
                ? 'linear-gradient(160deg, #243a1c 0%, #3a5a28 40%, #6b7a15 100%)'
                : 'linear-gradient(160deg, #1a2e14 0%, #2a4a1e 40%, #3a5a28 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(4rem,12vw,8rem)',
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 300,
              color: 'rgba(204,158,36,0.3)',
              userSelect: 'none',
            }}
          >
            {person.firstName[0]}
          </div>
        )}
        {/* Role badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '1.5rem',
            ...(side === 'left' ? { right: '1.5rem' } : { left: '1.5rem' }),
            padding: '0.4rem 1.2rem',
            background: 'rgba(204,158,36,0.9)',
            zIndex: 4,
          }}
        >
          <span
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 200,
              fontSize: '0.62rem',
              letterSpacing: '0.45em',
              color: '#1a2e14',
              textTransform: 'uppercase',
            }}
          >
            {role}
          </span>
        </div>
      </div>

      {/* Text content */}
      <div ref={textRef} style={{ paddingLeft: side === 'right' ? '0.5rem' : 0 }}>
        <p
          style={{
            fontFamily: 'Jost, sans-serif',
            fontWeight: 200,
            fontSize: '0.65rem',
            letterSpacing: '0.45em',
            color: '#cc9e24',
            textTransform: 'uppercase',
            marginBottom: '0.6rem',
          }}
        >
          {role}
        </p>
        <h3
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 400,
            fontStyle: 'italic',
            fontSize: 'clamp(2rem,5vw,2.8rem)',
            color: '#faf8f0',
            lineHeight: 1.1,
            marginBottom: '0.3rem',
          }}
        >
          {person.firstName}
        </h3>
        <p
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 300,
            fontSize: '1.05rem',
            color: 'rgba(250,248,240,0.5)',
            letterSpacing: '0.1em',
            marginBottom: '1.25rem',
          }}
        >
          {person.fullName}
        </p>
        <p
          style={{
            fontFamily: 'Jost, sans-serif',
            fontWeight: 300,
            fontSize: '0.88rem',
            lineHeight: 1.85,
            color: 'rgba(250,248,240,0.55)',
            maxWidth: '420px',
          }}
        >
          {person.bio}
        </p>
        <div
          style={{
            marginTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div style={{ height: '1px', width: '40px', background: 'rgba(204,158,36,0.4)' }} />
          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 200,
              fontSize: '0.7rem',
              letterSpacing: '0.3em',
              color: 'rgba(204,158,36,0.6)',
            }}
          >
            {person.parents}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CoupleSection() {
  const sectionRef = useRef(null);
  const centerRef  = useRef(null);
  const tagRef     = useRef(null);

  const driveRoot = config.google_drive?.root_folder_id;
  const { images: perlaImgs }   = useDriveImages(driveRoot, 'perla');
  const { images: antonioImgs } = useDriveImages(driveRoot, 'antonio');

  const bridePhoto  = perlaImgs[0]   ? driveThumbUrl(perlaImgs[0].id,   'w1200') : null;
  const groomPhoto  = antonioImgs[0] ? driveThumbUrl(antonioImgs[0].id, 'w1200') : null;
  const imgPos = config.imagePositions || {};

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from([tagRef.current, centerRef.current], {
        opacity: 0,
        y: 30,
        duration: 1,
        stagger: 0.15,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: centerRef.current,
          start: 'top 80%',
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="couple"
      ref={sectionRef}
      style={{
        background: '#1e3518',
        padding: 'clamp(2rem,8vw,9rem) clamp(1rem,4vw,5rem)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Large decorative ampersand watermark */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 'clamp(12rem,30vw,22rem)',
          fontWeight: 300,
          fontStyle: 'italic',
          color: 'rgba(204,158,36,0.04)',
          pointerEvents: 'none',
          userSelect: 'none',
          lineHeight: 1,
        }}
      >
        &amp;
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div
          ref={tagRef}
          style={{
            textAlign: 'center',
            marginBottom: 'clamp(1.5rem,6vw,5rem)',
          }}
        >
          <p className="section-tag" style={{ marginBottom: '0.75rem' }}>The Couple</p>
          <h2
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: 'clamp(2.2rem,6vw,4rem)',
              color: '#faf8f0',
              lineHeight: 1.15,
            }}
          >
            Two Souls, One Story
          </h2>
        </div>

        {/* Cards — side by side on desktop */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: 'clamp(1rem,8vw,6rem)',
          }}
        >
          <PersonCard
            person={config.couple.bride}
            role="Bride"
            side="left"
            photo={bridePhoto}
            objectPosition={imgPos.couple_bride}
          />

          {/* Center heart divider (desktop only) */}
          <div
            ref={centerRef}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              paddingTop: '0.5rem',
              minWidth: '60px',
            }}
            className="hidden lg:flex"
          >
            <div style={{ width: '1px', height: '80px', background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,0.4))' }} />
            <div
              style={{
                width: '44px',
                height: '44px',
                border: '1px solid rgba(204,158,36,0.4)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                color: '#cc9e24',
              }}
            >
              ♡
            </div>
            <div style={{ width: '1px', height: '80px', background: 'linear-gradient(to top, transparent, rgba(204,158,36,0.4))' }} />
          </div>

          <PersonCard
            person={config.couple.groom}
            role="Groom"
            side="right"
            photo={groomPhoto}
            objectPosition={imgPos.couple_groom}
          />
        </div>
      </div>
    </section>
  );
}
