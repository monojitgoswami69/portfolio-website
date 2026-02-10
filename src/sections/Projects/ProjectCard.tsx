import { motion } from 'framer-motion';
import { Github, ExternalLink, Star, Maximize2 } from 'lucide-react';
import { sanitizeUrl } from '../../utils/security';
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
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            onMouseEnter={() => onHover(String(index))}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(project)}
            className="group relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-colors duration-300 flex flex-col cursor-pointer"
        >
            {/* Featured Badge */}
            {project.featured && (
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-mono bg-yellow-400 text-black rounded font-bold">
                    <Star className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" />
                    Featured
                </div>
            )}

            {/* Image Container */}
            <div className="relative h-48 overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 hidden md:block bg-cyan-900/20 group-hover:bg-transparent transition-colors duration-300 z-10" />
                <img
                    src={project.imageUrl}
                    alt={project.name}
                    className="w-full h-full object-cover transform md:group-hover:scale-110 transition-transform duration-500 md:grayscale md:group-hover:grayscale-0"
                    loading="lazy"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/0f172a/00eeff?text=Module+Offline';
                    }}
                />
            </div>

            {/* Content */}
            <div className="p-6 relative flex flex-col flex-grow">
                {/* Decoration Line */}
                <div className={`hidden md:block absolute top-0 left-0 h-1 bg-cyan-400 transition-all duration-300 ${hoveredId === String(index) ? 'w-full' : 'w-0'}`} />

                {/* Status & Category */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {project.status && (
                        <span className={`px-2 py-0.5 text-[10px] md:text-xs font-mono rounded border ${getStatusColor(project.status)}`}>
                            {project.status}
                        </span>
                    )}
                    {project.category && (
                        <span className={`px-2 py-0.5 text-[10px] md:text-xs font-mono bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded`}>
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

                {/* Tech Stack - Dynamic two-row display */}
                <TechStackDisplay techStack={project.techStack} sortByLength={true} />

                {/* Spacer to push buttons to bottom */}
                <div className="flex-grow" />

                {/* Action Buttons Section */}
                <div className="flex flex-col gap-3 pt-4 border-t border-slate-800">
                    {/* Mobile View Details Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(project);
                        }}
                        className="md:hidden flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-800/80 border border-slate-700 text-slate-200 rounded-lg active:scale-[0.98] transition-all text-[10px] font-mono"
                    >
                        <Maximize2 className="w-3.5 h-3.5" />
                        View Details
                    </button>

                    {/* External Links - Only show if at least one valid link exists */}
                    {(isValidLink(project.demoUrl) || isValidLink(project.githubUrl)) && (
                        <div className="flex gap-3">
                            {isValidLink(project.demoUrl) && (
                                <a
                                    href={sanitizeUrl(project.demoUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 font-mono whitespace-nowrap ${isValidLink(project.demoUrl) && isValidLink(project.githubUrl)
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
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 hover:border-slate-600 hover:text-white transition-all duration-300 font-mono whitespace-nowrap ${isValidLink(project.demoUrl) && isValidLink(project.githubUrl)
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
