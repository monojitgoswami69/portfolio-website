import { ChatMessage } from '../types';

export const whoamiCommand = (): ChatMessage => {
    const storedUid = sessionStorage.getItem('nexus_user_id') || 'GUEST_USER';
    const userRem = sessionStorage.getItem('nexus_user_requests') || 'N/A';
    const globalRem = sessionStorage.getItem('nexus_global_requests') || 'N/A';

    return {
        role: 'model',
        text: `## USER IDENTITY:\n\n- **ID**: \`${storedUid}\`\n- **Privileges**: \`READ_ONLY\`\n- **Session**: \`ACTIVE\`\n- **User Requests Left**: \`${userRem}\`\n- **Global Requests Left**: \`${globalRem}\``,
        timestamp: new Date()
    };
};
