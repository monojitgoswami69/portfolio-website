import { useState, useEffect } from 'react';
import Navbar from './layout/Navbar';
import Hero from './sections/Hero';
import Skills from './sections/Skills';
import Projects from './sections/Projects/Projects';
import AIChat from './sections/AIChat/AIChat';
import Contact from './sections/Contact/Contact';
import BackgroundGrid from './components/BackgroundGrid';
import { Section } from './types/global.d';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>(Section.HERO);

  useEffect(() => {
    // Prevent browser from restoring scroll position
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Scroll to top on page load and clear any hash
    window.scrollTo(0, 0);
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Detect zoom level and scale content if below 120%
  useEffect(() => {
    const TARGET_ZOOM = 1.2; // 120%

    const adjustScaling = () => {
      // Estimate zoom level using devicePixelRatio and screen width
      // This is approximate as browsers don't expose exact zoom level
      const baseWidth = 1920; // Reference width at 100% zoom
      const currentWidth = window.innerWidth;
      const dpr = window.devicePixelRatio || 1;

      // Calculate effective zoom (higher viewport width at same resolution = lower zoom)
      // For a 1920px monitor: 100% zoom = 1920px viewport, 120% zoom ≈ 1600px viewport
      const estimatedZoom = baseWidth / (currentWidth * dpr) * dpr;

      // If zoom is below target, scale up to compensate
      if (estimatedZoom < TARGET_ZOOM && currentWidth > 1200) {
        const scaleFactor = TARGET_ZOOM / Math.max(estimatedZoom, 0.8);
        // Clamp scale factor to prevent extreme scaling
        const clampedScale = Math.min(Math.max(scaleFactor, 1), 1.35);
        document.documentElement.style.fontSize = `${clampedScale * 100}%`;
      } else {
        document.documentElement.style.fontSize = '100%';
      }
    };

    adjustScaling();
    window.addEventListener('resize', adjustScaling);

    return () => {
      window.removeEventListener('resize', adjustScaling);
      document.documentElement.style.fontSize = '100%';
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = Object.values(Section);
      let current = Section.HERO;

      // Check if we're near the bottom of the page - if so, we're on Contact
      const isNearBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100;
      if (isNearBottom) {
        setActiveSection(Section.CONTACT);
        return;
      }

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Special handling for contact section which is at bottom
          if (section === Section.CONTACT) {
            if (rect.top <= window.innerHeight / 2) {
              current = section;
            }
          } else if (rect.top <= 200 && rect.bottom >= 200) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200">
      <BackgroundGrid />
      <Navbar activeSection={activeSection} />

      <main className="relative z-10">
        <Hero />
        <Skills />
        <Projects />
        <AIChat />
        <Contact />
      </main>

      {/* Bottom viewport gradient fade for smooth content appearance */}
      <div
        className="fixed bottom-0 left-0 right-0 h-5 pointer-events-none z-40"
        style={{
          background: 'linear-gradient(to top, rgba(2, 6, 23, 0.7) 0%, transparent 100%)'
        }}
      />
    </div>
  );
};

export default App;