import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useConfig } from '../i18n/useConfig';
import { useLang } from '../i18n/LanguageContext';
import cornerRoses from '../assets/flowers/tow_roses_one_sunflower_leaves.png';
import cornerSunflower from '../assets/flowers/sunflower_rose_leaves.png';
import leavesImg from '../assets/flowers/leaves.png';

gsap.registerPlugin(ScrollTrigger);

/* ── Monogram: A & P (clean, no top accents) ── */
function Monogram() {
  return (
    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '0.05em',
        fontFamily: '"Playfair Display", Georgia, serif',
        fontSize: 'clamp(3rem, 10vw, 4.5rem)',
        fontWeight: 400,
        color: '#8B7355',
        lineHeight: 1,
        position: 'relative',
      }}>
        <span>A</span>
        <span style={{
          fontStyle: 'italic',
          color: '#87A96B',
          fontSize: '0.6em',
          margin: '0 0.05em',
          position: 'relative',
          top: '0.05em',
        }}>&amp;</span>
        <span>P</span>
      </div>
    </div>
  );
}

/* ── Background floral decorations — real watercolor images ── */
function FloralBackground() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: 0,
    }}>
      {/* Corner bouquet — top-right */}
      <img
        src={cornerRoses}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '60px',
          right: '-20px',
          width: 'clamp(160px, 28vw, 320px)',
          opacity: 0.18,
          transform: 'scaleX(-1)',
          pointerEvents: 'none',
          objectFit: 'contain',
        }}
      />
      {/* Corner bouquet — bottom-left */}
      <img
        src={cornerSunflower}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-20px',
          left: '-10px',
          width: 'clamp(130px, 22vw, 260px)',
          opacity: 0.16,
          transform: 'scaleY(-1)',
          pointerEvents: 'none',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}


