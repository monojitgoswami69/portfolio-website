// Chat-specific types only

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
    neofetchArt?: string[];
    neofetchInfo?: { label: string; value: string }[];
    subtext?: string;
}
