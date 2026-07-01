// ─────────────────────────────────────────────────────────────
// ENHANCED AUTH MIDDLEWARE
// Combines JWT verification, role check, rate limiting, CSRF
// ─────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";
import { unauthorized, forbidden, serverError } from "./response";
import { withRateLimit, getRateLimitKey, RATE_LIMIT_CONFIG } from "./rate-limit";
import { validateCsrf, csrfError } from "./csrf";
import { getPrisma } from "./prisma";
import { cleanSecret } from "./secrets";
import { hashToken } from "./token-hash";
import type { RequestContext } from "./types";
import type { Env } from "./env";
import { getEnv } from "./env";

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
}

const DEFAULT_OPTIONS: AuthOptions = {
  required: true,
  role: undefined,
  rateLimit: false,
  csrf: false,
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

  const session = await prisma.authSession.findFirst({
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
  const clientIp = request.headers.get("x-forwarded-for") ?? request.headers.get("cf-connecting-ip") ?? "unknown";
  const path = new URL(request.url).pathname;

  // 1. Rate limiting
  if (opts.rateLimit) {
    const prefix = opts.rateLimitPrefix ?? path;
    const config = path.startsWith("/api/admin")
      ? RATE_LIMIT_CONFIG.admin
      : path.includes("auth/") || path.includes("login") || path.includes("register")
        ? RATE_LIMIT_CONFIG.auth
        : RATE_LIMIT_CONFIG.standard;

    const limitCheck = await withRateLimit(getRateLimitKey(clientIp, prefix), config);
    if (limitCheck !== null) return limitCheck;
  }

  // 2. CSRF validation (for state-changing requests)
  if (opts.csrf) {
    if (!validateCsrf(request)) {
      return csrfError();
    }
  }

  // 3. JWT verification
  const authHeader = request.headers.get("Authorization");
  if (opts.required) {
    if (!authHeader?.startsWith("Bearer ")) {
      return unauthorized("Missing or invalid authorization header");
    }

    const token = authHeader.slice(7);

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

      // 4. Role check
      if (opts.role && ctx.userRole !== opts.role) {
        return forbidden(`Requires ${opts.role} role`);
      }

      return { ctx };
    } catch (err) {
      return serverError(err);
    }
  }

  // Optional auth — try to parse token but don't fail if missing
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const supabase = getSupabaseAdmin(env);
      const token = authHeader.slice(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const session = await resolveActiveSession(token, user.id, env);
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
    } catch {
      // Ignore — proceed without auth
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
