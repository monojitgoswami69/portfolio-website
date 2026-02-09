import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ExternalLink, X, Zap, Lightbulb, Target, ChevronRight, Star, Maximize2 } from 'lucide-react';
import { isSafeUrl, sanitizeUrl } from '../utils/security';

// Tech Stack Display Component with dynamic two-row detection
const TechStackDisplay: React.FC<{ techStack: string[]; sortByLength?: boolean }> = ({
  techStack,
  sortByLength = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(techStack.length);

  // Sort by length if requested (shortest first to maximize visible count)
  const sortedTechStack = sortByLength
    ? [...techStack].sort((a, b) => a.length - b.length)
    : techStack;

  useEffect(() => {
    const calculateVisibleBadges = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.offsetWidth;

      // Create temporary badges to measure their actual widths
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.visibility = 'hidden';
      tempContainer.style.display = 'flex';
      tempContainer.style.flexWrap = 'wrap';
      tempContainer.style.gap = '0.5rem'; // gap-2
      tempContainer.style.width = `${containerWidth}px`;
      document.body.appendChild(tempContainer);

      const badges: HTMLElement[] = [];
      sortedTechStack.forEach((tech) => {
        const badge = document.createElement('span');
        badge.className = 'px-2 py-1 text-xs font-mono bg-slate-800 text-cyan-200/70 rounded border border-slate-700';
        badge.textContent = tech;
        badge.style.whiteSpace = 'nowrap';
        tempContainer.appendChild(badge);
        badges.push(badge);
      });

      // Force layout calculation
      tempContainer.offsetHeight;

      // Detect which badges are in the first two rows
      let maxVisibleCount = 0;
      if (badges.length > 0) {
        const firstBadgeTop = badges[0].offsetTop;
        const gap = 8; // 0.5rem = 8px

        // Find badges that are within two rows
        // Second row top = firstBadgeTop + first badge height + gap
        const firstBadgeHeight = badges[0].offsetHeight;
        const secondRowTop = firstBadgeTop + firstBadgeHeight + gap;
        const maxAllowedTop = secondRowTop + firstBadgeHeight; // End of second row

        for (let i = 0; i < badges.length; i++) {
          const badgeTop = badges[i].offsetTop;
          if (badgeTop < maxAllowedTop) {
            maxVisibleCount = i + 1;
          } else {
            break;
          }
        }

        // Reserve space for the +X badge if needed
        if (maxVisibleCount < sortedTechStack.length) {
          // Check if +X badge would fit in the same position
          const plusBadge = document.createElement('span');
          plusBadge.className = 'px-2 py-1 text-xs font-mono bg-slate-800 text-slate-400 rounded border border-slate-700';
          plusBadge.textContent = `+${sortedTechStack.length - maxVisibleCount}`;
          plusBadge.style.whiteSpace = 'nowrap';

          // Replace the last visible badge with +X to test
          if (maxVisibleCount > 0) {
            tempContainer.removeChild(badges[maxVisibleCount - 1]);
            tempContainer.appendChild(plusBadge);
            tempContainer.offsetHeight; // Force layout

            // If +X badge goes to third row, reduce visible count
            const plusBadgeTop = plusBadge.offsetTop;
            if (plusBadgeTop >= maxAllowedTop) {
              maxVisibleCount = Math.max(1, maxVisibleCount - 1);
            }
          }
        }
      }

      document.body.removeChild(tempContainer);
      setVisibleCount(Math.max(1, maxVisibleCount));
    };

    calculateVisibleBadges();

    // Recalculate on resize
    const resizeObserver = new ResizeObserver(calculateVisibleBadges);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [sortedTechStack]);

  const visibleTechs = sortedTechStack.slice(0, visibleCount);
  const remainingCount = sortedTechStack.length - visibleCount;

  return (
    <div ref={containerRef} className="flex flex-wrap gap-2 mb-4">
      {visibleTechs.map((tech) => (
        <span
          key={tech}
          className="px-2 py-1 text-[10px] md:text-xs font-mono bg-slate-800 text-cyan-200/70 rounded border border-slate-700"
        >
          {tech}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="px-2 py-1 text-[10px] md:text-xs font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
          +{remainingCount}
        </span>
      )}
    </div>
  );
};

// Type for JSON project data
interface ProjectData {
  name: string;
  description: string;
  longDescription?: string;
  techStack: string[];
  imageUrl: string;
  githubUrl?: string;
  demoUrl?: string;
  status?: string;
  features?: string[];
  challenges?: string;
  learnings?: string;
  category?: string;
  featured?: boolean;
}

// Helper function to check if a link is valid (not empty, null, or "NIL")
const isValidLink = (link?: string): boolean => {
  return isSafeUrl(link);
};

// Status badge colors
const getStatusColor = (status?: string): string => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'in development':
    case 'under development':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'on hold':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

// Project Modal Component
const ProjectModal: React.FC<{ project: ProjectData; onClose: () => void }> = ({ project, onClose }) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
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
    >
      <motion.div
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

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto flex-1 rounded-t-2xl no-scrollbar">
          {/* Header Image */}
          <div className="relative h-40 md:h-72 overflow-hidden flex-shrink-0">
            <img
              src={project.imageUrl}
              alt={project.name}
              className="w-full h-full object-cover"
              loading="lazy"
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
            <h2 className="text-2xl md:text-4xl font-averia font-bold text-white pt-3 pb-3">
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
                  {project.techStack.map((tech) => (
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
                  <h3 className="flex items-center gap-2 text-sm md:text-lg font-bold text-white mb-4">
                    <Zap size={16} className="text-yellow-400" />
                    Key Features
                  </h3>
                  <ul className="space-y-2">
                    {project.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-300 text-xs md:text-base leading-relaxed">
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
                    <h3 className="flex items-center gap-2 text-sm md:text-lg font-bold text-white mb-3">
                      <Target size={16} className="text-red-400" />
                      Challenges
                    </h3>
                    <p className="text-slate-300 text-xs md:text-base leading-relaxed">{project.challenges}</p>
                  </div>
                )}
                {project.learnings && (
                  <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                    <h3 className="flex items-center gap-2 text-sm md:text-lg font-bold text-white mb-3">
                      <Lightbulb size={16} className="text-yellow-400" />
                      Learnings
                    </h3>
                    <p className="text-slate-300 text-xs md:text-base leading-relaxed">{project.learnings}</p>
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

const Projects: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  useEffect(() => {
    fetch('/data/projects.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load projects');
        return res.json();
      })
      .then((data: ProjectData[]) => {
        // Sort projects: featured projects first
        const sortedData = [...data].sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
        setProjects(sortedData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <section className="pb-10 lg:pb-20 relative z-10 overflow-hidden">
        <div id="projects" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-[85px]">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 font-averia text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              3.0 // ACTIVE MODULES
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm md:text-base mb-6 font-mono uppercase tracking-widest">
              Explore Monojit's Projects & Innovations
            </p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="text-center text-slate-400 py-12">
              <div className="animate-pulse font-mono">Loading projects...</div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center text-red-400 py-12 font-mono">
              Error: {error}
            </div>
          )}

          {/* No Projects Fallback */}
          {!loading && !error && projects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <p className="text-slate-400 text-lg mb-6 font-mono">
                No projects featured at the moment.
              </p>
              <a
                href="https://github.com/monojitgoswami69"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-lg text-cyan-400 hover:text-cyan-300 transition-all duration-300 font-mono group"
              >
                Visit GitHub to explore <Github size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          )}

          {/* Projects Grid */}
          {!loading && !error && projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredId(String(index))}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setSelectedProject(project)}
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
                          setSelectedProject(project);
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
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Projects;