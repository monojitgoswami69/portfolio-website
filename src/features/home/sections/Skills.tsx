import Image from 'next/image';
import { useRef } from 'react';
import { motion, useInView } from '@/lib/motion';
import { Scan, Activity, Monitor, Code, Terminal } from 'lucide-react';
import { skillsData, toolsData, Metric } from '../data/skills';
import { HomeSection } from '../types';

// System metrics data
const metrics: Metric[] = [
    { label: 'OS', value: 'Arch Linux', icon: Monitor, color: '#00FFFF', glowColor: 'rgba(0, 255, 255, 0.5)' },
    { label: 'Kernel', value: 'linux standard', icon: Monitor, color: '#00FFFF', glowColor: 'rgba(0, 255, 255, 0.5)' },
    { label: 'DE', value: 'hyprland', icon: Monitor, color: '#00FFFF', glowColor: 'rgba(0, 255, 255, 0.5)' },
    { label: 'IDE', value: 'VS Code', icon: Code, color: '#00FFFF', glowColor: 'rgba(0, 255, 255, 0.5)' },
    { label: 'Editor', value: 'Vim', icon: Code, color: '#00FFFF', glowColor: 'rgba(0, 255, 255, 0.5)' },
    { label: 'Terminal', value: 'kitty', icon: Terminal, color: '#00FFFF', glowColor: 'rgba(0, 255, 255, 0.5)' },
    { label: 'Shell', value: 'fish', icon: Terminal, color: '#00FFFF', glowColor: 'rgba(0, 255, 255, 0.5)' }
];

