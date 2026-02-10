
import { motion } from 'framer-motion';

// Grid configuration
const GRID_CELL_SIZE = 40;
const GRID_STROKE_WIDTH = 0.5;
const GRID_OPACITY_CLASS = 'opacity-20';

// Floating orb configuration
const CYAN_ORB_SIZE = 'w-64 h-64';
const CYAN_ORB_BLUR = 'blur-[100px]';
const CYAN_ORB_OPACITY = 'opacity-10';
const CYAN_ORB_DURATION = 20;

const PURPLE_ORB_SIZE = 'w-96 h-96';
const PURPLE_ORB_BLUR = 'blur-[120px]';
const PURPLE_ORB_OPACITY = 'opacity-10';
const PURPLE_ORB_DURATION = 25;

const BackgroundGrid: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 opacity-90 z-10" />

      {/* Grid Lines */}
      <div className={`absolute inset-0 z-0 ${GRID_OPACITY_CLASS}`}>
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width={GRID_CELL_SIZE} height={GRID_CELL_SIZE} patternUnits="userSpaceOnUse">
              <path d={`M ${GRID_CELL_SIZE} 0 L 0 0 0 ${GRID_CELL_SIZE}`} fill="none" stroke="cyan" strokeWidth={GRID_STROKE_WIDTH} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating Particles/Code Fragments */}
      <motion.div
        className={`absolute top-1/4 left-1/4 ${CYAN_ORB_SIZE} bg-cyan-500 rounded-full mix-blend-screen filter ${CYAN_ORB_BLUR} ${CYAN_ORB_OPACITY}`}
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -50, 50, 0],
        }}
        transition={{
          duration: CYAN_ORB_DURATION,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className={`absolute bottom-1/3 right-1/4 ${PURPLE_ORB_SIZE} bg-purple-600 rounded-full mix-blend-screen filter ${PURPLE_ORB_BLUR} ${PURPLE_ORB_OPACITY}`}
        animate={{
          x: [0, -70, 70, 0],
          y: [0, 70, -70, 0],
        }}
        transition={{
          duration: PURPLE_ORB_DURATION,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
};

export default BackgroundGrid;