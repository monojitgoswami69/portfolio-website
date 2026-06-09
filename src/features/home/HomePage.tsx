"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/features/home/Navbar";
import Contact from "@/features/home/sections/Contact/Contact";
import Hero from "@/features/home/sections/Hero";
import Projects from "@/features/home/sections/Projects/Projects";
import Skills from "@/features/home/sections/Skills";
import { HomeSection } from "@/features/home/types";
import { useDeferredMount } from "@/lib/hooks/useDeferredMount";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { LazyMotion, domMax } from "@/lib/motion";
import type { SiteContact, SiteProject } from "@/lib/content/site-data";
import NativeParticles from "@/features/home/NativeParticles";

const Particles = dynamic(() => import("@/features/home/Particles"), {
  ssr: false,
});
const AIChat = dynamic(() => import("@/features/chat/ui/AIChat"), {
  ssr: false,
});

const PARTICLE_COLORS = ["#88c0d0", "#b48ead", "#a3be8c", "#eceff4"];

const sectionOrder = [
  HomeSection.HERO,
  HomeSection.SKILLS,
  HomeSection.PROJECTS,
  HomeSection.CHAT,
  HomeSection.CONTACT,
];

const NAV_ANCHOR_OFFSET = 90;
const ACTIVE_SECTION_VIEWPORT_OFFSET = 0.38;

interface HomePageProps {
  projects: SiteProject[];
  contact: SiteContact;
}

export default function HomePage({ projects, contact }: HomePageProps) {
  const [activeSection, setActiveSection] = useState<HomeSection>(HomeSection.HERO);
  const reduceMotion = usePrefersReducedMotion();
  const fxReady = useDeferredMount(700);
  const showFx = !reduceMotion && fxReady;
  const scrollMuteCounter = useRef(0);

  // Toggle between native and OGL particles for comparison
  const useNativeParticles = true;

  // Mobile gets fewer particles — same look, much cheaper to render.
  const particleCount = useMemo(() => {
    if (typeof window === "undefined") return 250;
    return window.matchMedia("(max-width: 768px)").matches ? 150 : 350;
  }, []);

  useEffect(() => {
    let frameId = 0;

    const updateActiveSection = () => {
      if (scrollMuteCounter.current > 0) {
        return;
      }

      const sections = sectionOrder
        .map((section) => {
          const element = document.getElementById(section);
          return element
            ? {
                id: section,
                top: element.getBoundingClientRect().top + window.scrollY,
              }
            : null;
        })
        .filter((section): section is { id: HomeSection; top: number } => section !== null);

      if (sections.length === 0) {
        return;
      }

      const scrollPosition =
        window.scrollY +
        Math.max(NAV_ANCHOR_OFFSET, window.innerHeight * ACTIVE_SECTION_VIEWPORT_OFFSET);
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

      if (isAtBottom) {
        setActiveSection(sections[sections.length - 1].id);
        return;
      }

      const current = sections.reduce((active, section) => {
        return section.top <= scrollPosition ? section : active;
      }, sections[0]);

      setActiveSection(current.id);
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateActiveSection);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  const handleSectionChange = (section: HomeSection) => {
    setActiveSection(section);
    scrollMuteCounter.current++;
    setTimeout(() => {
      scrollMuteCounter.current = Math.max(0, scrollMuteCounter.current - 1);
    }, 150);
  };

  return (
    <LazyMotion features={domMax} strict>
      <div className="min-h-screen bg-transparent text-slate-200 selection:bg-[#88c0d0]/30 selection:text-[#88c0d0]">
        {/* Vibrant background grid mesh commented out in favor of solid midnight blue with grain */}
        {/* showFx && <BackgroundGrid /> */}

        {/* Native Canvas Particles - High Performance */}
        {showFx && useNativeParticles && (
          <NativeParticles
            count={window.matchMedia("(max-width: 768px)").matches ? 40 : 60}
            colors={PARTICLE_COLORS}
            size={1.2}
            speed={0.08}
          />
        )}

        {/* Original OGL Particles - Hidden for comparison */}
        {showFx && !useNativeParticles && (
          <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -5 }}>
            <Particles
              particleColors={PARTICLE_COLORS}
              particleCount={particleCount}
              particleSpread={10}
              speed={0.05}
              moveParticlesOnHover={false}
              particleHoverFactor={4.5}
              alphaParticles={true}
              particleOpacity={0.7}
              particleBaseSize={50}
              sizeRandomness={3}
              cameraDistance={30}
              disableRotation={true}
              pixelRatio={1}
            />
          </div>
        )}

        <Navbar activeSection={activeSection} onSectionChange={handleSectionChange} />

        <main id="main-content" className="relative z-10">
          <Hero onScrollToSkills={handleSectionChange} />
          <Skills />
          <Projects projects={projects} />
          <AIChat projects={projects} contact={contact} />
          <Contact contact={contact} />
        </main>

        <div
          className="fixed bottom-0 left-0 right-0 h-5 pointer-events-none z-40"
          style={{
            background:
              "linear-gradient(to top, rgba(6, 8, 20, 0.7) 0%, transparent 100%)",
          }}
        />
      </div>
    </LazyMotion>
  );
}
