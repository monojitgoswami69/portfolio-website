import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Monitor, Code, Terminal, Layers } from 'lucide-react';

interface Metric {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
}

const metrics: Metric[] = [
  {
    label: 'OS',
    value: 'Arch Linux',
    icon: Monitor,
    color: '#00FFFF',
    glowColor: 'rgba(0, 255, 255, 0.5)'
  },
  {
    label: 'Kernel',
    value: 'linux stable',
    icon: Monitor,
    color: '#00FFFF',
    glowColor: 'rgba(0, 255, 255, 0.5)'
  },
  {
    label: 'DE',
    value: 'hyprland',
    icon: Monitor,
    color: '#00FFFF',
    glowColor: 'rgba(0, 255, 255, 0.5)'
  },
  {
    label: 'IDE',
    value: 'VS Code',
    icon: Code,
    color: '#00FFFF',
    glowColor: 'rgba(0, 255, 255, 0.5)'
  },
  {
    label: 'Editor',
    value: 'Vim',
    icon: Code,
    color: '#00FFFF',
    glowColor: 'rgba(0, 255, 255, 0.5)'
  },
  {
    label: 'Terminal',
    value: 'kitty',
    icon: Terminal,
    color: '#00FFFF',
    glowColor: 'rgba(0, 255, 255, 0.5)'
  },
  {
    label: 'Shell',
    value: 'fish',
    icon: Terminal,
    color: '#00FFFF',
    glowColor: 'rgba(0, 255, 255, 0.5)'
  }
];

const SystemMetrics: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section 
      id="system-metrics" 
      ref={ref} 
      className="pb-20 relative z-10 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Metrics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="relative group"
        >
          {/* Single Card Background */}
          <div className="relative rounded-xl border border-slate-700/50 bg-slate-900/30 backdrop-blur-sm p-4">
            {/* All metrics in a single row */}
            <div className="flex items-stretch divide-x divide-slate-700/30">
              {metrics.map((metric, index) => {
                
                return (
                  <div
                    key={metric.label}
                    className="flex-1 px-6 first:pl-0 last:pr-0"
                  >
                    {/* Label */}
                    <div className="mb-0">
                      <span className="font-mono text-xs text-slate-400 tracking-wider uppercase">
                        {metric.label}
                      </span>
                    </div>

                    {/* Value */}
                    <div >
                      <span className="font-mono text-sm text-cyan-400">
                        {metric.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subtle grid lines for tech aesthetic */}
            <div className="absolute inset-0 pointer-events-none opacity-5 rounded-xl overflow-hidden">
              <div className="h-full w-full" 
                style={{
                  backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 255, 0.05) 25%, rgba(0, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.05) 75%, rgba(0, 255, 255, 0.05) 76%, transparent 77%, transparent)',
                  backgroundSize: '50px 50px'
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SystemMetrics;
