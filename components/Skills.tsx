import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Section } from '../types';
import { Scan, Activity } from 'lucide-react';
import {
  SiPython, SiC, SiCplusplus, SiJavascript, SiTypescript, SiPostgresql
} from 'react-icons/si';

// Skill icons data with real brand icons
const skillsData = [
  { icon: SiPython, name: 'Python', color: '#3776AB', url: 'https://www.python.org/' },
  { icon: SiC, name: 'C', color: '#A8B9CC', url: 'https://en.wikipedia.org/wiki/C_(programming_language)' },
  { icon: SiCplusplus, name: 'C++', color: '#00599C', url: 'https://isocpp.org/' },
  { icon: SiPostgresql, name: 'SQL', color: '#336791', url: 'https://www.postgresql.org/' },
  { icon: SiJavascript, name: 'JavaScript', color: '#F7DF1E', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
  { icon: SiTypescript, name: 'TypeScript', color: '#3178C6', url: 'https://www.typescriptlang.org/' },

];

const toolsData = [
  'Firebase', 'MongoDB', 'GCP', 'Pinecone', 'ChromaDB',
  'Langchain', 'HuggingFace', 'Transformers'
  , 'Git', 'Linux'
];

// Icon size and layout constants
const ICON_SIZE = 48;
const ICONS_PER_ROW = 4;
const ICON_GAP = 16;

const Skills: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const middleColumnRef = useRef<HTMLDivElement>(null);
  const textColumnRef = useRef<HTMLDivElement>(null);
  const [middleColumnHeight, setMiddleColumnHeight] = useState<number | null>(null);
  const [textFontSize, setTextFontSize] = useState(1.2); // Main text font size in rem
  const [quoteFontSize, setQuoteFontSize] = useState(2.5); // Quote font size in rem


  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const yText = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const yVisual = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const yTech = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const rotateBg = useTransform(scrollYProgress, [0, 1], [0, 45]);

  // Calculate middle column width based on 4 icons per row
  const middleColumnWidth = (ICON_SIZE * ICONS_PER_ROW) + (ICON_GAP * (ICONS_PER_ROW - 1)) + 48; // 48 for padding

  // Detect middle column height and adjust text sizes to fit
  const adjustLayout = useCallback(() => {
    if (middleColumnRef.current && textColumnRef.current) {
      const middleHeight = middleColumnRef.current.offsetHeight;
      setMiddleColumnHeight(middleHeight);

      // Check if text content overflows the available height
      const textScrollHeight = textColumnRef.current.scrollHeight;
      const tolerance = 5;

      if (textScrollHeight > middleHeight + tolerance) {
        // Content overflows, reduce font sizes proportionally
        if (textFontSize > 0.75 || quoteFontSize > 1.25) {
          setTextFontSize(prev => Math.max(0.75, prev - 0.03125));
          setQuoteFontSize(prev => Math.max(1.25, prev - 0.0625));
        }
      }
    }
  }, [textFontSize, quoteFontSize]);

  useEffect(() => {
    adjustLayout();
    window.addEventListener('resize', adjustLayout);
    return () => window.removeEventListener('resize', adjustLayout);
  }, [adjustLayout]);

  // Re-run adjustment when font sizes change
  useEffect(() => {
    const timer = setTimeout(adjustLayout, 50);
    return () => clearTimeout(timer);
  }, [textFontSize, quoteFontSize, adjustLayout]);

  // Changed from import to static string path to compatible with browser ESM
  const PROFILE_IMG = "/assets/profile.jpeg";

  return (
    <section ref={ref} className="pt-24 pb-4 relative z-10 overflow-hidden">
      {/* Parallax Background Element */}
      <motion.div
        style={{ rotate: rotateBg, opacity: 0.05 }}
        className="absolute -right-64 top-0 w-[800px] h-[800px] border-[40px] border-slate-700 rounded-full pointer-events-none"
      />

      <div id="skills" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-[136px]">
        {/* Section Title */}
        <motion.h2
          style={{ opacity }}
          className="text-4xl font-bold mb-2 font-averia text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400"
        >
          2.0 // SYSTEM SPECS
        </motion.h2>

        <motion.p
          style={{ opacity }}
          className="text-slate-400 text-sm md:text-base mb-6 font-mono uppercase tracking-widest"
        >
          Technical Capabilities & Core Architecture
        </motion.p>

        <motion.div
          style={{ opacity }}
          className="flex flex-col lg:flex-row gap-8 items-start justify-center"
        >

          {/* Left Column - Text Content (flexible width) */}
          <motion.div
            ref={textColumnRef}
            style={{
              fontSize: `${textFontSize}rem`,
              height: middleColumnHeight ? `${middleColumnHeight}px` : 'auto',
            }}
            className="flex-1 max-w-2xl space-y-6 text-slate-300 leading-relaxed overflow-hidden pt-[20px]"
          >
            <p>
              I am <span className="text-cyan-400 font-bold">Monojit Goswami</span>, a backend engineer driven by the potential of autonomous systems. My architecture philosophy focuses on <span className="text-white font-bold">efficiency</span>, <span className="text-white font-bold">modularity</span>, <span className="text-white font-bold">security</span>, and <span className="text-white font-bold">scalability</span>, building high-performance engines that bridge the gap between architectural stability and artificial intelligence.
            </p>
            <p>
              I specialize in developing general-purpose, high-fidelity backend solutions and RAG-based agentic systems. By leveraging Vector databases and embedding models, I build context-aware applications that transform static data into actionable intelligence.
            </p>
            <p
              className="text-white-400 font-quantico pt-5 block font-bold text-center"
              style={{ fontSize: `${quoteFontSize}rem` }}
            >
              "I use Arch btw"
            </p>
          </motion.div>

          {/* Middle Column - Tech Stack (Fixed width based on icons) */}
          <motion.div
            ref={middleColumnRef}
            style={{ width: `${middleColumnWidth}px` }}
            className="flex-shrink-0"
          >
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col">
              {/* Skills Section */}
              <div>
                <div className="text-cyan-400 font-mono text-sm tracking-wider mb-5">
                  SKILLS // 2.1
                </div>
                <div
                  className="grid justify-center"
                  style={{
                    gridTemplateColumns: `repeat(${ICONS_PER_ROW}, ${ICON_SIZE}px)`,
                    gap: `${ICON_GAP}px`
                  }}
                >
                  {skillsData.map((skill, index) => (
                    <motion.a
                      key={skill.name}
                      href={skill.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="cursor-pointer flex items-center justify-center"
                      title={skill.name}
                    >
                      <skill.icon
                        size={ICON_SIZE}
                        style={{ color: skill.color }}
                      />
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Divider Line */}
              <div className="w-full h-px bg-slate-700/30 my-5"></div>

              {/* Tools Section */}
              <div>
                <div className="text-purple-400 font-mono text-sm tracking-wider mb-5">
                  TOOLS // 2.2
                </div>
                <div className="flex flex-wrap gap-2">
                  {toolsData.map((tool, index) => (
                    <motion.span
                      key={tool}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.02 }}
                      className="px-3 py-1.5 text-[11px] font-mono tracking-wide bg-gradient-to-r from-slate-800/90 to-slate-800/60 text-slate-400 rounded border border-slate-700/40 hover:border-purple-500/30 hover:text-purple-300 transition-colors"
                    >
                      {tool}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Holographic Image Card */}
          <motion.div
            style={{ height: middleColumnHeight ? `${middleColumnHeight}px` : 'auto' }}
            className="relative flex items-center justify-center flex-shrink-0"
          >
            <div className="relative group w-full h-full bg-[#0c0c0c] rounded-2xl border border-slate-800 p-2 overflow-hidden shadow-2xl transition-all duration-300 hover:border-cyan-500/40">

              {/* Image Section - Full height */}
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-900">
                <img
                  src={PROFILE_IMG}
                  alt="Monojit Goswami"
                  className="w-full h-full object-cover object-[center_30%] transition-all duration-700
                                   filter grayscale sepia hue-rotate-[170deg] contrast-[1.2] brightness-75
                                   group-hover:filter-none group-hover:scale-105"
                />

                {/* Hologram Overlay (Fades on Hover) */}
                <div className="absolute inset-0 pointer-events-none z-10 bg-[length:100%_4px,6px_100%] opacity-40 group-hover:opacity-10 transition-opacity duration-500 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent z-20 translate-y-[-100%] animate-[scan_4s_linear_infinite] pointer-events-none group-hover:animate-none group-hover:opacity-0" />

                {/* HUD Elements */}
                <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
                    <Activity size={14} className="animate-pulse" />
                    <span>LIVE_FEED</span>
                  </div>
                  <div className="text-[10px] text-cyan-500/70 font-mono">
                    1080p // 60FPS
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 z-30">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs bg-black/60 px-2 py-1 rounded border border-emerald-500/30 backdrop-blur-md">
                    <Scan size={14} />
                    <span className="group-hover:hidden">SCANNING...</span>
                    <span className="hidden group-hover:inline">IDENTITY CONFIRMED</span>
                  </div>
                </div>

                {/* Corner Brackets */}
                <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-lg z-30" />
                <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-lg z-30" />
                <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-lg z-30" />
                <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50 rounded-br-lg z-30" />
              </div>
            </div>

            {/* Background Glow */}
            <div className="absolute inset-0 bg-cyan-500 rounded-full blur-[120px] opacity-10 -z-10 group-hover:opacity-20 transition-opacity duration-500" />
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default Skills;