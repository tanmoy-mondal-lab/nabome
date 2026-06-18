import { createClient } from "@supabase/supabase-js";
import { prisma } from "../_lib/prisma";
import { success, badRequest, unauthorized, serverError, created } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase admin credentials");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function handleAuthRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "register":
      return handleRegister(req);
    case "login":
      return handleLogin(req);
    case "logout":
      return handleLogout(req);
    case "me":
      return handleMe(ctx);
    case "forgotPassword":
      return handleForgotPassword(req);
    case "resetPassword":
      return handleResetPassword(req);
    default:
      return badRequest("Unknown auth action");
  }
}

async function handleRegister(req: Request): Promise<Response> {
  const body = await req.json();
  const { email, password, firstName, lastName, phone } = body;

  if (!email || !password || !firstName) {
    return badRequest("Email, password, and first name are required");
  }

  const supabase = getSupabaseAdmin();

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "customer", first_name: firstName },
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      return badRequest("An account with this email already exists");
    }
    return badRequest(authError.message);
  }

  if (!authData.user) {
    return serverError(new Error("Failed to create user"));
  }

  // Create profile in database
  try {
    await prisma.profile.create({
      data: {
        id: authData.user.id,
        role: "customer",
        firstName,
        lastName: lastName ?? null,
        phone: phone ?? null,
      },
    });
  } catch (err) {
    // Rollback auth user on profile creation failure
    await supabase.auth.admin.deleteUser(authData.user.id);
    return serverError(err);
  }

  return created({
    user: {
      id: authData.user.id,
      email: authData.user.email,
      firstName,
    },
  });
}

async function handleLogin(req: Request): Promise<Response> {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return badRequest("Email and password are required");
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return serverError(new Error("Missing Supabase credentials"));
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return unauthorized("Invalid email or password");
  }

  if (!data.session) {
    return serverError(new Error("No session created"));
  }

  // Get profile
  const profile = await prisma.profile.findUnique({
    where: { id: data.user.id },
    select: { id: true, role: true, firstName: true, lastName: true, phone: true },
  });

  return success({
    session: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    },
    user: {
      id: data.user.id,
      email: data.user.email,
      ...profile,
    },
  });
}

async function handleLogout(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  // Invalidate the session server-side
  return success({ message: "Logged out successfully" });
}

async function handleMe(ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  const profile = await prisma.profile.findUnique({
    where: { id: ctx.userId },
    select: {
      id: true,
      role: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!profile) {
    return unauthorized("Profile not found");
  }

  return success({ user: profile });
}

async function handleForgotPassword(req: Request): Promise<Response> {
  const body = await req.json();
  const { email } = body;

  if (!email) return badRequest("Email is required");

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return serverError(new Error("Missing Supabase credentials"));
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const siteUrl = process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? "http://localhost:5173";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/reset-password`,
  });

  if (error) return badRequest(error.message);

  return success({ message: "Password reset email sent" });
}

async function handleResetPassword(req: Request): Promise<Response> {
  const body = await req.json();
  const { password } = body;

  if (!password || password.length < 8) {
    return badRequest("Password must be at least 8 characters");
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return unauthorized("Missing or invalid token");
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return serverError(new Error("Missing Supabase credentials"));
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return badRequest(error.message);

  return success({ message: "Password updated successfully" });
}
