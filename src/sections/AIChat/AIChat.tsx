import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAIChat } from './useAIChat';
import MarkdownRenderer from './markdown/MarkdownRenderer';

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

const AIChat: React.FC = () => {
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
        activeMenu,
        roastLevel,
        sessionInfo,
        scrollRef,
        inputRef,
        containerRef,
        terminalRef,
        handleTerminalClick,
        handleKeyDown,
        handleSend,
        handleReconnect,
        handleMenuSelect,
    } = useAIChat();

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end end"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
    const y = useTransform(scrollYProgress, [0, 0.3], [50, 0]);

    useEffect(() => {
        if (inputRef.current) {
            const scrollElem = scrollRef.current;
            let isAtBottom = false;
            let oldScrollTop = 0;

            if (scrollElem) {
                oldScrollTop = scrollElem.scrollTop;
                // Check if user is near the very bottom of the chat container
                isAtBottom = Math.abs(scrollElem.scrollHeight - scrollElem.scrollTop - scrollElem.clientHeight) <= 15;
            }

            // Temporarily shrink to re-calculate clean scrollHeight
            inputRef.current.style.height = 'auto';
            if (input) {
                inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
            }

            if (scrollElem) {
                if (isAtBottom) {
                    // Lock to absolute bottom so expanding textareas stay fully visible
                    scrollElem.scrollTop = scrollElem.scrollHeight;
                } else {
                    // Anchor to old pos if user is currently scrolled up reading history
                    scrollElem.scrollTop = oldScrollTop;
                }
            }
        }
    }, [input, inputRef, scrollRef]);

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
                                    {/* Decorative Top Gradient */}
                                    <div className="absolute -top-[0px] left-0 right-0 h-8 bg-gradient-to-b from-[#0A0C11] to-transparent z-20 pointer-events-none" />

                                    <div
                                        ref={scrollRef}
                                        className="relative z-10 h-full p-4 md:p-6 overflow-y-auto space-y-4 cursor-text font-mono text-xs md:text-sm bg-[#0A0C11]/60 leading-relaxed terminal-scroll"
                                    >
                                        {history.map((msg, i) => (
                                            <div key={i} className="break-words">
                                                {msg.role === 'user' ? (
                                                    <div className="flex gap-2 items-start">
                                                        <span className="text-green-400 font-bold shrink-0 mt-[2px]">➜</span>
                                                        <span className="text-cyan-400 font-bold shrink-0 mt-[2px]">~</span>
                                                        <span className="text-[#00ff41] break-all whitespace-pre-wrap flex-1">{msg.text}</span>
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
                                                                        <div
                                                                            key={opt}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleMenuSelect(opt);
                                                                            }}
                                                                            className={`flex items-center gap-2 transition-all duration-200 pointer-events-auto sm:pointer-events-none cursor-pointer sm:cursor-default group/item ${isMovingIndex ? 'text-white' : 'text-slate-500 hover:text-slate-300 sm:hover:text-slate-500'}`}
                                                                        >
                                                                            <span className={`w-4 font-bold shrink-0 hidden sm:block ${isMovingIndex ? 'text-cyan-400 animate-pulse' : 'invisible'}`}>&gt;</span>
                                                                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                                                                <span className={`${isMovingIndex ? 'bg-cyan-900/30 px-2 py-0.5 rounded border border-cyan-800/50 text-cyan-400' : 'px-2 opacity-80 group-hover/item:opacity-100'}`}>
                                                                                    {opt}
                                                                                </span>
                                                                                {msg.menuOptionDescriptions && (
                                                                                    <span className="text-[10px] md:text-xs opacity-40 font-mono italic whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] sm:max-w-none group-hover/item:opacity-60">
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
                                                            <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start select-none md:select-text font-mono">
                                                                {/* ASCII Art */}
                                                                <div className="text-purple-500/80 leading-none whitespace-pre text-[10px] sm:text-xs md:text-sm font-bold shrink-0 ascii-art">
                                                                    {msg.neofetchArt?.map((line, idx) => (
                                                                        <div key={idx}>{line}</div>
                                                                    ))}
                                                                </div>
                                                                {/* System Info */}
                                                                <div className="flex flex-col gap-1 text-xs sm:text-sm">
                                                                    {msg.neofetchInfo?.map((info, idx) => (
                                                                        <div key={idx} className="flex gap-2">
                                                                            <span className="text-cyan-400 font-bold min-w-[80px] md:min-w-[100px]">{info.label}:</span>
                                                                            <span className="text-slate-300">{info.value}</span>
                                                                        </div>
                                                                    ))}
                                                                    {/* Color blocks */}
                                                                    <div className="flex gap-1 mt-2">
                                                                        <div className="w-3 h-3 bg-black"></div>
                                                                        <div className="w-3 h-3 bg-red-500"></div>
                                                                        <div className="w-3 h-3 bg-green-500"></div>
                                                                        <div className="w-3 h-3 bg-yellow-500"></div>
                                                                        <div className="w-3 h-3 bg-blue-500"></div>
                                                                        <div className="w-3 h-3 bg-purple-500"></div>
                                                                        <div className="w-3 h-3 bg-cyan-500"></div>
                                                                        <div className="w-3 h-3 bg-white"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <MarkdownRenderer message={msg} roastLevel={roastLevel} />
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

                                        {hasBooted && !isBooting && !isLoading && !activeMenu && (
                                            <div className="mt-4">
                                                <form onSubmit={handleSend} className="flex items-start group">
                                                    <span className="text-green-400 font-bold mr-2 mt-[2px]">➜</span>
                                                    <span className="text-cyan-400 font-bold mr-2 mt-[2px]">~</span>
                                                    <div className="relative flex-grow flex items-start">
                                                        <textarea
                                                            ref={inputRef}
                                                            value={input}
                                                            onChange={(e) => {
                                                                setInput(e.target.value);
                                                            }}
                                                            onKeyDown={handleKeyDown}
                                                            className="w-full bg-transparent border-none outline-none text-[#00ff41] font-mono text-sm md:text-[15px] caret-[#00ff41] break-words resize-none overflow-hidden"
                                                            style={{ minHeight: '24px', paddingTop: '2px' }}
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

                                    {/* Decorative Bottom Gradient */}
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
                                    <div className="flex gap-4 items-center">
                                        {input.length >= 1024 && (
                                            <span className="text-red-500 font-bold animate-pulse">
                                                MAX LENGTH (1024) REACHED
                                            </span>
                                        )}
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
