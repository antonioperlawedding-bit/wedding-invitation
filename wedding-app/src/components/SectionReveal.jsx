import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Wraps a section with a 3D perspective reveal on scroll.
 * Sections tilt in from below with a subtle parallax depth effect.
 */
export default function SectionReveal({ children, id, style = {} }) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        {
          rotateX: 3,
          y: 60,
          opacity: 0.3,
          scale: 0.97,
        },
        {
          rotateX: 0,
          y: 0,
          opacity: 1,
          scale: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            end: 'top 50%',
            scrub: 0.8,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={wrapperRef}
      id={id}
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d',
        willChange: 'transform, opacity',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
