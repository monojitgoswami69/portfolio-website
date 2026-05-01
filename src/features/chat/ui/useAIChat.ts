import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from './types';
import { sendMessageStream, initializeSession } from '@/features/chat/client/chatService';
import {
    helpCommand,
    whoamiCommand,
    contactCommand,
    neofetchCommand,
    projectsCommand,
    matrixCommand,
    escapeMatrixCommand
} from './commands';
import type { SiteContact } from '@/lib/content/site-data';

import { APP_VERSION } from '@/lib/version';

const MAX_MESSAGE_LENGTH = 1024;

const COMMANDS = [
    'help', 'clear', 'cls', 'whoami', 'projects', 'contact',
    'neofetch', 'matrix', 'escape-the-matrix', 'exit'
];

const COMMAND_INPUTS = new Set([...COMMANDS]);

interface UseAIChatOptions {
    projects: Array<{ name: string; description: string }>;
    contact: SiteContact;
}

export const useAIChat = ({ projects, contact }: UseAIChatOptions): {
    history: ChatMessage[];
    input: string;
    setInput: (input: string) => void;
    isLoading: boolean;
    isBooting: boolean;
    hasBooted: boolean;
    hasInitFailed: boolean;
    isMatrixActive: boolean;
    isTerminated: boolean;
    error: string | null;
    sessionInfo: { userRequestsLeft: string; globalRequestsLeft: string } | null;
    scrollRef: React.RefObject<HTMLDivElement | null>;
    inputRef: React.RefObject<HTMLTextAreaElement | null>;
    containerRef: React.RefObject<HTMLElement | null>;
    terminalRef: React.RefObject<HTMLDivElement | null>;
    handleTerminalClick: () => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    handleSend: (e: React.FormEvent) => Promise<void>;
    handleReconnect: () => void;
} => {
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

    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [sessionInfo, setSessionInfo] = useState<{ userRequestsLeft: string; globalRequestsLeft: string } | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);

    const handleLimitUpdate = useCallback((limits: { userRequestsLeft: string; globalRequestsLeft: string }) => {
        setSessionInfo(limits);

        const userRemaining = parseInt(limits.userRequestsLeft.split('/')[0] ?? '0');
        const globalRemaining = parseInt(limits.globalRequestsLeft.split('/')[0] ?? '0');

        if (!Number.isNaN(userRemaining) && !Number.isNaN(globalRemaining)) {
            setIsRateLimited(userRemaining === 0 || globalRemaining === 0);
        }
    }, []);

    const runBootSequence = useCallback(async () => {
        setIsBooting(true);

        setHistory(prev => [...prev, {
            role: 'model',
            text: "beginning startup sequence...",
            timestamp: new Date(),
            isSystem: true
        }]);
        await new Promise(resolve => setTimeout(resolve, 500));

        setHistory(prev => [...prev, {
            role: 'model',
            text: "accessing user profile...",
            timestamp: new Date(),
            isSystem: true
        }]);

        const initData = await initializeSession();

        if (initData) {
            setHistory(prev => [...prev, {
                role: 'model',
                text: `profile initialized: ${initData.userId}`,
                timestamp: new Date(),
                isSystem: true
            }]);
        } else {
            setHistory(prev => [...prev, {
                role: 'model',
                text: 'profile fetch failed: using local guest...',
                timestamp: new Date(),
                isSystem: true
            }]);
        }
        await new Promise(resolve => setTimeout(resolve, 200));

        setHistory(prev => [...prev, {
            role: 'model',
            text: "starting nexus kernel...",
            timestamp: new Date(),
            isSystem: true
        }]);
        await new Promise(resolve => setTimeout(resolve, 500));

        if (initData) {
            setSessionInfo({
                userRequestsLeft: initData.userRequestsLeft,
                globalRequestsLeft: initData.globalRequestsLeft
            });

            setHistory([{
                role: 'model',
                text: `# NEXUS v${APP_VERSION} INITIALIZED...\n\nType \`help\` for available commands or ask anything about the portfolio (dare to be roasted)`,
                timestamp: new Date(),
                isSuccess: true,
                isSystem: true
            }]);

            const userRemaining = parseInt(initData.userRequestsLeft.split('/')[0] ?? '0');
            const globalRemaining = parseInt(initData.globalRequestsLeft.split('/')[0] ?? '0');

            if (userRemaining === 0 || globalRemaining === 0) {
                const limitType = userRemaining === 0 ? 'user request limit reached (50/day)' : 'global request limit reached (1,000/day)';
                setIsRateLimited(true);

                const resetAt = initData.resetAt ? new Date(initData.resetAt).toLocaleString(undefined, {
                    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : '00:00 UTC';

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
            setSessionInfo({
                userRequestsLeft: 'OFFLINE',
                globalRequestsLeft: 'OFFLINE'
            });

            setHistory([{
                role: 'model',
                text: `# NEXUS v${APP_VERSION} INITIALIZED (OFFLINE MODE)...\n\nType \`help\` for available commands or ask anything about the portfolio (dare to be roasted)`,
                timestamp: new Date(),
                isSuccess: true,
                isSystem: true
            }]);

            setIsRateLimited(true);
            setHasInitFailed(true);

            setTimeout(() => {
                setHistory(prev => [...prev, {
                    role: 'model',
                    text: `\`AI CORE OFFLINE\`\n\nlocal chat service unreachable.\n\n## ENTERING COMMAND-ONLY MODE`,
                    timestamp: new Date(),
                    isError: true
                }]);
            }, 100);
        }

        setIsBooting(false);
        setHasBooted(true);
    }, []);

    // Boot sequence logic
    useEffect(() => {
        if (hasBooted || isBooting) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];
                if (firstEntry?.isIntersecting) {
                    void runBootSequence();
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        if (terminalRef.current) {
            observer.observe(terminalRef.current);
        }

        return () => observer.disconnect();
    }, [hasBooted, isBooting, runBootSequence]);

    const handleReconnect = () => {
        setIsTerminated(false);
        setIsMatrixActive(false);
        setHasBooted(false);
        setHistory([]);
        void runBootSequence();
    };



    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            // Slight delay allows React to render the DOM elements before measuring scrollHeight
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 50);
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
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void handleSend(e as unknown as React.FormEvent);
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

        const lowerCmd = cmd.toLowerCase();
        const isCommandInput = COMMAND_INPUTS.has(lowerCmd);
        const isLocalCommand = isRateLimited || isCommandInput;
        const userMsg: ChatMessage = {
            role: 'user',
            text: cmd,
            timestamp: new Date(),
            isCommand: isLocalCommand
        };

        setHistory(prev => [...prev, userMsg]);
        setInput('');
        setCommandHistory(prev => [...prev, cmd]);
        setHistoryIndex(-1);
        setIsLoading(true);
        setError(null);

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



        if (lowerCmd === 'whoami') {
            setHistory(prev => [...prev, whoamiCommand()]);
            setIsLoading(false);
            return;
        }

        if (lowerCmd === 'contact') {
            setHistory(prev => [...prev, contactCommand(contact)]);
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
                isError: true,
                isCommand: true
            };
            setHistory(prev => [...prev, notFoundMsg]);
            setIsLoading(false);
            return;
        }

        void sendMessageStream(
            cmd,
            (accumulatedText: string) => {
                // Update the last bot message with accumulated text
                setHistory(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg && lastMsg.role === 'model' && !lastMsg.isSystem && !lastMsg.isError) {
                        // Update existing message
                        return [
                            ...prev.slice(0, -1),
                            { ...lastMsg, text: accumulatedText }
                        ];
                    } else {
                        // Create new message
                        return [
                            ...prev,
                            {
                                role: 'model',
                                text: accumulatedText,
                                timestamp: new Date()
                            }
                        ];
                    }
                });
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
                    setError("NETWORK ERROR: Unable to connect to the local chat service. Please check your connection.");
                } else {
                    setError(`CONNECTION ERROR: ${errorMessage}`);
                }
                setIsLoading(false);
            },
            history.filter(
                m =>
                    !m.isSystem &&
                    !m.isError &&
                    !m.isMenu &&
                    !m.isNeofetch &&
                    !m.isCommand &&
                    (m.role === 'user' || m.role === 'model')
            ),
            handleLimitUpdate
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
    };
};
