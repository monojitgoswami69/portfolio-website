import type { ChatMessage } from "./types";

let counter = 0;

/**
 * Generates a stable, unique id for a chat message.
 * Uses crypto.randomUUID when available, falls back to a counter+random combo
 * (sufficient since IDs only need to be unique within a single conversation).
 */
export function makeMessageId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    counter += 1;
    return `m_${Date.now()}_${counter}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Convenience factory: returns a ChatMessage with a generated id.
 */
export function makeMessage(message: Omit<ChatMessage, "id">): ChatMessage {
    return { id: makeMessageId(), ...message };
}
