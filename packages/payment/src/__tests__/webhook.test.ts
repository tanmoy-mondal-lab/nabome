import { describe, expect, it } from 'vitest';

import { hmacHex } from '../gateway/razorpay';
import {
  hashPayload,
  isFresh,
  parseNabomeSignature,
  verifyNabomeSignature,
} from '../webhook';

describe('webhook security (REST §9.3 — IS-08)', () => {
  const secret = 'test-secret';

  it('parses timestamp.signature headers', () => {
    expect(parseNabomeSignature('1234567890.abc')).toEqual({
      timestamp: '1234567890',
      signature: 'abc',
    });
    expect(parseNabomeSignature(undefined)).toBeNull();
    expect(parseNabomeSignature('no-dots-here')).toBeNull();
    expect(parseNabomeSignature('.')).toBeNull();
  });

  it('enforces the 5-minute freshness window', () => {
    const now = 1_700_000_000;
    expect(isFresh(String(now - 60), now)).toBe(true);
    expect(isFresh(String(now - 301), now)).toBe(false);
    expect(isFresh(String(now + 300), now)).toBe(true);
    expect(isFresh(String(now + 301), now)).toBe(false);
    expect(isFresh('not-a-number', now)).toBe(false);
  });

  it('verifies valid signatures and rejects tampered payloads (timing-safe)', async () => {
    const body = JSON.stringify({ event: 'payment.captured', id: 'evt_1' });
    const ts = String(Math.floor(Date.now() / 1000));
    const signature = await hmacHex(secret, `${ts}.${body}`);
    const header = `${ts}.${signature}`;

    await expect(verifyNabomeSignature(body, header, secret)).resolves.toBe(
      true,
    );
    // tampered body
    await expect(
      verifyNabomeSignature(body + 'x', header, secret),
    ).resolves.toBe(false);
    // wrong secret
    await expect(
      verifyNabomeSignature(body, header, 'other-secret'),
    ).resolves.toBe(false);
    // missing header
    await expect(verifyNabomeSignature(body, undefined, secret)).resolves.toBe(
      false,
    );
  });

  it('rejects stale signatures even when cryptographically valid', async () => {
    const body = '{"event":"payment.captured"}';
    const ts = String(Math.floor(Date.now() / 1000) - 600);
    const signature = await hmacHex(secret, `${ts}.${body}`);
    await expect(
      verifyNabomeSignature(body, `${ts}.${signature}`, secret),
    ).resolves.toBe(false);
  });

  it('hashes payloads for idempotency dedupe', async () => {
    const hash = await hashPayload('payload');
    expect(hash).toHaveLength(64);
    await expect(hashPayload('payload')).resolves.toBe(hash);
    await expect(hashPayload('other')).resolves.not.toBe(hash);
  });
});
