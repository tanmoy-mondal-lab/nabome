// ─────────────────────────────────────────────────────────────
// CSRF PROTECTION — Double-submit cookie pattern
// ─────────────────────────────────────────────────────────────
//
// Generates a CSRF token, sets it as a cookie, and validates
// that the request includes a matching header.
// This uses the double-submit cookie pattern:
//  1. Server sets a csrf_token cookie (httpOnly: false for JS access)
//  2. Client reads it and sends as X-CSRF-Token header
//  3. Server compares header value to cookie value
//
// For pure SPA → API architectures with SameSite=Strict cookies,
// CSRF is largely mitigated. This provides defense-in-depth.

import { parseCookies, COOKIE_CONFIG } from "./cookies";

const TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = COOKIE_CONFIG.CSRF_TOKEN.name;
const CSRF_HEADER_NAME = "x-csrf-token";
const textEncoder = new TextEncoder();

function timingSafeEqual(left: string, right: string): boolean {
  const leftBytes = textEncoder.encode(left);
  const rightBytes = textEncoder.encode(right);
  const maxLength = Math.max(leftBytes.length, rightBytes.length);
  let diff = leftBytes.length ^ rightBytes.length;

  for (let i = 0; i < maxLength; i++) {
    diff |= (leftBytes[i] ?? 0) ^ (rightBytes[i] ?? 0);
  }

  return diff === 0;
}

export function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  let bytes = new Uint8Array(TOKEN_LENGTH);
  crypto.getRandomValues(bytes);
  const maxValid = 256 - (256 % chars.length);
  let i = 0;
  while (i < TOKEN_LENGTH) {
    for (let j = 0; j < TOKEN_LENGTH && i < TOKEN_LENGTH; j++) {
      if (bytes[j] < maxValid) {
        token += chars[bytes[j] % chars.length];
        i++;
      }
    }
    if (i < TOKEN_LENGTH) {
      bytes = new Uint8Array(TOKEN_LENGTH);
      crypto.getRandomValues(bytes);
    }
  }
  return token;
}

/**
 * Creates a Response with a CSRF cookie set.
 * Call this on the first GET request to establish a CSRF token.
 * Preserves existing valid CSRF tokens to support multi-tab browsing.
 */
export function setCsrfCookie(response: Response, env?: any): Response {
  // Only set a new CSRF cookie if one doesn't already exist in the response.
  // This avoids regenerating on every GET request (reduces Set-Cookie headers for CDN caching).
  // Use getSetCookie() where available (Cloudflare Workers, modern runtimes), fall back to
  // checking the raw Set-Cookie header for compatibility.
  let alreadyHasCsrf = false;
  if (typeof response.headers.getSetCookie === "function") {
    const existingCookies = response.headers.getSetCookie();
    alreadyHasCsrf = existingCookies.some(c => c.startsWith(`${CSRF_COOKIE_NAME}=`));
  } else {
    const raw = response.headers.get("Set-Cookie") || "";
    alreadyHasCsrf = raw.includes(`${CSRF_COOKIE_NAME}=`);
  }
  if (alreadyHasCsrf) return response;

  const token = generateToken();
  const nodeEnv = env?.NODE_ENV ?? (typeof process !== "undefined" ? process.env?.NODE_ENV : undefined);
  const cfPages = env?.CF_PAGES ?? (typeof process !== "undefined" ? process.env?.CF_PAGES : undefined);
  // Use Secure flag in production or when running on Cloudflare Pages (any CF_PAGES value indicates production)
  const isSecure = nodeEnv === "production" || cfPages !== undefined;
  response.headers.append(
    "Set-Cookie",
    `${CSRF_COOKIE_NAME}=${token}; Path=/; SameSite=Strict${isSecure ? "; Secure" : ""}; Max-Age=86400`
  );
  response.headers.set("X-CSRF-Token", token);
  return response;
}

/**
 * Validates that the CSRF token in the request header matches the cookie.
 * Returns true if valid, false if mismatch or missing.
 * Skips validation for GET/HEAD/OPTIONS requests (idempotent methods).
 */
export function validateCsrf(request: Request): boolean {
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return true; // Idempotent methods don't need CSRF
  }

  const cookieHeader = request.headers.get("Cookie") ?? "";
  const cookies = parseCookies(cookieHeader);
  const cookieToken = cookies[CSRF_COOKIE_NAME];

  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return false;
  }

  return timingSafeEqual(cookieToken, headerToken);
}

export function csrfError(): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: { code: "CSRF_TOKEN_INVALID", message: "Invalid or missing CSRF token", status: 403 },
    }),
    {
      status: 403,
      headers: { "Content-Type": "application/json" },
    }
  );
}
