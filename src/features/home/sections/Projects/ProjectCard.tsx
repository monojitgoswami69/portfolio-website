import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, Star, Maximize2 } from 'lucide-react';
import { Github } from '@/lib/icons';
import { sanitizeUrl } from '@/utils/security';
import { TechStackDisplay } from './ProjectGrid';
import { ProjectData, getStatusColor, isValidLink } from './projectUtils';

export interface ProjectCardProps {
    project: ProjectData;
    index: number;
    hoveredId: string | null;
    onHover: (id: string | null) => void;
    onSelect: (project: ProjectData) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, hoveredId, onHover, onSelect }) => {
    return (
        <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -50px 0px" }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
            onMouseEnter={() => onHover(String(index))}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(project)}
            className="group relative bg-[#0d0a1a] border-2 border-[#2d2754] overflow-hidden shadow-[4px_4px_0px_0px_#2d2754] transition-colors duration-200 flex flex-col cursor-pointer outline-none focus:outline-none"
        >
            {/* Featured Badge */}
            {project.featured && (
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2 py-0.5 md:px-2.5 md:py-1 text-[10px] md:text-xs font-mono bg-yellow-400 text-[#020208] border-2 border-[#2d2754] font-bold shadow-[2px_2px_0px_0px_#2d2754]">
                    <Star className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" />
                    Featured
                </div>
            )}

            {/* Image Container */}
            <div className="relative h-48 overflow-hidden flex-shrink-0 bg-[#0d0a1a] pointer-events-none select-none isolate">
                <div className="absolute inset-0 hidden md:block bg-cyan-900/20 opacity-100 group-hover:opacity-0 transition-opacity duration-300 z-10 pointer-events-none" />
                {/* Dark border overlay to mask any subpixel bleed */}
                <div className="absolute inset-0 z-20 pointer-events-none border-2 border-[#0d0a1a]" />
                <Image
                    src={project.imageUrl}
                    alt={project.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover scale-[1.02] md:group-hover:scale-110 transition-all duration-700 ease-out md:grayscale md:group-hover:grayscale-0 will-change-transform pointer-events-none select-none"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/0f172a/00eeff?text=Module+Offline';
                    }}
                />
            </div>

            {/* Content */}
            <div className="p-6 relative flex flex-col flex-grow">
                {/* Status & Category */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {project.status && (
                        <span className={`px-2 py-0.5 text-[10px] md:text-xs font-mono border-2 border-[#2d2754] font-bold ${getStatusColor(project.status)}`}>
                            {project.status}
                        </span>
                    )}
                    {project.category && (
                        <span className="px-2 py-0.5 text-[10px] md:text-xs font-mono bg-purple-500/20 text-purple-400 border-2 border-[#2d2754] font-bold">
                            {project.category}
                        </span>
                    )}
                </div>

                <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {project.name}
                </h3>

                <p className="text-slate-400 text-[13px] md:text-sm mb-4 line-clamp-2">
                    {project.description}
                </p>

                {/* Tech Stack */}
                <TechStackDisplay techStack={project.techStack} sortByLength={true} />

                <div className="flex-grow" />

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4 border-t-2 border-[#2d2754]">
                    {/* Mobile View Details Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(project);
                        }}
                        className="md:hidden flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#110e24] border-2 border-[#2d2754] text-slate-300 shadow-[3px_3px_0px_0px_#2d2754] active:bg-[#1a153a] active:text-white active:translate-x-[3px] active:translate-y-[3px] active:shadow-none active:transition-none transition-all duration-200 text-[10px] font-mono font-bold"
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
                                    onClick={(e) => e.stopPropagation()}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 bg-cyan-400 text-[#020208] border-2 border-[#2d2754] font-mono font-bold shadow-[3px_3px_0px_0px_#2d2754] hover:bg-cyan-500 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none active:bg-cyan-500 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none active:transition-none transition-all duration-200 whitespace-nowrap ${isValidLink(project.demoUrl) && isValidLink(project.githubUrl)
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
                                    onClick={(e) => e.stopPropagation()}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 bg-purple-500 border-2 border-[#2d2754] text-[#020208] font-mono font-bold shadow-[3px_3px_0px_0px_#2d2754] hover:bg-purple-600 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none active:bg-purple-600 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none active:transition-none transition-all duration-200 whitespace-nowrap ${isValidLink(project.demoUrl) && isValidLink(project.githubUrl)
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
        </motion.div>
    );
};

export default ProjectCard;
