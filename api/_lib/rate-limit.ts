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

function getKVBinding(env?: any): any | null {
  if (!env) return null;
  // Cloudflare Pages binds KV as a property on the env object
  const kv = env.RATE_LIMIT_STORE;
  if (kv && typeof kv.get === "function" && typeof kv.put === "function") {
    return kv;
  }
  return null;
}

async function getFromKV(kv: any, key: string): Promise<RateLimitEntry | null> {
  try {
    const value = await kv.get(key, { type: "json" });
    return value ? (value as RateLimitEntry) : null;
  } catch (error) {
    console.error("[RATE LIMIT] KV get error:", error);
    return null;
  }
}

async function setKV(kv: any, key: string, value: RateLimitEntry): Promise<void> {
  try {
    await kv.put(key, JSON.stringify(value), {
      expirationTtl: Math.ceil((value.resetAt - Date.now()) / 1000),
    });
  } catch (error) {
    console.error("[RATE LIMIT] KV put error:", error);
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
    let entry = await getFromKV(kv, key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 1, resetAt: now + config.windowMs };
      await setKV(kv, key, entry);
      return { allowed: true, remaining: config.maxRequests - 1, resetAt: entry.resetAt };
    }

    entry.count += 1;
    const remaining = Math.max(0, config.maxRequests - entry.count);

    if (entry.count > config.maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    await setKV(kv, key, entry);
    return { allowed: true, remaining, resetAt: entry.resetAt };
  }

  // No KV available — allow request (fail open)
  // This prevents rate limiting from breaking the app when KV is misconfigured
  console.warn("[RATE LIMIT] No KV binding available, skipping rate limit check");
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
