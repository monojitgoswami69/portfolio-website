import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Section, ChatMessage } from '../types';
import { sendMessage } from '../services/chatService';

const AIChat: React.FC = () => {
  const [history, setHistory] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "**NEXUS KERNEL v3.1.4 INITIALIZED...**\n\n> Accessing user profile: **MONOJIT GOSWAMI**\n> Status: `ONLINE`\n> Mode: `INTERACTIVE`\n\nType `help` for available commands or ask about my **Tech Stack**, **Projects**, or **Arch Linux** setup.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLElement>(null);

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
    if (!input.trim() || isLoading) return;

    const cmd = input.trim();
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

    try {
      const responseText = await sendMessage(cmd);
      const botMsg: ChatMessage = { role: 'model', text: responseText || "No data received.", timestamp: new Date() };
      setHistory(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
        setError("NETWORK ERROR: Unable to connect to backend. Please check your connection.");
      } else {
        setError(`CONNECTION ERROR: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section ref={containerRef} className="pb-[120px] relative z-10">
      <motion.div
        style={{ opacity, y }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <div id="chat" className="w-full scroll-mt-[90px]">
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
          >

            <div
              className="relative w-full bg-[#0C0E14] rounded-xl shadow-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col border border-slate-700/50"
              style={{ height: '37rem' }}
              onClick={handleTerminalClick}
            >
              {/* Window Title Bar */}
              <div className="h-10 bg-[#1e1e1e] px-4 flex items-center justify-between select-none border-b border-slate-700/50">
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
                      <div className="flex gap-2 items-start text-slate-200 opacity-60">
                        <span className="text-green-400 font-bold shrink-0">➜</span>
                        <span className="text-cyan-400 font-bold shrink-0">~</span>
                        <span>{msg.text}</span>
                      </div>
                    ) : (
                      <div className="text-slate-300 mt-2 mb-4 space-y-1">
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-green-400 mb-2" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-purple-400 mb-2 mt-4" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-2 text-slate-400" {...props} />,
                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
                            strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
                            code: ({ node, className, children, ...props }) => {
                              const match = /language-(\w+)/.exec(className || '');
                              const isInline = !match && !String(children).includes('\n');
                              const text = String(children).trim();
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
                          {msg.text}
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
                  <div className="text-red-400 mt-2 text-xs">
                    Error: {error}
                  </div>
                )}

                {/* Active Input Line */}
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
                        className="w-full bg-transparent border-none outline-none text-slate-100 font-mono text-sm md:text-[15px] caret-slate-200"
                        autoComplete="off"
                        spellCheck="false"
                      />
                    </div>
                  </form>
                </div>
              </div>

              {/* Status Footer */}
              <div className="px-4 py-2 border-t border-slate-700/50 bg-[#0c0e14] flex justify-between text-xs font-mono text-slate-600 uppercase tracking-widest">
                <div className="flex gap-4">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 inline-block rounded-full bg-green-500 animate-pulse" />
                    System Stable
                  </span>
                  <span className="hidden sm:inline">Encrypted :: AES-256</span>
                </div>
                <div>
                  <span>v1.0.4 build 2024</span>
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