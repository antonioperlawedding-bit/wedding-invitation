import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useConfig } from '../i18n/useConfig';
import { useLang } from '../i18n/LanguageContext';
import { useDriveImages, driveThumbUrl } from '../hooks/useDriveImages';

gsap.registerPlugin(ScrollTrigger);

function GalleryItem({ item, index, colSpan = 3, aspect = '1/1' }) {
  const itemRef = useRef(null);

  useEffect(() => {
    if (!itemRef.current) return;
    gsap.fromTo(
      itemRef.current,
      { scale: 0.95, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        delay: (index % 3) * 0.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: itemRef.current, start: 'top 92%' },
      }
    );
  }, [index]);

  return (
    <div
      ref={itemRef}
      className="gallery-item"
      style={{
        gridColumn: `span ${colSpan}`,
        aspectRatio: aspect,
        position: 'relative',
        background: 'linear-gradient(135deg, #eaf3e2 0%, #ebe5d8 100%)',
        overflow: 'hidden',
        borderRadius: '0.75rem',
      }}
    >
      <img
        src={item.src}
        alt={item.alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: item.objectPosition || 'center center',
          display: 'block',
          borderRadius: '0.75rem',
        }}
        loading="lazy"
        onError={e => { e.currentTarget.style.display = 'none'; }}
      />

      {/* Hover overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(135,169,107,0.45) 0%, transparent 60%)',
          opacity: 0,
          transition: 'opacity 0.4s ease',
          borderRadius: '0.75rem',
        }}
        className="gallery-overlay"
      />

      {/* Caption */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '1.25rem',
          opacity: 0,
          transition: 'opacity 0.4s ease',
          zIndex: 2,
        }}
        className="gallery-caption"
      >
        <p
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            fontSize: '0.95rem',
            color: '#fff',
          }}
        >
          {item.caption}
        </p>
      </div>

      {/* Border reveal on hover */}
      <div
        style={{
          position: 'absolute',
          inset: '4px',
          border: '1px solid rgba(135,169,107,0.4)',
          borderRadius: '0.6rem',
          opacity: 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
          zIndex: 2,
        }}
        className="gallery-border"
      />

      <style>{`
        .gallery-item:hover .gallery-overlay { opacity: 1 !important; }
        .gallery-item:hover .gallery-caption { opacity: 1 !important; }
        .gallery-item:hover .gallery-border  { opacity: 1 !important; }
      `}</style>
    </div>
  );
}

export default function GallerySection() {
  const sectionRef = useRef(null);
  const config = useConfig();
  const { t } = useLang();
  const driveRoot = config.google_drive?.root_folder_id;
  const { images: driveFiles, loading: driveLoading } = useDriveImages(driveRoot, 'memories');
  const imgPos = config.imagePositions || {};

  const gallery = driveFiles.length > 0
    ? driveFiles.map((f, i) => ({
        id: f.id,
        src: driveThumbUrl(f.id, 'w1600'),
        alt: f.name?.replace(/\.[^/.]+$/, '') || `${t('gallery.memory')} ${i + 1}`,
        caption: (f.name?.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || t('gallery.fallbackCaption')),
        objectPosition: imgPos[`gallery_${f.id}`],
      }))
    : (config.events.gallery || []);

  const galleryLayout = config.galleryLayout || {};
  const galleryOrder = config.galleryOrder || [];
  const sortedGallery = [...gallery].sort((a, b) => {
    const ai = galleryOrder.indexOf(a.id);
    const bi = galleryOrder.indexOf(b.id);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.gallery-header > *', {
        y: 30,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="watermark-sunflower"
      style={{
        background: '#eaf3e2',
        padding: 'clamp(3rem,8vw,7rem) clamp(1rem,4vw,3rem) clamp(1.5rem,4vw,3.5rem)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div
          className="gallery-header"
          style={{ textAlign: 'center', marginBottom: 'clamp(2rem,6vw,4rem)' }}
        >
          <p className="section-tag" style={{ marginBottom: '0.75rem' }}>
            {config.ui.gallery.tag}
          </p>
          <h2
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 400,
              fontSize: 'clamp(2rem,5vw,3.5rem)',
              color: '#3a2e20',
            }}
          >
            {config.ui.gallery.title}
          </h2>
          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 300,
              fontSize: '0.82rem',
              color: 'rgba(58,46,32,0.5)',
              marginTop: '0.75rem',
              letterSpacing: '0.1em',
            }}
          >
            {config.ui.gallery.subtitle}
          </p>
          <div
            style={{
              width: '60px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #87A96B, transparent)',
              margin: '1.25rem auto 0',
            }}
          />
        </div>

        {/* Photo grid */}
        <div
          className="gallery-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '0.75rem',
          }}
        >
          {driveLoading && driveFiles.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  gridColumn: 'span 3',
                  aspectRatio: '1/1',
                  background: 'linear-gradient(90deg, rgba(135,169,107,0.06) 25%, rgba(135,169,107,0.12) 50%, rgba(135,169,107,0.06) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.8s infinite',
                  borderRadius: '0.75rem',
                }}
              />
            ))
          ) : (
            sortedGallery.map((item, i) => {
              const lay = galleryLayout[item.id] || { cols: 3, aspect: '1/1' };
              return (
                <GalleryItem
                  key={item.id}
                  item={item}
                  index={i}
                  colSpan={lay.cols}
                  aspect={lay.aspect}
                />
              );
            })
          )}
        </div>

        <style>{`
          @keyframes shimmer {
            0%   { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          @media (max-width: 640px) {
            .gallery-grid { gap: 0.35rem !important; }
          }
        `}</style>
      </div>
    </section>
  );
}