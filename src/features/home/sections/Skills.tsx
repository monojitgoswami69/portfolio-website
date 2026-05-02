import Image from 'next/image';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Scan, Activity, Monitor, Code, Terminal } from 'lucide-react';
import { skillsData, toolsData, Metric } from '../data/skills';
import { HomeSection } from '../types';

// System metrics data
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
        value: 'linux standard',
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

const Skills: React.FC = () => {
    const metricsRef = useRef<HTMLDivElement>(null);
    const isMetricsInView = useInView(metricsRef, { once: true, margin: "-100px" });

    // Changed from import to static string path to compatible with browser ESM
    const PROFILE_IMG = "/assets/profile.webp";

    return (
        <section id={HomeSection.SKILLS} className="pt-8 pb-10 lg:pb-20 relative z-10 overflow-hidden scroll-mt-[85px]" style={{ position: 'relative' }}>
            {/* Parallax Background Element */}
            <div
                className="absolute -right-64 top-0 w-[800px] h-[800px] border-[40px] border-slate-700 rounded-full pointer-events-none opacity-[0.05]"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Title */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 font-quantico text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400"
                >
                    2.0 // SYSTEM SPECS
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-400 text-xs sm:text-sm md:text-base mb-6 font-mono uppercase tracking-widest"
                >
                    Technical Capabilities &amp; Core Architecture
                </motion.p>

                <div className="flex flex-col md:flex-row md:flex-wrap lg:flex-nowrap items-stretch justify-center w-full gap-0 lg:gap-0 mt-8 lg:mt-12">
                    {/* Left - Anchor Frame (Image) */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: 0.2 }}
                        className="relative w-full md:w-1/2 lg:w-[450px] xl:w-[500px] z-10 flex"
                    >
                        <div className="relative group w-full h-full overflow-hidden transition-all duration-300">
                            {/* Image Section */}
                            <div className="relative w-full h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl min-h-[400px]">
                                <Image
                                    src={PROFILE_IMG}
                                    alt="Monojit Goswami"
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px"
                                    className="object-cover object-[center_30%] transition-all duration-700
                                   filter grayscale sepia hue-rotate-[170deg] contrast-[1.2] brightness-75
                                   group-hover:filter-none group-hover:scale-105"
                                />

                                {/* Hologram Overlay */}
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
                        <div className="absolute inset-0 bg-cyan-500 rounded-full blur-[120px] opacity-10 -z-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />
                    </motion.div>

                    {/* Middle Column - Tech Stack (Skills) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: 0.3 }}
                        className="w-full md:w-1/2 lg:w-[350px] xl:w-[400px] bg-slate-950/40 backdrop-blur-xl border border-slate-800/50 md:rounded-2xl md:rounded-l-none md:rounded-b-none lg:rounded-none -mr-4 md:mr-0 md:border-l-0 md:border-r lg:border-r shadow-2xl overflow-hidden z-20 lg:my-[25px] md:border-b-0 lg:border-b"
                    >
                        <div className="py-5 px-6 lg:py-6 lg:px-6 xl:py-8 xl:px-8 flex flex-col justify-center">
                            <div>
                                <div className="text-cyan-400 font-mono text-sm tracking-wider mb-3 text-center">
                                    2.1 // SKILLS
                                </div>
                                <div className="flex flex-wrap justify-center gap-1 lg:gap-2">
                                    {skillsData.map((skill, index) => (
                                        <motion.div
                                            key={skill.name}
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex flex-col items-center justify-start gap-1 lg:gap-2 w-[60px] lg:w-[70px]"
                                            title={skill.name}
                                        >
                                            <Image
                                                src={skill.image}
                                                alt={skill.name}
                                                width={56}
                                                height={56}
                                                className="w-12 h-12 lg:w-14 lg:h-14 object-contain hover:scale-110 transition-transform"
                                            />
                                            <span className="text-[10px] lg:text-[11px] font-mono text-slate-400 text-center truncate w-full">
                                                {skill.name}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Tools Section */}
                            <div className="mt-6">
                                <div className="text-purple-400 font-mono text-sm tracking-wider mb-3 text-center">
                                    2.2 // TOOLS
                                </div>
                                <div className="flex flex-wrap gap-2 lg:gap-2.5 justify-center">
                                    {toolsData.map((tool, index) => (
                                        <motion.span
                                            key={tool}
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.02 }}
                                            className="px-2.5 py-1 text-[10px] lg:text-[11px] font-mono tracking-wide bg-gradient-to-r from-slate-800/90 to-slate-800/60 text-slate-400 rounded border border-slate-700/40 hover:border-purple-500/30 hover:text-purple-300 hover:scale-105 hover:shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all inline-block"
                                        >
                                            {tool}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: 0.4 }}
                        className="w-full md:w-full lg:flex-1 bg-slate-950/40 backdrop-blur-xl border border-slate-800/50 rounded-b-2xl md:rounded-2xl md:rounded-t-none lg:rounded-l-none lg:rounded-tr-2xl lg:border-l-0 shadow-2xl overflow-hidden z-20 lg:my-[25px] -mb-4 md:mb-0"
                    >
                        <div className="py-5 px-6 lg:py-6 lg:px-8 xl:py-8 xl:px-10 flex flex-col justify-center space-y-4 lg:space-y-5 text-slate-300 leading-relaxed text-[13px] md:text-[14px] font-mono">
                            <p>
                                I am <span className="text-cyan-400 font-bold">Monojit Goswami</span>, a backend engineer driven by the potential of autonomous systems. My architecture philosophy focuses on <span className="text-white font-bold">efficiency</span>, <span className="text-white font-bold">modularity</span>, <span className="text-white font-bold">security</span>, and <span className="text-white font-bold">scalability</span>, building high-performance engines that bridge the gap between architectural stability and artificial intelligence.
                            </p>
                            <p>
                                I specialize in developing general-purpose, high-fidelity backend solutions and RAG-based agentic systems. By leveraging Vector databases and embedding models, I build context-aware applications that transform static data into actionable intelligence.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* System Metrics Section - Integrated */}
                <motion.div
                    ref={metricsRef}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isMetricsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                    className="relative group mt-[20px] hidden lg:block"
                >
                    {/* Single Card Background */}
                    <div className="relative rounded-xl border border-slate-800 bg-slate-950/50 backdrop-blur-md p-4">
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
