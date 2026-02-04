// Chat API Service - Ready for your backend integration
// Replace BACKEND_URL with your actual backend endpoint

const BACKEND_URL = import.meta.env.VITE_CHAT_API_URL || '/api/chat';

export interface ChatRequest {
  message: string;
  history?: { role: string; text: string }[];
}

export interface ChatResponse {
  text: string;
  error?: string;
}

export const sendMessage = async (message: string, history: { role: string; text: string }[] = []): Promise<string> => {
  // TODO: Replace this with your actual backend API call
  // Example implementation:
  
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data.text;
  } catch (error) {
    // For now, return a placeholder response until backend is connected
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return getOfflineResponse(message);
    }
    
    if (error instanceof Error) {
      throw new Error(`Chat API Error: ${error.message}`);
    }
    throw new Error('Unknown error occurred');
  }
};

// Temporary offline responses until backend is connected
const getOfflineResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "**NEXUS ONLINE**\n\n> Greetings! I'm currently in `OFFLINE_MODE` as the backend is being configured.\n\n Once connected, I'll be able to answer questions about **Monojit's** skills, projects, and experience.";
  }
  
  if (lowerMessage.includes('skill') || lowerMessage.includes('tech')) {
    return "**TECH STACK:**\n\n- **Languages:** `Python`, `C`, `C++`, `JavaScript`, `SQL`\n- **AI/ML:** LangChain, Hugging Face, Transformers\n- **Databases:** MongoDB, Redis, Pinecone, ChromaDB\n- **Cloud:** GCP, Vercel, Render";
  }
  
  if (lowerMessage.includes('project')) {
    return "**ACTIVE MODULES:**\n\n1. **Agentic RAG Knowledge Base** - Context-aware AI with LangChain\n2. **Distributed Analytics Engine** - High-performance data processing\n3. **VisionGuard AI** - Computer vision anomaly detection\n\nScroll to the **MODULES** section for details.";
  }
  
  if (lowerMessage.includes('contact') || lowerMessage.includes('email')) {
    return "**SIGNAL TRANSMISSION:**\n\n> Navigate to the **SIGNAL** section at the bottom to establish contact.\n\nOr transmit directly to: `contact@monojit.dev`";
  }
  
  return "**SYSTEM NOTICE:**\n\n> Backend neural link not yet established.\n> Running in `DEMO_MODE`\n\nTry asking about:\n- `skills` - Technical capabilities\n- `projects` - Active modules\n- `contact` - Transmission protocols";
};
