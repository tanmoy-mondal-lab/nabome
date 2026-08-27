import { ApiError } from './http/errors.ts';

/**
 * CSRF (Cross-Site Request Forgery) protection utilities.
 * Verifies CSRF tokens on state-changing requests to prevent CSRF attacks.
 */

/**
 * Verify CSRF token from request headers against the expected token.
 * Throws ApiError if verification fails.
 */
export function verifyCsrfToken(request: Request, expectedToken: string): void {
  const csrfToken = request.headers.get('x-csrf-token');

  if (!csrfToken) {
    throw ApiError.forbidden('CSRF token required');
  }

  if (csrfToken !== expectedToken) {
    throw ApiError.forbidden('Invalid CSRF token');
  }
}

/**
 * Extract CSRF token from cookie.
 * Returns null if cookie is not present.
 */
export function getCsrfTokenFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const csrfCookie = cookies.find((c) => c.startsWith('csrf_token='));

  if (!csrfCookie) {
    return null;
  }

  return csrfCookie.substring('csrf_token='.length);
}

/**
 * Verify CSRF token from cookie against the expected token.
 * This is useful when the CSRF token is stored in a cookie and needs to be verified.
 */
export function verifyCsrfTokenFromCookie(
  request: Request,
  expectedToken: string,
): void {
  const csrfToken = getCsrfTokenFromCookie(request);

  if (!csrfToken) {
    throw ApiError.forbidden('CSRF token required');
  }

  if (csrfToken !== expectedToken) {
    throw ApiError.forbidden('Invalid CSRF token');
  }
}
