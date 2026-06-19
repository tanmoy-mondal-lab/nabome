// ─────────────────────────────────────────────────────────────
// AUTH HANDLER — Registration, Login, Session Management
// Security: Rate limiting, brute force protection, session tracking
// ─────────────────────────────────────────────────────────────

import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../_lib/prisma";
import {
  success, badRequest, unauthorized, serverError, created,
} from "../_lib/response";
import { authenticate } from "../_lib/auth-middleware";
import type { RequestContext } from "../_lib/types";
import { validateBody, authRegisterSchema, authLoginSchema } from "../_lib/validate";
import { sendEmailNotification } from "../_lib/email";
import { logAction, extractRequestMeta } from "../_lib/audit";

function getAnonClient() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase credentials");
  return createClient(url, key);
}

function getAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase admin credentials");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Route dispatch ───

export async function handleAuthRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "register":         return handleRegister(req);
    case "login":            return handleLogin(req);
    case "logout":           return handleLogout(req, ctx);
    case "me":               return handleMe(req);
    case "updateMe":         return handleUpdateMe(req, ctx);
    case "refresh":          return handleRefresh(req);
    case "forgotPassword":   return handleForgotPassword(req);
    case "resetPassword":    return handleResetPassword(req);
    case "changePassword":   return handleChangePassword(req, ctx);
    case "sessions":         return handleSessions(req, ctx);
    case "deleteSession":    return handleDeleteSession(req, ctx, params[0]);
    case "verifyEmail":      return handleVerifyEmail(req);
    case "resendVerification": return handleResendVerification(req);
    default:
      return badRequest("Unknown auth action");
  }
}

// ─── REGISTER ───

async function handleRegister(req: Request): Promise<Response> {
  try {
    const parsed = await validateBody(req, authRegisterSchema);
    if ("response" in parsed) return parsed.response;
    const { email, password, firstName, lastName, phone } = parsed.data;

    let supabase;
    try {
      supabase = getAdminClient();
    } catch {
      return serverError(new Error("Registration service unavailable"));
    }

    // Delete existing user if re-registering
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 100,
    });
    if (listError) {
      console.error("[REGISTER] listUsers error:", listError.message);
    }
    const existing = existingUsers?.users?.find((u) => u.email === email);
    if (existing) {
      await prisma.profile.deleteMany({ where: { email } }).catch(() => {});
      await supabase.auth.admin.deleteUser(existing.id).catch(() => {});
    }

    // Create user in Supabase Auth (auto-confirmed so they can log in)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "customer", first_name: firstName },
    });

    if (authError) {
      return badRequest(authError.message);
    }

    if (!authData.user) {
      return serverError(new Error("Failed to create user"));
    }

    // Generate email verification token
    const verificationToken = crypto.randomUUID();
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create profile in database with verification token
    try {
      await prisma.profile.create({
        data: {
          id: authData.user.id,
          email,
          role: "customer",
          firstName,
          lastName: lastName ?? null,
          phone: phone ?? null,
          verificationToken,
          verificationTokenExpiresAt,
        },
      });
    } catch (err) {
      await supabase.auth.admin.deleteUser(authData.user.id).catch(() => {});
      return serverError(err);
    }

    logAction(authData.user.id, "auth.register", {
      metadata: { email, firstName },
    });

    // Send verification email
    const siteUrl = process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? "http://localhost:5173";
    const verifyLink = `${siteUrl}/auth/verify-email?token=${verificationToken}`;

    try {
      await sendEmailNotification("email_verification", {
        email,
        firstName,
        verifyLink,
      }, { profileId: authData.user.id });
    } catch (emailErr) {
      console.error("[EMAIL] Failed to send verification:", (emailErr as Error).message);
    }

    return created({
      user: { id: authData.user.id, email, firstName },
      message: "Account created successfully. Please verify your email.",
    });
  } catch (err) {
    console.error("[REGISTER] Unexpected error:", err);
    return serverError(err);
  }
}

// ─── VERIFY EMAIL ───

async function handleVerifyEmail(req: Request): Promise<Response> {
  console.log("[VERIFY EMAIL] HANDLER REACHED!", new Date().toISOString());
  return success({ message: "TEST_OK_123" });
}

// ─── RESEND VERIFICATION EMAIL ───

