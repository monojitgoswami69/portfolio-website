// Security utilities for input validation and sanitization

const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:'];

/**
 * Validates if a URL is safe using a strict allowlist of protocols.
 * Only http, https, and mailto URLs are permitted.
 */
export const isSafeUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed.toUpperCase() === 'NIL' || trimmed.toUpperCase() === 'NULL') {
    return false;
  }
  try {
    const parsed = new URL(trimmed, window.location.origin);
    return ALLOWED_PROTOCOLS.includes(parsed.protocol);
  } catch {
    // Relative URLs (e.g. /path) are safe
    return !trimmed.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:/);
  }
};

/**
 * Sanitizes a URL - returns '#' if unsafe, otherwise returns the URL.
 * Used for project links, social links, etc.
 */
export const sanitizeUrl = (url: string | undefined): string => {
  if (!isSafeUrl(url)) {
    return '#';
  }
  return url ?? '#';
};

/**
 * Sanitizes a URL specifically for markdown-rendered content.
 * Blocks dangerous protocols; returns null if blocked (caller should show [Blocked URL]).
 */
export const sanitizeMarkdownUrl = (href: string | undefined): string | null => {
  if (!href) return null;
  if (!isSafeUrl(href)) return null;
  return href;
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || email.length > 254) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitizes text input by trimming and limiting length
 */
export const sanitizeInput = (input: string, maxLength: number): string => {
  return input.trim().slice(0, maxLength);
};

/**
 * Validates that a string doesn't contain only whitespace
 */
export const isNonEmpty = (str: string): boolean => {
  return str.trim().length > 0;
};

/**
 * Rate limiter class for client-side rate limiting
 */
export class RateLimiter {
  private lastCallTime: number = 0;
  private interval: number;

  constructor(intervalMs: number) {
    this.interval = intervalMs;
  }

  canProceed(): boolean {
    const now = Date.now();
    if (now - this.lastCallTime >= this.interval) {
      this.lastCallTime = now;
      return true;
    }
    return false;
  }

  getRemainingTime(): number {
    const now = Date.now();
    const elapsed = now - this.lastCallTime;
    return Math.max(0, this.interval - elapsed);
  }

  reset(): void {
    this.lastCallTime = 0;
  }
}

/**
 * Creates an AbortController with timeout
 */
export const createTimeoutController = (timeoutMs: number): { controller: AbortController; timeoutId: ReturnType<typeof setTimeout> } => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeoutId };
};
