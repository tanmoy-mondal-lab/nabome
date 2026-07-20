// ─────────────────────────────────────────────────────────────
// COOKIE MANAGEMENT — httpOnly cookie configuration for auth
// ─────────────────────────────────────────────────────────────

export interface CookieOptions {
  name: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  maxAge: number;
  path: string;
}

export const COOKIE_CONFIG = {
  ACCESS_TOKEN: {
    name: "access_token",
    httpOnly: true, // Security: Access token must be httpOnly to prevent XSS
    secure: true,
    sameSite: "lax" as const,
    maxAge: 15 * 60, // 15 minutes
    path: "/",
  },
  REFRESH_TOKEN: {
    name: "refresh_token",
    httpOnly: true, // Refresh token must be httpOnly
    secure: true,
    sameSite: "strict" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  },
  CSRF_TOKEN: {
    name: "csrf_token",
    httpOnly: false, // CSRF token needs to be accessible to JS for double-submit pattern
    secure: true,
    sameSite: "lax" as const,
    maxAge: 15 * 60, // 15 minutes
    path: "/",
  },
} as const;

/**
 * Set a cookie with the given options
 */
export function setCookie(
  response: Response,
  name: string,
  value: string,
  options: CookieOptions,
  env?: any
): Response {
  const nodeEnv = env?.NODE_ENV ?? (typeof process !== "undefined" ? process.env?.NODE_ENV : undefined);
  const cfPages = env?.CF_PAGES ?? (typeof process !== "undefined" ? process.env?.CF_PAGES : undefined);
  // For local development, allow non-secure cookies. In production, always use Secure.
  const isSecure = options.secure && (nodeEnv === "production" || cfPages !== undefined);
  
  const cookieString = [
    `${name}=${value}`,
    `Path=${options.path}`,
    `Max-Age=${options.maxAge}`,
    `SameSite=${options.sameSite}`,
    isSecure ? "Secure" : "",
    options.httpOnly ? "HttpOnly" : "",
  ]
    .filter(Boolean)
    .join("; ");

  // Clone the response to make headers mutable
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers),
  });
  
  newResponse.headers.append("Set-Cookie", cookieString);
  return newResponse;
}

/**
 * Build a cookie string without setting it (for batch setting)
 */
export function buildCookieString(
  name: string,
  value: string,
  options: CookieOptions,
  env?: any
): string {
  const nodeEnv = env?.NODE_ENV ?? (typeof process !== "undefined" ? process.env?.NODE_ENV : undefined);
  const cfPages = env?.CF_PAGES ?? (typeof process !== "undefined" ? process.env?.CF_PAGES : undefined);
  const isSecure = options.secure && (nodeEnv === "production" || cfPages !== undefined);
  
  return [
    `${name}=${value}`,
    `Path=${options.path}`,
    `Max-Age=${options.maxAge}`,
    `SameSite=${options.sameSite}`,
    isSecure ? "Secure" : "",
    options.httpOnly ? "HttpOnly" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

/**
 * Clear a cookie by setting Max-Age to 0
 */
export function clearCookie(
  response: Response,
  name: string,
  options: Pick<CookieOptions, "path" | "sameSite">,
  env?: any
): Response {
  const nodeEnv = env?.NODE_ENV ?? (typeof process !== "undefined" ? process.env?.NODE_ENV : undefined);
  const cfPages = env?.CF_PAGES ?? (typeof process !== "undefined" ? process.env?.CF_PAGES : undefined);
  const isSecure = nodeEnv === "production" || cfPages !== undefined;
  const cookieString = [
    `${name}=`,
    `Path=${options.path}`,
    `Max-Age=0`,
    `SameSite=${options.sameSite}`,
    isSecure ? "Secure" : "",
    "HttpOnly",
  ]
    .filter(Boolean)
    .join("; ");

  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers),
  });

  newResponse.headers.append("Set-Cookie", cookieString);
  return newResponse;
}

/**
 * Parse cookies from a Cookie header string
 */
export function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(";").forEach((pair) => {
    const [key, ...val] = pair.trim().split("=");
    if (key) cookies[key] = val.join("=");
  });
  return cookies;
}
