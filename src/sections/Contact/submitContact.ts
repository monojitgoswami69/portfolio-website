// Submit contact form - bridges UI validation and API service
import { sanitizeInput } from '../../utils/security';
import { submitContactForm } from '../../services/contactService';

interface SubmitContactData {
    name: string;
    email: string;
    message: string;
}

interface SubmitResult {
    success: boolean;
    error?: string;
}

export const submitContact = async (formData: SubmitContactData): Promise<SubmitResult> => {
    // Sanitize inputs before sending
    const sanitizedData = {
        name: sanitizeInput(formData.name, 100),
        email: sanitizeInput(formData.email, 254),
        message: sanitizeInput(formData.message, 2000)
    };

    return submitContactForm(sanitizedData);
};
