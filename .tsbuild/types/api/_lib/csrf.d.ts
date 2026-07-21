export declare function generateToken(): string;
/**
 * Creates a Response with a CSRF cookie set.
 * Call this on the first GET request to establish a CSRF token.
 * Preserves existing valid CSRF tokens to support multi-tab browsing.
 */
export declare function setCsrfCookie(response: Response, env?: any): Response;
/**
 * Validates that the CSRF token in the request header matches the cookie.
 * Returns true if valid, false if mismatch or missing.
 * Skips validation for GET/HEAD/OPTIONS requests (idempotent methods).
 */
export declare function validateCsrf(request: Request): boolean;
export declare function csrfError(): Response;
