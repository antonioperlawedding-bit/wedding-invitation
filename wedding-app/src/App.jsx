import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import Navigation       from './components/Navigation';
import HeroSection      from './components/HeroSection';
import CountdownSection from './components/CountdownSection';
import GatheringSection from './components/GatheringSection';
import EventsSection    from './components/EventsSection';
import InterludeSection from './components/InterludeSection';
import TimelineSection  from './components/TimelineSection';
import GallerySection   from './components/GallerySection';
import RSVPSection      from './components/RSVPSection';
import ListeDeMariageSection from './components/ListeDeMariageSection';
import FooterSection    from './components/FooterSection';
import ChatbotWidget    from './components/ChatbotWidget';
import MusicPlayer, { triggerPlay } from './components/MusicPlayer';
import LoadingScreen    from './components/LoadingScreen';

gsap.registerPlugin(ScrollTrigger);

/* Simple fade-up reveal for each section */
function FadeInSection({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.set(el, { y: 40, opacity: 0 });
    const tween = gsap.to(el, {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 100%',
        toggleActions: 'play none none none',
      },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, []);

  return <div ref={ref} style={{ willChange: 'transform' }}>{children}</div>;
}

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const lenisRef = useRef(null);

  /* ── Lenis smooth scroll ── */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current  = lenis;
    window.__lenis    = lenis;

    const ticker = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    // Required for Lenis v1 + GSAP ScrollTrigger: keeps ScrollTrigger in sync
    // with Lenis's scroll position synchronously (not waiting for native scroll events).
    // Without this, ScrollTrigger is one frame behind on fast scroll, causing
    // triggers to miss or fire late — making sections appear frozen/blank.
    lenis.on('scroll', ScrollTrigger.update);

    return () => {
      gsap.ticker.remove(ticker);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  /* ── Handle bfcache restore: re-show loading screen so music triggers ── */
  useEffect(() => {
    const onPageShow = (e) => {
      if (e.persisted) {
        // Reset timestamp so LoadingScreen shows for its full duration
        window.__loadStart = Date.now();
        setIsLoaded(false);
      }
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  const handleLoadComplete = () => {
    setIsLoaded(true);
    triggerPlay();
  };

  /* ── After load: refresh ScrollTrigger ── */
  useEffect(() => {
    if (isLoaded) {
      const id = setTimeout(() => ScrollTrigger.refresh(), 100);
      return () => clearTimeout(id);
    }
  }, [isLoaded]);

  return (
    <>
    {!isLoaded && <LoadingScreen onComplete={handleLoadComplete} />}
    <div style={{ pointerEvents: isLoaded ? 'auto' : 'none' }}>
      <Navigation />

      <main style={{ position: 'relative', zIndex: 1 }}>
        <HeroSection />
        <FadeInSection><CountdownSection /></FadeInSection>
        <FadeInSection><GatheringSection /></FadeInSection>
        <FadeInSection><EventsSection /></FadeInSection>
        <InterludeSection />
        <FadeInSection><TimelineSection /></FadeInSection>
        <FadeInSection><GallerySection /></FadeInSection>
        <FadeInSection><ListeDeMariageSection /></FadeInSection>
        <FadeInSection><RSVPSection /></FadeInSection>
        <FadeInSection><FooterSection /></FadeInSection>
      </main>

      <ChatbotWidget />
      <MusicPlayer />
    </div>
    </>
  );
}
