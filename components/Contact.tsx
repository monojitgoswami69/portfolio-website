import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Mail, Linkedin, Github, Twitter, ChevronUp } from 'lucide-react';
import { Section } from '../types';

const Contact: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  const scrollToChat = () => {
    const element = document.getElementById(Section.CHAT);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section ref={ref} className="min-h-screen relative z-20 bg-slate-950 flex flex-col justify-center overflow-hidden pt-24">
      {/* Upward Arrow at Top */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-20 left-0 right-0 flex justify-center z-20"
      >
        <button
          onClick={scrollToChat}
          className="text-slate-500 hover:text-cyan-400 transition-colors duration-300 cursor-pointer p-2"
          aria-label="Scroll to Nexus"
        >
          <ChevronUp size={32} />
        </button>
      </motion.div>

      <motion.div 
        style={{ opacity }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <div id="contact" className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 scroll-mt-[136px]">

          {/* Left Column - Contact Info */}
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 font-averia text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              5.0 // ESTABLISH SIGNAL
            </h2>
            <p className="text-xs sm:text-sm md:text-base mb-4 lg:mb-6 font-mono uppercase tracking-widest text-slate-400">
              Connect & Collaborate
            </p>
            <p className="text-sm sm:text-base lg:text-lg mb-6 lg:mb-8 text-slate-400">
              Currently available for freelance projects and full-time opportunities.
              If you have an interesting proposition or just want to discuss the future of AI, send a transmission.
            </p>

            <div className="space-y-3 lg:space-y-4">
              <a href="mailto:contact@monojit.dev" className="flex items-center gap-3 lg:gap-4 text-slate-300 hover:text-cyan-400 transition-colors group">
                <div className="p-2 lg:p-3 bg-slate-900 border border-slate-800 rounded-lg group-hover:border-cyan-500/50 transition-colors">
                  <Mail size={20} className="lg:w-6 lg:h-6" />
                </div>
                <span className="font-mono text-sm lg:text-base">contact@monojit.dev</span>
              </a>
              <div className="flex gap-3 lg:gap-4 mt-6 lg:mt-8">
                {[Github, Linkedin, Twitter].map((Icon, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="p-2 lg:p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800 transition-all transform hover:scale-110"
                  >
                    <Icon size={20} className="lg:w-6 lg:h-6" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div>
            <form className="space-y-3 lg:space-y-4">
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div className="space-y-1 lg:space-y-2">
                  <label className="text-xs lg:text-sm font-mono text-slate-500">USER_ID</label>
                  <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 lg:p-3 text-sm lg:text-base text-white focus:border-cyan-500 outline-none transition-colors" placeholder="Name" />
                </div>
                <div className="space-y-1 lg:space-y-2">
                  <label className="text-xs lg:text-sm font-mono text-slate-500">RETURN_ADDRESS</label>
                  <input type="email" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 lg:p-3 text-sm lg:text-base text-white focus:border-cyan-500 outline-none transition-colors" placeholder="Email" />
                </div>
              </div>
              <div className="space-y-1 lg:space-y-2">
                <label className="text-xs lg:text-sm font-mono text-slate-500">PAYLOAD</label>
                <textarea rows={3} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 lg:p-3 text-sm lg:text-base text-white focus:border-cyan-500 outline-none transition-colors lg:rows-4" placeholder="Message..." />
              </div>
              <button className="w-full py-3 lg:py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-sm lg:text-base font-bold tracking-widest rounded-lg transition-colors font-mono uppercase relative overflow-hidden group">
                <span className="relative z-10">Transmit Data</span>
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
              </button>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Footer - Absolutely positioned at bottom */}
      <div className="absolute bottom-10 left-0 right-0 text-center text-slate-600 font-mono text-sm z-30">
        <p>
          &copy; 2026 Monojit Goswami. All Rights Reserved.
        </p>
      </div>
    </section>
  );
};

export default Contact;