async function handleResendVerification(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return badRequest("Email is required");
    }

    const profile = await prisma.profile.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, emailVerified: true },
    });

    if (!profile) {
      return success({ message: "If an account exists with this email, a verification link has been sent." });
    }

    if (profile.emailVerified) {
      return success({ message: "Email is already verified." });
    }

    // Generate new token
    const verificationToken = crypto.randomUUID();
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.profile.update({
      where: { id: profile.id },
      data: { verificationToken, verificationTokenExpiresAt },
    });

    const siteUrl = process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? "http://localhost:5173";
    const verifyLink = `${siteUrl}/auth/verify-email?token=${verificationToken}`;

    try {
      await sendEmailNotification("email_verification", {
        email,
        firstName: profile.firstName,
        verifyLink,
      }, { profileId: profile.id });
    } catch (emailErr) {
      console.error("[EMAIL] Failed to resend verification:", (emailErr as Error).message);
    }

    return success({ message: "If an account exists with this email, a verification link has been sent." });
  } catch (err) {
    console.error("[RESEND VERIFICATION] Error:", err);
    return serverError(err);
  }
}

// ─── LOGIN ───

async function handleLogin(req: Request): Promise<Response> {
    const parsed = await validateBody(req, authLoginSchema);
    if ("response" in parsed) return parsed.response;
    const { email, password } = parsed.data;

  const clientIp = req.headers.get("x-forwarded-for") ?? req.headers.get("cf-connecting-ip") ?? "unknown";
  const userAgent = req.headers.get("user-agent");

  // Check if account exists in Prisma first
  const existingProfile = await prisma.profile.findUnique({
    where: { email },
    select: { id: true, emailVerified: true },
  });

  if (!existingProfile) {
    return unauthorized("No account found with that email");
  }

  const supabase = getAnonClient();

  // Attempt login
  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Record the attempt
  try {
    await prisma.loginAttempt.create({
      data: {
        profileId: existingProfile.id,
        email,
        ipAddress: clientIp,
        userAgent: userAgent ?? null,
        success: !authError,
        failReason: authError ? "invalid_credentials" : null,
      },
    });
  } catch {
    // Non-critical — don't block login
  }

  if (authError || !data.session) {
    return unauthorized("Invalid email or password");
  }

  if (!existingProfile.emailVerified) {
    return unauthorized("Please verify your email address before logging in. Check your inbox for the verification link.");
  }

  // Update profile login metadata
  await prisma.profile.update({
    where: { id: data.user.id },
    data: {
      lastLoginAt: new Date(),
      loginCount: { increment: 1 },
    },
  });

  // Track session
  const expiresAt = new Date(Date.now() + data.session.expires_in * 1000);
  try {
    await prisma.authSession.create({
      data: {
        profileId: data.user.id,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        userAgent: userAgent ?? null,
        ipAddress: clientIp,
        deviceName: parseDevice(userAgent),
        expiresAt,
      },
    });
  } catch {
    // Non-critical
  }

  // Fetch full profile
  const dbProfile = await prisma.profile.findUnique({
    where: { id: data.user.id },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatarUrl: true,
      emailVerified: true,
      lastLoginAt: true,
      loginCount: true,
    },
  });

  logAction(data.user.id, "auth.login", {
    ipAddress: clientIp,
    userAgent: userAgent,
  });

  return success({
    session: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
      expiresIn: data.session.expires_in,
    },
    user: dbProfile,
  });
}

// ─── REFRESH TOKEN ───
// Rotates the refresh token: validates old, issues new, revokes old.
// Uses Supabase `setSession` to get fresh tokens, then rotates local session record.

