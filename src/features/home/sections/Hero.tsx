import { motion } from '@/lib/motion';
import { ChevronDown } from 'lucide-react';
import { useLenis } from 'lenis/react';
import { HomeSection } from '../types';
import FuzzyText from './FuzzyText';

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


                <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter text-white mb-6 font-quantico">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="block text-[#88c0d0] font-quantico text-xl md:text-3xl tracking-wider mb-4"
                    >
                        1.0 // IDENTITY
                    </motion.span>

                    <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="flex flex-col items-center justify-center gap-4 md:gap-6 my-6 md:my-10 select-none font-averia"
                        style={{ fontFamily: 'var(--font-averia-serif-libre), serif' }}
                    >
                        <FuzzyText
                            fontSize="clamp(2.5rem, 8.5vw, 8.5rem)"
                            fontWeight={900}
                            fontFamily="inherit"
                            color="#ffffff"
                            enableHover={true}
                            baseIntensity={0.1}
                            hoverIntensity={0.26}
                            fuzzRange={20}
                            fps={120}
                            transitionDuration={0}
                            letterSpacing={0}
                            direction="horizontal"
                            clickEffect={true}
                            glitchMode={false}
                            glitchInterval={2500}
                            glitchDuration={100}
                        >
                            MONOJIT
                        </FuzzyText>
                        <FuzzyText
                            fontSize="clamp(2.5rem, 8.5vw, 8.5rem)"
                            fontWeight={900}
                            fontFamily="inherit"
                            gradient={["#88c0d0", "#b48ead", "#88c0d0"]}
                            enableHover={true}
                            baseIntensity={0.1}
                            hoverIntensity={0.26}
                            fuzzRange={20}
                            fps={120}
                            transitionDuration={0}
                            letterSpacing={0}
                            direction="horizontal"
                            clickEffect={true}
                            glitchMode={false}
                            glitchInterval={2500}
                            glitchDuration={100}
                        >
                            GOSWAMI
                        </FuzzyText>
                    </motion.span>
                </h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
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
