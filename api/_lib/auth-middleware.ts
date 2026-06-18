// ─────────────────────────────────────────────────────────────
// ENHANCED AUTH MIDDLEWARE
// Combines JWT verification, role check, rate limiting, CSRF
// ─────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";
import { unauthorized, forbidden, serverError } from "./response";
import { withRateLimit, getRateLimitKey, RATE_LIMIT_CONFIG } from "./rate-limit";
import { validateCsrf, csrfError } from "./csrf";
import type { RequestContext } from "./types";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase admin credentials");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface AuthOptions {
  /** Require authentication */
  required?: boolean;
  /** Require specific role */
  role?: "customer" | "super_admin";
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

/**
 * Authenticate a request and return context or error response.
 * Combines JWT verification, role check, rate limiting, and CSRF.
 */
export async function authenticate(
  request: Request,
  options: AuthOptions = {}
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

    const limitCheck = withRateLimit(getRateLimitKey(clientIp, prefix), config);
    if (limitCheck) return limitCheck;
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
      const supabase = getSupabaseAdmin();
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return unauthorized("Invalid or expired token");
      }

      const ctx: RequestContext = {
        userId: user.id,
        userRole: user.user_metadata?.role as string ?? "customer",
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
      const supabase = getSupabaseAdmin();
      const { data: { user } } = await supabase.auth.getUser(authHeader.slice(7));
      if (user) {
        return {
          ctx: {
            userId: user.id,
            userRole: user.user_metadata?.role as string ?? "customer",
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
export async function optionalAuth(request: Request): Promise<RequestContext> {
  const result = await authenticate(request, { required: false });
  if (result instanceof Response) return {};
  return result.ctx;
}