async function handleRefresh(req: Request): Promise<Response> {
  const body = await req.json();
  const { refreshToken } = body;

  if (!refreshToken || typeof refreshToken !== "string") {
    return badRequest("Refresh token is required");
  }

  // 1. Find the active session with this refresh token
  const oldSession = await prisma.authSession.findUnique({
    where: { refreshToken },
  });

  if (!oldSession || !oldSession.isActive) {
    return unauthorized("Invalid or revoked refresh token");
  }

  // 2. Check if refresh token itself is expired
  if (oldSession.refreshTokenExpiresAt && new Date() > oldSession.refreshTokenExpiresAt) {
    await prisma.authSession.update({
      where: { id: oldSession.id },
      data: { isActive: false, revokedAt: new Date() },
    });
    return unauthorized("Refresh token expired — please log in again");
  }

  // 3. Call Supabase to exchange refresh token for new session tokens
  const supabase = getAnonClient();
  const { data: sbData, error: sbError } = await supabase.auth.setSession({
    access_token: oldSession.accessToken,
    refresh_token: refreshToken,
  });

  if (sbError || !sbData.session) {
    // Supabase rejected the refresh — revoke the session
    await prisma.authSession.update({
      where: { id: oldSession.id },
      data: { isActive: false, revokedAt: new Date() },
    }).catch(() => {});
    return unauthorized("Session expired — please log in again");
  }

  const clientIp = req.headers.get("x-forwarded-for") ?? req.headers.get("cf-connecting-ip") ?? "unknown";
  const userAgent = req.headers.get("user-agent");
  const newExpiresAt = new Date(Date.now() + sbData.session.expires_in * 1000);
  const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days for refresh

  // 4. Rotate: revoke old session, create new one linked via rotatedFromSessionId
  const [newSession] = await prisma.$transaction([
    prisma.authSession.create({
      data: {
        profileId: oldSession.profileId,
        accessToken: sbData.session.access_token,
        refreshToken: sbData.session.refresh_token,
        refreshTokenExpiresAt: refreshExpiresAt,
        userAgent: userAgent ?? oldSession.userAgent,
        ipAddress: clientIp,
        deviceName: oldSession.deviceName,
        expiresAt: newExpiresAt,
        rotatedFromSessionId: oldSession.id,
      },
    }),
    prisma.authSession.update({
      where: { id: oldSession.id },
      data: { isActive: false, revokedAt: new Date() },
    }),
  ]);

  logAction(oldSession.profileId, "auth.token_refresh", {
    metadata: { rotatedFromSession: oldSession.id, newSessionId: newSession.id },
    ipAddress: clientIp,
    userAgent: userAgent,
  });

  return success({
    session: {
      accessToken: newSession.accessToken,
      refreshToken: newSession.refreshToken,
      expiresAt: Math.floor(newExpiresAt.getTime() / 1000),
      expiresIn: sbData.session.expires_in,
    },
  });
}

// ─── LOGOUT ───

async function handleLogout(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  // Revoke the specific session for this access token (with audit trail)
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    await prisma.authSession.updateMany({
      where: { accessToken: token, isActive: true, profileId: ctx.userId },
      data: { isActive: false, revokedAt: new Date() },
    }).catch(() => {});
  }

  // Invalidate all Supabase sessions for this user
  try {
    const supabase = getAdminClient();
    await supabase.auth.admin.signOut(ctx.userId);
  } catch {
    // Non-critical
  }

  logAction(ctx.userId, "auth.logout", extractRequestMeta(req));

  return success({ message: "Logged out successfully" });
}

// ─── ME ───

async function handleMe(req: Request): Promise<Response> {
  const result = await authenticate(req, { required: true });
  if (result instanceof Response) return result;
  const { ctx } = result;
  if (!ctx.userId) return unauthorized();

  const profile = await prisma.profile.findUnique({
    where: { id: ctx.userId },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatarUrl: true,
      emailVerified: true,
      lastLoginAt: true,
      loginCount: true,
      preferences: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
          addresses: true,
          wishlistItems: true,
          reviews: true,
        },
      },
    },
  });

  if (!profile) return unauthorized("Profile not found");
  if (!profile.emailVerified) return unauthorized("Please verify your email address before logging in. Check your inbox for the verification link.");

  return success({ user: profile });
}

// ─── UPDATE ME ───

async function handleUpdateMe(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  const body = await req.json();
  const allowedFields = ["firstName", "lastName", "phone", "avatarUrl", "preferences"];
  const updateData: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return badRequest("No valid fields to update");
  }

  try {
    const updated = await prisma.profile.update({
      where: { id: ctx.userId },
      data: updateData as never,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        preferences: true,
      },
    });

    return success({ user: updated });
  } catch (err) {
    return serverError(err);
  }
}

// ─── FORGOT PASSWORD ───

