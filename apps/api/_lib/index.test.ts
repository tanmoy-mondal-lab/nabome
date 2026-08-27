import { describe, expect, it } from 'vitest';

import { enforceCsrf, extractBearerToken, readCsrfToken } from './auth.ts';
import { ApiError } from './http/errors.ts';
import { failure, success } from './http/response.ts';
import { checkRateLimit } from './ratelimit.ts';
import type { RateLimitTier } from './ratelimit.ts';
import { resolveRequestId } from './request-id.ts';
import { allowedOrigins, isPreflight, resolveOrigin } from './security.ts';

const env = {
  CORS_ORIGINS: 'https://nabome.online, http://localhost:5173',
} as const;

describe('error envelope', () => {
  it('renders canonical error shape', () => {
    const error = ApiError.validation('Email is required', 'email');
    const body = failure(error, 'req-1');
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.field).toBe('email');
    expect(body.meta.requestId).toBe('req-1');
  });

  it('maps codes to http status', () => {
    expect(ApiError.notFound().status).toBe(404);
    expect(ApiError.unauthorized().status).toBe(401);
    expect(ApiError.rateLimited().status).toBe(429);
    expect(ApiError.internal().status).toBe(500);
  });
});

describe('success envelope', () => {
  it('carries version and requestId', () => {
    const body = success({ ok: true }, 'req-2');
    expect(body.success).toBe(true);
    expect(body.error).toBeNull();
    expect(body.meta.version).toBe('v1');
  });
});

describe('rate limiter', () => {
  class FakeKV {
    private readonly store = new Map<string, string>();

    async get(key: string): Promise<string | null> {
      return this.store.get(key) ?? null;
    }

    async put(key: string, value: string): Promise<void> {
      this.store.set(key, value);
    }
  }

  it('allows within the tier limit and counts down', async () => {
    const kv = new FakeKV() as unknown as Parameters<typeof checkRateLimit>[0];
    const results: Array<{ allowed: boolean; remaining: number }> = [];
    for (let i = 0; i < 3; i += 1) {
      results.push(await checkRateLimit(kv, 'public' as RateLimitTier, 'ip-1'));
    }
    expect(results.map((r) => r.allowed)).toEqual([true, true, true]);
    expect(results[2]?.remaining).toBe(57);
  });

  it('blocks after the limit', async () => {
    const kv = new FakeKV() as unknown as Parameters<typeof checkRateLimit>[0];
    for (let i = 0; i < 60; i += 1) {
      await checkRateLimit(kv, 'public', 'ip-2');
    }
    const blocked = await checkRateLimit(kv, 'public', 'ip-2');
    expect(blocked.allowed).toBe(false);
  });

  it('uses separate windows for separate keys', async () => {
    const kv = new FakeKV() as unknown as Parameters<typeof checkRateLimit>[0];
    await checkRateLimit(kv, 'public', 'ip-a');
    await checkRateLimit(kv, 'public', 'ip-a');
    const other = await checkRateLimit(kv, 'public', 'ip-b');
    expect(other.allowed).toBe(true);
    expect(other.remaining).toBe(59);
  });
});

describe('request id', () => {
  it('reuses a valid incoming id', () => {
    const request = new Request('https://x.test/', {
      headers: { 'x-request-id': 'abc-123' },
    });
    expect(resolveRequestId(request)).toBe('abc-123');
  });

  it('generates a uuid for missing or invalid ids', () => {
    expect(resolveRequestId(new Request('https://x.test/'))).toMatch(
      /^[0-9a-f-]{36}$/,
    );
    const request = new Request('https://x.test/', {
      headers: { 'x-request-id': 'bad id!!' },
    });
    expect(resolveRequestId(request)).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe('security', () => {
  it('splits CORS origins', () => {
    expect(allowedOrigins(env as never)).toEqual([
      'https://nabome.online',
      'http://localhost:5173',
    ]);
  });

  it('accepts only allowed origins', () => {
    const allowed = new Request('https://x.test/', {
      headers: { origin: 'https://nabome.online' },
    });
    const denied = new Request('https://x.test/', {
      headers: { origin: 'https://evil.test' },
    });
    expect(resolveOrigin(env as never, allowed)).toBe('https://nabome.online');
    expect(resolveOrigin(env as never, denied)).toBeNull();
  });

  it('recognizes preflight requests', () => {
    expect(
      isPreflight(new Request('https://x.test/', { method: 'OPTIONS' })),
    ).toBe(true);
  });
});

describe('auth helpers', () => {
  it('extracts bearer tokens', () => {
    const request = new Request('https://x.test/', {
      headers: { authorization: 'Bearer abc.def.ghi' },
    });
    expect(extractBearerToken(request)).toBe('abc.def.ghi');
    expect(extractBearerToken(new Request('https://x.test/'))).toBeNull();
  });

  it('reads csrf cookie and enforces double-submit', () => {
    const request = new Request('https://x.test/', {
      headers: {
        cookie: 'csrf_token=abc123; nabome_session=sess1',
        'x-csrf-token': 'abc123',
      },
    });
    expect(readCsrfToken(request, 'csrf_token')).toBe('abc123');
    expect(() => enforceCsrf(request, 'csrf_token')).not.toThrow();

    const mismatch = new Request('https://x.test/', {
      headers: {
        cookie: 'csrf_token=abc123',
        'x-csrf-token': 'nope',
      },
    });
    expect(() => enforceCsrf(mismatch, 'csrf_token')).toThrow(/CSRF/);
  });
});
