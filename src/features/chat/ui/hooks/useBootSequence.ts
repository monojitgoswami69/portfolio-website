import { useState, useCallback } from 'react';
import { ChatMessage } from '../types';
import { makeMessageId } from '../messageId';
import { initializeSession } from '@/features/chat/client/chatService';
import { APP_VERSION } from '@/lib/version';

interface BootSequenceResult {
    sessionInfo: { userRequestsLeft: string; globalRequestsLeft: string } | null;
    isRateLimited: boolean;
    hasInitFailed: boolean;
}

export const useBootSequence = () => {
    const [isBooting, setIsBooting] = useState(false);
    const [hasBooted, setHasBooted] = useState(false);

    const runBootSequence = useCallback(async (
        setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>
    ): Promise<BootSequenceResult> => {
        setIsBooting(true);

        setHistory(prev => [...prev, {
            id: makeMessageId(),
            role: 'model',
            text: "beginning startup sequence...",
            timestamp: new Date(),
            isSystem: true
        }]);
        await new Promise(resolve => setTimeout(resolve, 500));

        setHistory(prev => [...prev, {
            id: makeMessageId(),
            role: 'model',
            text: "accessing user profile...",
            timestamp: new Date(),
            isSystem: true
        }]);

        const initData = await initializeSession();

        if (initData) {
            setHistory(prev => [...prev, {
                id: makeMessageId(),
                role: 'model',
                text: `profile initialized: ${initData.userId}`,
                timestamp: new Date(),
                isSystem: true
            }]);
        } else {
            setHistory(prev => [...prev, {
                id: makeMessageId(),
                role: 'model',
                text: 'profile fetch failed: using local guest...',
                timestamp: new Date(),
                isSystem: true
            }]);
        }
        await new Promise(resolve => setTimeout(resolve, 200));

        setHistory(prev => [...prev, {
            id: makeMessageId(),
            role: 'model',
            text: "starting nexus kernel...",
            timestamp: new Date(),
            isSystem: true
        }]);
        await new Promise(resolve => setTimeout(resolve, 500));

        let sessionInfo: { userRequestsLeft: string; globalRequestsLeft: string } | null = null;
        let isRateLimited = false;
        let hasInitFailed = false;

        if (initData) {
            sessionInfo = {
                userRequestsLeft: initData.userRequestsLeft,
                globalRequestsLeft: initData.globalRequestsLeft
            };

            setHistory([{
                id: makeMessageId(),
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
                isRateLimited = true;

                const resetAt = initData.resetAt ? new Date(initData.resetAt).toLocaleString(undefined, {
                    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : '00:00 UTC';

                setTimeout(() => {
                    setHistory(prev => [...prev, {
                        id: makeMessageId(),
                        role: 'model',
                        text: `\`ACCESS RESTRICTED\`\n\n${limitType}.\n\nresets at \`${resetAt}\`\n\n## ENTERING COMMAND-ONLY MODE`,
                        timestamp: new Date(),
                        isError: true
                    }]);
                }, 100);
            }
        } else {
            sessionInfo = {
                userRequestsLeft: 'OFFLINE',
                globalRequestsLeft: 'OFFLINE'
            };

            setHistory([{
                id: makeMessageId(),
                role: 'model',
                text: `# NEXUS v${APP_VERSION} INITIALIZED (OFFLINE MODE)...\n\nType \`help\` for available commands or ask anything about the portfolio (dare to be roasted)`,
                timestamp: new Date(),
                isSuccess: true,
                isSystem: true
            }]);

            isRateLimited = true;
            hasInitFailed = true;

            setTimeout(() => {
                setHistory(prev => [...prev, {
                    id: makeMessageId(),
                    role: 'model',
                    text: `\`AI CORE OFFLINE\`\n\nlocal chat service unreachable.\n\n## ENTERING COMMAND-ONLY MODE`,
                    timestamp: new Date(),
                    isError: true
                }]);
            }, 100);
        }

        setIsBooting(false);
        setHasBooted(true);

        return { sessionInfo, isRateLimited, hasInitFailed };
    }, []);

    return {
        isBooting,
        hasBooted,
        setHasBooted,
        runBootSequence
    };
};
