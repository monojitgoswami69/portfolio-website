import "server-only";

import { Redis } from "@upstash/redis";

const UPSTASH_REDIS_URL = process.env.UPSTASH_REDIS_URL;
const UPSTASH_REDIS_TOKEN = process.env.UPSTASH_REDIS_TOKEN;

let cachedRedis: Redis | null = null;

function getRedis(): Redis | null {
  if (cachedRedis) return cachedRedis;
  if (!UPSTASH_REDIS_URL || !UPSTASH_REDIS_TOKEN) return null;
  cachedRedis = new Redis({ url: UPSTASH_REDIS_URL, token: UPSTASH_REDIS_TOKEN });
  return cachedRedis;
}

export interface RateLimitConfig {
  /** Identifier scoping the limit (e.g. "admin-login", "contact-form") */
  bucket: string;
  /** Stable subject — typically client IP */
  subject: string;
  /** Number of allowed events in the window */
  limit: number;
  /** Window length in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Fixed-window rate limiter backed by Upstash Redis.
 * Fails open when Redis is not configured — caller decides whether that's OK.
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) {
    return { allowed: true, remaining: config.limit, resetAt: Date.now() + config.windowSeconds * 1000 };
  }

  const key = `rl:${config.bucket}:${config.subject}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, config.windowSeconds);
  }
  const ttl = await redis.ttl(key);
  const resetAt = Date.now() + Math.max(ttl, 0) * 1000;
  const remaining = Math.max(0, config.limit - count);
  return {
    allowed: count <= config.limit,
    remaining,
    resetAt,
  };
}

export function rateLimitHeaders(result: RateLimitResult, limit: number): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
  };
}
