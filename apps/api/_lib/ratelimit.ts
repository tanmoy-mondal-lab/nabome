/**
 * KV-backed fixed-window rate limiter (API_SERVICE_ARCHITECTURE §10.7).
 * Tiers: public 60/min, authenticated 120/min, admin 300/min,
 * apiKey 100/min, premium 500/min. Key layout: rate:{tier}:{windowStart}:{key}.
 */
import type { KVNamespace } from '@cloudflare/workers-types';

export type RateLimitTier =
  'public' | 'authenticated' | 'admin' | 'apiKey' | 'premium';

export const RATE_LIMIT_LIMITS: Record<RateLimitTier, number> = {
  public: 60,
  authenticated: 120,
  admin: 300,
  apiKey: 100,
  premium: 500,
};

const WINDOW_SECONDS = 60;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

/**
 * Fixed-window counter. KV get/put each round-trip; on KV failures the
 * limiter fails closed (security over availability) and logs the error.
 */
export async function checkRateLimit(
  kv: KVNamespace | undefined,
  tier: RateLimitTier,
  identifier: string,
): Promise<{ allowed: boolean; remaining: number; resetSeconds?: number }> {
  if (!kv) {
    // No KV binding — rate limiting disabled (local dev or first deploy)
    return { allowed: true, remaining: 60 };
  }

  const limit = RATE_LIMIT_LIMITS[tier];
  if (!limit) {
    // Unknown tier - deny by default for security (fail-closed)
    return { allowed: false, remaining: 0, resetSeconds: 60 };
  }

  const now = Date.now();
  const windowMs = WINDOW_SECONDS * 1000;
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const key = `${identifier}:${windowStart}`;

  try {
    // Get current count
    const current = await kv.get(key, 'text');
    const count = current ? parseInt(current, 10) : 0;

    // Check if limit exceeded
    if (count >= limit) {
      const resetSeconds = Math.ceil((windowStart + windowMs - now) / 1000);
      return { allowed: false, remaining: 0, resetSeconds };
    }

    // Increment counter
    await kv.put(key, String(count + 1), { expirationTtl: WINDOW_SECONDS });

    return {
      allowed: true,
      remaining: limit - count - 1,
      resetSeconds: Math.ceil((windowStart + windowMs - now) / 1000),
    };
  } catch (error) {
    // If KV fails, deny request for security (fail-closed)
    console.error('Rate limit check failed, denying request:', error);
    return { allowed: false, remaining: 0, resetSeconds: 60 };
  }
}

export function clientKey(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    `unknown:${new URL(request.url).pathname}`
  );
}
