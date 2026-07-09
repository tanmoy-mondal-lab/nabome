import type { RequestContext } from "./types";
import type { Env } from "./env";
export interface AuthOptions {
    /** Require authentication */
    required?: boolean;
    /** Require specific role */
    role?: "customer" | "admin";
    /** Apply rate limiting */
    rateLimit?: boolean;
    /** Rate limit key prefix (default: endpoint path) */
    rateLimitPrefix?: string;
    /** Validate CSRF token */
    csrf?: boolean;
    /** Require email verification */
    requireEmailVerified?: boolean;
}
/**
 * Authenticate a request and return context or error response.
 * Combines JWT verification, role check, rate limiting, and CSRF.
 */
export declare function authenticate(request: Request, options?: AuthOptions, env?: Env): Promise<{
    ctx: RequestContext;
} | Response>;
/**
 * Quick helper for public endpoints that want optional auth identity.
 */
export declare function optionalAuth(request: Request, env?: Env): Promise<RequestContext>;
/**
 * Require a specific role. Returns null if authorized, otherwise returns a 403 response.
 * This is a helper function for use after authentication.
 */
export declare function requireRole(context: RequestContext | Response, role: string): Response | null;
/**
 * Require admin role. Returns null if authorized, otherwise returns a 403 response.
 * This is a helper function for use after authentication.
 */
export declare function requireAdmin(context: RequestContext | Response): Response | null;
