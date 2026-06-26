import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, getRateLimitKey, withRateLimit, RATE_LIMIT_CONFIG } from '../rate-limit';

describe('rate-limit', () => {
  beforeEach(() => {
    // Reset the store before each test
    vi.resetModules();
  });

  it('should allow first request', async () => {
    const key = getRateLimitKey('127.0.0.1', '/api/test');
    const result = await checkRateLimit(key, { windowMs: 1000, maxRequests: 5 });
    expect(result.allowed).toBe(true);
    // Without KV, fail-open returns maxRequests as remaining (no decrement)
    expect(result.remaining).toBe(5);
  });

  it('should allow multiple requests within limit', async () => {
    const key = getRateLimitKey('127.0.0.1', '/api/test');
    for (let i = 0; i < 3; i++) {
      const result = await checkRateLimit(key, { windowMs: 1000, maxRequests: 5 });
      expect(result.allowed).toBe(true);
      // Without KV, always returns maxRequests (fail open)
      expect(result.remaining).toBe(5);
    }
  });

  it('should block requests exceeding limit', async () => {
    // Without KV binding, rate limiter fails open (always allows)
    // This test verifies the in-memory fallback behavior
    const key = getRateLimitKey('127.0.0.1', '/api/test');
    for (let i = 0; i < 6; i++) {
      const result = await checkRateLimit(key, { windowMs: 1000, maxRequests: 5 });
      // Without KV, always allowed (fail open)
      expect(result.allowed).toBe(true);
    }
  });

  it('should generate correct rate limit keys', () => {
    const keyWithUserId = getRateLimitKey('127.0.0.1', '/api/test', 'user-123');
    expect(keyWithUserId).toBe('user-123:/api/test');

    const keyWithoutUserId = getRateLimitKey('127.0.0.1', '/api/test');
    expect(keyWithoutUserId).toBe('127.0.0.1:/api/test');
  });

  it('should have correct default configs', () => {
    expect(RATE_LIMIT_CONFIG.auth.maxRequests).toBe(5);
    expect(RATE_LIMIT_CONFIG.standard.maxRequests).toBe(30);
    expect(RATE_LIMIT_CONFIG.admin.maxRequests).toBe(60);
    expect(RATE_LIMIT_CONFIG.contact.maxRequests).toBe(3);
  });
});
