import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import LoadingScreen    from './components/LoadingScreen';
import Navigation       from './components/Navigation';
import HeroSection      from './components/HeroSection';
import CountdownSection from './components/CountdownSection';
import CoupleSection    from './components/CoupleSection';
import EventsSection    from './components/EventsSection';
import TimelineSection  from './components/TimelineSection';
import GallerySection   from './components/GallerySection';
import RSVPSection      from './components/RSVPSection';
import ListeDeMariageSection from './components/ListeDeMariageSection';
import FooterSection    from './components/FooterSection';
import ChatbotWidget    from './components/ChatbotWidget';
import SectionReveal    from './components/SectionReveal';

gsap.registerPlugin(ScrollTrigger);

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

    // Drive Lenis via GSAP ticker for perfect sync with ScrollTrigger
    const ticker = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(ticker);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  /* ── After load completes: refresh ScrollTrigger ── */
  useEffect(() => {
    if (isLoaded) {
      // Small delay to let DOM paint
      const id = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
      return () => clearTimeout(id);
    }
  }, [isLoaded]);

  return (
    <>
      {/* Loading screen always mounts first, is removed after animation */}
      {!isLoaded && (
        <LoadingScreen onComplete={() => setIsLoaded(true)} />
      )}

      {/* Main site — fades in after load */}
      <div
        style={{
          opacity:    isLoaded ? 1 : 0,
          transition: 'opacity 0.6s ease',
          // Prevent interaction before load is done
          pointerEvents: isLoaded ? 'auto' : 'none',
        }}
      >
        <Navigation />

        <main>
          <HeroSection />
          <SectionReveal><CountdownSection /></SectionReveal>
          <SectionReveal><CoupleSection /></SectionReveal>
          <SectionReveal><EventsSection /></SectionReveal>
          <SectionReveal><TimelineSection /></SectionReveal>
          <SectionReveal><GallerySection /></SectionReveal>
          <SectionReveal><ListeDeMariageSection /></SectionReveal>
          <SectionReveal><RSVPSection /></SectionReveal>
          <FooterSection />
        </main>

        <ChatbotWidget />
      </div>
    </>
  );
}
