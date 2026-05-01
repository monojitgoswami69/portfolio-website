"use client";

import { useEffect, useState } from "react";
import BackgroundGrid from "@/features/home/BackgroundGrid";
import Navbar from "@/features/home/Navbar";
import AIChat from "@/features/chat/ui/AIChat";
import Contact from "@/features/home/sections/Contact/Contact";
import Hero from "@/features/home/sections/Hero";
import Projects from "@/features/home/sections/Projects/Projects";
import Skills from "@/features/home/sections/Skills";
import { HomeSection } from "@/features/home/types";
import type { SiteContact, SiteProject } from "@/lib/content/site-data";

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
        threshold: Array.from({ length: 20 }, (_, i) => i * 0.05),
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200">
      <BackgroundGrid />
      <Navbar activeSection={activeSection} />

      <main className="relative z-10">
        <Hero />
        <Skills />
        <Projects projects={projects} />
        <AIChat projects={projects} contact={contact} />
        <Contact contact={contact} />
      </main>

      <div
        className="fixed bottom-0 left-0 right-0 h-5 pointer-events-none z-40"
        style={{
          background:
            "linear-gradient(to top, rgba(2, 6, 23, 0.7) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
