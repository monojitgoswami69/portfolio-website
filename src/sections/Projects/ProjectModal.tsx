import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Github, ExternalLink, X, Zap, Lightbulb, Target, ChevronRight, Star } from 'lucide-react';
import { sanitizeUrl } from '../../utils/security';
import { ProjectData, isValidLink, getStatusColor } from './projectUtils';

interface ProjectModalProps {
    project: ProjectData;
    onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);

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

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        // Set initial focus to close button or first focusable element
        const firstFocusable = modalRef.current?.querySelector<HTMLElement>('button, [href]');
        firstFocusable?.focus();

        return () => {
            window.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            style={{ zIndex: 9999 }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <motion.div
                ref={modalRef}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col"
                style={{ maxHeight: 'calc(100vh - 120px)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button - Fixed position on card */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-30 p-2 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-full text-slate-400 hover:text-white hover:border-slate-500 transition-all"
                >
                    <X size={20} />
                </button>

                {/* Top Gradient Fade */}
                <div
                    className="absolute inset-x-0 top-0 h-4 z-20 pointer-events-none rounded-t-2xl"
                    style={{
                        background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.7) 0%, transparent 100%)'
                    }}
                />

                {/* Scrollable Content Container */}
                <div className="overflow-y-auto flex-1 rounded-t-2xl no-scrollbar">
                    {/* Header Image */}
                    <div className="relative h-40 md:h-72 overflow-hidden flex-shrink-0">
                        <img
                            src={project.imageUrl}
                            alt={project.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/1200x800/0f172a/00eeff?text=Module+Data+Corrupted';
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-slate-900/30 to-transparent" />

                        {/* Featured Badge - Top Left */}
                        {project.featured && (
                            <div className="absolute top-4 left-4">
                                <span className="flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs font-mono bg-yellow-400 text-black rounded-lg font-bold">
                                    <Star className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" />
                                    Featured
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-3">
                        {/* Project Name */}
                        <h2 id="modal-title" className="text-2xl md:text-4xl font-averia font-bold text-white pt-3 pb-3">
                            {project.name}
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-3">
                                {/* Badges */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {project.status && (
                                        <span className={`px-2 py-1 text-[10px] md:text-xs font-mono rounded-lg border ${getStatusColor(project.status)}`}>
                                            {project.status}
                                        </span>
                                    )}
                                    {project.category && (
                                        <span className="px-2 py-1 text-[10px] md:text-xs font-mono bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg font-semibold">
                                            {project.category}
                                        </span>
                                    )}
                                </div>

                                {/* Tech Stack */}
                                <div className="flex flex-wrap gap-2">
                                    {project.techStack.map((tech: string) => (
                                        <span
                                            key={tech}
                                            className="px-2 py-1 text-[10px] md:text-xs font-mono bg-slate-800 text-cyan-200/80 rounded-lg border border-slate-700"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Long Description */}
                            <div className="prose prose-invert max-w-none">
                                <p className="text-slate-300 text-xs md:text-base leading-relaxed whitespace-pre-line">
                                    {project.longDescription || project.description}
                                </p>
                            </div>

                            {/* Features */}
                            {project.features && project.features.length > 0 && (
                                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                                    <h3 className="flex items-center gap-2 text-xs md:text-base font-bold text-white mb-4">
                                        <Zap size={16} className="text-yellow-400" />
                                        Key Features
                                    </h3>
                                    <ul className="space-y-2">
                                        {project.features.map((feature: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-3 text-slate-300 text-[11px] md:text-sm leading-relaxed">
                                                <ChevronRight size={14} className="text-cyan-400 mt-[5px] flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Challenges & Learnings Grid */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {project.challenges && (
                                    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                                        <h3 className="flex items-center gap-2 text-xs md:text-base font-bold text-white mb-3">
                                            <Target size={16} className="text-red-400" />
                                            Challenges
                                        </h3>
                                        <p className="text-slate-300 text-[11px] md:text-sm leading-relaxed">{project.challenges}</p>
                                    </div>
                                )}
                                {project.learnings && (
                                    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                                        <h3 className="flex items-center gap-2 text-xs md:text-base font-bold text-white mb-3">
                                            <Lightbulb size={16} className="text-yellow-400" />
                                            Learnings
                                        </h3>
                                        <p className="text-slate-300 text-[11px] md:text-sm leading-relaxed">{project.learnings}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Action Buttons with Gradient Blur */}
                {(isValidLink(project.demoUrl) || isValidLink(project.githubUrl)) && (
                    <div className="relative flex-shrink-0">
                        {/* Gradient fade overlay extending above buttons */}
                        <div
                            className="absolute inset-x-0 -top-10 h-10 pointer-events-none"
                            style={{
                                background: 'linear-gradient(to bottom, transparent 0%, rgba(15, 23, 42, 0.4) 50%, rgba(15, 23, 42, 0.8) 100%)'
                            }}
                        />
                        {/* Button container - highly translucent with strong blur */}
                        <div
                            className="relative flex gap-3 pt-0 pb-3 px-3 rounded-b-2xl"
                            style={{
                                backgroundColor: 'rgba(15, 23, 42, 0)',
                                backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                                borderTop: '1px solid rgba(148, 163, 184, 0)'
                            }}
                        >
                            {isValidLink(project.demoUrl) && (
                                <a
                                    href={sanitizeUrl(project.demoUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-lg transition-all duration-300 whitespace-nowrap ${isValidLink(project.demoUrl) && isValidLink(project.githubUrl)
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
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-white font-bold rounded-lg border border-slate-400/30 transition-all duration-300 hover:bg-white/10 whitespace-nowrap ${isValidLink(project.demoUrl) && isValidLink(project.githubUrl)
                                        ? 'text-[10px] px-2 md:text-base md:px-6'
                                        : 'text-sm px-6 md:text-base'
                                        }`}
                                    style={{
                                        backgroundColor: 'rgba(51, 65, 85, 0.5)',
                                        backdropFilter: 'blur(4px)'
                                    }}
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
