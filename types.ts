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

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
  isSuccess?: boolean;
  isSystem?: boolean;
  isMenu?: boolean;
  menuOptions?: string[];
  menuOptionDescriptions?: string[];
  selectedIndex?: number;
  isNeofetch?: boolean;
  subtext?: string;
}

export enum Section {
  HERO = 'hero',
  ABOUT = 'about',
  SKILLS = 'skills',
  PROJECTS = 'projects',
  CHAT = 'chat',
  CONTACT = 'contact'
}