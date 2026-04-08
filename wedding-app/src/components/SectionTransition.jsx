import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/*
  Section Transitions — desktop gets advanced 3D clip-path reveals,
  mobile gets clean, simple fade-up animations for reliability.
*/

/* ── Desktop clip-path helpers ── */
const CLIP_FULL     = 'inset(0% 0% 0% 0%)';
const CLIP_BOTTOM   = 'inset(100% 0% 0% 0%)';
const CLIP_CENTER_H = 'inset(0% 50% 0% 50%)';
const CIRCLE_ZERO   = 'circle(0% at 50% 50%)';
const CIRCLE_FULL   = 'circle(75% at 50% 50%)';

const VARIANTS = {
  rise: {
    from: { y: 120, rotateX: 8, scale: 0.92, z: -120, clipPath: CLIP_BOTTOM },
    to:   { y: 0,   rotateX: 0, scale: 1,    z: 0,    clipPath: CLIP_FULL },
    origin: '50% 100%',
  },
  tiltLeft: {
    from: { x: -120, rotateY: 12, scale: 0.93, z: -100, clipPath: 'inset(0% 0% 0% 100%)' },
    to:   { x: 0,    rotateY: 0,  scale: 1,    z: 0,    clipPath: CLIP_FULL },
    origin: '0% 50%',
  },
  tiltRight: {
    from: { x: 120, rotateY: -12, scale: 0.93, z: -100, clipPath: 'inset(0% 100% 0% 0%)' },
    to:   { x: 0,   rotateY: 0,   scale: 1,    z: 0,    clipPath: CLIP_FULL },
    origin: '100% 50%',
  },
  scale: {
    from: { scale: 0.80, rotateX: 6, rotateY: -3, z: -200, clipPath: CLIP_BOTTOM },
    to:   { scale: 1,    rotateX: 0, rotateY: 0,  z: 0,    clipPath: CLIP_FULL },
    origin: '50% 50%',
  },
  flip: {
    from: { rotateX: -25, y: 60, scale: 0.88, z: -150, clipPath: CLIP_BOTTOM },
    to:   { rotateX: 0,   y: 0,  scale: 1,    z: 0,    clipPath: CLIP_FULL },
    origin: '50% 0%',
  },
  curtain: {
    from: { scale: 0.96, z: -80, clipPath: CLIP_CENTER_H },
    to:   { scale: 1,    z: 0,   clipPath: CLIP_FULL },
    origin: '50% 50%',
  },
  portal: {
    from: { scale: 0.90, z: -140, rotateX: 4, clipPath: CIRCLE_ZERO },
    to:   { scale: 1,    z: 0,    rotateX: 0, clipPath: CIRCLE_FULL },
    origin: '50% 50%',
  },
};

const OVERLAP = 40; // px

export default function SectionTransition({ children, variant = 'rise' }) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const mobile = window.innerWidth < 768;

    if (mobile) {
      /* ── Mobile: simple fade-up, no clip-path, no 3D ── */
      gsap.set(el, { y: 40, opacity: 0 });

      const tween = gsap.to(el, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    }

    /* ── Desktop: full 3D clip-path transitions ── */
    const v = VARIANTS[variant] || VARIANTS.rise;

    gsap.set(el, {
      ...v.from,
      opacity: 1,
      transformPerspective: 1400,
      transformOrigin: v.origin,
    });

    const enterTween = gsap.to(el, {
      ...v.to,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 92%',
        end: 'top 15%',
        scrub: 0.6,
      },
    });

    const driftTween = gsap.fromTo(el,
      { yPercent: 1.5 },
      {
        yPercent: -1.5,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      },
    );

    return () => {
      enterTween.scrollTrigger?.kill();
      enterTween.kill();
      driftTween.scrollTrigger?.kill();
      driftTween.kill();
    };
  }, [variant]);

  return (
    <div
      ref={wrapperRef}
      style={{
        willChange: 'transform',
        position: 'relative',
        zIndex: 1,
        marginTop: -OVERLAP,
        paddingTop: OVERLAP,
      }}
    >
      {children}
    </div>
  );
}
