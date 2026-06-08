import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from './types';
import { makeMessageId } from './messageId';
import { RateLimitUpdate, sendMessageStream } from '@/features/chat/client/chatService';
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
import { useCommandHistory } from './hooks/useCommandHistory';
import { useBootSequence } from './hooks/useBootSequence';

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

export const useAIChat = ({ projects, contact }: UseAIChatOptions) => {
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRateLimited, setIsRateLimited] = useState(false);
    const [isMatrixActive, setIsMatrixActive] = useState(false);
    const [isTerminated, setIsTerminated] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionInfo, setSessionInfo] = useState<{ userRequestsLeft: string; globalRequestsLeft: string } | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);

    const { addToHistory, navigateHistory } = useCommandHistory();
    const { isBooting, hasBooted, setHasBooted, runBootSequence } = useBootSequence();
    const [hasInitFailed, setHasInitFailed] = useState(false);
    const commandOnlyNoticeShown = useRef(false);
    const pendingCommandOnlyNotice = useRef<RateLimitUpdate | null>(null);

    const getRemainingCount = (value: string) => {
        const match = value.match(/^\s*(\d+)/);
        return match ? Number(match[1]) : Number.NaN;
    };

    const formatResetAt = (resetAt?: string | null) => {
        if (!resetAt) return 'next reset';
        const date = new Date(resetAt);
        if (Number.isNaN(date.getTime())) return 'next reset';
        return date.toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getLimitNoticeDetails = useCallback((limits: RateLimitUpdate) => {
        const userRemaining = getRemainingCount(limits.userRequestsLeft);
        const globalRemaining = getRemainingCount(limits.globalRequestsLeft);
        const exhaustedUser = userRemaining === 0;
        const exhaustedGlobal = globalRemaining === 0;

        if (!exhaustedUser && !exhaustedGlobal) return null;

        return {
            limitType: exhaustedUser
                ? `user request limit reached (${limits.userRequestsLeft})`
                : `global request limit reached (${limits.globalRequestsLeft})`,
            resetAt: limits.resetAt
        };
    }, []);

    const appendCommandOnlyNotice = useCallback((limits: RateLimitUpdate) => {
        if (commandOnlyNoticeShown.current) return;

        const details = getLimitNoticeDetails(limits);
        if (!details) return;

        commandOnlyNoticeShown.current = true;
        pendingCommandOnlyNotice.current = null;

        setHistory(prev => [...prev, {
            id: makeMessageId(),
            role: 'model',
            text: `**ACCESS RESTRICTED**\n\n${details.limitType}.\n\nResets at ${formatResetAt(details.resetAt)}.\n\n**ENTERING COMMAND-ONLY MODE**`,
            timestamp: new Date(),
            isError: true
        }]);
    }, [getLimitNoticeDetails]);

    const handleLimitUpdate = useCallback((limits: RateLimitUpdate) => {
        setSessionInfo(limits);

        const userRemaining = getRemainingCount(limits.userRequestsLeft);
        const globalRemaining = getRemainingCount(limits.globalRequestsLeft);

        if (!Number.isNaN(userRemaining) && !Number.isNaN(globalRemaining)) {
            const limited = userRemaining === 0 || globalRemaining === 0;
            setIsRateLimited(limited);
            if (limited) {
                pendingCommandOnlyNotice.current = limits;
            }
        }
    }, []);

    // Boot sequence logic
    useEffect(() => {
        if (hasBooted || isBooting) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];
                if (firstEntry?.isIntersecting) {
                    void (async () => {
                        const result = await runBootSequence(setHistory);
                        setSessionInfo(result.sessionInfo);
                        setIsRateLimited(result.isRateLimited);
                        setHasInitFailed(result.hasInitFailed);
                    })();
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
        setHasInitFailed(false);
        commandOnlyNoticeShown.current = false;
        pendingCommandOnlyNotice.current = null;
        setHasBooted(false);
        setHistory([]);
        void (async () => {
            const result = await runBootSequence(setHistory);
            setSessionInfo(result.sessionInfo);
            setIsRateLimited(result.isRateLimited);
            setHasInitFailed(result.hasInitFailed);
        })();
    };

    // Keep live output pinned only while the user is already reading the bottom.
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distanceFromBottom > 80) return;

        requestAnimationFrame(() => {
            el.scrollTop = el.scrollHeight;
        });
    }, [history, isLoading]);

    const handleTerminalClick = (event: React.MouseEvent) => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) return;
        if (event.detail > 1) return;

        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const cmd = navigateHistory('up');
            if (cmd !== null) setInput(cmd);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const cmd = navigateHistory('down');
            if (cmd !== null) setInput(cmd);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const currentInput = input.trim().toLowerCase();
            if (!currentInput) return;
            const matches = COMMANDS.filter(c => c.startsWith(currentInput));
            if (matches.length > 0 && matches[0]) {
                setInput(matches[0]);
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
            id: makeMessageId(),
            role: 'user',
            text: cmd,
            timestamp: new Date(),
            isCommand: isLocalCommand
        };

        setHistory(prev => [...prev, userMsg]);
        setInput('');
        addToHistory(cmd);
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
                id: makeMessageId(),
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
                setHistory(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg && lastMsg.role === 'model' && !lastMsg.isSystem && !lastMsg.isError) {
                        return [
                            ...prev.slice(0, -1),
                            { ...lastMsg, text: accumulatedText }
                        ];
                    } else {
                        return [
                            ...prev,
                            {
                                id: makeMessageId(),
                                role: 'model',
                                text: accumulatedText,
                                timestamp: new Date()
                            }
                        ];
                    }
                });
            },
            () => {
                const pendingNotice = pendingCommandOnlyNotice.current;
                if (pendingNotice) {
                    appendCommandOnlyNotice(pendingNotice);
                }
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

                    const formattedError = `**ACCESS RESTRICTED**\n\n${limitDetails}.\n\nResets at ${timeAt || 'next reset'}.\n\n**ENTERING COMMAND-ONLY MODE**`;

                    setIsRateLimited(true);
                    commandOnlyNoticeShown.current = true;
                    pendingCommandOnlyNotice.current = null;
                    setHistory(prev => [...prev, {
                        id: makeMessageId(),
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
    };
};
