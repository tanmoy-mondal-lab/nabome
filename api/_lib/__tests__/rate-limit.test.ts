import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkRateLimit,
  getRateLimitKey,
  withRateLimit,
  rateLimitResponse,
  RATE_LIMIT_CONFIG,
} from '../rate-limit';

function createMockKV() {
  const store = new Map<string, string>();
  return {
    get: vi.fn(async (key: string, opts?: any) => {
      const raw = store.get(key) ?? null;
      if (raw && opts?.type === 'json') return JSON.parse(raw);
      return raw;
    }),
    put: vi.fn(async (key: string, value: string) => store.set(key, value)),
    _store: store,
  };
}

describe('Rate Limiter - Security Tests', () => {
  describe('with KV binding (production-like)', () => {
    it('should allow requests within limit', async () => {
      const kv = createMockKV();
      const env = { RATE_LIMIT_STORE: kv };
      const key = getRateLimitKey('1.2.3.4', '/api/auth/login');

      const result = await checkRateLimit(key, RATE_LIMIT_CONFIG.auth, env);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should block requests exceeding limit', async () => {
      const kv = createMockKV();
      const env = { RATE_LIMIT_STORE: kv };
      const key = getRateLimitKey('1.2.3.4', '/api/auth/login');

      for (let i = 0; i < 5; i++) {
        await checkRateLimit(key, RATE_LIMIT_CONFIG.auth, env);
      }

      const result = await checkRateLimit(key, RATE_LIMIT_CONFIG.auth, env);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', async () => {
      const kv = createMockKV();
      const env = { RATE_LIMIT_STORE: kv };
      const key = getRateLimitKey('1.2.3.4', '/api/test');

      // Use a window of 100ms and max of 2 requests
      const config = { windowMs: 100, maxRequests: 2 };
      await checkRateLimit(key, config, env);
      await checkRateLimit(key, config, env);

      // Third should be blocked
      let result = await checkRateLimit(key, config, env);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);

      // Manually clear the KV to simulate expiration
      // (In production, KV TTL would handle this automatically)
      kv._store.delete(key);

      // Should be allowed again
      result = await checkRateLimit(key, config, env);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('should track per-user limits independently', async () => {
      const kv = createMockKV();
      const env = { RATE_LIMIT_STORE: kv };
      const config = { windowMs: 60_000, maxRequests: 2 };

      const key1 = getRateLimitKey('1.1.1.1', '/api/test', 'user-1');
      const key2 = getRateLimitKey('2.2.2.2', '/api/test', 'user-2');

      await checkRateLimit(key1, config, env);
      await checkRateLimit(key1, config, env);

      // user-1 is at limit
      const result1 = await checkRateLimit(key1, config, env);
      expect(result1.allowed).toBe(false);

      // user-2 is still allowed
      const result2 = await checkRateLimit(key2, config, env);
      expect(result2.allowed).toBe(true);
    });

    it('should use userId over IP in key', () => {
      const key = getRateLimitKey('1.2.3.4', '/api/test', 'user-123');
      expect(key).toBe('user-123:/api/test');
    });

    it('should fall back to IP when no userId', () => {
      const key = getRateLimitKey('1.2.3.4', '/api/test');
      expect(key).toBe('1.2.3.4:/api/test');
    });
  });

  describe('without KV binding', () => {
    it('should allow local requests when KV unavailable', async () => {
      const key = getRateLimitKey('1.2.3.4', '/api/test');
      const config = { windowMs: 1000, maxRequests: 1 };

      const result = await checkRateLimit(key, config);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('should fail closed in Cloudflare production when KV unavailable', async () => {
      const key = getRateLimitKey('1.2.3.4', '/api/test');
      const config = { windowMs: 1000, maxRequests: 1 };

      const result = await checkRateLimit(key, config, { CF_PAGES: 'true' });
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe('withRateLimit', () => {
    it('should return null when allowed', async () => {
      const kv = createMockKV();
      const env = { RATE_LIMIT_STORE: kv };
      const result = await withRateLimit('key', RATE_LIMIT_CONFIG.auth, env);
      expect(result).toBeNull();
    });

    it('should return 429 response when exceeded', async () => {
      const kv = createMockKV();
      const env = { RATE_LIMIT_STORE: kv };
      const key = getRateLimitKey('1.2.3.4', '/api/test');
      const config = { windowMs: 60_000, maxRequests: 1 };

      await withRateLimit(key, config, env);
      const result = await withRateLimit(key, config, env);

      expect(result).not.toBeNull();
      expect(result!.status).toBe(429);
    });
  });

  describe('rateLimitResponse', () => {
    it('should return 429 status', () => {
      const res = rateLimitResponse('Too many requests', Date.now() + 60000);
      expect(res.status).toBe(429);
    });

    it('should include Retry-After header', () => {
      const resetAt = Date.now() + 30000;
      const res = rateLimitResponse('Slow down', resetAt);
      const retryAfter = res.headers.get('Retry-After');
      expect(retryAfter).toBeTruthy();
      expect(Number(retryAfter)).toBeGreaterThan(0);
    });

    it('should include error message in body', async () => {
      const res = rateLimitResponse('Rate limit exceeded', Date.now());
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.message).toBe('Rate limit exceeded');
      expect(body.error.status).toBe(429);
    });
  });

  describe('default configs', () => {
    it('auth: 5 requests per 60s', () => {
      expect(RATE_LIMIT_CONFIG.auth.maxRequests).toBe(5);
      expect(RATE_LIMIT_CONFIG.auth.windowMs).toBe(60_000);
    });

    it('standard: 30 requests per 10s', () => {
      expect(RATE_LIMIT_CONFIG.standard.maxRequests).toBe(30);
      expect(RATE_LIMIT_CONFIG.standard.windowMs).toBe(10_000);
    });

    it('admin: 60 requests per 60s', () => {
      expect(RATE_LIMIT_CONFIG.admin.maxRequests).toBe(60);
      expect(RATE_LIMIT_CONFIG.admin.windowMs).toBe(60_000);
    });

    it('contact: 3 requests per hour', () => {
      expect(RATE_LIMIT_CONFIG.contact.maxRequests).toBe(3);
      expect(RATE_LIMIT_CONFIG.contact.windowMs).toBe(3_600_000);
    });
  });
});
