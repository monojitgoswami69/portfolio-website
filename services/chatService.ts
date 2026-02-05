// Chat API Service - Connected to backend streaming API
const BACKEND_URL = import.meta.env.VITE_CHAT_API_URL || 'http://localhost:8000/api/v1/chat';

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  status: string;
  response: string;  // Markdown response from backend
  timestamp: string;
  cached: boolean;
}

// Callback for receiving streaming chunks
export type StreamCallback = (chunk: string) => void;

export const sendMessageStream = async (
  message: string,
  onChunk: StreamCallback,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> => {
  try {
    const response = await fetch(`${BACKEND_URL}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onComplete();
        break;
      }

      // Decode the chunk
      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6); // Remove 'data: ' prefix
          try {
            const data = JSON.parse(jsonStr);
            if (data.chunk) {
              onChunk(data.chunk);
            }
            if (data.done) {
              onComplete();
              return;
            }
          } catch (e) {
            console.warn('Failed to parse SSE data:', jsonStr);
          }
        }
      }
    }
  } catch (error) {
    // Fallback to offline response if backend is unavailable
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const offlineResponse = getOfflineResponse(message);
      // Simulate streaming for offline response
      for (let i = 0; i < offlineResponse.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 20));
        onChunk(offlineResponse.slice(0, i + 1));
      }
      onComplete();
      return;
    }

    if (error instanceof Error) {
      onError(error);
    } else {
      onError(new Error('Unknown error occurred'));
    }
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
