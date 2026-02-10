import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectGrid from './ProjectGrid';
import { ProjectData } from './projectUtils';
import ProjectModal from './ProjectModal';
import projectsData from '../../data/projects.json';

const Projects: React.FC = () => {
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

    useEffect(() => {
        try {
            // Validate data shape
            if (!Array.isArray(projectsData)) {
                throw new Error('Invalid project data format');
            }

            const data = projectsData as ProjectData[];

            // Sort projects: featured projects first
            const sortedData = [...data].sort((a, b) => {
                const aFeatured = !!a.featured;
                const bFeatured = !!b.featured;
                if (aFeatured && !bFeatured) return -1;
                if (!aFeatured && bFeatured) return 1;
                return 0;
            });
            setProjects(sortedData);
            setLoading(false);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load projects');
            setLoading(false);
        }
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
                            Explore Monojit's Projects &amp; Innovations
                        </p>
                    </motion.div>

                    <ProjectGrid
                        projects={projects}
                        loading={loading}
                        error={error}
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
