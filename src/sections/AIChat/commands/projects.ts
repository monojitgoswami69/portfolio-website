import { ChatMessage } from '../types';

export const projectsCommand = (projects: Array<{ name: string; description: string }>): ChatMessage => {
    const projectsList = projects.map(p => `- **${p.name}**: ${p.description}`).join('\n');
    return {
        role: 'model',
        text: `## ACTIVE MODULES:\n\n${projectsList || 'Loading projects...'}\n\nType \`Tell me more about [Project Name]\` for details.`,
        timestamp: new Date()
    };
};
