import { createClient } from "@supabase/supabase-js";
import { unauthorized, forbidden, serverError } from "./response";
import type { RequestContext } from "./types";
import { getPrisma } from "./prisma";
import type { Env } from "./env";

let supabaseAdminWarningShown = false;

function getSupabaseAdmin(env?: Env) {
  const url = env?.SUPABASE_URL ?? env?.VITE_SUPABASE_URL ?? (typeof process !== "undefined" ? process.env?.SUPABASE_URL : undefined);
  const key = env?.SUPABASE_SERVICE_ROLE_KEY ?? (typeof process !== "undefined" ? process.env?.SUPABASE_SERVICE_ROLE_KEY : undefined);

  if (!url || !key) {
    if (!supabaseAdminWarningShown) {
      console.error("[AUTH] Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Cloudflare Pages secrets.");
      supabaseAdminWarningShown = true;
    }
    throw new Error("Authentication service unavailable — missing configuration");
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function authenticateRequest(
  request: Request,
  env?: Env
): Promise<RequestContext | Response> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return unauthorized("Missing or invalid authorization header");
  }

  const token = authHeader.slice(7);

  try {
    const supabase = getSupabaseAdmin(env);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return unauthorized("Invalid or expired token");
    }

    // Read role from the profile table (source of truth), not from JWT metadata
    const prisma = getPrisma(env);
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    return {
      userId: user.id,
      userRole: profile?.role ?? "customer",
    };
  } catch (err) {
    // If it's our own "missing config" error, return a clear 503
    if (err instanceof Error && err.message.includes("missing configuration")) {
      return serverError("Authentication service unavailable — server misconfigured");
    }
    return serverError(err);
  }
}

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

export function requireAdmin(context: RequestContext | Response): Response | null {
  if (context instanceof Response) return context;
  if (context.userRole !== "admin") {
    return forbidden("Requires admin role");
  }
  return null;
}