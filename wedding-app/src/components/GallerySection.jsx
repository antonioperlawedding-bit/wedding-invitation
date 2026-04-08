import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import config from '@config';
import { useDriveImages, driveThumbUrl } from '../hooks/useDriveImages';

gsap.registerPlugin(ScrollTrigger);

function GalleryItem({ item, index, colSpan = 3, aspect = '1/1' }) {
  const itemRef = useRef(null);

  useEffect(() => {
    if (!itemRef.current) return;

    gsap.fromTo(
      itemRef.current,
      { scale: 0.92, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.9,
        delay: (index % 3) * 0.1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: itemRef.current,
          start: 'top 92%',
        },
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
        background: 'linear-gradient(135deg, #2a4a1e 0%, #3a5a28 60%, #1e3216 100%)',
        overflow: 'hidden',
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
        }}
        loading="lazy"
        onError={e => { e.currentTarget.style.display = 'none'; }}
      />

      {/* Overlay */}
      <div className="gallery-overlay" />

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
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          zIndex: 2,
        }}
        className="gallery-caption"
      >
        <p
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            fontSize: '1rem',
            color: '#faf8f0',
          }}
        >
          {item.caption}
        </p>
      </div>

      {/* Gold border reveal on hover */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: '1px solid rgba(204,158,36,0.5)',
          opacity: 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
          zIndex: 2,
        }}
        className="gallery-border"
      />

      <style>{`
        .gallery-item:hover .gallery-caption { opacity: 1 !important; }
        .gallery-item:hover .gallery-border  { opacity: 1 !important; }
      `}</style>
    </div>
  );
}

export default function GallerySection() {
  const sectionRef    = useRef(null);

  const driveRoot = config.google_drive?.root_folder_id;
  const { images: driveFiles, loading: driveLoading } = useDriveImages(driveRoot, 'memories');

  const imgPos = config.imagePositions || {};

  // Map Drive files to gallery shape; fall back to static config when Drive is not ready
  const gallery = driveFiles.length > 0
    ? driveFiles.map((f, i) => ({
        id: f.id,
        src: driveThumbUrl(f.id, 'w1600'),
        alt: f.name?.replace(/\.[^/.]+$/, '') || `Memory ${i + 1}`,
        caption: (f.name?.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'A beautiful moment'),
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
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
        id="gallery"
        ref={sectionRef}
        style={{
          background: '#1e3518',
          padding: 'clamp(2rem,8vw,9rem) clamp(1rem,4vw,5rem)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div
            className="gallery-header"
            style={{ textAlign: 'center', marginBottom: 'clamp(3rem,8vw,4.5rem)' }}
          >
            <p className="section-tag" style={{ marginBottom: '0.75rem' }}>
              {config.ui.gallery.tag}
            </p>
            <h2
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontWeight: 400,
                fontSize: 'clamp(2.2rem,6vw,4rem)',
                color: '#faf8f0',
              }}
            >
              {config.ui.gallery.title}
            </h2>
            <p
              style={{
                fontFamily: 'Jost, sans-serif',
                fontWeight: 200,
                fontSize: '0.82rem',
                color: 'rgba(250,248,240,0.4)',
                marginTop: '0.75rem',
                letterSpacing: '0.15em',
              }}
            >
              {config.ui.gallery.subtitle}
            </p>
          </div>

          {/* Grid — responsive photo wall driven by config.galleryLayout */}
          <div
            className="gallery-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '0.75rem',
            }}
          >
            {driveLoading && driveFiles.length === 0 ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    gridColumn: 'span 3',
                    aspectRatio: '1/1',
                    background: 'linear-gradient(90deg, rgba(204,158,36,0.04) 25%, rgba(204,158,36,0.08) 50%, rgba(204,158,36,0.04) 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.8s infinite',
                    borderRadius: '2px',
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
