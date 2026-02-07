// Security utilities for input validation and sanitization

/**
 * Validates if a URL is safe (not javascript:, data:, or vbscript: protocol)
 */
export const isSafeUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed.toUpperCase() === 'NIL' || trimmed.toUpperCase() === 'NULL') {
    return false;
  }
  // Block dangerous protocols
  if (trimmed.match(/^(javascript|data|vbscript|file):/i)) {
    return false;
  }
  return true;
};

/**
 * Sanitizes a URL - returns # if unsafe, otherwise returns the URL
 */
export const sanitizeUrl = (url: string | undefined): string => {
  if (!isSafeUrl(url)) {
    return '#';
  }
  return url!;
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
export const createTimeoutController = (timeoutMs: number): { controller: AbortController; timeoutId: NodeJS.Timeout } => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeoutId };
};
