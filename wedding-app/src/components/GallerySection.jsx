import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';
import config from '@config';
import { useDriveImages, driveThumbUrl } from '../hooks/useDriveImages';

gsap.registerPlugin(ScrollTrigger);

function Lightbox({ item, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 5000,
          background: 'rgba(5,10,8,0.96)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'zoom-out',
          padding: '1.5rem',
        }}
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1,    opacity: 1 }}
          exit={{    scale: 0.88, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25,0.46,0.45,0.94] }}
          style={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '85vh',
          }}
          onClick={e => e.stopPropagation()}
        >
          <img
            src={item.src}
            alt={item.alt}
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
              display: 'block',
              border: '1px solid rgba(201,168,76,0.25)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-2.5rem',
              left: 0,
              right: 0,
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontStyle: 'italic',
                fontSize: '1rem',
                color: 'rgba(250,248,240,0.55)',
              }}
            >
              {item.caption}
            </p>
          </div>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '-3rem',
              right: 0,
              background: 'none',
              border: '1px solid rgba(201,168,76,0.4)',
              color: '#c9a84c',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              transition: 'all 0.3s',
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function GalleryItem({ item, index, onOpen }) {
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

  const isLarge = index === 0 || index === 4;

  return (
    <div
      ref={itemRef}
      className="gallery-item"
      onClick={() => onOpen(item)}
      style={{
        gridColumn: isLarge ? 'span 2' : 'span 1',
        aspectRatio: isLarge ? '16/9' : '1/1',
        position: 'relative',
        cursor: 'zoom-in',
        background: 'linear-gradient(135deg, #144030 0%, #1e5c3a 60%, #112b1e 100%)',
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
        <p
          style={{
            fontFamily: 'Jost, sans-serif',
            fontWeight: 200,
            fontSize: '0.62rem',
            letterSpacing: '0.35em',
            color: 'rgba(201,168,76,0.8)',
            textTransform: 'uppercase',
          }}
        >
          View Photo
        </p>
      </div>

      {/* Gold border reveal on hover */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: '1px solid rgba(201,168,76,0.5)',
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
  const [selected, setSelected] = useState(null);

  const driveRoot = config.google_drive?.root_folder_id;
  const { images: driveFiles, loading: driveLoading } = useDriveImages(driveRoot, 'memories');

  // Map Drive files to gallery shape; fall back to static config when Drive is not ready
  const gallery = driveFiles.length > 0
    ? driveFiles.map((f, i) => ({
        id: f.id,
        src: driveThumbUrl(f.id, 'w1600'),
        alt: f.name?.replace(/\.[^/.]+$/, '') || `Memory ${i + 1}`,
        caption: (f.name?.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'A beautiful moment'),
      }))
    : (config.events.gallery || []);

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

  // Lock scroll when lightbox open
  useEffect(() => {
    if (selected) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }
    return () => { document.documentElement.style.overflow = ''; };
  }, [selected]);

  return (
    <>
      <section
        id="gallery"
        ref={sectionRef}
        style={{
          background: '#112b1e',
          padding: 'clamp(5rem,12vw,9rem) clamp(1.5rem,5vw,5rem)',
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
              Memories
            </p>
            <h2
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontWeight: 400,
                fontSize: 'clamp(2.2rem,6vw,4rem)',
                color: '#faf8f0',
              }}
            >
              Our Story in Frames
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
              Click any photo to view full size
            </p>
          </div>

          {/* Grid — 2-column baseline for predictable span behaviour */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
            }}
          >
            {driveLoading && driveFiles.length === 0 ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    gridColumn: i === 0 || i === 4 ? 'span 2' : 'span 1',
                    aspectRatio: i === 0 || i === 4 ? '16/9' : '1/1',
                    background: 'linear-gradient(90deg, rgba(201,168,76,0.04) 25%, rgba(201,168,76,0.08) 50%, rgba(201,168,76,0.04) 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.8s infinite',
                    borderRadius: '2px',
                  }}
                />
              ))
            ) : (
              gallery.map((item, i) => (
                <GalleryItem
                  key={item.id}
                  item={item}
                  index={i}
                  onOpen={setSelected}
                />
              ))
            )}
          </div>
          <style>{`
            @keyframes shimmer {
              0%   { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
        </div>
      </section>

      {/* Lightbox (portal-like — rendered outside section) */}
      {selected && (
        <Lightbox item={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
