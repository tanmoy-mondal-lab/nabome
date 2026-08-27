/**
 * Webhook Security — signature verification, freshness, and replay protection.
 *
 * Binding: REST_API_SPECIFICATION.md §9.3 (IS-08, Blueprint mandatory rule 14),
 * PAYMENT_ENGINE_ARCHITECTURE.md §10.9/§10.10.
 *
 * - X-Nabome-Signature: `<timestamp>.<hmac-sha256-hex>` over raw payload with
 *   shared secret (outbound deliveries + platform-verified callbacks).
 * - Timestamp freshness ≤ 5 minutes; stale → reject.
 * - Verification is timing-safe and fail-closed: any failure → reject, no
 *   partial processing.
 */

import { hmacHex, timingSafeEqualHex } from './gateway/razorpay';

export const WEBHOOK_FRESHNESS_WINDOW_SECONDS = 300; // 5 min (REST §9.3)

export interface NabomeSignatureParts {
  timestamp: string;
  signature: string;
}

/** Parse `timestamp.signature` — returns null on malformed input. */
export function parseNabomeSignature(
  header: string | undefined,
): NabomeSignatureParts | null {
  if (!header) return null;
  const [timestamp, signature] = header.split('.');
  if (
    !timestamp ||
    !signature ||
    timestamp.length === 0 ||
    signature.length === 0
  )
    return null;
  return { timestamp, signature };
}

/** Timestamp freshness check (≤ 5 minutes, both past and future skew). */
export function isFresh(
  timestamp: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): boolean {
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  return Math.abs(nowSeconds - ts) <= WEBHOOK_FRESHNESS_WINDOW_SECONDS;
}

/**
 * Verify the Nabome signature scheme (HMAC-SHA256 over
 * `${timestamp}.${rawBody}` with the shared secret). Timing-safe, fail-closed.
 */
export async function verifyNabomeSignature(
  rawBody: string,
  header: string | undefined,
  secret: string,
  nowSeconds?: number,
): Promise<boolean> {
  const parts = parseNabomeSignature(header);
  if (!parts || !isFresh(parts.timestamp, nowSeconds)) return false;
  const expected = await hmacHex(secret, `${parts.timestamp}.${rawBody}`);
  return timingSafeEqualHex(expected, parts.signature);
}

/** SHA-256 hex of the payload — idempotency hash for WebhookEvent rows. */
export async function hashPayload(rawBody: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(rawBody),
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
