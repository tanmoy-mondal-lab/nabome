import { createClient } from "@supabase/supabase-js";
import { unauthorized, forbidden, serverError } from "./response";
import type { RequestContext } from "./types";
import { prisma } from "./prisma";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase admin credentials");
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function authenticateRequest(
  request: Request
): Promise<RequestContext | Response> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return unauthorized("Missing or invalid authorization header");
  }

  const token = authHeader.slice(7);

  try {
    const supabase = getSupabaseAdmin();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return unauthorized("Invalid or expired token");
    }

    // Read role from the profile table (source of truth), not from JWT metadata
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    return {
      userId: user.id,
      userRole: profile?.role ?? "customer",
    };
  } catch (err) {
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
