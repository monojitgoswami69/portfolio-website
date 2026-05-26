import { useState } from 'react';
import { ChevronsDown, Code2, Terminal, Cpu, MessageSquare, Mail } from 'lucide-react';
import { useLenis } from 'lenis/react';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeSection } from './types';

interface NavbarProps {
    activeSection: HomeSection;
    onSectionChange: (section: HomeSection) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection, onSectionChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const lenis = useLenis();

    const navItems = [
        { id: HomeSection.HERO, label: '01. // SYSTEM', icon: <Terminal size={16} /> },
        { id: HomeSection.SKILLS, label: '02. // SPECS', icon: <Cpu size={16} /> },
        { id: HomeSection.PROJECTS, label: '03. // MODULES', icon: <Code2 size={16} /> },
        { id: HomeSection.CHAT, label: '04. // NEXUS', icon: <MessageSquare size={16} /> },
        { id: HomeSection.CONTACT, label: '05. // SIGNAL', icon: <Mail size={16} /> },
    ];

    const handleNavClick = (sectionId: HomeSection) => () => {
        const wasOpen = isOpen;
        setIsOpen(false);

        // Mute the IntersectionObserver during programmatically triggered scrolling
        if (typeof window !== "undefined") {
            (window as Window & typeof globalThis & { isProgrammaticScroll?: boolean }).isProgrammaticScroll = true;
        }

        // Set the active section immediately in the parent state for responsive pill translation
        onSectionChange(sectionId);

        const target = document.getElementById(sectionId);
        if (target) {
            const clearScrollMute = () => {
                setTimeout(() => {
                    if (typeof window !== "undefined") {
                        (window as Window & typeof globalThis & { isProgrammaticScroll?: boolean }).isProgrammaticScroll = false;
                    }
                }, 100);
            };

            const triggerScroll = () => {
                if (lenis) {
                    if (sectionId === HomeSection.HERO) {
                        lenis.scrollTo('top', {
                            duration: 1.5,
                            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                            onComplete: clearScrollMute
                        });
                    } else if (sectionId === HomeSection.CONTACT) {
                        lenis.scrollTo('bottom', {
                            duration: 1.5,
                            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                            onComplete: clearScrollMute
                        });
                    } else {
                        // Offset is 0 by default, but applying a +12px offset specifically for the SKILLS section.
                        lenis.scrollTo(target, {
                            offset: sectionId === HomeSection.SKILLS ? 12 : 0,
                            duration: 1.5,
                            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                            onComplete: clearScrollMute
                        });
                    }
                } else {
                    const block = sectionId === HomeSection.CONTACT ? 'end' : 'start';
                    target.scrollIntoView({ behavior: 'smooth', block });
                    setTimeout(clearScrollMute, 1000);
                }
            };

            // Delay scroll animation when mobile menu is open to let layout collapse finish first,
            // avoiding scroll target offset calculation errors due to the in-flow layout shift.
            if (wasOpen) {
                setTimeout(triggerScroll, 250);
            } else {
                triggerScroll();
            }
        } else {
            if (typeof window !== "undefined") {
                (window as Window & typeof globalThis & { isProgrammaticScroll?: boolean }).isProgrammaticScroll = false;
            }
        }

        if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
        }
    };

    return (
        <nav className="fixed top-0 w-full z-50 border-b-2 border-[#2d2754] bg-[#080315]">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between md:justify-center h-16">

                    {/* Mobile Navigation */}
                    <div className="flex md:hidden w-full">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-full flex items-center justify-center px-4 py-2 font-mono text-sm transition-all duration-200 relative"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400">
                                    {navItems.find(item => item.id === activeSection)?.icon}
                                </span>
                                <span className="text-cyan-400 font-medium">
                                    {navItems.find(item => item.id === activeSection)?.label}
                                </span>
                            </div>
                            <ChevronsDown
                                size={20}
                                className={`text-slate-400 transition-transform duration-300 absolute right-4 ${isOpen ? 'rotate-180' : ''}`}
                            />
                        </button>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="flex items-center space-x-1 relative">
                            {navItems.map((item) => {
                                const isActive = activeSection === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={handleNavClick(item.id)}
                                        aria-current={isActive ? 'page' : undefined}
                                        className="relative group flex items-center gap-2 px-3.5 py-2 text-sm font-medium font-mono transition-colors duration-300 cursor-pointer"
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="navbar-active-pill"
                                                className="absolute inset-0 bg-cyan-400 border border-[#2d2754] z-0 rounded-sm"
                                                transition={{ type: "spring", stiffness: 350, damping: 26 }}
                                            />
                                        )}
                                        <span className={`relative z-10 inline-flex items-center transition-colors duration-300 ${
                                            isActive ? 'text-[#020208] opacity-100' : 'text-slate-400 opacity-50 group-hover:opacity-90 group-hover:text-white'
                                        }`}>
                                            {item.icon}
                                        </span>
                                        <span className={`relative z-10 transition-colors duration-300 ${
                                            isActive ? 'text-[#020208] font-bold' : 'text-slate-400 group-hover:text-white'
                                        }`}>
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile dropdown menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="md:hidden overflow-hidden border-t-2 border-[#2d2754]"
                    >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-1">
                            {navItems.map((item) => {
                                const isActive = activeSection === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={handleNavClick(item.id)}
                                        aria-current={isActive ? 'page' : undefined}
                                        className={`w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-medium font-mono transition-colors duration-200 ${
                                            isActive
                                                ? 'bg-cyan-400 text-[#020208] font-bold'
                                                : 'text-slate-300 hover:bg-[#110e24] hover:text-white'
                                        }`}
                                    >
                                        <span className={isActive ? 'text-[#020208]' : 'text-slate-400'}>
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
