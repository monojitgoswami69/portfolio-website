import { isSafeUrl } from '../../utils/security';

export interface ProjectData {
    name: string;
    description: string;
    longDescription?: string;
    techStack: string[];
    imageUrl: string;
    githubUrl?: string;
    demoUrl?: string;
    status?: string;
    features?: string[];
    challenges?: string;
    learnings?: string;
    category?: string;
    featured?: boolean;
}

export const isValidLink = (link?: string): boolean => {
    return isSafeUrl(link);
};

export const getStatusColor = (status?: string): string => {
    switch (status?.toLowerCase()) {
        case 'completed':
            return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'in development':
        case 'under development':
            return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'on hold':
            return 'bg-red-500/20 text-red-400 border-red-500/30';
        default:
            return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
};
