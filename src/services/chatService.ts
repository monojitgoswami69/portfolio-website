// Chat API Service - Connected to backend streaming API
// Points to the new FastAPI backend endpoint
import { createTimeoutController, isNonEmpty, sanitizeInput } from '../utils/security';

const BACKEND_URL = import.meta.env.VITE_CHAT_API_URL || 'https://api.nexus.mgbuilds.in';
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds
const MAX_MESSAGE_LENGTH = 1000;

export interface ChatRequest {
  message: string;
  history?: Array<{ role: string; parts: string[] }>;
  roast_level?: string;
}

export interface ChatResponse {
  status: string;
  response: string;
  timestamp: string;
}

// Callback for receiving streaming chunks with full text
export type StreamCallback = (chunk: string) => void;

// Initialize session and get user info
export const initializeSession = async (): Promise<{ userId: string; userRequestsLeft: string; globalRequestsLeft: string; resetAt?: string } | null> => {
  try {
    const { controller, timeoutId } = createTimeoutController(30000);
    const response = await fetch(`${BACKEND_URL}/initialize`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json() as { user_id: string; user_requests_left: string; global_requests_left: string; reset_at?: string };

    // Store in session storage
    sessionStorage.setItem('nexus_user_id', data.user_id);
    sessionStorage.setItem('nexus_user_requests', data.user_requests_left);
    sessionStorage.setItem('nexus_global_requests', data.global_requests_left);
    if (data.reset_at) {
      sessionStorage.setItem('nexus_reset_at', data.reset_at);
    }

    return {
      userId: data.user_id,
      userRequestsLeft: data.user_requests_left,
      globalRequestsLeft: data.global_requests_left,
      resetAt: data.reset_at
    };
  } catch (error) {
    console.error("Initialization failed:", error);
    return null;
  }
};

// Check backend health
export const checkHealth = async (): Promise<boolean> => {
  try {
    const { controller, timeoutId } = createTimeoutController(30000);
    const response = await fetch(`${BACKEND_URL}/`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
};

// Send message using non-streaming endpoint (default)
export const sendMessage = async (
  message: string,
  onResponse: (response: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void,
  history: Array<{ role: string; text: string }> = [],
  roastLevel?: string,
  onUpdateLimits?: (limits: { userRequestsLeft: string; globalRequestsLeft: string }) => void
): Promise<void> => {
  try {
    if (!isNonEmpty(message)) {
      throw new Error("Message cannot be empty");
    }

    const sanitizedMessage = sanitizeInput(message, MAX_MESSAGE_LENGTH);

    // Format history for backend: { role: "user" | "model", parts: ["text"] }
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [msg.text]
    }));

    const { controller, timeoutId } = createTimeoutController(REQUEST_TIMEOUT_MS);

    const payload: ChatRequest = {
      message: sanitizedMessage,
      history: formattedHistory
    };

    if (roastLevel) {
      payload.roast_level = roastLevel.toLowerCase();
    }

    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    clearTimeout(timeoutId);

    // Handle rate limiting (429 status)
    if (response.status === 429) {
      let resetAt: string | null = null;
      let limit: string = 'Unknown';
      let errorType = 'unknown';

      // Try to parse JSON body
      try {
        const rateLimitData = await response.json();
        if (rateLimitData) {
          resetAt = rateLimitData.reset_at;
          limit = String(rateLimitData.limit || 'Unknown');
          errorType = rateLimitData.error || 'unknown';
        }
      } catch {
        console.warn("Could not parse 429 JSON body, trying headers...");
      }

      // Fallback to headers if body failed
      if (!resetAt) {
        resetAt = response.headers.get('X-RateLimit-Reset');
      }
      if (limit === 'Unknown') {
        limit = response.headers.get('X-RateLimit-Limit') || response.headers.get('X-RateLimit-Global-Limit') || 'Unknown';
      }

      // Default safe message logic
      const resetTime = resetAt ? new Date(resetAt) : new Date(Date.now() + 60000); // Default 1m
      const now = new Date();
      let diffMs = resetTime.getTime() - now.getTime();
      if (isNaN(diffMs) || diffMs < 0) diffMs = 60000; // Safe fallback

      // Calculate relative time
      let relativeTimeStr = '';
      if (diffMs > 0) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.ceil((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) relativeTimeStr = `${hours}h ${minutes}m`;
        else relativeTimeStr = `${minutes}m`;
      } else {
        relativeTimeStr = '1m';
      }

      const localResetTime = resetTime.toLocaleString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      const isGlobalLimit = errorType === 'global_limit' || limit === '1000'; // Inference
      const limitMessage = isGlobalLimit
        ? `Global system limit reached (${limit}/day).`
        : `Daily limit reached (${limit}/day).`;

      // Set allocation to 0 when rate limited
      sessionStorage.setItem('nexus_user_requests', '0/50');
      sessionStorage.setItem('nexus_global_requests', '0/1000');

      if (onUpdateLimits) {
        onUpdateLimits({
          userRequestsLeft: '0/50',
          globalRequestsLeft: '0/1000'
        });
      }

      const errorMsg = `RATE_LIMIT_ERROR: ${limitMessage}\n\nRESETS IN: ${relativeTimeStr} (at ${localResetTime})`;
      throw new Error(errorMsg);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Extract rate limit info from headers
    const userRemaining = response.headers.get('X-RateLimit-Remaining');
    const globalRemaining = response.headers.get('X-RateLimit-Global-Remaining');

    if (userRemaining) sessionStorage.setItem('nexus_user_requests', userRemaining);
    if (globalRemaining) sessionStorage.setItem('nexus_global_requests', globalRemaining);

    if (onUpdateLimits && userRemaining && globalRemaining) {
      onUpdateLimits({
        userRequestsLeft: userRemaining,
        globalRequestsLeft: globalRemaining
      });
    }

    const data = await response.json();

    if (data.status === 'success' && data.response) {
      onResponse(data.response);
      onComplete();
    } else {
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    // Fallback to offline response if backend is unavailable
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const offlineResponse = getOfflineResponse(message);
      onResponse(offlineResponse);
      onComplete();
      return;
    }

    // Handle abort/timeout
    if (error instanceof Error && error.name === 'AbortError') {
      onError(new Error('Request timeout - please try again'));
      return;
    }

    if (error instanceof Error) {
      onError(error);
    } else {
      onError(new Error('Unknown error occurred'));
    }
  }
};

// Send message using streaming endpoint (optional)
export const sendMessageStream = async (
  message: string,
  onChunk: StreamCallback,
  onComplete: () => void,
  onError: (error: Error) => void,
  history: Array<{ role: string; text: string }> = []
): Promise<void> => {
  try {
    // Format history for backend: { role: "user" | "model", parts: ["text"] }
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [msg.text]
    }));

    const { controller, timeoutId } = createTimeoutController(REQUEST_TIMEOUT_MS);

    const response = await fetch(`${BACKEND_URL}/chat/stream`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: formattedHistory
      }),
    });

    clearTimeout(timeoutId);

    // Handle rate limiting (429 status)
    if (response.status === 429) {
      let resetAt: string | null = null;
      let limit: string = 'Unknown';
      let errorType = 'unknown';

      // Try to parse JSON body
      try {
        const rateLimitData = await response.json();
        if (rateLimitData) {
          resetAt = rateLimitData.reset_at;
          limit = String(rateLimitData.limit || 'Unknown');
          errorType = rateLimitData.error || 'unknown';
        }
      } catch {
        console.warn("Could not parse 429 JSON body, trying headers...");
      }

      // Fallback to headers if body failed
      if (!resetAt) {
        resetAt = response.headers.get('X-RateLimit-Reset');
      }
      if (limit === 'Unknown') {
        limit = response.headers.get('X-RateLimit-Limit') || response.headers.get('X-RateLimit-Global-Limit') || 'Unknown';
      }

      // Default safe message logic
      const resetTime = resetAt ? new Date(resetAt) : new Date(Date.now() + 60000); // Default 1m
      const now = new Date();
      let diffMs = resetTime.getTime() - now.getTime();
      if (isNaN(diffMs) || diffMs < 0) diffMs = 60000; // Safe fallback

      // Calculate relative time
      let relativeTimeStr = '';
      if (diffMs > 0) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.ceil((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) relativeTimeStr = `${hours}h ${minutes}m`;
        else relativeTimeStr = `${minutes}m`;
      } else {
        relativeTimeStr = '1m';
      }

      const localResetTime = resetTime.toLocaleString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      const isGlobalLimit = errorType === 'global_limit' || limit === '1000'; // Inference
      const limitMessage = isGlobalLimit
        ? `Global system limit reached (${limit}/day).`
        : `Daily limit reached (${limit}/day).`;

      const errorMsg = `RATE_LIMIT_ERROR: ${limitMessage}\n\nRESETS IN: ${relativeTimeStr} (at ${localResetTime})`;
      throw new Error(errorMsg);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let accumulatedResponse = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Flush any remaining decoder bytes (multi-byte UTF-8 sequences)
        const finalBytes = decoder.decode(new Uint8Array(), { stream: false });
        if (finalBytes) {
          buffer += finalBytes;
        }

        // Process any remaining buffered data
        if (buffer.trim()) {
          const lines = buffer.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const rawData = line.slice(6);
              if (rawData.trim() && rawData.trim() !== '[DONE]' && rawData.trim() !== '[ERROR]') {
                accumulatedResponse += rawData;
                onChunk(accumulatedResponse);
              }
            }
          }
        }

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
          const rawData = line.slice(6); // Remove 'data: ' prefix

          if (!rawData.trim()) continue; // Skip empty keep-alive or newlines

          // Check for completion signal
          if (rawData.trim() === '[DONE]') {
            // Stream completed successfully, stop processing
            onComplete();
            return;
          }

          // Check for error signal
          if (rawData.trim() === '[ERROR]') {
            onError(new Error('Stream encountered an error'));
            return;
          }

          // New backend sends raw text in data field
          // It's not valid JSON anymore, so we take it as string
          // Only weird case is if the backend sends newlines, they might be split

          accumulatedResponse += rawData;
          onChunk(accumulatedResponse);
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

    // Handle abort/timeout
    if (error instanceof Error && error.name === 'AbortError') {
      onError(new Error('Request timeout - please try again'));
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
