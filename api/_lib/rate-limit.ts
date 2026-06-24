// ─────────────────────────────────────────────────────────────
// RATE LIMITER — Cloudflare KV sliding window
// ─────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
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
};

let store: Map<string, RateLimitEntry> | null = null;
let isUsingKV = false;

export function getStore(env?: any): Map<string, RateLimitEntry> | null {
  if (!store) {
    // Check if we're in Cloudflare Workers environment with KV
    const kvNamespace = env?.KV_NAMESPACE ?? (typeof process !== "undefined" ? process.env?.KV_NAMESPACE : undefined);
    if (kvNamespace) {
      isUsingKV = true;
      // Store remains null, will initialize lazily
      console.log("[RATE LIMIT] Using Cloudflare KV for distributed rate limiting");
      return null;
    } else {
      // Fallback to in-memory map for local development/testing
      store = new Map<string, RateLimitEntry>();
      console.log("[RATE LIMIT] Using in-memory Map for development");
    }
  }
  return store;
}

async function getFromKV(key: string): Promise<RateLimitEntry | null> {
  try {
    // In Cloudflare Workers, access KV via environment variable
    // This is a placeholder implementation - actual KV access would be done via globalThis.caches or similar
    const kv = globalThis as any;
    if (kv.RATE_LIMIT_STORE) {
      const value = await kv.RATE_LIMIT_STORE.get(key, { type: "json" });
      return value ? (value as RateLimitEntry) : null;
    }
    return null;
  } catch (error) {
    console.error("[RATE LIMIT] KV error:", error);
    return null;
  }
}

async function setKV(key: string, value: RateLimitEntry): Promise<void> {
  try {
    const kv = globalThis as any;
    if (kv.RATE_LIMIT_STORE) {
      await kv.RATE_LIMIT_STORE.put(key, JSON.stringify(value), {
        expiration: Math.ceil(value.resetAt / 1000),
      });
    }
  } catch (error) {
    console.error("[RATE LIMIT] KV set error:", error);
  }
}

async function deleteFromKV(key: string): Promise<void> {
  try {
    const kv = globalThis as any;
    if (kv.RATE_LIMIT_STORE) {
      await kv.RATE_LIMIT_STORE.delete(key);
    }
  } catch (error) {
    console.error("[RATE LIMIT] KV delete error:", error);
  }
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULTS.auth,
  env?: any
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const store = getStore(env);

  if (isUsingKV) {
    // KV implementation
    let entry = await getFromKV(key);
    
    if (!entry || entry.resetAt <= now) {
      entry = { count: 1, resetAt: now + config.windowMs };
      await setKV(key, entry);
      return { allowed: true, remaining: config.maxRequests - 1, resetAt: entry.resetAt };
    }

    entry.count += 1;
    const remaining = Math.max(0, config.maxRequests - entry.count);

    if (entry.count > config.maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    await setKV(key, entry);
    return { allowed: true, remaining, resetAt: entry.resetAt };
  } else {
    // In-memory implementation (fallback)
    let cleaned = 0;
    for (const [k, v] of store) {
      if (v.resetAt <= now) { store.delete(k); cleaned++; }
      if (cleaned >= 20) break;
    }

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
    }
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

export function getRateLimitKey(ip: string, endpoint: string, userAgent?: string): string {
  const ua = userAgent?.slice(0, 50) ?? "unknown";
  return `${ip}:${ua}:${endpoint}`;
}

export { DEFAULTS as RATE_LIMIT_CONFIG };
