import { motion } from '@/lib/motion';
import { ChevronDown } from 'lucide-react';
import { useLenis } from 'lenis/react';
import { HomeSection } from '../types';

interface HeroProps {
    onScrollToSkills: (section: HomeSection) => void;
}

const Hero: React.FC<HeroProps> = ({ onScrollToSkills }) => {
    const lenis = useLenis();

    const handleScrollToSkills = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const target = document.getElementById(HomeSection.SKILLS);
        if (target) {
            onScrollToSkills(HomeSection.SKILLS);

            if (lenis) {
                lenis.scrollTo(target, {
                    offset: 12,
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                });
            } else {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    return (
        <section id={HomeSection.HERO} className="relative h-[100svh] md:h-screen flex items-center justify-center overflow-hidden pt-16">

            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">


                <h1 className="flex flex-col items-center justify-center text-center mb-6">
                    <span className="block text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 font-quantico text-transparent bg-clip-text bg-gradient-to-r from-[#88c0d0] to-[#b48ead]">
                        1.0 // IDENTITY
                    </span>
                    <span 
                        className="block font-black leading-none text-white tracking-wide uppercase"
                        style={{ fontSize: 'clamp(3.6rem, 10vw, 8.5rem)', fontFamily: 'var(--font-averia-serif-libre), serif' }}
                    >
                        MONOJIT
                    </span>
                    <span 
                        className="block font-black leading-none bg-gradient-to-r from-[#88c0d0] via-[#b48ead] to-[#88c0d0] bg-clip-text text-transparent tracking-wide uppercase mt-0"
                        style={{ fontSize: 'clamp(3.6rem, 10vw, 8.5rem)', fontFamily: 'var(--font-averia-serif-libre), serif' }}
                    >
                        GOSWAMI
                    </span>
                </h1>

                <p className="text-slate-400 text-lg md:text-2xl font-mono max-w-2xl mx-auto leading-relaxed mb-10">
                    Self-taught Backend Developer specializing in RAG based systems and high-performance Machine Learning pipelines.
                </p>


            </div>

            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-10 left-0 right-0 flex justify-center z-20"
            >
                <a
                    href={`#${HomeSection.SKILLS}`}
                    onClick={handleScrollToSkills}
                    className="text-slate-500 hover:text-[#88c0d0] transition-colors duration-300 cursor-pointer p-2"
                    aria-label="Scroll to Skills"
                >
                    <ChevronDown size={32} />
                </a>
            </motion.div>
        </section>
    );
};

export default Hero;
