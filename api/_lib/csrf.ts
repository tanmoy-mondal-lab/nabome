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

const TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

export function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  const bytes = new Uint8Array(TOKEN_LENGTH);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < TOKEN_LENGTH; i++) {
    token += chars[bytes[i] % chars.length];
  }
  return token;
}

/**
 * Creates a Response with a CSRF cookie set.
 * Call this on the first GET request to establish a CSRF token.
 */
export function setCsrfCookie(response: Response, env?: any): Response {
  const token = generateToken();
  const nodeEnv = env?.NODE_ENV ?? (typeof process !== "undefined" ? process.env?.NODE_ENV : undefined);
  const cfPages = env?.CF_PAGES ?? (typeof process !== "undefined" ? process.env?.CF_PAGES : undefined);
  const isSecure = nodeEnv === "production" || cfPages === "true";
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

  return cookieToken === headerToken;
}

export function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach((pair) => {
    const [key, ...val] = pair.trim().split("=");
    if (key) cookies[key] = val.join("=");
  });
  return cookies;
}

export function csrfError(): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: { message: "Invalid or missing CSRF token", status: 403 },
    }),
    {
      status: 403,
      headers: { "Content-Type": "application/json" },
    }
  );
}
