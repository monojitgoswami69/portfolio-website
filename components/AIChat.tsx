import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import { ChatMessage } from '../types';
import { sendMessage, checkHealth } from '../services/chatService';
import { RateLimiter } from '../utils/security';

const MAX_MESSAGE_LENGTH = 1000;
const MESSAGE_RATE_LIMIT_MS = 2000; // 2 seconds between messages

const AIChat: React.FC = () => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [hasBooted, setHasBooted] = useState(false);
  const [hasInitFailed, setHasInitFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const rateLimiter = useRef(new RateLimiter(MESSAGE_RATE_LIMIT_MS));

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

  const runBootSequence = async () => {
    setIsBooting(true);

    // Start health check immediately in background
    const healthPromise = checkHealth();

    const steps = [
      { text: "beginning startup sequence...", delay: 1000 },
      { text: "accessing user profile...", delay: 700 },
      { text: "starting nexus kernel...", delay: 500 }
    ];

    for (const step of steps) {
      setHistory(prev => [...prev, {
        role: 'model',
        text: step.text,
        timestamp: new Date(),
        isSystem: true
      }]);
      await new Promise(resolve => setTimeout(resolve, step.delay));
    }

    // Wait for health check to complete
    const isHealthy = await healthPromise;

    if (isHealthy) {
      // Clear history (buffer) before printing initialized
      setHistory([{
        role: 'model',
        text: "# NEXUS v2.5.0 INITIALIZED...\n\nType `help` for available commands or ask anything about the portfolio (dare if you want to get roasted)",
        timestamp: new Date(),
        isSuccess: true
      }]);
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isRateLimited) return;

    const cmd = input.trim();

    // Validate message length
    if (cmd.length > MAX_MESSAGE_LENGTH) {
      setError(`Message too long (max ${MAX_MESSAGE_LENGTH} characters)`);
      return;
    }

    // Check rate limit
    if (!rateLimiter.current.canProceed()) {
      const remainingMs = rateLimiter.current.getRemainingTime();
      const remainingSec = Math.ceil(remainingMs / 1000);
      setError(`Please wait ${remainingSec} second${remainingSec > 1 ? 's' : ''} before sending another message`);
      return;
    }

    const userMsg: ChatMessage = { role: 'user', text: cmd, timestamp: new Date() };

    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    const lowerCmd = cmd.toLowerCase();

    // Client-side commands
    if (lowerCmd === 'clear' || lowerCmd === 'cls') {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    if (lowerCmd === 'help') {
      setTimeout(() => {
        const helpMsg: ChatMessage = {
          role: 'model',
          text: "## AVAILABLE COMMANDS:\n\n- `help` : Show this help message\n- `clear` : Clear terminal output\n- `whoami` : Display current user info\n- `projects` : List active modules\n\nOr just ask naturally: *\"What is your experience with RAG?\"*",
          timestamp: new Date()
        };
        setHistory(prev => [...prev, helpMsg]);
        setIsLoading(false);
      }, 300);
      return;
    }

    if (lowerCmd === 'whoami') {
      setTimeout(() => {
        const whoMsg: ChatMessage = {
          role: 'model',
          text: "**USER IDENTITY:**\n\n- **ID**: `GUEST_USER`\n- **Privileges**: `READ_ONLY`\n- **Connection**: `ENCRYPTED (SSL/TLS)`\n- **Session**: `ACTIVE`",
          timestamp: new Date()
        };
        setHistory(prev => [...prev, whoMsg]);
        setIsLoading(false);
      }, 300);
      return;
    }

    // Call non-streaming endpoint
    sendMessage(
      cmd,
      (response: string) => {
        // Add the complete response message
        const botMsg: ChatMessage = {
          role: 'model',
          text: response,
          timestamp: new Date()
        };
        setHistory(prev => [...prev, botMsg]);
      },
      () => {
        // Request completed
        setIsLoading(false);
      },
      (err: Error) => {
        // Request error
        const errorMessage = err.message;

        // Check if it's a rate limit error (with explicit prefix)
        if (errorMessage.startsWith('RATE_LIMIT_ERROR:')) {
          // Parse format: RATE_LIMIT_ERROR: {limit details}\n\nRESETS IN: {time} (at {localTime})
          const parts = errorMessage.split('\n\nRESETS IN: ');
          const limitDetails = parts[0].replace('RATE_LIMIT_ERROR: ', '');
          const resetDetails = parts[1] || '';

          // Clean up "Global system limit reached" etc to just "user/global request limit reached" if preferred
          // BUT user asked for: 'ACCESS RESTRICTED' user/global request limit reached(50/1000 /day). come back after 'time' ('date + time')

          // Extract limit numbers if possible or just use string
          // limitDetails might be "Global system limit reached (1000/day)."

          // Reformat text to user specification
          // "ACCESS RESTRICTED' user/global request limit reached(50/1000 /day). come back after 'time' ('date + time')"

          // Try to extract the time from resetDetails "Xh Ym (at HH:MM AM)"
          const timeMatch = resetDetails.match(/(.*) \((.*)\)/);
          const timeAt = timeMatch ? timeMatch[2].replace(/^at\s+/, '') : '';

          let displayLimit = limitDetails;
          if (limitDetails.includes('Global')) displayLimit = 'global request limit reached (1,000/day)';
          else displayLimit = 'user request limit reached (50/day)';

          const formattedError = `\`ACCESS RESTRICTED\`\n\n${displayLimit}.\n\nresets at \`${timeAt}\``;

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
      history // Pass history without current message (current message is in 'cmd' parameter)
    );
  };

  return (
    <section id="chat" ref={containerRef} className="pb-[60px] lg:pb-[120px] relative z-10 scroll-mt-[85px]" style={{ position: 'relative' }}>
      <motion.div
        style={{ opacity, y }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <div className="w-full">
          {/* Section Header */}
          <div
            className="mb-2"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 font-averia text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              4.0 // NEXUS
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm md:text-base mb-0 font-mono uppercase tracking-widest">
              Direct Neural Link to AI Core
            </p>
          </div>

          {/* Terminal Container */}
          <div
            className="relative pt-[15px]"
            ref={terminalRef}
          >

            <div
              className="relative w-full bg-[#0C0E14] rounded-xl shadow-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col border border-slate-700/50"
              style={{ height: '37rem' }}
              onClick={handleTerminalClick}
            >
              {/* Window Title Bar */}
              <div className="h-10 bg-[#14171c] px-4 flex items-center justify-between select-none border-b border-slate-700/50">
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

              {/* Terminal Content Area */}
              <div ref={scrollRef} className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 cursor-text scroll-smooth font-mono text-xs md:text-sm bg-[#0c0e14] leading-relaxed terminal-scroll">

                {/* Messages */}
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
                        <ReactMarkdown
                          components={{
                            h1: ({ ...props }) => <h1 className={`text-xl font-bold mb-2 ${msg.isSuccess ? 'text-emerald-500/90' : msg.isError ? 'text-rose-500/90' : 'text-green-400'}`} {...props} />,
                            h2: ({ ...props }) => <h2 className="text-lg font-bold text-purple-400 mb-2 mt-4" {...props} />,
                            ul: ({ ...props }) => <ul className="list-disc list-outside space-y-1 my-2 text-slate-400 marker:text-slate-400 pl-5" {...props} />,
                            ol: ({ ...props }) => <ol className="list-decimal list-outside space-y-1 my-2 text-slate-400 marker:text-slate-400 pl-5" {...props} />,
                            li: ({ ...props }) => <li className="text-slate-400" {...props} />,
                            a: ({ ...props }) => {
                              const href = props.href;
                              // Block dangerous protocols
                              if (href?.match(/^(javascript|data|vbscript|file):/i)) {
                                return <span className="text-red-400">[Blocked URL]</span>;
                              }
                              return <a className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors" rel="noopener noreferrer" target="_blank" {...props} />;
                            },
                            p: ({ ...props }) => <p className={`mb-2 leading-relaxed ${msg.isError && !msg.isSystem ? 'text-yellow-400' :
                              ''
                              }`} {...props} />,
                            strong: ({ ...props }) => <strong className={`${msg.isSuccess ? 'text-emerald-300' :
                              msg.isError && msg.isSystem ? 'text-rose-300' :
                                'text-white'
                              } font-bold`} {...props} />,
                            code: ({ className, children, ...props }) => {
                              const match = /language-(\w+)/.exec(className || '');
                              const isInline = !match && !String(children).includes('\n');
                              const text = String(children).trim();

                              if (msg.isError) {
                                return <code className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-xs md:text-sm font-mono border border-slate-700/50">{children}</code>;
                              }

                              // Check for status badges
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
                          {DOMPurify.sanitize(msg.text, {
                            ALLOWED_TAGS: ['h1', 'h2', 'p', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'a', 'br'],
                            ALLOWED_ATTR: ['href', 'className', 'class']
                          })}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading */}
                {isLoading && (
                  <div className="text-cyan-500 flex items-center gap-2 opacity-60">
                    <span className="animate-spin">⠋</span>
                    <span>Processing...</span>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className={`mt-2 text-xs md:text-sm rounded p-3 border ${error.includes('limit') ? 'text-yellow-400 bg-yellow-950/30 border-yellow-800' : 'text-red-400 bg-red-950/30 border-red-800'}`}>
                    <div className="font-bold mb-1">{error.includes('limit') ? '⚠ ACCESS LIMITED' : '⚠ ERROR'}</div>
                    <div className="whitespace-pre-line font-mono">{error}</div>
                  </div>
                )}

                {/* Active Input Line */}
                {!isRateLimited && hasBooted && !isBooting && !hasInitFailed && !isLoading && (
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
                          className="w-full bg-transparent border-none outline-none text-[#00ff41] font-mono text-sm md:text-[15px] caret-[#00ff41] break-all"
                          autoComplete="off"
                          spellCheck="false"
                        />
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Status Footer */}
              <div className="px-4 py-2 border-t border-slate-700/50 bg-[#0c0e14] flex justify-between text-xs font-mono text-slate-600 uppercase tracking-widest">
                <div className="flex gap-4">
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 inline-block rounded-full animate-pulse ${hasInitFailed ? 'bg-red-500' :
                      (hasBooted && !isBooting) ? 'bg-green-500' :
                        'bg-yellow-500'
                      }`} />
                    {hasInitFailed ? 'System Offline' :
                      (hasBooted && !isBooting) ? 'System Stable' :
                        'Connecting...'}
                  </span>
                  <span className="hidden sm:inline">Encrypted :: AES-256</span>
                </div>
                <div>
                  <span>v2.5.1 BUILD 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default AIChat;