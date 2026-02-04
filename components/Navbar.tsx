import { useState, useEffect } from 'react';
import { Menu, X, Code2, Terminal, Cpu, MessageSquare, Mail } from 'lucide-react';
import { Section } from '../types';

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
    { id: Section.CHAT, label: '04. // AI_LINK', icon: <MessageSquare size={16} /> },
    { id: Section.CONTACT, label: '05. // SIGNAL', icon: <Mail size={16} /> },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-md' : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between md:justify-center h-16 relative">

          {/* Mobile Menu Button (Absolute positioned to stay left on mobile) */}
          <div className="flex md:hidden absolute left-0">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
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
        className="absolute left-0 right-0 top-full h-8 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(2, 6, 23, 0.8) 0%, rgba(2, 6, 23, 0.4) 50%, transparent 100%)'
        }}
      />

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-950">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="w-full text-left flex items-center gap-3 px-3 py-4 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 font-mono"
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;