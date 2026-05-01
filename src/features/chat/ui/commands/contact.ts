import { ChatMessage } from '../types';

interface ContactInfo {
    email: string;
    socials: {
        github: string;
        linkedin: string;
        twitter: string;
    };
}

export const contactCommand = (contact: ContactInfo): ChatMessage => {
    const lines = [
        contact.email ? `- **Email**: [${contact.email}](mailto:${contact.email})` : null,
        contact.socials.github ? `- **GitHub**: [${contact.socials.github.replace(/^https?:\/\//, '')}](${contact.socials.github})` : null,
        contact.socials.linkedin ? `- **LinkedIn**: [${contact.socials.linkedin.replace(/^https?:\/\//, '')}](${contact.socials.linkedin})` : null,
        contact.socials.twitter ? `- **Twitter**: [${contact.socials.twitter.replace(/^https?:\/\//, '')}](${contact.socials.twitter})` : null,
    ].filter(Boolean);

    return {
        role: 'model',
        text: `## ESTABLISHING SIGNAL...\n\n${lines.join('\n') || 'Contact data unavailable.'}`,
        timestamp: new Date(),
        isCommand: true
    };
};
