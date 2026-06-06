import { useState, useCallback } from 'react';

export const useCommandHistory = () => {
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const addToHistory = useCallback((command: string) => {
        setCommandHistory(prev => [...prev, command]);
        setHistoryIndex(-1);
    }, []);

    const navigateHistory = useCallback((direction: 'up' | 'down'): string | null => {
        if (direction === 'up' && commandHistory.length > 0) {
            const nextIndex = historyIndex + 1;
            if (nextIndex < commandHistory.length) {
                setHistoryIndex(nextIndex);
                return commandHistory[commandHistory.length - 1 - nextIndex] ?? null;
            }
        } else if (direction === 'down') {
            if (historyIndex > 0) {
                const nextIndex = historyIndex - 1;
                setHistoryIndex(nextIndex);
                return commandHistory[commandHistory.length - 1 - nextIndex] ?? null;
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                return '';
            }
        }
        return null;
    }, [commandHistory, historyIndex]);

    return {
        addToHistory,
        navigateHistory
    };
};
