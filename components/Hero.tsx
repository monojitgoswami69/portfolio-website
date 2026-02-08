import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Section } from '../types';

const Hero: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section id={Section.HERO} ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden" style={{ position: 'relative' }}>

      {/* Background Elements */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 flex items-center justify-center opacity-10">
        <div className="relative w-[800px] h-[800px] border border-slate-700 rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute w-[600px] h-[600px] border border-dashed border-cyan-900 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
        <div className="absolute w-[400px] h-[400px] border border-slate-700 rounded-full animate-[spin_20s_linear_infinite]" />
      </motion.div>

      <motion.div
        style={{ y: yText, opacity }}
        className="relative z-10 text-center px-4 max-w-5xl mx-auto"
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-cyan-400 font-averia text-xl md:text-3xl tracking-wider mb-4"
        >
          1.0 // MONOJIT GOSWAMI
        </motion.h2>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter text-white mb-6 mix-blend-overlay"
          style={{ fontFamily: "'Quantico', sans-serif" }}
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
          className="text-slate-400 text-lg md:text-2xl font-light max-w-2xl mx-auto leading-relaxed"
        >
          Self-taught Backend Developer specializing in RAG-based systems and high-performance Machine Learning pipelines.
        </motion.p>


      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-0 right-0 flex justify-center z-20"
      >
        <a
          href={`#${Section.SKILLS}`}
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