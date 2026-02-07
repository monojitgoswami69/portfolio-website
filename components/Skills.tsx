import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Scan, Activity, Monitor, Code, Terminal } from 'lucide-react';

// Skill icons data using static assets
const skillsData = [
  { image: '/assets/python.webp', name: 'Python' },
  { image: '/assets/c.webp', name: 'C' },
  { image: '/assets/cpp.webp', name: 'C++' },
  { image: '/assets/js.webp', name: 'JavaScript' },
  { image: '/assets/ts.webp', name: 'TypeScript' },
  { image: '/assets/mysql.webp', name: 'SQL' },
  { image: '/assets/mongodb.webp', name: 'MongoDB' },
];

const toolsData = [
  'Firebase',"GCP", 'Pinecone', 'ChromaDB',
  'Langchain', 'Transformers'
  , 'Git', 'Linux'
];

// System metrics data
interface Metric {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
}

const metrics: Metric[] = [
  {
    label: 'OS',
    value: 'Arch Linux',
    icon: Monitor,
    color: '#00FFFF',
    glowColor: 'rgba(0, 255, 255, 0.5)'
  },
  {
    label: 'Kernel',
    value: 'linux stable',
    icon: Monitor,
    color: '#00FFFF',
    glowColor: 'rgba(0, 255, 255, 0.5)'
  },
  {
    label: 'DE',
    value: 'hyprland',
    icon: Monitor,
    color: '#00FFFF',
    glowColor: 'rgba(0, 255, 255, 0.5)'
  },
  {
    label: 'IDE',
    value: 'VS Code',
    icon: Code,
    color: '#00FFFF',
    glowColor: 'rgba(0, 255, 255, 0.5)'
  },
  {
    label: 'Editor',
    value: 'Vim',
    icon: Code,
    color: '#00FFFF',
    glowColor: 'rgba(0, 255, 255, 0.5)'
  },
  {
    label: 'Terminal',
    value: 'kitty',
    icon: Terminal,
    color: '#00FFFF',
    glowColor: 'rgba(0, 255, 255, 0.5)'
  },
  {
    label: 'Shell',
    value: 'fish',
    icon: Terminal,
    color: '#00FFFF',
    glowColor: 'rgba(0, 255, 255, 0.5)'
  }
];

// Icon size and layout constants
const ICON_SIZE = 48;
const ICONS_PER_ROW = 4;
const ICON_GAP = 16;

