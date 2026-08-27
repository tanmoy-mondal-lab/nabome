import { describe, expect, it } from 'vitest';

import {
  API_BASE_PATH,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  QUERY_DEFAULTS,
  RATE_LIMIT_AUTH,
  RATE_LIMIT_TIERS,
} from './index.ts';

describe('shared constants', () => {
  it('uses the canonical pagination defaults', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(24);
    expect(MAX_PAGE_SIZE).toBe(100);
  });

  it('uses the canonical rate-limit tiers', () => {
    expect(RATE_LIMIT_TIERS.public).toBe(60);
    expect(RATE_LIMIT_TIERS.admin).toBe(300);
    expect(RATE_LIMIT_AUTH.login.limit).toBe(20);
  });

  it('keeps client query defaults from the client architecture spec', () => {
    expect(QUERY_DEFAULTS.retry).toBe(2);
    expect(QUERY_DEFAULTS.staleTime).toBe(5 * 60 * 1000);
  });

  it('versioned API base path', () => {
    expect(API_BASE_PATH).toBe('/api/v1');
  });
});
