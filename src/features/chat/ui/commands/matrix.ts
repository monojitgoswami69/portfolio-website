import { ChatMessage } from '../types';
import { makeMessageId } from '../messageId';

export const matrixCommand = (isMatrixActive: boolean): { message: ChatMessage; activate: boolean } => {
    if (isMatrixActive) {
        return {
            message: {
                id: makeMessageId(),
                role: 'model',
                text: "Already in the matrix.",
                subtext: "type escape-the-matrix to return to reality",
                timestamp: new Date(),
                isCommand: true
            },
            activate: false
        };
    }
    return {
        message: {
            id: makeMessageId(),
            role: 'model',
            text: "Entering the matrix...",
            subtext: "type escape-the-matrix to return to reality",
            timestamp: new Date(),
            isCommand: true
        },
        activate: true
    };
};

export const escapeMatrixCommand = (): ChatMessage => ({
    id: makeMessageId(),
    role: 'model',
    text: "Escaped the matrix.",
    timestamp: new Date(),
    isSuccess: true,
    isCommand: true
});
