// Contact API Service - handles network communication only
// Zero UI logic. Zero side effects beyond network.

import { createTimeoutController, isValidEmail, isNonEmpty } from '../utils/security';

interface ContactFormData {
    name: string;
    email: string;
    message: string;
}

interface ContactResult {
    success: boolean;
    error?: string;
}

const getApiUrl = (): string => {
    return (import.meta.env.VITE_PORTFOLIO_API_URL as string) || 'http://localhost:8000';
};

const REQUEST_TIMEOUT_MS = 10000; // 10 seconds

export const submitContactForm = async (data: ContactFormData): Promise<ContactResult> => {
    try {
        if (!isNonEmpty(data.name) || !isNonEmpty(data.message) || !isValidEmail(data.email)) {
            return { success: false, error: 'Invalid form data. Please check all fields.' };
        }

        const apiUrl = getApiUrl();
        const { controller, timeoutId } = createTimeoutController(REQUEST_TIMEOUT_MS);

        const response = await fetch(`${apiUrl}/api/v1/communication/submit`, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            return { success: true };
        } else {
            return { success: false, error: 'Failed to send message. Please try again.' };
        }
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            return { success: false, error: 'Request timeout. Please try again.' };
        }
        return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
};
