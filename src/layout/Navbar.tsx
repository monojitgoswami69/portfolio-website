import { useState, useEffect } from 'react';
import { ChevronsDown, Code2, Terminal, Cpu, MessageSquare, Mail } from 'lucide-react';
import { Section } from '../types/global.d';

interface NavbarProps {
    activeSection: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { id: Section.HERO, label: '01. // SYSTEM', icon: <Terminal size={16} /> },
        { id: Section.SKILLS, label: '02. // SPECS', icon: <Cpu size={16} /> },
        { id: Section.PROJECTS, label: '03. // MODULES', icon: <Code2 size={16} /> },
        { id: Section.CHAT, label: '04. // NEXUS', icon: <MessageSquare size={16} /> },
        { id: Section.CONTACT, label: '05. // SIGNAL', icon: <Mail size={16} /> },
    ];

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const elementPosition = element.getBoundingClientRect().top;

            // Add intentional offset for Skills section (only for PC layout)
            const isDesktop = window.innerWidth >= 768;
            const extraOffset = (id === Section.SKILLS && isDesktop) ? 50 : 0;
            const offsetPosition = elementPosition + window.pageYOffset - 85 - extraOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
            setIsOpen(false);
        }
    };

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/95 backdrop-blur-md' : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between md:justify-center h-16">

                    {/* Mobile Navigation - Content on blurred container */}
                    <div className="flex md:hidden w-full">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-full flex items-center justify-center px-4 py-2 font-mono text-sm transition-all duration-300 relative"
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
                        <div className="flex items-center space-x-8">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`group flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium font-mono transition-colors duration-300 ${activeSection === item.id
                                        ? 'text-cyan-400 bg-cyan-400/10'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span className="inline-flex items-center opacity-50 group-hover:opacity-100 transition-opacity" style={{ marginBottom: '1px' }}>{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Gradient fade overlay below navbar for smooth content transition */}
            <div
                className={`absolute left-0 right-0 top-full h-4 pointer-events-none transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    background: 'linear-gradient(to bottom, rgba(2, 6, 23, 0.7) 0%, transparent 100%)'
                }}
            />

            {/* Mobile dropdown menu */}
            <div
                className={`md:hidden absolute top-16 left-0 right-0 overflow-hidden transition-all duration-300 rounded-b-lg backdrop-blur-md ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                style={{
                    backgroundColor: 'rgba(2, 6, 23, 0.95)'
                }}
            >
                <div className="px-4 py-2 space-y-1 max-w-7xl mx-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium font-mono transition-all duration-200 ${activeSection === item.id
                                ? 'text-cyan-400 bg-cyan-400/10'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            <span className={activeSection === item.id ? 'text-cyan-400' : 'text-slate-400'}>
                                {item.icon}
                            </span>
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
