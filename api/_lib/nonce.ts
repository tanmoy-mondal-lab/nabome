// ─────────────────────────────────────────────────────────────
// NONCE GENERATION — CSP nonce support for inline scripts
// ─────────────────────────────────────────────────────────────

/**
 * Generate a cryptographically secure nonce for CSP
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Replace {nonce} placeholder in CSP header with actual nonce
 */
export function injectNonce(csp: string, nonce: string): string {
  return csp.replace(/\{nonce\}/g, nonce);
}
