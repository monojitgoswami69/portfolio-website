import { memo } from 'react';
import { Github } from '@/lib/icons';
import ProjectCard from './ProjectCard';
import { ProjectData } from './projectUtils';

interface ProjectGridProps {
    projects: ProjectData[];
    onSelect: (project: ProjectData) => void;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects, onSelect }) => {

    return (
        <>
            {/* No Projects Fallback */}
            {projects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <p className="text-slate-400 text-lg mb-6 font-mono">
                        No projects featured at the moment.
                    </p>
                    <a
                        href="https://github.com/monojitgoswami69"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#88c0d0] border-2 border-transparent text-[#1b2234] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none active:transition-none transition-all duration-200 font-mono group font-bold"
                    >
                        Visit GitHub to explore <Github size={18} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
            )}

            {/* Projects Grid */}
            {projects.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                    {projects.map((project, index) => (
                        <ProjectCard
                            key={project.id ?? `${project.name}-${index}`}
                            project={project}
                            index={index}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </>
    );
};

export default memo(ProjectGrid);