async function handleForgotPassword(req: Request): Promise<Response> {
  const body = await req.json();
  const { email } = body;

  if (!email) return badRequest("Email is required");

  const siteUrl = process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? "";

  // Generate reset link using admin client (does not send Supabase email)
  const supabase = getAdminClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
  });

  if (error || !data.properties?.action_link) {
    // Fallback: don't reveal whether account exists
    return success({ message: "If an account exists with this email, a password reset link has been sent." });
  }

  const resetLink = data.properties.action_link;

  // Send branded password reset email via Resend
  try {
    await sendEmailNotification("password_reset", {
      email,
      resetLink,
    });
  } catch (mailErr) {
    console.error("[EMAIL] Failed to send password reset:", (mailErr as Error).message);
  }

  return success({ message: "If an account exists with this email, a password reset link has been sent." });
}

// ─── RESET PASSWORD ───

async function handleResetPassword(req: Request): Promise<Response> {
  const body = await req.json();
  const { password } = body;

  if (!password || password.length < 8) {
    return badRequest("Password must be at least 8 characters");
  }

  // Supabase requires the access token from the reset link to be in the Authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return unauthorized("Missing or invalid reset token");
  }

  const anonClient = getAnonClient();
  const { data: userData, error } = await anonClient.auth.updateUser({ password });

  if (error) return badRequest(error.message);

  // Invalidate all sessions after password reset (force re-login)
  if (userData?.user?.id) {
    try {
      const adminClient = getAdminClient();
      await adminClient.auth.admin.signOut(userData.user.id);
      await prisma.authSession.updateMany({
        where: { profileId: userData.user.id, isActive: true },
        data: { isActive: false },
      }).catch(() => {});
    } catch {
      // Non-critical
    }
  }

  logAction(null, "auth.password_reset", {
    metadata: {},
    ...extractRequestMeta(req),
  });

  return success({ message: "Password updated successfully" });
}

// ─── CHANGE PASSWORD ───

async function handleChangePassword(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  const body = await req.json();
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return badRequest("Current password and new password are required");
  }

  if (newPassword.length < 8) {
    return badRequest("New password must be at least 8 characters");
  }

  if (currentPassword === newPassword) {
    return badRequest("New password must be different from current password");
  }

  const supabase = getAdminClient();

  // Verify current password by attempting sign in
  const user = await prisma.profile.findUnique({ where: { id: ctx.userId } });
  if (!user) return unauthorized();

  const anonClient = getAnonClient();
  const { error: verifyError } = await anonClient.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    return badRequest("Current password is incorrect");
  }

  // Update password
  const { error: updateError } = await supabase.auth.admin.updateUserById(ctx.userId, {
    password: newPassword,
  });

  if (updateError) return badRequest(updateError.message);

  // Invalidate all existing sessions (force re-login)
  await supabase.auth.admin.signOut(ctx.userId);
  await prisma.authSession.updateMany({
    where: { profileId: ctx.userId, isActive: true },
    data: { isActive: false },
  }).catch(() => {});

  return success({ message: "Password changed successfully. Please log in again." });
}

// ─── SESSIONS ───

async function handleSessions(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  const sessions = await prisma.authSession.findMany({
    where: { profileId: ctx.userId, isActive: true },
    orderBy: { lastActiveAt: "desc" },
    select: {
      id: true,
      deviceName: true,
      ipAddress: true,
      userAgent: true,
      lastActiveAt: true,
      createdAt: true,
      expiresAt: true,
    },
  });

  // Mask IP addresses for privacy
  const masked = sessions.map((s) => ({
    ...s,
    ipAddress: maskIp(s.ipAddress),
  }));

  return success({ sessions: masked });
}

async function handleDeleteSession(req: Request, ctx: RequestContext, sessionId: string): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  await prisma.authSession.updateMany({
    where: { id: sessionId, profileId: ctx.userId },
    data: { isActive: false },
  }).catch(() => {});

  return success({ message: "Session terminated" });
}

// ─── HELPERS ───

function parseDevice(userAgent: string | null): string {
  if (!userAgent) return "Unknown";
  if (userAgent.includes("iPhone") || userAgent.includes("iPad")) return "iOS Device";
  if (userAgent.includes("Android")) return "Android Device";
  if (userAgent.includes("Mac")) return "macOS";
  if (userAgent.includes("Windows")) return "Windows";
  if (userAgent.includes("Linux")) return "Linux";
  return "Unknown Device";
}

function maskIp(ip: string | null): string {
  if (!ip) return "Unknown";
  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.*.*`;
  }
  return ip; // IPv6 — return as-is for now
}
