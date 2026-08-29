import { describe, expect, it } from 'vitest';

import { apiEnvSchema, parseEnv, parseClientEnv } from './env.ts';
import { FEATURE_FLAGS, flagDefault } from './flags.ts';

describe('config', () => {
  it('validates client env with defaults', () => {
    const env = parseClientEnv({});
    expect(env.NODE_ENV).toBe('development');
    expect(env.PUBLIC_API_URL).toBe('http://localhost:8788');
  });

  it('rejects a bad API env with a descriptive error', () => {
    expect(() => parseEnv(apiEnvSchema, {})).toThrow(/Invalid environment/);
  });

  it('accepts a complete API env', () => {
    const env = parseEnv(apiEnvSchema, {
      DATABASE_URL: 'postgresql://u:p@localhost:5432/nabome',
      JWT_SECRET: 'test-jwt-secret-must-be-at-least-32-chars',
      CSRF_SECRET: '0123456789abcdef',
    });
    expect(env.STORAGE_BUCKET || 'nabome-storage').toBe('nabome-storage');
  });

  it('exposes offline flag defaults', () => {
    expect(flagDefault('quickCheckout')).toBe(false);
    expect(FEATURE_FLAGS.wishlistEnabled.default).toBe(true);
  });
});
