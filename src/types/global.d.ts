export interface Project {
    id: string;
    title: string;
    description: string;
    techStack: string[];
    imageUrl: string;
    githubUrl?: string;
    demoUrl?: string;
}

export interface SkillData {
    subject: string;
    A: number; // Proficiency level (0-100)
    fullMark: number;
}

export enum Section {
    HERO = 'hero',
    ABOUT = 'about',
    SKILLS = 'skills',
    PROJECTS = 'projects',
    CHAT = 'chat',
    CONTACT = 'contact'
}
