// ─────────────────────────────────────────────────────────────
// RATE LIMITER — In-memory sliding window
// Production: replace with Redis-based implementation
// ─────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, 60_000);

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

const DEFAULTS = {
  // Auth endpoints: 5 attempts per minute per IP
  auth: { windowMs: 60_000, maxRequests: 5, message: "Too many attempts. Try again in 1 minute." },
  // Standard endpoints: 30 requests per 10 seconds per IP
  standard: { windowMs: 10_000, maxRequests: 30, message: "Too many requests. Slow down." },
  // Admin endpoints: 60 requests per minute
  admin: { windowMs: 60_000, maxRequests: 60, message: "Too many requests. Slow down." },
  // Contact endpoints: 3 per hour
  contact: { windowMs: 3_600_000, maxRequests: 3, message: "Too many submissions. Try again later." },
};

/**
 * Check rate limit for a given key.
 * Returns object with `allowed` boolean and headers to set.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULTS.auth
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  entry.count += 1;
  const remaining = Math.max(0, config.maxRequests - entry.count);

  if (entry.count > config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining, resetAt: entry.resetAt };
}

/**
 * Creates a Response with rate limit headers.
 */
export function rateLimitResponse(message: string, resetAt: number): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: { message, status: 429 },
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
      },
    }
  );
}

/**
 * Middleware-style wrapper for API handlers.
 * Returns a rate-limited response if exceeded, or null to proceed.
 */
export function withRateLimit(
  key: string,
  config?: RateLimitConfig
): Response | null {
  const result = checkRateLimit(key, config);
  if (!result.allowed) {
    return rateLimitResponse(config?.message ?? DEFAULTS.auth.message, result.resetAt);
  }
  return null;
}

export function getRateLimitKey(ip: string, endpoint: string): string {
  return `${ip}:${endpoint}`;
}

export { DEFAULTS as RATE_LIMIT_CONFIG };
