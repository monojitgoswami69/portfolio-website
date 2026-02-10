import { ChatMessage } from '../types';

export const matrixCommand = (isMatrixActive: boolean): { message: ChatMessage; activate: boolean } => {
    if (isMatrixActive) {
        return {
            message: {
                role: 'model',
                text: "Already in the matrix.",
                subtext: "type escape-the-matrix to return to reality",
                timestamp: new Date()
            },
            activate: false
        };
    }
    return {
        message: {
            role: 'model',
            text: "Entering the matrix...",
            subtext: "type escape-the-matrix to return to reality",
            timestamp: new Date()
        },
        activate: true
    };
};

export const escapeMatrixCommand = (): ChatMessage => ({
    role: 'model',
    text: "Escaped the matrix.",
    timestamp: new Date(),
    isSuccess: true
});
