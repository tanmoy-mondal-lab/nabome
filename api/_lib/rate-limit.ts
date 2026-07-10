// ─────────────────────────────────────────────────────────────
// RATE LIMITER — Cloudflare KV sliding window with in-memory fallback
// ─────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const inMemoryStore = new Map<string, RateLimitEntry>();

// Lazy cleanup function - removes expired entries when called
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of inMemoryStore) {
    if (entry.resetAt <= now) {
      inMemoryStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

const DEFAULTS = {
  auth: { windowMs: 60_000, maxRequests: 5, message: "Too many attempts. Try again in 1 minute." },
  standard: { windowMs: 10_000, maxRequests: 30, message: "Too many requests. Slow down." },
  admin: { windowMs: 60_000, maxRequests: 60, message: "Too many requests. Slow down." },
  contact: { windowMs: 3_600_000, maxRequests: 3, message: "Too many submissions. Try again later." },
  resendVerification: { windowMs: 3_600_000, maxRequests: 3, message: "Too many verification requests. Please try again later." },
};

function getKVBinding(env?: any): any | null {
  if (!env) return null;
  // Cloudflare Pages binds KV as a property on the env object
  const kv = env.RATE_LIMIT_STORE;
  if (kv && typeof kv.get === "function" && typeof kv.put === "function") {
    return kv;
  }
  return null;
}

function isProductionRuntime(env?: any): boolean {
  const nodeEnv = env?.NODE_ENV ?? (typeof process !== "undefined" ? process.env?.NODE_ENV : undefined);
  const cfPages = env?.CF_PAGES ?? (typeof process !== "undefined" ? process.env?.CF_PAGES : undefined);
  return nodeEnv === "production" || cfPages === "1" || cfPages === "true";
}

async function getFromKV(kv: any, key: string): Promise<RateLimitEntry | null> {
  try {
    const value = await kv.get(key, { type: "json" });
    return value ? (value as RateLimitEntry) : null;
  } catch (error) {
    return null;
  }
}

async function setKV(kv: any, key: string, value: RateLimitEntry): Promise<void> {
  try {
    await kv.put(key, JSON.stringify(value), {
      expirationTtl: Math.ceil((value.resetAt - Date.now()) / 1000),
    });
  } catch (error) {
    // Silent failure - KV write error
  }
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULTS.auth,
  env?: any
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const kv = getKVBinding(env);

  if (kv) {
    // KV-based distributed rate limiting (production)
    // KV is eventually consistent — under high concurrency a few extra requests
    // may slip through. A 10% grace window compensates without weakening protection.
    let entry = await getFromKV(kv, key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 1, resetAt: now + config.windowMs };
      await setKV(kv, key, entry);
      return { allowed: true, remaining: config.maxRequests - 1, resetAt: entry.resetAt };
    }

    entry.count += 1;
    // Allow a small grace window (10% of max) to account for KV eventual consistency
    const remaining = Math.max(0, config.maxRequests - entry.count);

    if (entry.count > config.maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    await setKV(kv, key, entry);
    return { allowed: true, remaining, resetAt: entry.resetAt };
  }

  if (isProductionRuntime(env)) {
    console.warn(
      `[rate-limit] KV unavailable in production — falling back to in-memory rate limiting for key "${key.split(":")[0]}"`
    );
    // Lazy cleanup of expired entries
    cleanupExpiredEntries();
    const inMemEntry = inMemoryStore.get(key);
    if (inMemEntry && inMemEntry.resetAt > now) {
      inMemEntry.count += 1;
      if (inMemEntry.count > config.maxRequests) {
        return { allowed: false, remaining: 0, resetAt: inMemEntry.resetAt };
      }
      return { allowed: true, remaining: Math.max(0, config.maxRequests - inMemEntry.count), resetAt: inMemEntry.resetAt };
    }
    const newEntry: RateLimitEntry = { count: 1, resetAt: now + config.windowMs };
    inMemoryStore.set(key, newEntry);
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: newEntry.resetAt };
  }

  // No KV available locally — allow request so localhost stays usable.
  return { allowed: true, remaining: config.maxRequests, resetAt: now + config.windowMs };
}

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
    },
  );
}

export async function withRateLimit(
  key: string,
  config?: RateLimitConfig,
  env?: any
): Promise<Response | null> {
  const result = await checkRateLimit(key, config, env);
  if (!result.allowed) {
    return rateLimitResponse(config?.message ?? DEFAULTS.auth.message, result.resetAt);
  }
  return null;
}

export function getRateLimitKey(ip: string, endpoint: string, userId?: string): string {
  // Use userId when available for per-user rate limiting
  const identifier = userId ?? ip;
  return `${identifier}:${endpoint}`;
}

export { DEFAULTS as RATE_LIMIT_CONFIG };
