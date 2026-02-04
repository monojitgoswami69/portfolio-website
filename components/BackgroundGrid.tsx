
import { motion } from 'framer-motion';

const BackgroundGrid: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 opacity-90 z-10" />

      {/* Grid Lines */}
      <div className="absolute inset-0 z-0 opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="cyan" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating Particles/Code Fragments */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10"
        animate={{
            x: [0, 50, -50, 0],
            y: [0, -50, 50, 0],
        }}
        transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
        }}
      />
       <motion.div 
        className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-10"
        animate={{
            x: [0, -70, 70, 0],
            y: [0, 70, -70, 0],
        }}
        transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
        }}
      />
    </div>
  );
};

export default BackgroundGrid;