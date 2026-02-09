import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { sendMessage, initializeSession } from '../services/chatService';

const MAX_MESSAGE_LENGTH = 1000;

const ROAST_OPTIONS = ['DEFAULT', 'SPICY', 'NO-MERCY'];
const ROAST_DESCRIPTIONS = [
  'default roast mode',
  'added spice and violence',
  'self-explainatory.. try at your own risk.'
];

const COMMANDS = [
  'help', 'clear', 'cls', 'whoami', 'projects', 'contact',
  'neofetch', 'matrix', 'escape-the-matrix', 'roast-level', 'exit'
];

const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const columns = Math.floor(width / 20);
    const drops: number[] = new Array(columns).fill(1);

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$@#%&*^";

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#0F0";
      ctx.font = "15px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-80 z-0"
    />
  );
};

const AIChat: React.FC = () => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [hasBooted, setHasBooted] = useState(false);
  const [hasInitFailed, setHasInitFailed] = useState(false);
  const [isMatrixActive, setIsMatrixActive] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interactive Menu State
  const [activeMenu, setActiveMenu] = useState<'roast' | null>(null);
  const [menuSelectedIndex, setMenuSelectedIndex] = useState(0);
  const [roastLevel, setRoastLevel] = useState('DEFAULT');

  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [sessionInfo, setSessionInfo] = useState<{ userRequestsLeft: string; globalRequestsLeft: string } | null>(null);
  const [projects, setProjects] = useState<Array<{ name: string; description: string }>>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Boot sequence logic
  useEffect(() => {
    if (hasBooted || isBooting) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          runBootSequence();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (terminalRef.current) {
      observer.observe(terminalRef.current);
    }

    return () => observer.disconnect();
  }, [hasBooted, isBooting]);

  // Load projects data
  useEffect(() => {
    fetch('/data/projects.json')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error('Failed to load projects:', err));
  }, []);

  const runBootSequence = async () => {
    setIsBooting(true);

    // Initialize session immediately to get user ID
    const initData = await initializeSession();

    const steps = [
      { text: "beginning startup sequence...", delay: 1000 },
      { text: "accessing user profile...", delay: 700 }
    ];

    if (initData) {
      steps[1].text = `accessing user profile: ${initData.userId}...`;
    }

    steps.push({ text: "starting nexus kernel...", delay: 500 });

    for (const step of steps) {
      setHistory(prev => [...prev, {
        role: 'model',
        text: step.text,
        timestamp: new Date(),
        isSystem: true
      }]);
      await new Promise(resolve => setTimeout(resolve, step.delay));
    }

    if (initData) {
      setSessionInfo({
        userRequestsLeft: initData.userRequestsLeft,
        globalRequestsLeft: initData.globalRequestsLeft
      });

      // Clear history (buffer) before printing initialized
      setHistory([{
        role: 'model',
        text: "# NEXUS v2.5.0 INITIALIZED...\n\nType `help` for available commands or ask anything about the portfolio (dare to be roasted)",
        timestamp: new Date(),
        isSuccess: true
      }]);

      // Check if user is already rate limited
      const userRemaining = parseInt(initData.userRequestsLeft.split('/')[0]);
      const globalRemaining = parseInt(initData.globalRequestsLeft.split('/')[0]);

      if (userRemaining === 0 || globalRemaining === 0) {
        const limitType = userRemaining === 0 ? 'user request limit reached (50/day)' : 'global request limit reached (1,000/day)';
        setIsRateLimited(true);

        // Format reset time
        const resetAt = initData.resetAt ? new Date(initData.resetAt).toLocaleString(undefined, {
          weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : '00:00 UTC';

        // Add rate limit message as a separate error message
        setTimeout(() => {
          setHistory(prev => [...prev, {
            role: 'model',
            text: `\`ACCESS RESTRICTED\`\n\n${limitType}.\n\nresets at \`${resetAt}\`\n\n## ENTERING COMMAND-ONLY MODE`,
            timestamp: new Date(),
            isError: true
          }]);
        }, 100);
      }
    } else {
      setHasInitFailed(true);
      setHistory([{
        role: 'model',
        text: "# NEXUS v2.5.0 FAILED TO INITIALIZE\n\ncheck back later or contact at [monojitgoswami.dev@gmail.com](mailto:monojitgoswami.dev@gmail.com) for support",
        timestamp: new Date(),
        isError: true,
        isSystem: true
      }]);
    }

    setIsBooting(false);
    setHasBooted(true);
  };

  const handleReconnect = () => {
    setIsTerminated(false);
    setHasBooted(false);
    setHistory([]);
    runBootSequence();
  };

  // Sync menu index to history
  useEffect(() => {
    if (activeMenu) {
      setHistory(prev => {
        const newHistory = [...prev];
        const last = newHistory[newHistory.length - 1];
        if (last && last.isMenu) {
          newHistory[newHistory.length - 1] = { ...last, selectedIndex: menuSelectedIndex };
          return newHistory;
        }
        return prev;
      });
    }
  }, [menuSelectedIndex, activeMenu]);

  // Global Keydown for Menu Navigation
  useEffect(() => {
    if (!activeMenu) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const options = ROAST_OPTIONS;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMenuSelectedIndex(prev => (prev - 1 + options.length) % options.length);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMenuSelectedIndex(prev => (prev + 1) % options.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = options[menuSelectedIndex];
        setRoastLevel(selected);
        setHistory(prev => [...prev, {
          role: 'model',
          text: `Roast level set to **${selected}**.`,
          timestamp: new Date(),
          isSuccess: true
        }]);
        setActiveMenu(null);
        // Re-focus terminal input after selection
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (e.key === 'Escape') {
        setActiveMenu(null);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeMenu, menuSelectedIndex]);

  // Parallax fade-out effect as you scroll past this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isLoading]);

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex = historyIndex + 1;
        if (nextIndex < commandHistory.length) {
          setHistoryIndex(nextIndex);
          setInput(commandHistory[commandHistory.length - 1 - nextIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(commandHistory[commandHistory.length - 1 - nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const currentInput = input.trim().toLowerCase();
      if (!currentInput) return;
      const matches = COMMANDS.filter(c => c.startsWith(currentInput));
      if (matches.length > 0) {
        setInput(matches[0]);
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd || isLoading) return;

    if (cmd.length > MAX_MESSAGE_LENGTH) {
      setError(`Message too long (max ${MAX_MESSAGE_LENGTH} characters)`);
      return;
    }

    const userMsg: ChatMessage = { role: 'user', text: cmd, timestamp: new Date() };

    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    setIsLoading(true);
    setError(null);

    const lowerCmd = cmd.toLowerCase();

    if (lowerCmd === 'clear' || lowerCmd === 'cls') {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    if (lowerCmd === 'help') {
      const helpMsg: ChatMessage = {
        role: 'model',
        text: "## AVAILABLE COMMANDS:\n\n- `help` : Show this help message\n- `clear` : Clear terminal output\n- `whoami` : Display current user info\n- `projects` : List active modules\n- `contact` : Display communication channels\n- `neofetch` : Display system information\n- `matrix` : Toggle digital rain effect\n- `roast-level` : Set AI personality intensity\n- `exit` : Terminate current session",
        timestamp: new Date()
      };
      setHistory(prev => [...prev, helpMsg]);
      setIsLoading(false);
      return;
    }

    if (lowerCmd === 'matrix') {
      if (isMatrixActive) {
        const matrixMsg: ChatMessage = {
          role: 'model',
          text: "Already in the matrix.",
          subtext: "type escape-the-matrix to return to reality",
          timestamp: new Date()
        };
        setHistory(prev => [...prev, matrixMsg]);
        setIsLoading(false);
        return;
      }
      setIsMatrixActive(true);
      const matrixMsg: ChatMessage = {
        role: 'model',
        text: "Entering the matrix...",
        subtext: "type escape-the-matrix to return to reality",
        timestamp: new Date()
      };
      setHistory(prev => [...prev, matrixMsg]);
      setIsLoading(false);
      return;
    }

    if (lowerCmd === 'escape-the-matrix') {
      setIsMatrixActive(false);
      const escapeMsg: ChatMessage = {
        role: 'model',
        text: "Escaped the matrix.",
        timestamp: new Date(),
        isSuccess: true
      };
      setHistory(prev => [...prev, escapeMsg]);
      setIsLoading(false);
      return;
    }

    if (lowerCmd === 'exit') {
      setIsLoading(false);
      setIsTerminated(true);
      return;
    }

    if (lowerCmd === 'roast' || lowerCmd === 'roast-level' || lowerCmd === 'roast level') {
      const idx = ROAST_OPTIONS.indexOf(roastLevel);
      setMenuSelectedIndex(idx !== -1 ? idx : 0);
      setActiveMenu('roast');
      setHistory(prev => [...prev, {
        role: 'model',
        text: "Select Roast Intensity:",
        timestamp: new Date(),
        isMenu: true,
        menuOptions: ROAST_OPTIONS,
        menuOptionDescriptions: ROAST_DESCRIPTIONS,
        selectedIndex: idx !== -1 ? idx : 0
      }]);
      setIsLoading(false);
      return;
    }

    if (lowerCmd === 'whoami') {
      const storedUid = sessionStorage.getItem('nexus_user_id') || 'GUEST_USER';
      const userRem = sessionStorage.getItem('nexus_user_requests') || 'N/A';
      const globalRem = sessionStorage.getItem('nexus_global_requests') || 'N/A';

      const whoMsg: ChatMessage = {
        role: 'model',
        text: `## USER IDENTITY:\n\n- **ID**: \`${storedUid}\`\n- **Privileges**: \`READ_ONLY\`\n- **Session**: \`ACTIVE\`\n- **User Requests Left**: \`${userRem}\`\n- **Global Requests Left**: \`${globalRem}\``,
        timestamp: new Date()
      };
      setHistory(prev => [...prev, whoMsg]);
      setIsLoading(false);
      return;
    }

    if (lowerCmd === 'contact') {
      const contactMsg: ChatMessage = {
        role: 'model',
        text: "## ESTABLISHING SIGNAL...\n\n- **Email**: [monojitgoswami.dev@gmail.com](mailto:monojitgoswami.dev@gmail.com)\n- **GitHub**: [github.com/monojitgoswami69](https://github.com/monojitgoswami69)\n- **LinkedIn**: [linkedin.com/in/monojitgoswami69](https://linkedin.com/in/monojitgoswami69)\n- **Twitter**: [twitter.com/monojitgoswami9](https://twitter.com/monojitgoswami9)",
        timestamp: new Date()
      };
      setHistory(prev => [...prev, contactMsg]);
      setIsLoading(false);
      return;
    }

    if (lowerCmd === 'projects') {
      const projectsList = projects.map(p => `- **${p.name}**: ${p.description}`).join('\n');
      const projMsg: ChatMessage = {
        role: 'model',
        text: `## ACTIVE MODULES:\n\n${projectsList || 'Loading projects...'}\n\nType \`Tell me more about [Project Name]\` for details.`,
        timestamp: new Date()
      };
      setHistory(prev => [...prev, projMsg]);
      setIsLoading(false);
      return;
    }

    if (lowerCmd === 'neofetch') {
      const birthDate = new Date(2006, 4, 9); // May 9, 2006
      const now = new Date();
      let years = now.getFullYear() - birthDate.getFullYear();
      let months = now.getMonth() - birthDate.getMonth();
      if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
        years--;
        months += 12;
      }
      const uptime = `${years} years, ${months} months`;

      const fetchMsg: ChatMessage = {
        role: 'model',
        text:
          " ██████   ██████   █████████     OS: monojit goswami\n" +
          "▒▒██████ ██████   ███▒▒▒▒▒███    Host: portfolio\n" +
          " ▒███▒█████▒███  ███     ▒▒▒     Kernel: nexus v2.5.1\n" +
          " ▒███▒▒███ ▒███ ▒███             Uptime: " + uptime + "\n" +
          " ▒███ ▒▒▒  ▒███ ▒███    █████    Shell: homo sapiens\n" +
          " ▒███      ▒███ ▒▒███  ▒▒███     Resolution: " + window.innerWidth + "x" + window.innerHeight + "\n" +
          " █████     █████ ▒▒█████████     DE: Framer-Motion-Dynamic\n" +
          "▒▒▒▒▒     ▒▒▒▒▒   ▒▒▒▒▒▒▒▒▒      WM: Tailwind-Static",
        timestamp: new Date(),
        isNeofetch: true
      };
      setHistory(prev => [...prev, fetchMsg]);
      setIsLoading(false);
      return;
    }

    // If rate limited and command not recognized, show error
    if (isRateLimited) {
      const firstWord = cmd.split(/\s+/)[0];
      const notFoundMsg: ChatMessage = {
        role: 'model',
        text: `command "${firstWord}" not found`,
        timestamp: new Date(),
        isError: true
      };
      setHistory(prev => [...prev, notFoundMsg]);
      setIsLoading(false);
      return;
    }

    sendMessage(
      cmd,
      (response: string) => {
        const botMsg: ChatMessage = {
          role: 'model',
          text: response,
          timestamp: new Date()
        };
        setHistory(prev => [...prev, botMsg]);
      },
      () => {
        setIsLoading(false);
      },
      (err: Error) => {
        const errorMessage = err.message;
        if (errorMessage.startsWith('RATE_LIMIT_ERROR:')) {
          const parts = errorMessage.split('\n\nRESETS IN: ');
          const limitDetails = parts[0].replace('RATE_LIMIT_ERROR: ', '');
          const resetDetails = parts[1] || '';
          const timeMatch = resetDetails.match(/(.*) \((.*)\)/);
          const timeAt = timeMatch ? timeMatch[2].replace(/^at\s+/, '') : '';

          let displayLimit = limitDetails;
          if (limitDetails.includes('Global')) displayLimit = 'global request limit reached (1,000/day)';
          else displayLimit = 'user request limit reached (50/day)';

          const formattedError = `\`ACCESS RESTRICTED\`\n\n${displayLimit}.\n\nresets at \`${timeAt}\`\n\n## ENTERING COMMAND-ONLY MODE`;

          setIsRateLimited(true);
          setHistory(prev => [...prev, {
            role: 'model',
            text: formattedError,
            timestamp: new Date(),
            isError: true
          }]);
        } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
          setError("NETWORK ERROR: Unable to connect to backend. Please check your connection.");
        } else {
          setError(`CONNECTION ERROR: ${errorMessage}`);
        }
        setIsLoading(false);
      },
      history,
      roastLevel !== 'DEFAULT' ? roastLevel : undefined,
      (limits) => {
        setSessionInfo({
          userRequestsLeft: limits.userRequestsLeft,
          globalRequestsLeft: limits.globalRequestsLeft
        });
      }
    );
  };

  return (
    <section id="chat" ref={containerRef} className="pb-[60px] lg:pb-[120px] relative z-10 scroll-mt-[85px]">
      <motion.div
        style={{ opacity, y }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <div className="w-full">
          <div className="mb-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 font-averia text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              4.0 // NEXUS
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm md:text-base mb-0 font-mono uppercase tracking-widest">
              Direct Neural Link to AI Core
            </p>
          </div>

          <div className="relative pt-[15px]" ref={terminalRef}>
            <div className="relative w-full bg-[#0A0C11] rounded-xl shadow-2xl overflow-hidden border border-slate-700/50" style={{ height: '37rem' }}>
              <div
                className={`relative w-full h-full flex flex-col transition-all duration-700 ${isTerminated ? 'grayscale blur-sm brightness-50' : ''}`}
                onClick={handleTerminalClick}
              >
                {isMatrixActive && <MatrixRain />}

                <div className="relative z-10 h-10 bg-[#14171c] px-4 flex items-center justify-between select-none">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors" />
                  </div>
                  <div className="text-xs font-mono text-slate-500 font-medium">
                    <span className="hidden sm:inline">&gt;_ </span>guest — -zsh — 80x24
                  </div>
                  <div className="w-10" />
                </div>

                <div className="relative flex-1 min-h-0">
                  {/* Decorative Top Gradient - Overlaps 3px into header for seamless fade */}
                  <div className="absolute -top-[0px] left-0 right-0 h-8 bg-gradient-to-b from-[#0A0C11] to-transparent z-20 pointer-events-none" />

                  <div
                    ref={scrollRef}
                    className="relative z-10 h-full p-4 md:p-6 overflow-y-auto space-y-4 cursor-text scroll-smooth font-mono text-xs md:text-sm bg-[#0A0C11]/60 leading-relaxed terminal-scroll"
                  >
                    {history.map((msg, i) => (
                      <div key={i} className="break-words">
                        {msg.role === 'user' ? (
                          <div className="flex gap-2 items-start">
                            <span className="text-green-400 font-bold shrink-0">➜</span>
                            <span className="text-cyan-400 font-bold shrink-0">~</span>
                            <span className="text-[#00ff41]">{msg.text}</span>
                          </div>
                        ) : (
                          <div className={`mt-2 mb-4 space-y-1 ${msg.isSuccess ? 'text-slate-300' :
                            msg.isError && msg.isSystem ? 'text-slate-300' :
                              msg.isError ? 'text-yellow-400 font-mono tracking-wide' :
                                msg.isSystem ? 'text-yellow-500/80 font-mono text-xs italic' :
                                  'text-slate-300'
                            }`}>
                            {msg.isMenu ? (
                              <div className="mt-2 space-y-2">
                                <p className="text-white font-mono font-bold tracking-[0.2em] uppercase text-xs border-b border-white/20 w-fit pb-1 mb-3">{msg.text}</p>
                                {msg.menuOptions?.map((opt, idx) => {
                                  const isMovingIndex = idx === msg.selectedIndex;
                                  const isCurrentActive = opt === roastLevel;
                                  return (
                                    <div key={opt} className={`flex items-center gap-2 transition-all duration-200 ${isMovingIndex ? 'text-white' : 'text-slate-500'}`}>
                                      <span className={`w-4 font-bold shrink-0 ${isMovingIndex ? 'text-cyan-400 animate-pulse' : 'invisible'}`}>&gt;</span>
                                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                        <span className={`${isMovingIndex ? 'bg-cyan-900/30 px-2 py-0.5 rounded border border-cyan-800/50' : 'px-2 opacity-80'}`}>
                                          {opt}
                                        </span>
                                        {msg.menuOptionDescriptions && (
                                          <span className="text-[10px] md:text-xs opacity-40 font-mono italic whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] sm:max-w-none">
                                            — {msg.menuOptionDescriptions[idx]}
                                          </span>
                                        )}
                                        {isCurrentActive && (
                                          <span className="text-emerald-500 text-xs ml-1 font-bold shrink-0">✓</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : msg.isNeofetch ? (
                              <div className="whitespace-pre font-mono leading-tight text-white/90">
                                {msg.text.split('\n').map((line, lineIdx) => {
                                  const match = line.match(/^(.*?)(\b[A-Z]{2,}|Host|Kernel|Uptime|Shell|Resolution)(\s*:\s*)(.*)$/);
                                  if (match) {
                                    return (
                                      <div key={lineIdx} className="flex">
                                        <span className="text-purple-500/80">{match[1]}</span>
                                        <span className="text-cyan-400 font-bold">{match[2]}</span>
                                        <span className="text-slate-500">{match[3]}</span>
                                        <span className="text-slate-300">{match[4]}</span>
                                      </div>
                                    );
                                  }
                                  return <div key={lineIdx} className="text-purple-500/80">{line}</div>;
                                })}
                              </div>
                            ) : (
                              <div>
                                <ReactMarkdown
                                  components={{
                                    h1: ({ ...props }) => <h1 className={`text-xl font-bold mb-2 font-mono ${msg.isSuccess ? 'text-emerald-500/90' : msg.isError ? 'text-rose-500/90' : 'text-green-400'}`} {...props} />,
                                    h2: ({ ...props }) => <h2 className="text-lg font-bold text-purple-400 mb-2 mt-4 font-mono" {...props} />,
                                    ul: ({ ...props }) => <ul className="list-disc list-outside space-y-1 my-2 text-slate-400 marker:text-slate-400 pl-5 font-mono" {...props} />,
                                    ol: ({ ...props }) => <ol className="list-decimal list-outside space-y-1 my-2 text-slate-400 marker:text-slate-400 pl-5 font-mono" {...props} />,
                                    li: ({ ...props }) => <li className="text-slate-400 font-mono" {...props} />,
                                    a: ({ ...props }) => {
                                      const href = props.href;
                                      if (href?.match(/^(javascript|data|vbscript|file):/i)) {
                                        return <span className="text-red-400 font-mono">[Blocked URL]</span>;
                                      }
                                      return <a className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors font-mono" rel="noopener noreferrer" target="_blank" {...props} />;
                                    },
                                    p: ({ ...props }) => <p className={`mb-2 leading-relaxed font-mono ${msg.isError && !msg.isSystem ? 'text-yellow-400' : ''}`} {...props} />,
                                    strong: ({ ...props }) => <strong className={`font-mono ${msg.isSuccess ? 'text-emerald-300' : msg.isError && msg.isSystem ? 'text-rose-300' : 'text-white'} font-bold`} {...props} />,
                                    code: ({ className, children, ...props }: any) => {
                                      const match = /language-(\w+)/.exec(className || '');
                                      const isInline = !match && !String(children).includes('\n');
                                      const text = String(children).trim();

                                      if (msg.isError) {
                                        return <code className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-xs md:text-sm font-mono border border-slate-700/50">{children}</code>;
                                      }

                                      if (isInline && text === 'ONLINE') {
                                        return <span className="bg-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded text-xs border border-emerald-800 font-mono">ONLINE</span>;
                                      }
                                      if (isInline && text === 'INTERACTIVE') {
                                        return <span className="bg-purple-900/30 text-purple-400 px-1.5 py-0.5 rounded text-xs border border-purple-800 font-mono">INTERACTIVE</span>;
                                      }
                                      return isInline ? (
                                        <code className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-xs md:text-sm font-mono font-medium" {...props}>
                                          {children}
                                        </code>
                                      ) : (
                                        <code className="block bg-[#111] p-3 rounded border border-slate-700 text-green-400 my-2 font-mono text-xs md:text-sm" {...props}>
                                          {children}
                                        </code>
                                      );
                                    }
                                  }}
                                >
                                  {msg.text}
                                </ReactMarkdown>
                                {msg.subtext && (
                                  <p className="text-[10px] md:text-xs opacity-40 font-mono italic mt-1">
                                    — {msg.subtext}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {isLoading && (
                      <div className="text-cyan-500 flex items-center gap-2 opacity-60">
                        <span className="animate-spin">⠋</span>
                        <span>Processing...</span>
                      </div>
                    )}

                    {error && (
                      <div className={`mt-2 text-xs md:text-sm rounded p-3 border ${error.includes('limit') ? 'text-yellow-400 bg-yellow-950/30 border-yellow-800' : 'text-red-400 bg-red-950/30 border-red-800'}`}>
                        <div className="font-bold mb-1">{error.includes('limit') ? '⚠ ACCESS LIMITED' : '⚠ ERROR'}</div>
                        <div className="whitespace-pre-line font-mono">{error}</div>
                      </div>
                    )}

                    {hasBooted && !isBooting && !hasInitFailed && !isLoading && !activeMenu && (
                      <div className="mt-4">
                        <form onSubmit={handleSend} className="flex items-center group">
                          <span className="text-green-400 font-bold mr-2">➜</span>
                          <span className="text-cyan-400 font-bold mr-2">~</span>
                          <div className="relative flex-grow flex items-center">
                            <input
                              ref={inputRef}
                              type="text"
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="w-full bg-transparent border-none outline-none text-[#00ff41] font-mono text-sm md:text-[15px] caret-[#00ff41] break-all"
                              autoComplete="off"
                              spellCheck="false"
                            />
                          </div>
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Decorative Bottom Gradient - Overlaps 3px into footer for seamless fade */}
                  <div className="absolute -bottom-[0px] left-0 right-0 h-8 bg-gradient-to-t from-[#0A0C11] to-transparent z-20 pointer-events-none" />
                </div>

                <div className="px-4 py-2 bg-[#14171c] flex justify-between text-xs font-mono text-slate-600 uppercase tracking-widest relative z-10">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 inline-block rounded-full animate-pulse ${hasInitFailed ? 'bg-red-500' : (hasBooted && !isBooting) ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      {hasInitFailed ? 'System Offline' : (hasBooted && !isBooting) ? 'System Stable' : 'Connecting...'}
                    </span>
                    <span className="hidden md:inline">
                      :: Allocation: {sessionInfo && hasBooted && !isBooting ? sessionInfo.userRequestsLeft : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="md:hidden">{sessionInfo && hasBooted && !isBooting ? sessionInfo.userRequestsLeft : 'N/A'}</span>
                    <span className="hidden md:inline">v2.5.1 BUILD 2026</span>
                  </div>
                </div>
              </div>

              {isTerminated && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center p-8 border-2 border-red-500/50 rounded-lg bg-black/95 shadow-[0_0_60px_rgba(239,68,68,0.4)]"
                  >
                    <h2 className="text-4xl md:text-6xl font-bold text-red-500 font-mono tracking-tighter mb-4">
                      NEXUS TERMINATED
                    </h2>
                    <p className="text-red-400 font-mono text-sm uppercase tracking-widest opacity-70 mb-8">
                      Physical connection severed...
                    </p>
                    <button
                      onClick={handleReconnect}
                      className="text-red-500 hover:text-white transition-all font-mono text-sm uppercase tracking-[0.2em]"
                    >
                      &gt; RECONNECT &lt;
                    </button>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default AIChat;