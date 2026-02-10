import { ChatMessage } from '../types';

export const helpCommand = (): ChatMessage => ({
    role: 'model',
    text: "## AVAILABLE COMMANDS:\n\n- `help` : Show this help message\n- `clear` : Clear terminal output\n- `whoami` : Display current user info\n- `projects` : List active modules\n- `contact` : Display communication channels\n- `neofetch` : Display system information\n- `matrix` : Toggle digital rain effect\n- `roast-level` : Set AI personality intensity\n- `exit` : Terminate current session",
    timestamp: new Date()
});
