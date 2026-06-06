import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from '@/lib/motion';
import { ExternalLink, X, Zap, Star, Check } from 'lucide-react';
import { Github } from '@/lib/icons';
import { sanitizeUrl } from '@/utils/security';
import { useLenis } from 'lenis/react';
import { ProjectData, isValidLink, getStatusColor } from './projectUtils';

interface ProjectModalProps {
    project: ProjectData;
    onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const lenis = useLenis();

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

    // Close on escape key and prevent layout shift
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);

        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.body.style.overflow = 'hidden';

        const navbar = document.querySelector('nav');
        if (navbar) {
            navbar.style.paddingRight = `${scrollbarWidth}px`;
        }

        // Disable global Lenis while modal is open
        lenis?.stop();

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
            // Re-enable global Lenis
            lenis?.start();
        };
    }, [onClose, lenis]);

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
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-5xl bg-[var(--bg-card)] border-2 border-[var(--border-color)] shadow-[var(--shadow-offset)] rounded-xl overflow-hidden flex flex-col outline-none"
                style={{ maxHeight: 'calc(100vh - 120px)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close project details"
                    className="absolute top-4 right-4 z-30 p-2.5 bg-[var(--bg-card-alt)] border-2 border-transparent text-slate-400 hover:bg-[#bf616a] hover:text-[#1b2234] hover:border-transparent shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:bg-[#bf616a] active:text-[#1b2234] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none active:transition-none transition-all duration-200 outline-none focus:outline-none focus-visible:outline-none select-none rounded-base cursor-pointer"
                >
                    <X size={20} aria-hidden="true" />
                </button>

                {/* Scrollable Content */}
                <div ref={scrollRef} className="overflow-y-auto flex-1 no-scrollbar" data-lenis-prevent>
                    <div className="flex flex-col">
                        {/* Header Image */}
                    <div className="relative h-40 md:h-72 overflow-hidden flex-shrink-0 rounded-t-[calc(12px-2px)]">
                        <Image
                            src={project.imageUrl}
                            alt={project.name}
                            fill
                            sizes="(max-width: 1024px) 100vw, 1024px"
                            className="object-cover rounded-t-[calc(12px-2px)]"
                            onError={(e) => {
                                const img = e.currentTarget;
                                if (img.dataset.fallbackApplied === 'true') return;
                                img.dataset.fallbackApplied = 'true';
                                img.src = 'https://placehold.co/1200x800/0f172a/00eeff?text=Module+Data+Corrupted';
                            }}
                        />
                        <div className="absolute inset-0 bg-[var(--bg-card)]/20 rounded-t-[calc(12px-2px)]" />

                        {/* Featured Badge */}
                        {project.featured && (
                            <div className="absolute top-4 left-4">
                                <span className="flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs font-mono bg-[#ebcb8b] text-[#1b2234] border-2 border-[var(--border-color)] font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)] rounded-base">
                                    <Star className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" />
                                    Featured
                                </span>
                            </div>
                        )}

                        {/* Hard bottom edge */}
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--border-color)]" />
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
                                        <span className={`px-2 py-1 text-[10px] md:text-xs font-mono border-2 border-[var(--border-color)] font-bold rounded-base ${getStatusColor(project.status)}`}>
                                            {project.status}
                                        </span>
                                    )}
                                    {project.category && (
                                        <span className="px-2 py-1 text-[10px] md:text-xs font-mono bg-[#b48ead]/15 text-[#b48ead] border-2 border-[var(--border-color)] font-semibold rounded-base">
                                            {project.category}
                                        </span>
                                    )}
                                </div>

                                {/* Tech Stack */}
                                <div className="flex flex-wrap gap-2">
                                    {project.techStack.map((tech: string) => (
                                        <span
                                            key={tech}
                                            className="px-2 py-1 text-[10px] md:text-xs font-mono bg-[var(--bg-card-alt)] border-2 border-[var(--border-color)] text-[#88c0d0]/80 rounded-base"
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

                            {/* Key Features List */}
                            {project.features && project.features.length > 0 && (
                                <div className="mt-6 border-t border-[var(--border-color)]/50 pt-6">
                                    <h3 className="flex items-center gap-2 text-xs md:text-sm font-mono font-bold text-[#88c0d0] tracking-wider uppercase mb-4">
                                        <Zap size={14} className="text-[#ebcb8b] animate-pulse" />
                                        KEY FEATURES
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                        {project.features.map((feature: string, idx: number) => (
                                            <div
                                                key={idx}
                                                className="flex items-start gap-3 group/feat"
                                            >
                                                <span className="flex items-center justify-center w-5 h-5 rounded bg-[#a3be8c]/10 text-[#a3be8c] border border-[#a3be8c]/20 shrink-0 mt-0.5 group-hover/feat:bg-[#a3be8c]/20 group-hover/feat:text-white transition-colors duration-200">
                                                    <Check className="w-3 h-3" />
                                                </span>
                                                <span className="text-slate-300 text-xs md:text-[13.5px] leading-relaxed group-hover/feat:text-white transition-colors duration-200">
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
                        <div className="relative flex gap-3 pt-0 pb-3 px-3 bg-[var(--bg-card)]">
                            {isValidLink(project.demoUrl) && (
                                <a
                                    href={sanitizeUrl(project.demoUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Live demo of ${project.name}`}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 bg-[#88c0d0] text-[#1b2234] font-bold border-2 border-transparent shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none active:transition-none transition-all duration-200 rounded-base whitespace-nowrap outline-none focus:outline-none ${isValidLink(project.demoUrl) && isValidLink(project.githubUrl)
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
                                    aria-label={`Source code for ${project.name} on GitHub`}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 bg-[#b48ead] text-[#1b2234] font-bold border-2 border-transparent shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none active:transition-none transition-all duration-200 rounded-base whitespace-nowrap outline-none focus:outline-none ${isValidLink(project.demoUrl) && isValidLink(project.githubUrl)
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
