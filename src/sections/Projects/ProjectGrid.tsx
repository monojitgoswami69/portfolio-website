import { useState, useEffect, useRef } from 'react';
import { Github } from 'lucide-react';
import ProjectCard from './ProjectCard';
import { ProjectData } from './projectUtils';

// Tech Stack Display Component with dynamic two-row detection
export const TechStackDisplay: React.FC<{ techStack: string[]; sortByLength?: boolean }> = ({
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
            void tempContainer.offsetHeight;

            // Detect which badges are in the first two rows
            let maxVisibleCount = 0;
            if (badges.length > 0) {
                const firstBadge = badges[0];
                if (!firstBadge) return; // Guard against undefined

                const firstBadgeTop = firstBadge.offsetTop;
                const gap = 8; // 0.5rem = 8px

                // Find badges that are within two rows
                const firstBadgeHeight = firstBadge.offsetHeight;
                const secondRowTop = firstBadgeTop + firstBadgeHeight + gap;
                const maxAllowedTop = secondRowTop + firstBadgeHeight; // End of second row

                for (let i = 0; i < badges.length; i++) {
                    const badge = badges[i];
                    if (!badge) continue; // Guard against undefined

                    const badgeTop = badge.offsetTop;
                    if (badgeTop < maxAllowedTop) {
                        maxVisibleCount = i + 1;
                    } else {
                        break;
                    }
                }

                // Reserve space for the +X badge if needed
                if (maxVisibleCount < sortedTechStack.length) {
                    const plusBadge = document.createElement('span');
                    plusBadge.className = 'px-2 py-1 text-xs font-mono bg-slate-800 text-slate-400 rounded border border-slate-700';
                    plusBadge.textContent = `+${sortedTechStack.length - maxVisibleCount}`;
                    plusBadge.style.whiteSpace = 'nowrap';

                    if (maxVisibleCount > 0) {
                        const lastVisibleBadge = badges[maxVisibleCount - 1];
                        if (lastVisibleBadge) {
                            tempContainer.removeChild(lastVisibleBadge);
                            tempContainer.appendChild(plusBadge);
                            void tempContainer.offsetHeight; // Force layout

                            const plusBadgeTop = plusBadge.offsetTop;
                            if (plusBadgeTop >= maxAllowedTop) {
                                maxVisibleCount = Math.max(1, maxVisibleCount - 1);
                            }
                        }
                    }
                }
            }

            document.body.removeChild(tempContainer);
            setVisibleCount(Math.max(1, maxVisibleCount));
        };

        calculateVisibleBadges();

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

interface ProjectGridProps {
    projects: ProjectData[];
    loading: boolean;
    error: string | null;
    onSelect: (project: ProjectData) => void;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects, loading, error, onSelect }) => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    return (
        <>
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
                        <ProjectCard
                            key={index}
                            project={project}
                            index={index}
                            hoveredId={hoveredId}
                            onHover={setHoveredId}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </>
    );
};

export default ProjectGrid;
