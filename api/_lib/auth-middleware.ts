// ─────────────────────────────────────────────────────────────
// ENHANCED AUTH MIDDLEWARE
// Combines JWT verification, role check, rate limiting, CSRF
// ─────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";
import { unauthorized, forbidden, serverError } from "./response";
import { withRateLimit, getRateLimitKey, RATE_LIMIT_CONFIG } from "./rate-limit";
import { getPrisma } from "./prisma";
import { cleanSecret } from "./secrets";
import { hashToken } from "./token-hash";
import type { RequestContext } from "./types";
import type { Env } from "./env";
import { getEnv } from "./env";
import { parseCookies, COOKIE_CONFIG } from "./cookies";

function getSupabaseAdmin(env?: Env) {
  // Use provided env, or fall back to process.env for local development
  const effectiveEnv = env || getEnv();
  const url = cleanSecret(effectiveEnv.SUPABASE_URL) || cleanSecret(effectiveEnv.VITE_SUPABASE_URL);
  const key = cleanSecret(effectiveEnv.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !key) throw new Error("Missing Supabase admin credentials");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

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

const DEFAULT_OPTIONS: AuthOptions = {
  required: true,
  role: undefined,
  rateLimit: false,
  csrf: true, // Enable CSRF by default for authenticated requests
};

interface ActiveSessionResult {
  role: "customer" | "admin";
}

async function resolveActiveSession(
  token: string,
  userId: string,
  env?: Env
): Promise<ActiveSessionResult | null> {
  const prisma = getPrisma(env);
  const tokenHash = await hashToken(token);
  const now = new Date();

  const session = await prisma.auth_sessions.findFirst({
    where: {
      profileId: userId,
      isActive: true,
      expiresAt: { gt: now },
      OR: [
        { accessToken: tokenHash },
        // One-time compatibility for sessions created before token hashing.
        { accessToken: token },
      ],
    },
    select: {
      id: true,
      lastActiveAt: true,
      profile: {
        select: {
          role: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Check idle timeout (8 hours for admin, 2 hours for customers)
  const adminIdleTimeout = 8 * 60 * 60 * 1000; // 8 hours for admin users
  const customerIdleTimeout = 2 * 60 * 60 * 1000; // 2 hours for customers
  const effectiveIdleTimeout = session.profile?.role === "admin" ? adminIdleTimeout : customerIdleTimeout;
  
  const timeSinceLastActive = now.getTime() - session.lastActiveAt.getTime();
  if (timeSinceLastActive > effectiveIdleTimeout) {
    // Revoke session due to inactivity
    await prisma.auth_sessions.update({
      where: { id: session.id },
      data: { isActive: false, revokedAt: now },
    });
    return null;
  }

  // Update last active timestamp
  await prisma.auth_sessions.update({
    where: { id: session.id },
    data: { lastActiveAt: now },
  }).catch(() => {
    // Non-critical: lastActiveAt update failure should not break the request
  });

  return {
    role: session.profile?.role ?? "customer",
  };
}

/**
 * Authenticate a request and return context or error response.
 * Combines JWT verification, role check, rate limiting, and CSRF.
 */
export async function authenticate(
  request: Request,
  options: AuthOptions = {},
  env?: Env
): Promise<{ ctx: RequestContext } | Response> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const clientIp = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const path = new URL(request.url).pathname;

  // 1. Rate limiting
  if (opts.rateLimit) {
    const prefix = opts.rateLimitPrefix ?? path;
    const config = path.startsWith("/api/admin")
      ? RATE_LIMIT_CONFIG.admin
      : path.includes("auth/") || path.includes("login") || path.includes("register")
        ? RATE_LIMIT_CONFIG.auth
        : RATE_LIMIT_CONFIG.standard;

    const limitCheck = await withRateLimit(getRateLimitKey(clientIp, prefix), config, env);
    if (limitCheck !== null) return limitCheck;
  }

  // 2. JWT verification
  // Security: Read access token from httpOnly cookie instead of Authorization header
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? parseCookies(cookieHeader) : {};
  const accessToken = cookies[COOKIE_CONFIG.ACCESS_TOKEN.name];
  const authHeader = request.headers.get("Authorization"); // Fallback for compatibility

  const token = accessToken || (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);

  if (opts.required) {
    if (!token) {
      return unauthorized("Missing authentication token");
    }

    try {
      const supabase = getSupabaseAdmin(env);
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return unauthorized("Invalid or expired token");
      }

      const session = await resolveActiveSession(token, user.id, env);
      if (!session) {
        return unauthorized("Session expired — please log in again");
      }

      const ctx: RequestContext = {
        userId: user.id,
        userRole: session.role,
      };

      // 4. Email verification check
      if (opts.requireEmailVerified) {
        const prisma = getPrisma(env);
        const profile = await prisma.profiles.findUnique({
          where: { id: user.id },
          select: { emailVerified: true },
        });
        if (!profile || !profile.emailVerified) {
          return unauthorized("Please verify your email address before performing this action");
        }
      }

      // 5. Role check
      if (opts.role && ctx.userRole !== opts.role) {
        return forbidden(`Requires ${opts.role} role`);
      }

      return { ctx };
    } catch (err) {
      return serverError(err);
    }
  }

  // Optional auth — try to parse token but don't fail if missing. Mirror the
  // required path: prefer the httpOnly access_token cookie, fall back to the
  // Authorization header.
  const optionalToken = accessToken || (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);
  if (optionalToken) {
    try {
      const supabase = getSupabaseAdmin(env);
      const { data: { user } } = await supabase.auth.getUser(optionalToken as string);
      if (user) {
        const session = await resolveActiveSession(optionalToken as string, user.id, env);
        if (!session) {
          return { ctx: {} };
        }
        return {
          ctx: {
            userId: user.id,
            userRole: session.role,
          },
        };
      }
    } catch (err) {
      console.error("Optional auth error (continuing without auth):", err);
      // Proceed without auth rather than failing the request
    }
  }

  return { ctx: {} };
}

/**
 * Quick helper for public endpoints that want optional auth identity.
 */
export async function optionalAuth(request: Request, env?: Env): Promise<RequestContext> {
  const result = await authenticate(request, { required: false }, env);
  if (result instanceof Response) return {};
  return result.ctx;
}

/**
 * Require a specific role. Returns null if authorized, otherwise returns a 403 response.
 * This is a helper function for use after authentication.
 */
export function requireRole(
  context: RequestContext | Response,
  role: string
): Response | null {
  if (context instanceof Response) return context;
  if (context.userRole !== role) {
    return forbidden(`Requires ${role} role`);
  }
  return null;
}

/**
 * Require admin role. Returns null if authorized, otherwise returns a 403 response.
 * This is a helper function for use after authentication.
 */
export function requireAdmin(context: RequestContext | Response): Response | null {
  if (context instanceof Response) return context;
  if (context.userRole !== "admin") {
    return forbidden("Requires admin role");
  }
  return null;
}
