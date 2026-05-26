import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAIChat } from './useAIChat';
import MarkdownRenderer from './markdown/MarkdownRenderer';
import { APP_VERSION } from '@/lib/version';
import type { SiteContact, SiteProject } from '@/lib/content/site-data';

// MatrixRain effect - kept here as it's purely presentational
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
                const charIndex = Math.floor(Math.random() * chars.length);
                const text = chars[charIndex];
                const dropY = drops[i];

                if (text !== undefined && dropY !== undefined) {
                    ctx.fillText(text, i * 20, dropY * 20);

                    if (dropY * 20 > height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    const currentDrop = drops[i];
                    if (currentDrop !== undefined) {
                        drops[i] = currentDrop + 1;
                    }
                }
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

interface AIChatProps {
    projects: SiteProject[];
    contact: SiteContact;
}

const AIChat: React.FC<AIChatProps> = ({ projects, contact }) => {
    const {
        history,
        input,
        setInput,
        isLoading,
        isBooting,
        hasBooted,
        hasInitFailed,
        isMatrixActive,
        isTerminated,
        error,
        sessionInfo,
        scrollRef,
        inputRef,
        containerRef,
        terminalRef,
        handleTerminalClick,
        handleKeyDown,
        handleSend,
        handleReconnect,
    } = useAIChat({ projects, contact });

    useEffect(() => {
        if (inputRef.current) {
            const scrollElem = scrollRef.current;
            let isAtBottom = false;
            let oldScrollTop = 0;

            if (scrollElem) {
                oldScrollTop = scrollElem.scrollTop;
                isAtBottom = Math.abs(scrollElem.scrollHeight - scrollElem.scrollTop - scrollElem.clientHeight) <= 15;
            }

            inputRef.current.style.height = 'auto';
            if (input) {
                inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
            }

            if (scrollElem) {
                if (isAtBottom) {
                    scrollElem.scrollTop = scrollElem.scrollHeight;
                } else {
                    scrollElem.scrollTop = oldScrollTop;
                }
            }
        }
    }, [input, inputRef, scrollRef]);

    // Smart Scroll Trapping: Only block Lenis scroll bubbling when the terminal actually has active scroll overflow
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            const { scrollTop, scrollHeight, clientHeight } = el;
            const isScrollable = scrollHeight > clientHeight;

            // If terminal content doesn't overflow, let mousewheel bubble up to scroll the page smoothly
            if (!isScrollable) {
                return;
            }

            const delta = e.deltaY;
            const isScrollingUp = delta < 0;
            const isScrollingDown = delta > 0;

            // Chaining: If scrolled to absolute top/bottom boundaries, bubble events up to scroll the main page
            if (isScrollingUp && scrollTop === 0) {
                return;
            }

            if (isScrollingDown && Math.ceil(scrollTop + clientHeight) >= scrollHeight) {
                return;
            }

            // Otherwise, actively scroll inside the terminal and prevent Lenis from hijacking/blocking
            e.stopPropagation();
        };

        const handleTouchStart = (e: TouchEvent) => {
            (el as any).touchStartY = e.touches[0].clientY;
        };

        const handleTouchMove = (e: TouchEvent) => {
            const touchStartY = (el as any).touchStartY || 0;
            const touchCurrentY = e.touches[0].clientY;
            const deltaY = touchStartY - touchCurrentY;

            const { scrollTop, scrollHeight, clientHeight } = el;
            const isScrollable = scrollHeight > clientHeight;

            if (!isScrollable) {
                return;
            }

            const isScrollingUp = deltaY < 0;
            const isScrollingDown = deltaY > 0;

            if (isScrollingUp && scrollTop === 0) {
                return;
            }

            if (isScrollingDown && Math.ceil(scrollTop + clientHeight) >= scrollHeight) {
                return;
            }

            e.stopPropagation();
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        el.addEventListener('touchstart', handleTouchStart, { passive: true });
        el.addEventListener('touchmove', handleTouchMove, { passive: false });

        return () => {
            el.removeEventListener('wheel', handleWheel);
            el.removeEventListener('touchstart', handleTouchStart);
            el.removeEventListener('touchmove', handleTouchMove);
        };
    }, [scrollRef]);

    return (
        <section id="chat" ref={containerRef} className="pb-[60px] lg:pb-[120px] relative z-10 scroll-mt-[85px]">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
            >
                <div className="w-full">
                    <div className="mb-2">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 font-quantico text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                            4.0 // NEXUS
                        </h2>
                        <p className="text-slate-400 text-xs sm:text-sm md:text-base mb-0 font-mono uppercase tracking-widest">
                            Direct Neural Link to AI Core
                        </p>
                    </div>

                    <div className="relative pt-[15px]" ref={terminalRef}>
                        <div className="relative w-full bg-[#08061a] overflow-hidden border-2 border-[#2d2754] shadow-[6px_6px_0px_0px_#2d2754]" style={{ height: '37rem' }}>
                            <div
                                className={`relative w-full h-full flex flex-col transition-all duration-700 ${isTerminated ? 'grayscale blur-sm brightness-50' : ''}`}
                                onClick={handleTerminalClick}
                            >
                                {isMatrixActive && <MatrixRain />}

                                {/* Title bar */}
                                <div className="relative z-10 h-10 bg-[#0d0a1a] border-b-2 border-[#2d2754] px-4 flex items-center justify-between select-none">
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400 border border-red-600" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-600" />
                                        <div className="w-3 h-3 rounded-full bg-green-400 border border-green-600" />
                                    </div>
                                    <div className="text-xs font-mono text-slate-500 font-medium">
                                        <span className="hidden sm:inline">&gt;_ </span>guest — -zsh — 80x24
                                    </div>
                                    <div className="w-10" />
                                </div>

                                <div className="relative flex-1 min-h-0">
                                    <div
                                        ref={scrollRef}
                                        className="relative z-10 h-full p-4 md:p-6 overflow-y-auto space-y-4 cursor-text bg-[#08061a] terminal-scroll"
                                        style={{ fontFamily: '"JetBrains Mono", "JetBrainsMono Nerd Font", monospace', lineHeight: '1.2' }}
                                    >
                                        {history.map((msg, i) => (
                                            <div key={i} className="break-words">
                                                {msg.role === 'user' ? (
                                                    <div className="flex gap-2 items-start font-mono">
                                                        <span className="text-pink-400 font-bold shrink-0 mt-[2px]">➜</span>
                                                        <span className="text-cyan-400 font-bold shrink-0 mt-[2px]">~</span>
                                                        <span className="text-[#00f3ff] break-all whitespace-pre-wrap flex-1">{msg.text}</span>
                                                    </div>
                                                ) : (
                                                    <div className={`mt-2 mb-4 space-y-1 font-mono ${msg.isSuccess ? 'text-slate-300' :
                                                        msg.isError && msg.isSystem ? 'text-slate-300' :
                                                            msg.isError ? 'text-yellow-400 tracking-wide' :
                                                                msg.isSystem ? 'text-yellow-500/80 text-xs italic' :
                                                                    'text-slate-300'
                                                        }`}>
                                                        {msg.isMenu ? (
                                                            <div className="mt-2 space-y-2 font-mono">
                                                                <p className="text-white font-bold tracking-[0.2em] uppercase text-xs border-b-2 border-[#2d2754] w-fit pb-1 mb-3">{msg.text}</p>
                                                                {msg.menuOptions?.map((opt, idx) => {
                                                                    const isMovingIndex = idx === msg.selectedIndex;
                                                                    return (
                                                                        <div
                                                                            key={opt}
                                                                            className={`flex items-center gap-2 transition-all duration-200 cursor-pointer group/item ${isMovingIndex ? 'text-white' : 'text-slate-500 hover:text-white'}`}
                                                                        >
                                                                            <span className={`w-4 font-bold shrink-0 hidden sm:block ${isMovingIndex ? 'text-cyan-400 animate-pulse' : 'invisible'}`}>&gt;</span>
                                                                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                                                                <span className={`${isMovingIndex ? 'bg-cyan-400 text-[#020208] px-2 py-0.5 border-2 border-[#2d2754] font-bold' : 'px-2 opacity-80 group-hover/item:opacity-100'}`}>
                                                                                    {opt}
                                                                                </span>
                                                                                {msg.menuOptionDescriptions && (
                                                                                    <span className="text-[10px] md:text-xs opacity-40 italic whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] sm:max-w-none group-hover/item:opacity-60">
                                                                                        — {msg.menuOptionDescriptions[idx]}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : msg.isNeofetch ? (
                                                            <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start select-none md:select-text font-mono">
                                                                <pre className="text-purple-500/80 leading-none text-sm sm:text-base md:text-2xl font-bold shrink-0 ascii-art m-0">
                                                                    {msg.neofetchArt?.join('\n')}
                                                                </pre>
                                                                <div className="flex flex-col gap-1 text-xs sm:text-sm">
                                                                    {msg.neofetchInfo?.map((info, idx) => (
                                                                        <div key={idx} className="flex gap-2">
                                                                            <span className="text-cyan-400 font-bold min-w-[80px] md:min-w-[100px]">{info.label}:</span>
                                                                            <span className="text-slate-300">{info.value}</span>
                                                                        </div>
                                                                    ))}
                                                                    <div className="flex gap-1 mt-2">
                                                                        <div className="w-3 h-3 bg-black border border-[#2d2754]"></div>
                                                                        <div className="w-3 h-3 bg-red-500 border border-[#2d2754]"></div>
                                                                        <div className="w-3 h-3 bg-green-500 border border-[#2d2754]"></div>
                                                                        <div className="w-3 h-3 bg-yellow-500 border border-[#2d2754]"></div>
                                                                        <div className="w-3 h-3 bg-blue-500 border border-[#2d2754]"></div>
                                                                        <div className="w-3 h-3 bg-purple-500 border border-[#2d2754]"></div>
                                                                        <div className="w-3 h-3 bg-cyan-500 border border-[#2d2754]"></div>
                                                                        <div className="w-3 h-3 bg-white border border-[#2d2754]"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <MarkdownRenderer message={msg} />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {isLoading && (
                                            <div className="text-cyan-500 flex items-center gap-2 opacity-60 font-mono">
                                                <span className="animate-spin">⠋</span>
                                                <span>Processing...</span>
                                            </div>
                                        )}

                                        {error && (
                                            <div className={`mt-2 text-xs md:text-sm p-3 border-2 border-[#2d2754] font-mono ${error.includes('limit') ? 'text-yellow-400 bg-yellow-950/30' : 'text-red-400 bg-red-950/30'}`}>
                                                <div className="font-bold mb-1">{error.includes('limit') ? '⚠ ACCESS LIMITED' : '⚠ ERROR'}</div>
                                                <div className="whitespace-pre-line">{error}</div>
                                            </div>
                                        )}

                                        {hasBooted && !isBooting && !isLoading && (
                                            <div className="mt-4">
                                                <form onSubmit={handleSend} className="flex items-start group">
                                                    <span className="text-pink-400 font-bold mr-2 mt-[2px]">➜</span>
                                                    <span className="text-cyan-400 font-bold mr-2 mt-[2px]">~</span>
                                                    <div className="relative flex-grow flex items-start">
                                                        <textarea
                                                            ref={inputRef}
                                                            value={input}
                                                            onChange={(e) => {
                                                                setInput(e.target.value);
                                                            }}
                                                            onKeyDown={handleKeyDown}
                                                            className="w-full bg-transparent border-none outline-none text-[#00f3ff] text-sm md:text-[15px] caret-[#00f3ff] break-words resize-none overflow-hidden"
                                                            style={{ minHeight: '24px', paddingTop: '2px', fontFamily: '"JetBrains Mono", "JetBrainsMono Nerd Font", monospace' }}
                                                            rows={1}
                                                            maxLength={1024}
                                                            aria-label="Terminal Input"
                                                            autoComplete="off"
                                                            spellCheck="false"
                                                        />
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Status bar */}
                                <div className="px-4 py-2 bg-[#0d0a1a] border-t-2 border-[#2d2754] flex justify-between text-xs font-mono text-slate-600 uppercase tracking-widest relative z-10">
                                    <div className="flex gap-4">
                                        <span className="flex items-center gap-2">
                                            <span className={`w-2 h-2 inline-block rounded-none ${hasInitFailed ? 'bg-red-500' : (hasBooted && !isBooting) ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                            {hasInitFailed ? 'System Offline' : (hasBooted && !isBooting) ? 'System Stable' : 'Connecting...'}
                                        </span>
                                        <span className="hidden md:inline">
                                            :: Allocation: {sessionInfo && hasBooted && !isBooting ? sessionInfo.userRequestsLeft : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        {input.length >= 1024 && (
                                            <span className="text-red-500 font-bold animate-pulse">
                                                MAX LENGTH (1024) REACHED
                                            </span>
                                        )}
                                        <span className="md:hidden">{sessionInfo && hasBooted && !isBooting ? sessionInfo.userRequestsLeft : 'N/A'}</span>
                                        <span className="hidden md:inline">v{APP_VERSION}</span>
                                    </div>
                                </div>
                            </div>

                            {isTerminated && (
                                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40">
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-center p-8 border-2 border-red-500 bg-[#020208] shadow-[6px_6px_0px_0px_#991b1b]"
                                    >
                                        <h2 className="text-4xl md:text-6xl font-bold text-red-500 font-mono tracking-tighter mb-4">
                                            NEXUS TERMINATED
                                        </h2>
                                        <p className="text-red-400 font-mono text-sm uppercase tracking-widest opacity-70 mb-8">
                                            Physical connection severed...
                                        </p>
                                        <button
                                            onClick={handleReconnect}
                                            className="px-6 py-2 bg-red-500 text-[#020208] border-2 border-red-800 font-mono text-sm uppercase tracking-[0.2em] font-bold shadow-[4px_4px_0px_0px_#991b1b] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:bg-red-600 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none active:transition-none transition-all duration-200"
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
