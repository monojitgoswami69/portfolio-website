import { isSafeUrl } from '@/utils/security';

export interface ProjectData {
    id?: string;
    name: string;
    description: string;
    longDescription?: string;
    techStack: string[];
    imageUrl: string;
    githubUrl?: string;
    demoUrl?: string;
    status?: string;
    features?: string[];

    category?: string;
    featured?: boolean;
    visible?: boolean;
}

export const isValidLink = (link?: string): boolean => {
    return isSafeUrl(link);
};

export const getStatusColor = (status?: string): string => {
    switch (status?.toLowerCase()) {
        case 'completed':
            return 'bg-[#a3be8c]/15 text-[#a3be8c]';
        case 'in development':
        case 'under development':
            return 'bg-[#ebcb8b]/15 text-[#ebcb8b]';
        case 'on hold':
            return 'bg-[#bf616a]/15 text-[#bf616a]';
        default:
            return 'bg-[#d8dee9]/10 text-[#d8dee9]';
    }
};
