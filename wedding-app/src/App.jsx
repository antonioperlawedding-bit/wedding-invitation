import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

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
import SectionTransition from './components/SectionTransition';

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

    const ticker = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(ticker);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  /* ── Animate the HTML preloader out, then mark loaded ── */
  useEffect(() => {
    const preloader = document.getElementById('preloader');
    if (!preloader) { setIsLoaded(true); return; }

    document.documentElement.style.overflow = 'hidden';

    // Wait for the progress bar animation (2.5s) + small buffer
    const MIN_DISPLAY_MS = 2800;
    const pageStart = window.__loadStart || Date.now();
    const elapsed = Date.now() - pageStart;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

    const tl = gsap.timeline({
      delay: remaining / 1000,
      onComplete: () => {
        preloader.remove();
        document.documentElement.style.overflow = '';
        setIsLoaded(true);
      },
    });

    tl.to(preloader, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut',
    });

    return () => {
      tl.kill();
      document.documentElement.style.overflow = '';
    };
  }, []);

  /* ── After load completes: refresh ScrollTrigger ── */
  useEffect(() => {
    if (isLoaded) {
      const id = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
      return () => clearTimeout(id);
    }
  }, [isLoaded]);

  return (
    <div
      style={{
        pointerEvents: isLoaded ? 'auto' : 'none',
      }}
    >
      <Navigation />

      <main style={{ perspective: '1400px', perspectiveOrigin: '50% 50%' }}>
        <HeroSection />
        <SectionTransition variant="rise">
          <CountdownSection />
        </SectionTransition>
        <SectionTransition variant="tiltLeft">
          <CoupleSection />
        </SectionTransition>
        <SectionTransition variant="curtain">
          <EventsSection />
        </SectionTransition>
        <SectionTransition variant="portal">
          <TimelineSection />
        </SectionTransition>
        <SectionTransition variant="flip">
          <GallerySection />
        </SectionTransition>
        <SectionTransition variant="tiltRight">
          <ListeDeMariageSection />
        </SectionTransition>
        <SectionTransition variant="scale">
          <RSVPSection />
        </SectionTransition>
        <SectionTransition variant="rise">
          <FooterSection />
        </SectionTransition>
      </main>

      <ChatbotWidget />
    </div>
  );
}
