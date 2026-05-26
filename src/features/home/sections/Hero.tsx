import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { HomeSection } from '../types';

const Hero: React.FC = () => {
    return (
        <section id={HomeSection.HERO} className="relative h-[100svh] md:h-screen flex items-center justify-center overflow-hidden" style={{ position: 'relative' }}>

            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">


                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-cyan-400 font-quantico text-xl md:text-3xl tracking-wider mb-4"
                >
                    1.0 // MONOJIT GOSWAMI
                </motion.h2>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter text-white mb-6 font-quantico"
                >
                    ARCHITECT
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 animate-gradient bg-300%">
                        OF AGENTIC AI
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-slate-400 text-lg md:text-2xl font-mono max-w-2xl mx-auto leading-relaxed mb-10"
                >
                    Self-taught Backend Developer specializing in RAG based systems and high-performance Machine Learning pipelines.
                </motion.p>


            </div>

            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-10 left-0 right-0 flex justify-center z-20"
            >
                <a
                    href={`#${HomeSection.SKILLS}`}
                    className="text-slate-500 hover:text-cyan-400 transition-colors duration-300 cursor-pointer p-2"
                    aria-label="Scroll to Skills"
                >
                    <ChevronDown size={32} />
                </a>
            </motion.div>
        </section>
    );
};

export default Hero;
