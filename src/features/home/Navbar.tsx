import { useState } from 'react';
import { ChevronsDown, Code2, Terminal, Cpu, MessageSquare, Mail } from 'lucide-react';
import { useLenis } from 'lenis/react';
import { motion, AnimatePresence } from '@/lib/motion';
import { HomeSection } from './types';

interface NavbarProps {
    activeSection: HomeSection;
    onSectionChange: (section: HomeSection) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection, onSectionChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const lenis = useLenis();

    const navItems = [
        { id: HomeSection.HERO, label: '01. // IDENTITY', icon: <Terminal size={16} /> },
        { id: HomeSection.SKILLS, label: '02. // SPECS', icon: <Cpu size={16} /> },
        { id: HomeSection.PROJECTS, label: '03. // MODULES', icon: <Code2 size={16} /> },
        { id: HomeSection.CHAT, label: '04. // NEXUS', icon: <MessageSquare size={16} /> },
        { id: HomeSection.CONTACT, label: '05. // SIGNAL', icon: <Mail size={16} /> },
    ];

    const handleNavClick = (sectionId: HomeSection) => (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const wasOpen = isOpen;
        setIsOpen(false);

        onSectionChange(sectionId);

        const target = document.getElementById(sectionId);
        if (target) {
            const triggerScroll = () => {
                if (lenis) {
                    if (sectionId === HomeSection.HERO) {
                        lenis.scrollTo('top', {
                            duration: 1.5,
                            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                        });
                    } else if (sectionId === HomeSection.CONTACT) {
                        lenis.scrollTo('bottom', {
                            duration: 1.5,
                            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                        });
                    } else {
                        lenis.scrollTo(target, {
                            offset: sectionId === HomeSection.SKILLS ? 12 : 0,
                            duration: 1.5,
                            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                        });
                    }
                } else {
                    const block = sectionId === HomeSection.CONTACT ? 'end' : 'start';
                    target.scrollIntoView({ behavior: 'smooth', block });
                }
            };

            if (wasOpen) {
                setTimeout(triggerScroll, 250);
            } else {
                triggerScroll();
            }
        }

        if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
        }
    };

    return (
        <nav className="fixed top-0 w-full z-50 border-b-2 border-[var(--border-color)] bg-[color-mix(in_srgb,var(--bg-base)_90%,transparent)] backdrop-blur-2xl">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between md:justify-center h-16">

                    {/* Mobile Navigation */}
                    <div className="flex md:hidden w-full">
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-expanded={isOpen}
                            aria-controls="mobile-nav-menu"
                            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                            className="w-full flex items-center justify-center px-4 py-2 font-mono text-sm transition-all duration-200 relative cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400">
                                    {navItems.find(item => item.id === activeSection)?.icon}
                                </span>
                                <span className="text-[#88c0d0] font-medium">
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
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        onClick={handleNavClick(item.id)}
                                        aria-current={isActive ? 'page' : undefined}
                                        className="relative group flex items-center gap-2 px-3.5 py-2 text-sm font-medium font-mono transition-colors duration-300 cursor-pointer no-underline"
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="navbar-active-pill"
                                                className="absolute inset-0 bg-[var(--accent-main)] border border-[var(--border-color)] z-0 rounded-base"
                                                transition={{ type: "spring", stiffness: 350, damping: 26 }}
                                            />
                                        )}
                                        <span className={`relative z-10 inline-flex items-center transition-colors duration-300 ${
                                            isActive ? 'text-[var(--accent-main-fg)] opacity-100' : 'text-slate-400 opacity-50 group-hover:opacity-90 group-hover:text-white'
                                        }`}>
                                            {item.icon}
                                        </span>
                                        <span className={`relative z-10 transition-colors duration-300 ${
                                            isActive ? 'text-[var(--accent-main-fg)] font-bold' : 'text-slate-400 group-hover:text-white'
                                        }`}>
                                            {item.label}
                                        </span>
                                    </a>
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
                        className="md:hidden overflow-hidden border-t-2 border-[var(--border-color)]"
                        id="mobile-nav-menu"
                    >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-1">
                            {navItems.map((item) => {
                                const isActive = activeSection === item.id;
                                return (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        onClick={handleNavClick(item.id)}
                                        aria-current={isActive ? 'page' : undefined}
                                        className={`w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-medium font-mono transition-colors duration-200 no-underline ${
                                            isActive
                                                ? 'bg-[var(--accent-main)] text-[var(--accent-main-fg)] font-bold'
                                                : 'text-slate-300 hover:bg-[var(--bg-card-alt)] hover:text-white'
                                        }`}
                                    >
                                        <span className={isActive ? 'text-[var(--accent-main-fg)]' : 'text-slate-400'}>
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </a>
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