const Skills: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const middleColumnRef = useRef<HTMLDivElement>(null);
  const textColumnRef = useRef<HTMLDivElement>(null);
  const [middleColumnHeight, setMiddleColumnHeight] = useState<number | null>(null);
  const [textFontSize, setTextFontSize] = useState(1.2); // Main text font size in rem
  const [quoteFontSize, setQuoteFontSize] = useState(2.5); // Quote font size in rem
  const [responsiveIconSize, setResponsiveIconSize] = useState(64); // Mobile icon size
  const isMetricsInView = useInView(metricsRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const updateIconSize = () => {
      // Mobile: 64px (w-16), Desktop: 48px (lg:w-12)
      setResponsiveIconSize(window.innerWidth >= 1024 ? ICON_SIZE : 64);
    };
    
    updateIconSize();
    window.addEventListener('resize', updateIconSize);
    return () => window.removeEventListener('resize', updateIconSize);
  }, []);


  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

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
  const PROFILE_IMG = "/assets/profile.webp";

  return (
    <section ref={ref} className="pt-24 pb-10 lg:pb-20 relative z-10 overflow-hidden" style={{ position: 'relative' }}>
      {/* Parallax Background Element */}
      <motion.div
        style={{ rotate: rotateBg, opacity: 0.05 }}
        className="absolute -right-64 top-0 w-[800px] h-[800px] border-[40px] border-slate-700 rounded-full pointer-events-none"
      />

      <div id="skills" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-[85px]">
        {/* Section Title */}
        <motion.h2
          style={{ opacity }}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 font-averia text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400"
        >
          2.0 // SYSTEM SPECS
        </motion.h2>

        <motion.p
          style={{ opacity }}
          className="text-slate-400 text-xs sm:text-sm md:text-base mb-6 font-mono uppercase tracking-widest"
        >
          Technical Capabilities & Core Architecture
        </motion.p>

        <motion.div
          style={{ opacity }}
          className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-center lg:items-start justify-center"
        >

          {/* Left Column - Text Content (flexible width) */}
          <motion.div
            ref={textColumnRef}
            style={{
              fontSize: `${textFontSize}rem`,
              height: middleColumnHeight ? `${middleColumnHeight}px` : 'auto',
            }}
            className="flex-1 max-w-2xl space-y-6 text-slate-300 leading-relaxed overflow-hidden pt-[20px] text-center lg:text-left order-2 lg:order-1"
          >
            <p>
              I am <span className="text-cyan-400 font-bold">Monojit Goswami</span>, a backend engineer driven by the potential of autonomous systems. My architecture philosophy focuses on <span className="text-white font-bold">efficiency</span>, <span className="text-white font-bold">modularity</span>, <span className="text-white font-bold">security</span>, and <span className="text-white font-bold">scalability</span>, building high-performance engines that bridge the gap between architectural stability and artificial intelligence.
            </p>
            <p>
              I specialize in developing general-purpose, high-fidelity backend solutions and RAG-based agentic systems. By leveraging Vector databases and embedding models, I build context-aware applications that transform static data into actionable intelligence.
            </p>
            <p
              className="text-white-400 font-quantico pt-5 font-bold text-center hidden lg:block"
              style={{ fontSize: `${quoteFontSize}rem` }}
            >
              "I use Arch btw"
            </p>
          </motion.div>

          {/* Middle Column - Tech Stack (Fixed width based on icons) */}
          <motion.div
            ref={middleColumnRef}
            style={{ 
              '--desktop-width': `${middleColumnWidth}px`
            } as React.CSSProperties}
            className="flex-shrink-0 order-3 lg:order-2 w-full lg:w-[var(--desktop-width)]"
          >
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col">
              {/* Skills Section */}
              <div>
                <div className="text-cyan-400 font-mono text-sm tracking-wider mb-5 text-center lg:text-left">
                  2.1 // SKILLS
                </div>
                <div className="flex justify-center lg:justify-start">
                  <div
                    className="grid place-items-center"
                    style={{
                      gridTemplateColumns: `repeat(${ICONS_PER_ROW}, ${responsiveIconSize}px)`,
                      gap: `${ICON_GAP}px`
                    }}
                  >
                    {skillsData.map((skill, index) => (
                      <motion.div
                        key={skill.name}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="flex flex-col items-center justify-start gap-2"
                        title={skill.name}
                      >
                        <img
                          src={skill.image}
                          alt={skill.name}
                          className="lg:w-12 lg:h-12 w-16 h-16 object-contain"
                        />
                        <span className="text-xs lg:text-[11px] font-mono text-slate-400 text-center">
                          {skill.name}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Divider Line */}
              <div className="w-full h-px bg-slate-700/30 my-5"></div>

              {/* Tools Section */}
              <div>
                <div className="text-purple-400 font-mono text-sm tracking-wider mb-5 text-center lg:text-left">
                  2.2 // TOOLS
                </div>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {toolsData.map((tool, index) => (
                    <motion.span
                      key={tool}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.02 }}
                      className="px-3 py-1.5 text-xs lg:text-[11px] font-mono tracking-wide bg-gradient-to-r from-slate-800/90 to-slate-800/60 text-slate-400 rounded border border-slate-700/40 hover:border-purple-500/30 hover:text-purple-300 transition-colors"
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
            style={{ 
              height: middleColumnHeight ? `${middleColumnHeight}px` : 'auto',
              '--desktop-width': `${middleColumnWidth}px`
            } as React.CSSProperties}
            className="relative flex items-center justify-center flex-shrink-0 w-full lg:w-[var(--desktop-width)] order-1 lg:order-3"
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

        {/* System Metrics Section - Integrated */}
        <motion.div
          ref={metricsRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isMetricsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="relative group mt-[20px] hidden lg:block"
        >
          {/* Single Card Background */}
          <div className="relative rounded-xl border border-slate-700/50 bg-slate-900/30 backdrop-blur-sm p-4">
            {/* All metrics in a single row */}
            <div className="flex items-stretch divide-x divide-slate-700/30">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex-1 px-6 first:pl-0 last:pr-0"
                >
                  {/* Label */}
                  <div className="mb-0">
                    <span className="font-mono text-xs text-slate-400 tracking-wider uppercase">
                      {metric.label}
                    </span>
                  </div>

                  {/* Value */}
                  <div>
                    <span className="font-mono text-sm text-cyan-400">
                      {metric.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtle grid lines for tech aesthetic */}
            <div className="absolute inset-0 pointer-events-none opacity-5 rounded-xl overflow-hidden">
              <div className="h-full w-full"
                style={{
                  backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 255, 0.05) 25%, rgba(0, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.05) 75%, rgba(0, 255, 255, 0.05) 76%, transparent 77%, transparent)',
                  backgroundSize: '50px 50px'
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;