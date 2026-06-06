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

const BackgroundGrid = dynamic(() => import("@/features/home/BackgroundGrid"), {
  ssr: false,
});
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
  const [useNativeParticles, setUseNativeParticles] = useState(true);

  // Mobile gets fewer particles — same look, much cheaper to render.
  const particleCount = useMemo(() => {
    if (typeof window === "undefined") return 250;
    return window.matchMedia("(max-width: 768px)").matches ? 150 : 350;
  }, []);

  useEffect(() => {
    const elements = sectionOrder
      .map((section) => document.getElementById(section))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return;
    }

    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollMuteCounter.current > 0) {
          return;
        }

        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.intersectionRatio);
        });

        let maxRatio = 0;
        let mostVisible = "";

        ratios.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            mostVisible = id;
          }
        });

        if (maxRatio > 0 && mostVisible) {
          setActiveSection(mostVisible as HomeSection);
        }
      },
      {
        rootMargin: "-10% 0px -10% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
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
