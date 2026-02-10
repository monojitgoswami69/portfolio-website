import { ChatMessage } from '../types';

export const neofetchCommand = (): ChatMessage => {
    const birthDate = new Date(2006, 4, 9); // May 9, 2006
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
        years--;
        months += 12;
    }
    const uptime = `${years} years, ${months} months`;

    return {
        role: 'model',
        text: '',
        neofetchArt: [
            " ██████   ██████   █████████",
            "▒▒██████ ██████   ███▒▒▒▒▒███",
            " ▒███▒█████▒███  ███     ▒▒▒",
            " ▒███▒▒███ ▒███ ▒███",
            " ▒███ ▒▒▒  ▒███ ▒███    █████",
            " ▒███      ▒███ ▒▒███  ▒▒███",
            " █████     █████ ▒▒█████████",
            "▒▒▒▒▒     ▒▒▒▒▒   ▒▒▒▒▒▒▒▒▒"
        ],
        neofetchInfo: [
            { label: 'OS', value: 'monojit goswami' },
            { label: 'Host', value: 'portfolio' },
            { label: 'Kernel', value: 'nexus v2.5.1' },
            { label: 'Uptime', value: uptime },
            { label: 'Shell', value: 'homo sapiens' },
            { label: 'Resolution', value: `${window.innerWidth}x${window.innerHeight}` },
            { label: 'DE', value: 'Framer-Motion-Dynamic' },
            { label: 'WM', value: 'Tailwind-Static' }
        ],
        timestamp: new Date(),
        isNeofetch: true
    };
};
