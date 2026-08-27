/**
 * Authentication middleware — validates requests and extracts user context.
 * Integrates with Supabase Auth and app-side session management.
 * Provides both required and optional authentication variants.
 */

import type { KVNamespace } from '@cloudflare/workers-types';

import { extractBearerToken, enforceCsrf } from '../auth.ts';
import type { Env } from '../env.ts';
import { ApiError } from '../http/errors.ts';
import { getPrisma } from '../prisma.ts';
import { checkRateLimit, clientKey, type RateLimitTier } from '../ratelimit.ts';

import { verifyToken } from './jwt.ts';
import { getUserPermissions, type AuthenticatedContext } from './middleware.ts';

// ── Authentication Middleware ─────────────────────────────────────────────────

/**
 * Required authentication — throws if no valid session.
 * Returns authenticated context with user, role, and permissions.
 */
export async function requireAuth(
  request: Request,
  env?: Env,
): Promise<AuthenticatedContext> {
  const token =
    extractBearerToken(request) ?? getCookieToken(request, 'access_token');

  if (!token) {
    throw ApiError.unauthorized('Authentication required');
  }

  const secret =
    env?.JWT_SECRET ?? (globalThis as any).process?.env?.JWT_SECRET;
  if (!secret)
    throw ApiError.unauthorized('Server misconfigured: JWT_SECRET missing');

  let payload: { userId: string; email: string; role: string };
  try {
    payload = verifyToken(token, secret);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const prisma = getPrisma() as any;
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) throw ApiError.unauthorized('Account inactive');

  const context: AuthenticatedContext = {
    userId: user.id,
    email: user.email,
    role: user.role,
    permissions: getUserPermissions(user.role as any),
  };

  return context;
}

function getCookieToken(request: Request, name: string): string | null {
  const cookies = request.headers.get('cookie') ?? '';
  for (const part of cookies.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

/**
 * Optional authentication — returns null if no valid session.
 * Useful for endpoints that work for both authenticated and guest users.
 */
export async function optionalAuth(
  request: Request,
  env?: Env,
): Promise<AuthenticatedContext | null> {
  try {
    return await requireAuth(request, env);
  } catch (error) {
    if (error instanceof ApiError && error.code === 'AUTH_REQUIRED') {
      return null;
    }
    throw error;
  }
}

// ── CSRF Protection Middleware ───────────────────────────────────────────────

/**
 * Enforce CSRF protection for mutation requests.
 * Uses double-submit cookie pattern (SEC §3.3).
 */
export function requireCsrf(
  request: Request,
  cookieName: string = 'csrf_token',
): void {
  // Only enforce for non-GET requests
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return;
  }

  enforceCsrf(request, cookieName);
}

// ── Rate Limiting Middleware ───────────────────────────────────────────────

/**
 * Rate limiting using Cloudflare KV.
 * Requires KV namespace to be passed via context.
 */
export async function requireRateLimit(
  request: Request,
  kv: KVNamespace,
  tier: RateLimitTier,
  identifier?: string,
): Promise<void> {
  const ip = clientKey(request);
  const key = identifier ? `${identifier}:${ip}` : ip;

  const result = await checkRateLimit(kv, tier, key);

  if (!result.allowed) {
    throw new Error(
      `Rate limit exceeded. Try again in ${result.resetSeconds} seconds.`,
    );
  }
}

// ── Auth-Specific Rate Limits ───────────────────────────────────────────────

/**
 * Apply auth-specific rate limits (login, register, password reset).
 */
export async function applyAuthRateLimit(
  request: Request,
  kv: KVNamespace,
  action: 'login' | 'register' | 'password_reset' | 'verify_email_resend',
): Promise<void> {
  const tiers: Record<typeof action, RateLimitTier> = {
    login: 'public',
    register: 'public',
    password_reset: 'public',
    verify_email_resend: 'authenticated',
  };

  const tier = tiers[action];
  await requireRateLimit(request, kv, tier, `auth:${action}`);
}

// ── Middleware Composers ────────────────────────────────────────────────────

/**
 * Compose multiple middleware functions.
 * Executes in order; throws if any middleware fails.
 */
export function composeMiddleware(
  ...middlewares: Array<(request: Request) => Promise<void> | void>
) {
  return async (request: Request): Promise<void> => {
    for (const middleware of middlewares) {
      await middleware(request);
    }
  };
}

/**
 * Standard auth middleware for protected endpoints.
 * Includes authentication and CSRF protection.
 */
export const protectedEndpoint = composeMiddleware(
  async (request: Request) => {
    await requireAuth(request);
  },
  (request: Request) => {
    requireCsrf(request);
  },
);

/**
 * Public endpoint with CSRF protection only.
 * For endpoints that don't require authentication but need CSRF.
 */
export const publicEndpoint = composeMiddleware((request: Request) => {
  requireCsrf(request);
});

/**
 * Optional auth endpoint with CSRF protection.
 * For endpoints that work for both authenticated and guest users.
 */
export const optionalAuthEndpoint = composeMiddleware(
  async (request: Request) => {
    await optionalAuth(request);
  },
  (request: Request) => {
    requireCsrf(request);
  },
);

// ── Context Helpers ────────────────────────────────────────────────────────

/**
 * Extract user ID from request (after authentication middleware).
 */
export function getUserId(request: Request): string {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    throw ApiError.unauthorized('User context not found');
  }
  return userId;
}

/**
 * Extract user role from request (after authentication middleware).
 */
export function getUserRole(request: Request): string {
  const role = request.headers.get('x-user-role');
  if (!role) {
    throw ApiError.unauthorized('User role not found');
  }
  return role;
}

/**
 * Check if request is from authenticated user.
 */
export function isAuthenticated(request: Request): boolean {
  return !!request.headers.get('x-user-id');
}
