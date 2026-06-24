import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, getRateLimitKey, withRateLimit, RATE_LIMIT_CONFIG } from '../api/_lib/rate-limit';

describe('rate-limit', () => {
  beforeEach(() => {
    // Reset the store before each test
    vi.resetModules();
  });

  it('should allow first request', async () => {
    const key = getRateLimitKey('127.0.0.1', '/api/test');
    const result = await checkRateLimit(key, { windowMs: 1000, maxRequests: 5 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('should allow multiple requests within limit', async () => {
    const key = getRateLimitKey('127.0.0.1', '/api/test');
    for (let i = 0; i < 3; i++) {
      const result = await checkRateLimit(key, { windowMs: 1000, maxRequests: 5 });
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4 - i);
    }
  });

  it('should block requests exceeding limit', async () => {
    const key = getRateLimitKey('127.0.0.1', '/api/test');
    for (let i = 0; i < 6; i++) {
      const result = await checkRateLimit(key, { windowMs: 1000, maxRequests: 5 });
      if (i < 5) {
        expect(result.allowed).toBe(true);
      } else {
        expect(result.allowed).toBe(false);
        expect(result.remaining).toBe(0);
      }
    }
  });

  it('should generate correct rate limit keys', () => {
    const key = getRateLimitKey('127.0.0.1', '/api/test', 'Mozilla/5.0');
    expect(key).toBe('127.0.0.1:Mozilla/5.0:/api/test');
  });

  it('should have correct default configs', () => {
    expect(RATE_LIMIT_CONFIG.auth.maxRequests).toBe(5);
    expect(RATE_LIMIT_CONFIG.standard.maxRequests).toBe(30);
    expect(RATE_LIMIT_CONFIG.admin.maxRequests).toBe(60);
    expect(RATE_LIMIT_CONFIG.contact.maxRequests).toBe(3);
  });
});