export default function HeroSection() {
  const config = useConfig();
  const { t, isAr } = useLang();
  const sectionRef = useRef(null);
  const imageBlockRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);
  const scrollIndRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Fade-in the image + names overlay */
      gsap.from(imageRef.current, {
        scale: 1.05,
        opacity: 0,
        duration: 1.4,
        ease: 'expo.out',
      });
      gsap.from('.hero-cover-name', {
        y: 30,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'expo.out',
        delay: 0.4,
      });

      if (scrollIndRef.current) {
        gsap.from(scrollIndRef.current, {
          opacity: 0, y: 10, duration: 0.5, ease: 'expo.out', delay: 1.2,
        });
      }

      /* Content block fades in when scrolled into view */
      const items = contentRef.current?.querySelectorAll('.hero-anim') ?? [];
      gsap.from(items, {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'expo.out',
        scrollTrigger: { trigger: contentRef.current, start: 'top 80%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const scrollDown = () => {
    const target = imageBlockRef.current ? imageBlockRef.current.offsetHeight : window.innerHeight;
    if (window.__lenis) window.__lenis.scrollTo(target);
    else window.scrollTo({ top: target, behavior: 'smooth' });
  };

  const heroImage = config.ui.hero.heroImage;

  return (
    <section
      id="hero"
      ref={sectionRef}
      style={{ position: 'relative' }}
    >
      {/* ─── Full-screen couple image — fixed so it slides under the next section ─── */}
      <div
        ref={imageBlockRef}
        style={{
          position: 'relative',
          height: '100svh',
          overflow: 'hidden',
        }}
      >
        {/* Image fills the section container */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}>
          {heroImage ? (
            <div
              ref={imageRef}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${heroImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 30%',
                willChange: 'transform',
              }}
            />
          ) : (
            /* Elegant placeholder when no image is set */
            <div
              ref={imageRef}
              style={{
                position: 'absolute',
                inset: 0,
                background: '#f2f8ec',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem',
              }}
            >
              {/* Decorative border frame */}
              <div style={{
                position: 'absolute',
                inset: 'clamp(16px,4vw,40px)',
                border: '1px solid rgba(135,169,107,0.2)',
                borderRadius: '1rem',
                pointerEvents: 'none',
              }}>
                {/* Corner ornaments */}
                {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => {
                  const isTop = pos.includes('top');
                  const isLeft = pos.includes('left');
                  return (
                    <svg
                      key={pos}
                      width="28" height="28" viewBox="0 0 28 28" fill="none"
                      style={{
                        position: 'absolute',
                        [isTop ? 'top' : 'bottom']: '-1px',
                        [isLeft ? 'left' : 'right']: '-1px',
                        transform: `scaleX(${isLeft ? 1 : -1}) scaleY(${isTop ? 1 : -1})`,
                      }}
                    >
                      <path d="M2,28 L2,6 Q2,2 6,2 L28,2" stroke="rgba(135,169,107,0.35)" strokeWidth="1.5" fill="none" />
                      <circle cx="2" cy="28" r="1.5" fill="rgba(135,169,107,0.3)" />
                    </svg>
                  );
                })}
              </div>
              {/* Watermark monogram */}
              <div style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: 'clamp(4rem, 15vw, 8rem)',
                fontWeight: 400,
                fontStyle: 'italic',
                color: 'rgba(135,169,107,0.12)',
                letterSpacing: '0.15em',
                lineHeight: 1,
              }}>
                {config.couple.groom.firstName.charAt(0)}
                <span style={{ fontSize: '0.6em', margin: '0 0.1em' }}>&amp;</span>
                {config.couple.bride.firstName.charAt(0)}
              </div>
              {/* Sunflower accent */}
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.2 }}>
                <g transform="translate(16,16)">
                  {Array.from({ length: 8 }, (_, i) => (
                    <ellipse key={i} rx="3" ry="8" fill="#87A96B" transform={`rotate(${i * 22.5})`} />
                  ))}
                  <circle r="4" fill="#FFE135" />
                </g>
              </svg>
            </div>
          )}

          {/* Gradient overlay — lighter for placeholder, cinematic for photo */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: heroImage
              ? 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.22) 40%, rgba(0,0,0,0.68) 100%)'
              : 'linear-gradient(to bottom, transparent 0%, transparent 60%, rgba(27,67,50,0.06) 100%)',
            pointerEvents: 'none',
          }} />

          {/* Luxury sun border glow */}
          {heroImage && (
            <>
              {/* Edge light — warm golden sun rays from borders */}
              <div style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 1,
                background: [
                  /* Top edge — warm golden light */
                  'linear-gradient(to bottom, rgba(255,220,150,0.25) 0%, rgba(255,200,100,0.08) 12%, transparent 30%)',
                  /* Bottom edge — softer warm glow */
                  'linear-gradient(to top, rgba(255,200,120,0.18) 0%, rgba(255,190,100,0.05) 10%, transparent 25%)',
                  /* Left edge */
                  'linear-gradient(to right, rgba(255,215,140,0.15) 0%, transparent 18%)',
                  /* Right edge */
                  'linear-gradient(to left, rgba(255,215,140,0.15) 0%, transparent 18%)',
                  /* Top-left corner flare */
                  'radial-gradient(ellipse 50% 40% at 0% 0%, rgba(255,230,160,0.3) 0%, transparent 70%)',
                  /* Top-right corner flare */
                  'radial-gradient(ellipse 50% 40% at 100% 0%, rgba(255,225,150,0.25) 0%, transparent 70%)',
                  /* Bottom-left corner */
                  'radial-gradient(ellipse 40% 35% at 0% 100%, rgba(255,210,130,0.12) 0%, transparent 70%)',
                  /* Bottom-right corner */
                  'radial-gradient(ellipse 40% 35% at 100% 100%, rgba(255,210,130,0.12) 0%, transparent 70%)',
                ].join(', '),
              }} />
              {/* Subtle vignette glow to enhance the sun border feel */}
              <div style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 1,
                boxShadow: 'inset 0 0 100px 30px rgba(255,215,140,0.12), inset 0 0 200px 60px rgba(255,200,100,0.06)',
              }} />
            </>
          )}

          {/* Names on image */}
          <div style={{
            position: 'absolute',
            bottom: 'clamp(5rem,10vw,7rem)',
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 2,
            padding: '0 clamp(1.5rem,5vw,3rem)',
          }}>
            <p className="hero-cover-name" style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 200,
              fontSize: '0.68rem',
              letterSpacing: '0.5em',
              color: heroImage ? 'rgba(255,255,255,0.95)' : 'rgba(135,169,107,0.6)',
              textTransform: 'uppercase',
              marginBottom: '0.6rem',
            }}>
              {config.ui.hero.tag}
            </p>
            <h1 className="hero-cover-name" style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(3rem, 11vw, 5.5rem)',
              color: heroImage ? '#fff' : '#3a2e20',
              lineHeight: 1.15,
              letterSpacing: '0.04em',
              textShadow: heroImage ? '0 2px 8px rgba(0,0,0,0.55), 0 4px 32px rgba(0,0,0,0.35)' : 'none',
            }}>
              {config.couple.groom.firstName}
              <span style={{
                color: heroImage ? '#A8D8A0' : '#87A96B',
                fontSize: '0.7em',
                fontWeight: 300,
                margin: '0 0.06em',
              }}>&amp;</span>
              {config.couple.bride.firstName}
            </h1>
            <p className="hero-cover-name" style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 200,
              fontSize: '0.7rem',
              letterSpacing: '0.4em',
              color: heroImage ? 'rgba(255,255,255,0.92)' : 'rgba(135,169,107,0.7)',
              textTransform: 'uppercase',
              marginTop: '0.75rem',
            }}>
              {config.wedding.dateFormatted}
            </p>
          </div>

          {/* Scroll indicator */}
          <div
            ref={scrollIndRef}
            onClick={scrollDown}
            className="scroll-indicator"
            style={{
              position: 'absolute',
              bottom: 'clamp(1.5rem,3vw,2.5rem)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 3,
              filter: heroImage ? 'brightness(2)' : 'none',
            }}
            role="button"
            aria-label="Scroll down"
            tabIndex={0}
          />
        </div>
      </div>

      {/* ─── Wedding details section (slides over the image) ─── */}
      <div
        style={{
          background: '#f2f8ec',
          padding: 'clamp(2rem,6vw,5rem) clamp(1.5rem,5vw,3rem) clamp(1rem,3vw,2rem)',
          position: 'relative',
          zIndex: 2,
          overflow: 'hidden',
        }}
      >
        {/* Background floral decorations */}
        <FloralBackground />

        {/* Subtle radial warmth */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(168,216,160,0.06) 0%, transparent 70%)',
        }} />

        <div
          ref={contentRef}
          style={{
            position: 'relative',
            textAlign: 'center',
            maxWidth: '600px',
            width: '100%',
            margin: '0 auto',
            zIndex: 1,
          }}
        >
          {/* Monogram */}
          <div className="hero-anim">
            <Monogram />
          </div>

          {/* Cross + Bible verse */}
          <div className="hero-anim" style={{ marginBottom: '2rem' }}>
            <div style={{
              fontSize: '1.5rem', color: '#87A96B', marginBottom: '1rem', opacity: 0.7,
            }}>✝</div>
            <p style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(1.15rem, 3vw, 1.4rem)',
              color: '#5a4a3a',
              lineHeight: 1.8,
              maxWidth: '520px',
              margin: '0 auto',
              letterSpacing: '0.02em',
            }}>
              &ldquo;{config.wedding.bibleVerse}&rdquo;
            </p>
            <p style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 300,
              fontSize: '0.85rem',
              letterSpacing: '0.15em',
              color: '#87A96B',
              marginTop: '0.6rem',
            }}>
              — {config.wedding.bibleReference}
            </p>
          </div>

          {/* Floral divider */}
          <div className="hero-anim" style={{ margin: '0 auto 1.5rem', textAlign: 'center' }}>
            <img
              src={leavesImg}
              alt=""
              aria-hidden="true"
              style={{ width: 'clamp(180px, 40vw, 280px)', opacity: 0.75, display: 'inline-block' }}
            />
          </div>

          {/* Parents' names */}
          <div className="hero-anim" style={{ marginBottom: '1.5rem' }}>
            <p style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 400,
              fontSize: 'clamp(2rem, 3vw, 2.5rem)',
              color: '#5a4a3a',
              lineHeight: 1.8,
            }}>
              {config.couple.groom.parentsDisplay}
            </p>
            <p style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 200,
              fontSize: '0.78rem',
              letterSpacing: '0.4em',
              color: '#87A96B',
              textTransform: 'uppercase',
              margin: '0.3rem 0',
            }}>
              &amp;
            </p>
            <p style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 400,
              fontSize: 'clamp(2rem, 3vw, 2.5rem)',
              color: '#5a4a3a',
              lineHeight: 1.8,
            }}>
              {config.couple.bride.parentsDisplay}
            </p>
          </div>

          {/* "Invite you to the wedding of" */}
          <p className="hero-anim" style={{
            fontFamily: isAr ? '"Tajawal", sans-serif' : 'Jost, sans-serif',
            fontWeight: 300,
            fontSize: '0.88rem',
            letterSpacing: isAr ? '0' : '0.4em',
            color: '#87A96B',
            textTransform: isAr ? 'none' : 'uppercase',
            marginBottom: '0.6rem',
            direction: isAr ? 'rtl' : 'ltr',
          }}>
            {t('hero.inviteLine')}
          </p>

          {/* Couple names — large flowing script */}
          <h2 className="hero-anim" style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: 'clamp(3.5rem, 13vw, 6rem)',
            color: '#3a2e22',
            lineHeight: 1.15,
            letterSpacing: '0.04em',
            marginBottom: '0.6rem',
          }}>
            {config.couple.groom.firstName}
            <span style={{ color: '#87A96B', fontSize: '0.7em', fontWeight: 300, margin: '0 0.06em' }}>&amp;</span>
            {config.couple.bride.firstName}
          </h2>

          {/* Date */}
          <div className="hero-anim" style={{ marginTop: '1.25rem' }}>
            <p style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 400,
              fontSize: 'clamp(1.3rem, 3.5vw, 1.75rem)',
              color: '#87A96B',
              letterSpacing: '0.15em',
            }}>
              {config.wedding.dateFormatted}
            </p>
          </div>

          {/* Location */}
          <p className="hero-anim" style={{
            fontFamily: 'Jost, sans-serif',
            fontWeight: 200,
            fontSize: '0.88rem',
            letterSpacing: '0.3em',
            color: '#87A96B',
            textTransform: 'uppercase',
            marginTop: '0.6rem',
          }}>
            {config.wedding.locationFull}
          </p>
        </div>
      </div>

      {/* ─── Curved bottom edge ─── */}
      <div style={{
        position: 'relative',
        marginTop: '-1px',
        marginBottom: 'clamp(-30px, -4vw, -60px)',
        lineHeight: 0,
        zIndex: 3,
      }}>
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: 'clamp(30px, 4vw, 60px)' }}
        >
          <path
            d="M0,0 L0,0 Q360,60 720,60 Q1080,60 1440,0 L1440,0 Z"
            fill="#f2f8ec"
          />
        </svg>
      </div>
    </section>
  );
}
