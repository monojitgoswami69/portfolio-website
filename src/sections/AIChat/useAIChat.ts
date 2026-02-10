import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from './types';
import { sendMessage, initializeSession } from '../../services/chatService';
import {
    helpCommand,
    whoamiCommand,
    contactCommand,
    neofetchCommand,
    projectsCommand,
    matrixCommand,
    escapeMatrixCommand
} from './commands';

import projectsData from '../../data/projects.json';
import { ProjectData } from '../Projects/projectUtils';

const MAX_MESSAGE_LENGTH = 1000;

const ROAST_OPTIONS = ['DEFAULT', 'SPICY', 'NO-MERCY'];
const ROAST_DESCRIPTIONS = [
    'default roast mode',
    'added spice and violence',
    'try at your own risk.'
];

const COMMANDS = [
    'help', 'clear', 'cls', 'whoami', 'projects', 'contact',
    'neofetch', 'matrix', 'escape-the-matrix', 'roast-level', 'exit'
];

export const useAIChat = () => {
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
    const [projects] = useState<Array<{ name: string; description: string }>>(projectsData as ProjectData[]);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);

    // Boot sequence logic
    useEffect(() => {
        if (hasBooted || isBooting) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];
                if (firstEntry?.isIntersecting) {
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

        // 1. Start sequence
        setHistory(prev => [...prev, {
            role: 'model',
            text: "beginning startup sequence...",
            timestamp: new Date(),
            isSystem: true
        }]);
        await new Promise(resolve => setTimeout(resolve, 500));

        // 2. Fetch profile (show loading msg first)
        setHistory(prev => [...prev, {
            role: 'model',
            text: "accessing user profile...",
            timestamp: new Date(),
            isSystem: true
        }]);

        // Fetch data *after* showing the message
        const initData = await initializeSession();

        if (initData) {
            // 3. Profile loaded
            setHistory(prev => [...prev, {
                role: 'model',
                text: `profile initialized: ${initData.userId}`,
                timestamp: new Date(),
                isSystem: true
            }]);
            await new Promise(resolve => setTimeout(resolve, 200));

            // 4. Kernel start
            setHistory(prev => [...prev, {
                role: 'model',
                text: "starting nexus kernel...",
                timestamp: new Date(),
                isSystem: true
            }]);
            await new Promise(resolve => setTimeout(resolve, 500));

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
            const userRemaining = parseInt(initData.userRequestsLeft.split('/')[0] ?? '0');
            const globalRemaining = parseInt(initData.globalRequestsLeft.split('/')[0] ?? '0');

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
            // Init failed
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
        setIsMatrixActive(false);
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

    const handleMenuSelect = useCallback((option: string) => {
        if (!activeMenu) return;
        const index = ROAST_OPTIONS.indexOf(option);
        if (index !== -1) {
            setMenuSelectedIndex(index);
            // Force update history immediately so the menu visuals reflect the selection
            setHistory(prev => {
                const newHistory = [...prev];
                // Find the last menu message (it might not be the VERY last if a bot response started)
                for (let i = newHistory.length - 1; i >= 0; i--) {
                    const msg = newHistory[i];
                    if (msg && msg.isMenu) {
                        newHistory[i] = { ...msg, selectedIndex: index };
                        break;
                    }
                }
                return newHistory;
            });
        }
        setRoastLevel(option);
        setHistory(prev => [...prev, {
            role: 'model',
            text: `Roast level set to **${option}**.`,
            timestamp: new Date(),
            isSuccess: true
        }]);
        setActiveMenu(null);
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [activeMenu]);

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
                const selectedOption = options[menuSelectedIndex];
                if (selectedOption) {
                    handleMenuSelect(selectedOption);
                }
            } else if (e.key === 'Escape') {
                setActiveMenu(null);
                setTimeout(() => inputRef.current?.focus(), 50);
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [activeMenu, menuSelectedIndex, handleMenuSelect]);

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
                    const cmd = commandHistory[commandHistory.length - 1 - nextIndex];
                    setInput(cmd ?? '');
                }
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const nextIndex = historyIndex - 1;
                setHistoryIndex(nextIndex);
                const cmd = commandHistory[commandHistory.length - 1 - nextIndex];
                setInput(cmd ?? '');
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
                const firstMatch = matches[0];
                if (firstMatch) {
                    setInput(firstMatch);
                }
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
            setHistory(prev => [...prev, helpCommand()]);
            setIsLoading(false);
            return;
        }

        if (lowerCmd === 'matrix') {
            const result = matrixCommand(isMatrixActive);
            if (result.activate) {
                setIsMatrixActive(true);
            }
            setHistory(prev => [...prev, result.message]);
            setIsLoading(false);
            return;
        }

        if (lowerCmd === 'escape-the-matrix') {
            setIsMatrixActive(false);
            setHistory(prev => [...prev, escapeMatrixCommand()]);
            setIsLoading(false);
            return;
        }

        if (lowerCmd === 'exit') {
            setIsLoading(false);
            setIsMatrixActive(false);
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
            setHistory(prev => [...prev, whoamiCommand()]);
            setIsLoading(false);
            return;
        }

        if (lowerCmd === 'contact') {
            setHistory(prev => [...prev, contactCommand()]);
            setIsLoading(false);
            return;
        }

        if (lowerCmd === 'projects') {
            setHistory(prev => [...prev, projectsCommand(projects)]);
            setIsLoading(false);
            return;
        }

        if (lowerCmd === 'neofetch') {
            setHistory(prev => [...prev, neofetchCommand()]);
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

        void sendMessage(
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
                    const limitDetails = parts[0]?.replace('RATE_LIMIT_ERROR: ', '') ?? '';
                    const resetDetails = parts[1] ?? '';
                    const timeMatch = resetDetails.match(/(.*) \((.*)\)/);
                    const timeAt = timeMatch?.[2]?.replace(/^at\s+/, '') ?? '';

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

    return {
        // State
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

        // Refs
        scrollRef,
        inputRef,
        containerRef,
        terminalRef,

        // Handlers
        handleTerminalClick,
        handleKeyDown,
        handleSend,
        handleReconnect,
        handleMenuSelect,
    };
};
