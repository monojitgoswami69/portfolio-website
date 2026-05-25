import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { ExternalLink, X, Zap, Star } from 'lucide-react';
import { Github } from '@/lib/icons';
import { sanitizeUrl } from '@/utils/security';
import Lenis from 'lenis';
import { ProjectData, isValidLink, getStatusColor } from './projectUtils';

interface ProjectModalProps {
    project: ProjectData;
    onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Trap focus inside modal
    useEffect(() => {
        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            if (!modalRef.current) return;

            const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement && lastElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement && firstElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        window.addEventListener('keydown', handleTab);
        return () => window.removeEventListener('keydown', handleTab);
    }, []);

    // Close on escape key and prevent layout shift (including navbar shift)
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);

        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.body.style.overflow = 'hidden';

        // Apply scroll padding to fixed navigation bar to block shifting
        const navbar = document.querySelector('nav');
        if (navbar) {
            navbar.style.paddingRight = `${scrollbarWidth}px`;
        }

        const firstFocusable = modalRef.current?.querySelector<HTMLElement>('button, [href]');
        firstFocusable?.focus();

        return () => {
            window.removeEventListener('keydown', handleEscape);
            document.body.style.paddingRight = '';
            document.body.style.overflow = '';
            const navbar = document.querySelector('nav');
            if (navbar) {
                navbar.style.paddingRight = '';
            }
        };
    }, [onClose]);

    // Custom Lenis instance for smooth scrolling inside the modal
    useEffect(() => {
        if (!scrollRef.current) return;

        const lenis = new Lenis({
            wrapper: scrollRef.current,
            content: scrollRef.current.firstElementChild as HTMLElement,
            lerp: 0.1,
            duration: 1.2,
            syncTouch: true,
        });

        let rafId: number;
        const raf = (time: number) => {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            cancelAnimationFrame(rafId);
        };
    }, []);

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            style={{ zIndex: 9999 }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <motion.div
                ref={modalRef}
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ type: 'spring', damping: 32, stiffness: 280 }}
                className="relative w-full max-w-5xl bg-[#0d0a1a] border-2 border-[#2d2754] shadow-[4px_4px_0px_0px_#2d2754] rounded-2xl overflow-hidden flex flex-col outline-none"
                style={{ maxHeight: 'calc(100vh - 120px)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-30 p-2.5 bg-[#110e24] border-2 border-[#2d2754] text-slate-400 hover:bg-red-500 hover:text-[#020208] hover:border-[#2d2754] shadow-[2px_2px_0px_0px_#2d2754] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200 outline-none focus:outline-none focus-visible:outline-none select-none rounded-lg"
                >
                    <X size={20} />
                </button>

                {/* Scrollable Content */}
                <div ref={scrollRef} className="overflow-y-auto flex-1 no-scrollbar" data-lenis-prevent>
                    <div className="flex flex-col">
                        {/* Header Image */}
                    <div className="relative h-40 md:h-72 overflow-hidden flex-shrink-0">
                        <Image
                            src={project.imageUrl}
                            alt={project.name}
                            fill
                            sizes="(max-width: 1024px) 100vw, 1024px"
                            className="object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/1200x800/0f172a/00eeff?text=Module+Data+Corrupted';
                            }}
                        />
                        <div className="absolute -inset-x-2 top-0 bottom-0 bg-gradient-to-t from-[#0d0a1a]/95 via-[#0d0a1a]/40 to-transparent" />

                        {/* Featured Badge */}
                        {project.featured && (
                            <div className="absolute top-4 left-4">
                                <span className="flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs font-mono bg-yellow-400 text-[#020208] border-2 border-[#2d2754] font-bold shadow-[2px_2px_0px_0px_#2d2754] rounded-md">
                                    <Star className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" />
                                    Featured
                                </span>
                            </div>
                        )}

                        {/* Hard bottom edge */}
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2d2754]" />
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-3">
                        <h2 id="modal-title" className="text-xl md:text-3xl font-averia font-bold text-white pt-3 pb-3">
                            {project.name}
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-3">
                                {/* Badges */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {project.status && (
                                        <span className={`px-2 py-1 text-[10px] md:text-xs font-mono border-2 border-[#2d2754] font-bold rounded-md ${getStatusColor(project.status)}`}>
                                            {project.status}
                                        </span>
                                    )}
                                    {project.category && (
                                        <span className="px-2 py-1 text-[10px] md:text-xs font-mono bg-purple-500/20 text-purple-400 border-2 border-[#2d2754] font-semibold rounded-md">
                                            {project.category}
                                        </span>
                                    )}
                                </div>

                                {/* Tech Stack */}
                                <div className="flex flex-wrap gap-2">
                                    {project.techStack.map((tech: string) => (
                                        <span
                                            key={tech}
                                            className="px-2 py-1 text-[10px] md:text-xs font-mono bg-[#110e24] border-2 border-[#2d2754] text-cyan-200/80 rounded-md"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Long Description */}
                            <div className="prose prose-invert max-w-none">
                                <p className="text-slate-300 text-xs md:text-[14px] leading-relaxed whitespace-pre-line">
                                    {project.longDescription || project.description}
                                </p>
                            </div>

                            {/* Features Grid */}
                            {project.features && project.features.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="flex items-center gap-2 text-xs md:text-sm font-mono font-bold text-cyan-400 tracking-wider uppercase mb-4">
                                        <Zap size={14} className="text-yellow-400 animate-pulse" />
                                        SYSTEM_MODULES // KEY_FEATURES
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {project.features.map((feature: string, idx: number) => (
                                            <div
                                                key={idx}
                                                className="flex items-start gap-3 p-3.5 bg-[#110e24] border-2 border-[#2d2754] shadow-[2px_2px_0px_0px_#2d2754] rounded-xl transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                                            >
                                                <div className="flex items-center justify-center w-5 h-5 border border-[#2d2754] bg-[#0d0a1a] text-cyan-400 font-mono text-[9px] font-bold shrink-0 mt-[2px] select-none rounded-md">
                                                    {String(idx + 1).padStart(2, '0')}
                                                </div>
                                                <span className="font-mono text-slate-300 text-[11px] md:text-xs leading-relaxed">
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

                {/* Sticky Action Buttons */}
                {(isValidLink(project.demoUrl) || isValidLink(project.githubUrl)) && (
                    <div className="relative flex-shrink-0">
                        <div className="relative flex gap-3 pt-0 pb-3 px-3 bg-[#0d0a1a]">
                            {isValidLink(project.demoUrl) && (
                                <a
                                    href={sanitizeUrl(project.demoUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 bg-cyan-400 text-[#020208] font-bold border-2 border-[#2d2754] shadow-[2px_2px_0px_0px_#2d2754] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200 rounded-xl whitespace-nowrap outline-none focus:outline-none ${isValidLink(project.demoUrl) && isValidLink(project.githubUrl)
                                        ? 'text-[10px] px-2 md:text-base md:px-6'
                                        : 'text-sm px-6 md:text-base'
                                    }`}
                                >
                                    <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    Live Demo
                                </a>
                            )}
                            {isValidLink(project.githubUrl) && (
                                <a
                                    href={sanitizeUrl(project.githubUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 bg-purple-500 text-[#020208] font-bold border-2 border-[#2d2754] shadow-[2px_2px_0px_0px_#2d2754] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200 rounded-xl whitespace-nowrap outline-none focus:outline-none ${isValidLink(project.demoUrl) && isValidLink(project.githubUrl)
                                        ? 'text-[10px] px-2 md:text-base md:px-6'
                                        : 'text-sm px-6 md:text-base'
                                    }`}
                                >
                                    <Github className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    Source Code
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>,
        document.body
    );
};

export default ProjectModal;
