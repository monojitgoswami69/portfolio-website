import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectGrid from './ProjectGrid';
import { ProjectData } from './projectUtils';
import ProjectModal from './ProjectModal';
import { HomeSection } from '../../types';

interface ProjectsProps {
    projects: ProjectData[];
}

const Projects: React.FC<ProjectsProps> = ({ projects }) => {
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

    const sortedProjects = useMemo(() => {
        return [...projects].sort((a, b) => {
            const aFeatured = !!a.featured;
            const bFeatured = !!b.featured;
            if (aFeatured && !bFeatured) return -1;
            if (!aFeatured && bFeatured) return 1;
            return 0;
        });
    }, [projects]);

    return (
        <>
            <section id={HomeSection.PROJECTS} className="pb-10 lg:pb-20 relative z-10 overflow-hidden scroll-mt-[85px]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="mb-8"
                    >
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 font-quantico text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                            3.0 // ACTIVE MODULES
                        </h2>
                        <p className="text-slate-400 text-xs sm:text-sm md:text-base mb-6 font-mono uppercase tracking-widest">
                            Explore Monojit&apos;s Projects &amp; Innovations
                        </p>
                    </motion.div>

                    <ProjectGrid
                        projects={sortedProjects}
                        onSelect={setSelectedProject}
                    />
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