const Skills: React.FC = () => {
    const metricsRef = useRef<HTMLDivElement>(null);
    const isMetricsInView = useInView(metricsRef, { once: true, margin: "-100px" });

    const PROFILE_IMG = "/assets/profile.webp";

    return (
        <section id={HomeSection.SKILLS} className="pt-8 pb-10 lg:pb-20 relative z-10 overflow-hidden scroll-mt-[85px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Title */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 font-quantico text-transparent bg-clip-text bg-gradient-to-r from-[#88c0d0] to-[#b48ead]"
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

                <div className="flex flex-col lg:flex-row items-stretch justify-center w-full gap-0 lg:gap-6 mt-5 lg:mt-6">
                    {/* Left - Profile Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: 0.2 }}
                        className="relative w-full lg:w-[380px] xl:w-[420px] z-10 flex"
                    >
                        <div className="relative group w-full h-full">
                            <div className="relative w-full h-full border-2 border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden rounded-t-base rounded-b-none lg:rounded-base shadow-[var(--shadow-offset)] min-h-[400px]">
                                <Image
                                    src={PROFILE_IMG}
                                    alt="Monojit Goswami"
                                    fill
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 420px"
                                    className="object-cover object-[center_30%] transition-all duration-700 ease-out
                                   filter grayscale sepia hue-rotate-[170deg] contrast-[1.2] brightness-75
                                   group-hover:filter-none group-hover:scale-105 rounded-t-[calc(var(--radius-base)-2px)] rounded-b-none lg:rounded-[calc(var(--radius-base)-2px)] select-none pointer-events-none"
                                />

                                {/* Hologram Overlay */}
                                <div className="absolute inset-0 pointer-events-none z-10 bg-[length:100%_4px,6px_100%] opacity-40 group-hover:opacity-10 transition-opacity duration-500 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))]" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#88c0d0]/10 to-transparent z-20 translate-y-[-100%] animate-[scan_4s_linear_infinite] pointer-events-none group-hover:animate-none group-hover:opacity-0" />

                                {/* HUD Elements */}
                                <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-2 text-[#88c0d0] font-mono text-xs">
                                        <Activity size={14} className="animate-pulse" />
                                        <span>LIVE_FEED</span>
                                    </div>
                                    <div className="text-[10px] text-[#88c0d0]/70 font-mono">
                                        1080p // 60FPS
                                    </div>
                                </div>

                                <div className="absolute bottom-4 left-4 z-30">
                                    <div className="flex items-center gap-2 text-[#a3be8c] font-mono text-xs px-2.5 py-1.5 border-2 border-[#a3be8c]/40 bg-[#020208] rounded-base">
                                        <Scan size={14} />
                                        <span className="group-hover:hidden">SCANNING...</span>
                                        <span className="hidden group-hover:inline">IDENTITY CONFIRMED</span>
                                    </div>
                                </div>

                                {/* Corner Brackets */}
                                <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#88c0d0]/50 z-30" />
                                <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#88c0d0]/50 z-30" />
                                <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#88c0d0]/50 z-30" />
                                <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#88c0d0]/50 z-30" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Middle Column - Tech Stack */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: 0.3 }}
                        className="w-full lg:w-[380px] border-2 border-t-0 lg:border-t-2 border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden z-20 shadow-[var(--shadow-offset)] rounded-none lg:rounded-base"
                    >
                        <div className="py-5 px-6 lg:py-6 lg:px-6 xl:py-8 xl:px-8 flex flex-col justify-center">
                            <div>
                                <h3 className="text-[#88c0d0] font-mono text-sm tracking-wider mb-3 text-center font-bold">
                                    2.1 // SKILLS
                                </h3>
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
                                                {...(index === 0 ? { priority: true } : {})}
                                                className="w-12 h-12 lg:w-14 lg:h-14 object-contain hover:scale-110 transition-transform"
                                            />
                                            <span className="text-[11px] lg:text-xs font-mono text-slate-400 text-center truncate w-full">
                                                {skill.name}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Tools Section */}
                            <div className="mt-6">
                                <h3 className="text-[#b48ead] font-mono text-sm tracking-wider mb-3 text-center font-bold">
                                    2.2 // TOOLS
                                </h3>
                                <div className="flex flex-wrap gap-2 lg:gap-2.5 justify-center">
                                    {toolsData.map((tool, index) => (
                                        <motion.span
                                            key={tool}
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.02 }}
                                            className="px-2.5 py-1 text-[11px] lg:text-xs font-mono tracking-wide border-2 border-[var(--border-color)] bg-[var(--bg-card-alt)] text-slate-300 shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:bg-[#b48ead] hover:text-[#1b2234] hover:border-[var(--border-color)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:bg-[#b48ead] active:text-[#1b2234] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none active:transition-none transition-all duration-200 inline-block cursor-default font-medium rounded-base"
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
                        className="w-full lg:w-[380px] border-2 border-t-0 lg:border-t-2 border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden z-20 shadow-[var(--shadow-offset)] rounded-t-none rounded-b-base lg:rounded-base"
                    >
                        <div className="py-5 px-6 lg:py-6 lg:px-8 xl:py-8 xl:px-10 flex flex-col justify-center space-y-4 lg:space-y-5 text-slate-300 leading-relaxed text-[13px] md:text-sm lg:text-[15px] xl:text-base font-mono">
                            <p>
                                I am <span className="text-[#88c0d0] font-bold">Monojit Goswami</span>, a backend engineer driven by the potential of autonomous systems. My architecture philosophy focuses on <span className="text-white font-bold">efficiency</span>, <span className="text-white font-bold">modularity</span>, <span className="text-white font-bold">security</span>, and <span className="text-white font-bold">scalability</span>, building high-performance engines that bridge the gap between architectural stability and artificial intelligence.
                            </p>
                            <p>
                                I specialize in developing general-purpose, high-fidelity backend solutions and RAG-based agentic systems. By leveraging Vector databases and embedding models, I build context-aware applications that transform static data into actionable intelligence.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* System Metrics */}
                <motion.div
                    ref={metricsRef}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isMetricsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                    className="relative mt-5 lg:mt-6 w-full hidden lg:block"
                >
                    <div className="border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-offset)] rounded-base">
                        {/* Specs Flex Row */}
                        <div className="flex flex-row flex-nowrap items-center justify-between md:justify-center w-full gap-x-2 sm:gap-x-3 md:gap-x-6 lg:gap-x-10 xl:gap-x-12 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                            {metrics.map((metric) => (
                                <div key={metric.label} className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center border-2 border-[var(--border-color)] bg-[var(--bg-card-alt)] text-[#88c0d0] shadow-[2px_2px_0px_0px_var(--shadow-color)] flex-shrink-0 rounded-base">
                                        <metric.icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] md:w-5 md:h-5" />
                                    </div>
                                    <div className="min-w-0 flex flex-col justify-center space-y-0.5">
                                        <span className="font-mono text-[9px] sm:text-[10px] md:text-xs text-slate-400 tracking-widest uppercase leading-none">{metric.label}</span>
                                        <span className="font-mono text-[10px] sm:text-xs md:text-sm lg:text-base text-[#88c0d0] font-bold whitespace-nowrap leading-none">{metric.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Skills;
