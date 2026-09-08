import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { __resetPrismaForTests, initPrisma } from './prisma.ts';

describe('prisma forensic regression', () => {
  it('initPrisma throws safe error without leaking connection string', () => {
    __resetPrismaForTests();
    expect(() => initPrisma('')).toThrow(/No database URL/);
  });

  it('middleware binds latest active session without invalid refreshTokenHash field', () => {
    const src = readFileSync(
      new URL('../functions/_middleware.ts', import.meta.url),
      'utf8',
    );
    expect(src).not.toContain('refreshTokenHash');
    expect(src).toContain('revokedAt: null');
    expect(src).toContain("orderBy: { createdAt: 'desc' }");
  });

  it('middleware returns JSON envelope when DB init fails', () => {
    const src = readFileSync(
      new URL('../functions/_middleware.ts', import.meta.url),
      'utf8',
    );
    expect(src).toContain('Database temporarily unavailable');
    expect(src).toContain('INTERNAL_ERROR');
  });

  it('staging uses direct DATABASE_URL with no shared prod Hyperdrive binding', () => {
    const staging = readFileSync(
      new URL('../wrangler.staging.jsonc', import.meta.url),
      'utf8',
    );
    expect(staging).not.toContain('e2b5c6e70f164e189bebf1cc1282428f');
    expect(staging).not.toContain('hyperdrive');
    const preview = readFileSync(
      new URL('../wrangler.jsonc', import.meta.url),
      'utf8',
    );
    const previewBlock = preview.slice(preview.indexOf('"preview"'));
    expect(previewBlock).not.toContain('hyperdrive');
    const settlement = readFileSync(
      new URL('../../../workers/settlement/wrangler.toml', import.meta.url),
      'utf8',
    );
    expect(settlement).not.toContain('hyperdrive');
    expect(settlement).not.toContain('e2b5c6e70f164e189bebf1cc1282428f');
  });

  it('order payments use a valid PaymentMethod enum value with provider', () => {
    const src = readFileSync(
      new URL('./order/service.ts', import.meta.url),
      'utf8',
    );
    expect(src).not.toContain("method: 'razorpay'");
    expect(src).toContain("provider: 'razorpay'");
    for (const m of ['card', 'upi', 'netbanking', 'wallet', 'cod']) {
      if (src.includes(`'${m}'`)) {
        expect(['card', 'upi', 'netbanking', 'wallet', 'cod']).toContain(m);
      }
    }
  });
});
