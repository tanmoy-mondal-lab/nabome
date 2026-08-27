/**
 * Session plumbing — JWT + bcrypt authentication for V1.
 * Tokens are short-lived JWT access tokens supplied via the `authorization: Bearer` header.
 */
import { verifyToken, type JwtPayload } from './auth/jwt.ts';
import { ApiError } from './http/errors.ts';

export interface SessionPrincipal {
  userId: string;
  email?: string;
  role?: string;
}

const BEARER_PATTERN = /^Bearer\s+([A-Za-z0-9\-._~+/]+=*)$/;

export function extractBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization');
  if (!header) {
    return null;
  }
  const match = BEARER_PATTERN.exec(header.trim());
  return match ? (match[1] ?? null) : null;
}

/**
 * Validate the JWT access token and return the principal.
 */
export async function authenticate(
  request: Request,
  jwtSecret?: string,
): Promise<SessionPrincipal | null> {
  const token = extractBearerToken(request) ?? readCookieToken(request);
  if (!token) {
    return null;
  }

  try {
    const secret = jwtSecret ?? (globalThis as any).process?.env?.JWT_SECRET;
    if (!secret)
      throw ApiError.unauthorized('Server misconfigured: JWT_SECRET missing');
    const payload = verifyToken(token, secret);
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.unauthorized('Invalid or expired token');
  }
}

function readCookieToken(request: Request): string | null {
  const cookies = request.headers.get('cookie') ?? '';
  for (const part of cookies.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === 'access_token') {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

/** Read the CSRF cookie (double-submit cookie pattern, SEC §3.3). */
export function readCsrfToken(
  request: Request,
  cookieName: string,
): string | null {
  const cookies = request.headers.get('cookie') ?? '';
  for (const part of cookies.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === cookieName) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

/** Enforce the double-submit CSRF cookie on mutations (SEC §3.3). */
export function enforceCsrf(request: Request, cookieName: string): void {
  const cookieToken = readCsrfToken(request, cookieName);
  const headerToken = request.headers.get('x-csrf-token');
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    throw new ApiError({
      code: 'FORBIDDEN',
      message: 'CSRF validation failed',
    });
  }
}
