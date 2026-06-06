import Image from 'next/image';
import { motion } from '@/lib/motion';
import { ExternalLink, Star, Maximize2 } from 'lucide-react';
import { Github } from '@/lib/icons';
import { sanitizeUrl } from '@/utils/security';
import { ProjectData, getStatusColor, isValidLink } from './projectUtils';

export interface ProjectCardProps {
    project: ProjectData;
    index: number;
    onSelect: (project: ProjectData) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onSelect }) => {
    const handleSelect = () => onSelect(project);
    const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect();
        }
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -50px 0px" }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
            onClick={handleSelect}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`Open details for ${project.name}`}
            className="group relative bg-[var(--bg-card)] border-2 border-[var(--border-color)] overflow-hidden rounded-base shadow-[var(--shadow-offset)] transition-colors duration-200 flex flex-col cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#88c0d0] bg-clip-padding [backface-visibility:hidden] [transform-style:preserve-3d]"
        >
            {/* Featured Badge */}
            {project.featured && (
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2 py-0.5 md:px-2.5 md:py-1 text-[10px] md:text-xs font-mono bg-[#ebcb8b] text-[#1b2234] border-2 border-[var(--border-color)] font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)] rounded-base">
                    <Star className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" />
                    Featured
                </div>
            )}

            {/* Image Container */}
            <div className="relative h-48 overflow-hidden flex-shrink-0 bg-[var(--bg-card)] pointer-events-none select-none isolate rounded-t-[calc(var(--radius-base)-2px)] [backface-visibility:hidden]">
                <div className="absolute inset-0 hidden md:block bg-[#88c0d0]/10 opacity-100 group-hover:opacity-0 transition-opacity duration-300 z-10 pointer-events-none rounded-t-[calc(var(--radius-base)-2px)]" />
                <Image
                    src={project.imageUrl}
                    alt={project.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover scale-[1.02] md:group-hover:scale-110 transition-all duration-700 ease-out md:grayscale md:group-hover:grayscale-0 will-change-transform pointer-events-none select-none rounded-t-[calc(var(--radius-base)-2px)]"
                    onError={(e) => {
                        const img = e.currentTarget;
                        if (img.dataset.fallbackApplied === 'true') return;
                        img.dataset.fallbackApplied = 'true';
                        img.src = 'https://placehold.co/600x400/0f172a/00eeff?text=Module+Offline';
                    }}
                />
            </div>

            {/* Content */}
            <div className="p-6 relative flex flex-col flex-grow">
                {/* Status & Category */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {project.status && (
                        <span className={`px-2 py-0.5 text-[10px] md:text-xs font-mono border-2 border-[var(--border-color)] font-bold rounded-base ${getStatusColor(project.status)}`}>
                            {project.status}
                        </span>
                    )}
                    {project.category && (
                        <span className="px-2 py-0.5 text-[10px] md:text-xs font-mono bg-[#b48ead]/15 text-[#b48ead] border-2 border-[var(--border-color)] font-bold rounded-base">
                            {project.category}
                        </span>
                    )}
                </div>

                <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-[#88c0d0] transition-colors">
                     {project.name}
                </h3>

                <p className="text-slate-400 text-[13px] md:text-sm mb-4 line-clamp-2">
                    {project.description}
                </p>

                {/* SEO/AIO: full narrative for crawlers and AI engines, mirrors modal content. */}
                <div className="sr-only">
                    {project.status && <p>Status: {project.status}.</p>}
                    {project.category && <p>Category: {project.category}.</p>}
                    {project.longDescription && (
                        <p>{project.longDescription}</p>
                    )}
                    {project.features && project.features.length > 0 && (
                        <>
                            <h4>Key features of {project.name}</h4>
                            <ul>
                                {project.features.map((feature, idx) => (
                                    <li key={idx}>{feature}</li>
                                ))}
                            </ul>
                        </>
                    )}
                    {project.techStack && project.techStack.length > 0 && (
                        <p>
                            Built with: {project.techStack.join(", ")}.
                        </p>
                    )}
                    {project.githubUrl && (
                        <p>
                            Source code: <a href={project.githubUrl}>{project.githubUrl}</a>
                        </p>
                    )}
                    {project.demoUrl && (
                        <p>
                            Live demo: <a href={project.demoUrl}>{project.demoUrl}</a>
                        </p>
                    )}
                </div>

                {/* Tech Stack - CSS-based wrapping */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {project.techStack.map((tech) => (
                        <span
                            key={tech}
                            className="px-2 py-1 text-[10px] md:text-xs font-mono bg-[var(--bg-card-alt)] border-2 border-[var(--border-color)] text-[#88c0d0]/80 rounded-base"
                        >
                            {tech}
                        </span>
                    ))}
                </div>

                <div className="flex-grow" />

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4 border-t-2 border-[var(--border-color)]">
                    {/* Mobile View Details Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(project);
                        }}
                        className="md:hidden flex items-center justify-center gap-2 w-full px-4 py-2 bg-[var(--bg-card-alt)] border-2 border-transparent text-slate-300 shadow-[3px_3px_0px_0px_var(--shadow-color)] active:bg-[#1a153a] active:text-white active:translate-x-[3px] active:translate-y-[3px] active:shadow-none active:transition-none transition-all duration-200 text-[10px] font-mono font-bold rounded-base cursor-pointer"
                    >
                        <Maximize2 className="w-3.5 h-3.5" />
                        View Details
                    </button>

                    {/* External Links */}
                    {(isValidLink(project.demoUrl) || isValidLink(project.githubUrl)) && (
                        <div className="flex gap-3">
                            {isValidLink(project.demoUrl) && (
                                <a
                                    href={sanitizeUrl(project.demoUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Live demo of ${project.name}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#88c0d0] text-[#1b2234] border-2 border-transparent font-mono font-bold shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px] active:shadow-none active:transition-none transition-all duration-200 whitespace-nowrap rounded-base ${isValidLink(project.demoUrl) && isValidLink(project.githubUrl)
                                        ? 'text-[10px] px-2 md:text-sm md:px-4'
                                        : 'text-xs px-4 md:text-sm'
                                    }`}
                                >
                                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    Live Demo
                                </a>
                            )}
                            {isValidLink(project.githubUrl) && (
                                <a
                                    href={sanitizeUrl(project.githubUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Source code for ${project.name} on GitHub`}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#b48ead] text-[#1b2234] border-2 border-transparent font-mono font-bold shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px] active:shadow-none active:transition-none transition-all duration-200 whitespace-nowrap rounded-base ${isValidLink(project.demoUrl) && isValidLink(project.githubUrl)
                                        ? 'text-[10px] px-2 md:text-sm md:px-4'
                                        : 'text-xs px-4 md:text-sm'
                                    }`}
                                >
                                    <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    Source Code
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.article>
    );
};

export default ProjectCard;
