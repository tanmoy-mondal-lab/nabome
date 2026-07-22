// ─────────────────────────────────────────────────────────────
// AUTH HANDLER — Registration, Login, Session Management
// Security: Rate limiting, brute force protection, session tracking
// ─────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";
import { getPrisma } from "../_lib/prisma";
import {
  success, badRequest, unauthorized, serverError, created, conflict, error,
} from "../_lib/response";
import type { RequestContext } from "../_lib/types";
import { ErrorCode } from "../_lib/types";
import { validateBody, authRegisterSchema, authLoginSchema, forgotPasswordSchema, verifyResetCodeSchema, resetPasswordSchema, changePasswordSchema, verifyEmailSchema, resendVerificationSchema, updateProfileSchema, emailChangeSchema } from "../_lib/validate";
import type { Prisma } from "@prisma/client";
import { sendEmailNotification } from "../_lib/email";
import { logAction, extractRequestMeta } from "../_lib/audit";
import type { Env } from "../_lib/env";
import { cleanSecret } from "../_lib/secrets";
import { hashToken } from "../_lib/token-hash";
import { getEnv } from "../_lib/env";
import { withRateLimit, RATE_LIMIT_CONFIG } from "../_lib/rate-limit";
import { setCookie, clearCookie, parseCookies, COOKIE_CONFIG, buildCookieString } from "../_lib/cookies";

function generateVerificationCode(): string {
  const buf = new Uint8Array(4);
  crypto.getRandomValues(buf);
  const num = 100000 + ((buf[0]! << 8 | buf[1]!) % 900000);
  return num.toString();
}

function getAnonClient(env?: Env) {
  // Use provided env, or fall back to process.env for local development
  const effectiveEnv = env || getEnv();
  const url = cleanSecret(effectiveEnv.SUPABASE_URL) || cleanSecret(effectiveEnv.VITE_SUPABASE_URL);
  const key = cleanSecret(effectiveEnv.SUPABASE_ANON_KEY) || cleanSecret(effectiveEnv.VITE_SUPABASE_ANON_KEY);
  if (!url || !key) throw new Error("Missing Supabase credentials");
  return createClient(url, key);
}

function getAdminClient(env?: Env) {
  // Use provided env, or fall back to process.env for local development
  const effectiveEnv = env || getEnv();
  const url = cleanSecret(effectiveEnv.SUPABASE_URL) || cleanSecret(effectiveEnv.VITE_SUPABASE_URL);
  const key = cleanSecret(effectiveEnv.SUPABASE_SERVICE_ROLE_KEY);
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
    case "register":         return handleRegister(req, ctx);
    case "login":            return handleLogin(req, ctx);
    case "logout":           return handleLogout(req, ctx);
    case "me":               return handleMe(req, ctx);
    case "updateMe":         return handleUpdateMe(req, ctx);
    case "refresh":          return handleRefresh(req, ctx);
    case "forgotPassword":   return handleForgotPassword(req, ctx);
    case "verifyResetCode":  return handleVerifyResetCode(req, ctx);
    case "resetPassword":    return handleResetPassword(req, ctx);
    case "changePassword":   return handleChangePassword(req, ctx);
    case "sessions":         return handleSessions(req, ctx);
    case "deleteSession":    return handleDeleteSession(req, ctx, params[0]);
    case "verifyEmail":      return handleVerifyEmail(req, ctx);
    case "resendVerification": return handleResendVerification(req, ctx);
    case "changeEmail":      return handleChangeEmail(req, ctx);
    case "verifyEmailChange": return handleVerifyEmailChange(req, ctx);
    default:
      return badRequest("Unknown auth action");
  }
}

// ─── REGISTER ───

async function handleRegister(req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const parsed = await validateBody(req, authRegisterSchema);
    if ("response" in parsed) return parsed.response;
    const { email, password, firstName, lastName, phone } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const prisma = getPrisma(ctx.env!);

    // Check if a local profile already exists for this email.
    const existingProfile = await prisma.profiles.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, emailVerified: true, firstName: true, preferences: true },
    });

    if (existingProfile) {
      const isGuest =
        (existingProfile.preferences as Record<string, unknown> | null)?.guest === true;

      // A profile created by guest checkout has no Supabase Auth user. Convert
      // it into a full account (reusing the same profile id so existing guest
      // orders stay linked) instead of telling the user to "log in".
      if (isGuest) {
        let supabase;
        try {
          supabase = getAdminClient(ctx.env!);
        } catch {
          return serverError(new Error("Registration service unavailable"));
        }

        const { data: createdUser, error: authError } = await supabase.auth.admin.createUser({
          id: existingProfile.id,
          email,
          password,
          email_confirm: true,
          user_metadata: { role: "customer", first_name: firstName },
        });

        if (authError) return badRequest(authError.message);
        if (!createdUser.user) return serverError(new Error("Failed to create user"));

        const verificationToken = generateVerificationCode();
        const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await prisma.profiles.update({
          where: { id: existingProfile.id },
          data: {
            firstName,
            lastName: lastName ?? null,
            phone: phone ?? null,
            emailVerified: false,
            verificationToken,
            verificationTokenExpiresAt,
            preferences: { ...(existingProfile.preferences as object ?? {}), guest: false },
          },
        });

        void logAction(existingProfile.id, "auth.register_guest_convert", {
          metadata: { email: normalizedEmail, firstName },
        }, ctx.env!);

        const emailResult = await sendEmailNotification("email_verification", {
          email: normalizedEmail,
          firstName,
          verificationCode: verificationToken,
        }, ctx.env!, true);

        if (!emailResult.success) {
          console.error("[AUTH] Failed to send verification email (guest convert):", emailResult.error);
        }

        return created({
          user: { id: existingProfile.id, email: normalizedEmail, firstName },
          message: emailResult.success
            ? "Account created successfully. A verification email has been sent."
            : "Account created successfully. We couldn't send the verification email. Please try again.",
          emailSent: emailResult.success,
        });
      }

      if (existingProfile.emailVerified) {
        return conflict("An account with this email already exists. Please log in.");
      }

      // Account exists but not verified — issue a fresh token and resend the
      // verification email. Never ask the user to create another account.
      const verificationToken = generateVerificationCode();
      const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await prisma.profiles.update({
        where: { id: existingProfile.id },
        data: { verificationToken, verificationTokenExpiresAt },
      });

      const emailResult = await sendEmailNotification("email_verification", {
        email: normalizedEmail,
        firstName: existingProfile.firstName,
        verificationCode: verificationToken,
      }, ctx.env!, true);

      if (!emailResult.success) {
        console.error("[AUTH] Failed to resend verification for existing unverified account:", emailResult.error);
      }

      void logAction(existingProfile.id, "auth.resend_verification", {
        metadata: { email: normalizedEmail, reason: "registration_attempt" },
      }, ctx.env!);

      return success({
        message: emailResult.success
          ? "Your account exists but your email has not been verified. We have sent you a new verification email."
          : "Your account exists but your email has not been verified. We couldn't send the verification email. Please try again.",
        emailSent: emailResult.success,
        accountExists: true,
      });
    }

    // No local profile exists. Check whether a Supabase Auth user already
    // exists for this email (e.g. a previous registration created the auth
    // user but the profile row was never written — an "orphaned" user).
    let supabase;
    try {
      supabase = getAdminClient(ctx.env!);
    } catch {
      return serverError(new Error("Registration service unavailable"));
    }

    const orphanId = await findSupabaseUserByEmail(supabase, normalizedEmail);

    if (orphanId) {
      // Reuse the existing auth user: set its password and create the missing
      // profile row linked to it. Deleting + recreating races Supabase's
      // eventual consistency, so we link to the existing user instead.
      const { error: updateError } = await supabase.auth.admin.updateUserById(orphanId, {
        password,
        email_confirm: true,
        user_metadata: { role: "customer", first_name: firstName },
      });
      if (updateError) return badRequest(updateError.message);

      const verificationToken = generateVerificationCode();
      const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      try {
        await prisma.profiles.create({
          data: {
            id: orphanId,
            email: normalizedEmail,
            role: "customer",
            firstName,
            lastName: lastName ?? null,
            phone: phone ?? null,
            verificationToken,
            verificationTokenExpiresAt,
          },
        });
      } catch (err) {
        // Profile is keyed by the Supabase user id, so a repeated attempt is
        // naturally idempotent. Log but continue — the auth password is set.
        console.error("[AUTH] Profile create failed on orphan recovery:", err);
      }

      void logAction(orphanId, "auth.register_orphan_recover", {
        metadata: { email: normalizedEmail, firstName },
      }, ctx.env!);

      const emailResult = await sendEmailNotification("email_verification", {
        email: normalizedEmail,
        firstName,
        verificationCode: verificationToken,
      }, ctx.env!, true);

      if (!emailResult.success) {
        console.error("[AUTH] Failed to send verification email (orphan recover):", emailResult.error);
      }

      return created({
        user: { id: orphanId, email: normalizedEmail, firstName },
        message: emailResult.success
          ? "Account created successfully. A verification email has been sent."
          : "Account created successfully. We couldn't send the verification email. Please try again.",
        emailSent: emailResult.success,
      });
    }

    // Normal path: no auth user and no profile — create both.
    const { data: createdUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "customer", first_name: firstName },
    });
    let authData = createdUser;

    if (authError) {
      const msg = authError.message?.toLowerCase() || "";
      if (msg.includes("already been registered") || msg.includes("already registered") || msg.includes("already exists")) {
        // Extremely unlikely after the pre-check above, but recover just in case
        // the list call missed a user created in the same instant.
        const fallbackId = await findSupabaseUserByEmail(supabase, normalizedEmail);
        if (fallbackId) {
          await supabase.auth.admin.updateUserById(fallbackId, {
            password,
            email_confirm: true,
            user_metadata: { role: "customer", first_name: firstName },
          }).catch(() => {});
          authData = { user: { id: fallbackId } } as unknown as typeof createdUser;
        } else {
          return badRequest(authError.message);
        }
      } else {
        return badRequest(authError.message);
      }
    }

    if (!authData.user) {
      return serverError(new Error("Failed to create user"));
    }

    // Generate 6-digit email verification code (24-hour expiry)
    const verificationToken = generateVerificationCode();
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create profile in database with verification token
    try {
      await prisma.profiles.create({
        data: {
          id: authData.user.id,
          email: normalizedEmail,
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
      console.error("[AUTH] Profile create failed, rolled back Supabase user:", err);
      return serverError(err);
    }

    void logAction(authData.user.id, "auth.register", {
      metadata: { email: normalizedEmail, firstName },
    }, ctx.env!);

    const emailResult = await sendEmailNotification("email_verification", {
      email: normalizedEmail,
      firstName,
      verificationCode: verificationToken,
    }, ctx.env!, true);

    if (!emailResult.success) {
      console.error("[AUTH] Failed to send verification email:", emailResult.error);
    }

    return created({
      user: { id: authData.user.id, email: normalizedEmail, firstName },
      message: emailResult.success
        ? "Account created successfully. A verification email has been sent."
        : "Account created successfully. We couldn't send the verification email. Please try again.",
      emailSent: emailResult.success,
    });
  } catch (err) {
    return serverError(err);
  }
}

// ─── VERIFY EMAIL ───

async function handleVerifyEmail(req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const parsed = await validateBody(req, verifyEmailSchema);
    if ("response" in parsed) return parsed.response;
    const { email, code } = parsed.data;

    const prisma = getPrisma(ctx.env!);
    const ipAddress = req.headers.get("CF-Connecting-IP") || req.headers.get("X-Forwarded-For") || "unknown";
    const normalizedEmail = email.toLowerCase().trim();

    // Check if this email is locked out. Lockout must count attempts by email
    // (and IP), NOT by the submitted code — otherwise a brute-forcer who sends
    // a different code each request would never trip the limit.
    const recentAttempts = await prisma.verification_attempts.findMany({
      where: {
        email: normalizedEmail,
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) }, // Last 10 minutes
      },
      orderBy: { createdAt: "desc" },
    });

    // Count failed attempts for this code
    const failedAttempts = recentAttempts.filter(a => !a.success).length;
    
    // Check if locked out
    const lockedAttempt = recentAttempts.find(a => a.lockedUntil && a.lockedUntil > new Date());
    if (lockedAttempt && lockedAttempt.lockedUntil) {
      const remainingTime = Math.ceil((lockedAttempt.lockedUntil.getTime() - Date.now()) / 60000);
      return badRequest(`Too many failed attempts. Try again in ${remainingTime} minutes.`);
    }

    // Lockout after 5 failed attempts
    if (failedAttempts >= 5) {
      const lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      await prisma.verification_attempts.create({
        data: {
          email: normalizedEmail,
          code: code as string,
          ipAddress,
          success: false,
          lockedUntil,
        },
      });
      return badRequest("Too many failed attempts. Please request a new verification code.");
    }

    const profile = await prisma.profiles.findFirst({
      where: { email: normalizedEmail, verificationToken: code },
      select: { id: true, email: true, firstName: true, emailVerified: true, verificationTokenExpiresAt: true },
    });

    if (!profile) {
      // Record failed attempt
      await prisma.verification_attempts.create({
        data: {
          profileId: null,
          email: normalizedEmail,
          code: code as string,
          ipAddress,
          success: false,
        },
      });
      return badRequest("Invalid verification code");
    }

    if (profile.emailVerified) {
      // Token matches but the account is already verified (e.g. the link was
      // clicked more than once). Do not error — just confirm the state.
      return success({ message: "Your email has already been verified." });
    }

    if (profile.verificationTokenExpiresAt && profile.verificationTokenExpiresAt < new Date()) {
      // Auto-issue a fresh token and send a new verification email so the user
      // is never stuck with an expired code.
      const newToken = generateVerificationCode();
      const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.profiles.update({
        where: { id: profile.id },
        data: { verificationToken: newToken, verificationTokenExpiresAt: newExpiry },
      });

      const emailResult = await sendEmailNotification("email_verification", {
        email: normalizedEmail,
        firstName: profile.firstName,
        verificationCode: newToken,
      }, ctx.env!, true).catch(() => ({ success: false, error: "email_failed" as const }));

      // Record the expired attempt as a failure for lockout accounting.
      await prisma.verification_attempts.create({
        data: {
          profileId: profile.id,
          email: normalizedEmail,
          code: code as string,
          ipAddress,
          success: false,
        },
      }).catch(() => {});

      if (!emailResult.success) {
        console.error("[AUTH] Failed to resend verification after expired code:", emailResult.error);
        return badRequest("Your verification code has expired. We couldn't send a new verification email. Please try again.");
      }

      return badRequest("Your verification code has expired. We've sent you a new verification email.");
    }

    await prisma.profiles.update({
      where: { id: profile.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
    });

    // Record successful attempt
    await prisma.verification_attempts.create({
      data: {
        profileId: profile.id,
        email: normalizedEmail,
        code: code as string,
        ipAddress,
        success: true,
      },
    });

    void logAction(profile.id, "auth.email_verified", {
      metadata: { email: profile.email },
    }, ctx.env!);

    return success({ message: "Your email has been verified successfully. You can now log in." });
  } catch (err) {
    return serverError(err);
  }
}

// ─── RESEND VERIFICATION EMAIL ───

async function handleResendVerification(req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const parsed = await validateBody(req, resendVerificationSchema);
    if ("response" in parsed) return parsed.response;
    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

  const clientIp = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    // Per-IP rate limit: 3 per hour
    const ipRateLimitResponse = await withRateLimit(
      `${clientIp}:resend-verification`,
      RATE_LIMIT_CONFIG.resendVerification,
      ctx.env
    );
    if (ipRateLimitResponse) return ipRateLimitResponse;

    // Per-email rate limit: 3 per hour
    const emailRateLimitResponse = await withRateLimit(
      `email:${normalizedEmail}:resend-verification`,
      RATE_LIMIT_CONFIG.resendVerification,
      ctx.env
    );
    if (emailRateLimitResponse) return emailRateLimitResponse;

    const prisma = getPrisma(ctx.env!);
    const profile = await prisma.profiles.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, firstName: true, emailVerified: true },
    });

    if (!profile) {
      return success({ message: "We've sent you a new verification email." });
    }

    if (profile.emailVerified) {
      return success({ message: "This account is already verified." });
    }

    // Generate new token and invalidate previous
    const verificationToken = generateVerificationCode();
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.profiles.update({
      where: { id: profile.id },
      data: { verificationToken, verificationTokenExpiresAt },
    });

    const emailResult = await sendEmailNotification("email_verification", {
      email: normalizedEmail,
      firstName: profile.firstName,
      verificationCode: verificationToken,
    }, ctx.env!, true);

    if (!emailResult.success) {
      console.error("[AUTH] Failed to resend verification email:", emailResult.error);
    }

    void logAction(profile.id, "auth.resend_verification", {
      metadata: { email: normalizedEmail, reason: "user_requested" },
    }, ctx.env!);

    return success({
      message: emailResult.success
        ? "We've sent you a new verification email."
        : "We couldn't send the verification email. Please try again.",
      emailSent: emailResult.success,
    });
  } catch (err) {
    return serverError(err);
  }
}

// ─── LOGIN ───

async function handleLogin(req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const parsed = await validateBody(req, authLoginSchema);
    if ("response" in parsed) return parsed.response;
    const { email, password, rememberMe } = parsed.data;
    const normalizedEmail = String(email).trim().toLowerCase();

    const prisma = getPrisma(ctx.env!);
    const clientIp = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const userAgent = req.headers.get("user-agent");

    // Check IP block status (block after 5 consecutive failed attempts).
    // A successful login from the same IP resets the counter so legitimate
    // users are not needlessly locked out for the full 15-minute window.
    const [lastSuccess] = await prisma.login_attempts.findMany({
      where: {
        ipAddress: clientIp,
        success: true,
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
      orderBy: { createdAt: "desc" },
      take: 1,
    });
    const sinceWhen = lastSuccess
      ? lastSuccess.createdAt
      : new Date(Date.now() - 15 * 60 * 1000);
    const recentFailedAttempts = await prisma.login_attempts.count({
      where: {
        ipAddress: clientIp,
        success: false,
        createdAt: { gte: sinceWhen },
      },
    });

    if (recentFailedAttempts >= 5) {
      // Check if IP is in whitelist
      const whitelistVal = ctx.env?.IP_WHITELIST || (typeof process !== "undefined" ? process.env?.IP_WHITELIST : undefined);
      const ipWhitelist = whitelistVal?.split(",") || [];
      if (!ipWhitelist.includes(clientIp)) {
        return unauthorized("Too many failed login attempts. Please try again in 15 minutes.");
      }
    }

    // Check if account exists in Prisma first
    const existingProfile = await prisma.profiles.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, emailVerified: true, firstName: true, isActive: true },
    });

    if (!existingProfile) {
      // Record failed attempt for non-existent account
      try {
        await prisma.login_attempts.create({
          data: {
            profileId: null,
            email: normalizedEmail,
            ipAddress: clientIp,
            userAgent: userAgent ?? null,
            success: false,
            failReason: "invalid_credentials",
          },
        });
      } catch {
        // Non-critical
      }
      return unauthorized("Invalid email or password.");
    }

    // Reject login for deactivated accounts (suspended by admin)
    if (!existingProfile.isActive) {
      try {
        await prisma.login_attempts.create({
          data: {
            profileId: existingProfile.id,
            email: normalizedEmail,
            ipAddress: clientIp,
            userAgent: userAgent ?? null,
            success: false,
            failReason: "account_deactivated",
          },
        });
      } catch {
        // Non-critical
      }
      return unauthorized("Invalid email or password.");
    }

    const supabase = getAnonClient(ctx.env!);

    // Attempt login
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    // Record the attempt
    try {
      await prisma.login_attempts.create({
        data: {
          profileId: existingProfile.id,
          email: normalizedEmail,
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
      return unauthorized("Invalid email or password.");
    }

    if (!existingProfile.emailVerified) {
      // Password is correct but email not verified — issue a fresh token
      // (invalidating any previous unused one) and send a new verification email.
      const verificationToken = generateVerificationCode();
      const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.profiles.update({
        where: { id: existingProfile.id },
        data: { verificationToken, verificationTokenExpiresAt },
      });

      const emailResult = await sendEmailNotification("email_verification", {
        email,
        firstName: existingProfile.firstName || "there",
        verificationCode: verificationToken,
      }, ctx.env!, true);

      if (!emailResult.success) {
        console.error("[AUTH] Failed to send verification email on login:", emailResult.error);
      }

      void logAction(existingProfile.id, "auth.resend_verification", {
        metadata: { email, reason: "unverified_login_attempt" },
      }, ctx.env!);

      if (!emailResult.success) {
        return error(
          ErrorCode.UNAUTHORIZED,
          "We couldn't send the verification email. Please try again.",
          401,
          { needsVerification: true, email }
        );
      }

      return error(
        ErrorCode.UNAUTHORIZED,
        "Your email has not been verified. We've sent you a new verification email. Please verify your email before logging in.",
        401,
        { needsVerification: true, email }
      );
    }

    // Update profile login metadata
    await prisma.profiles.update({
      where: { id: data.user.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
      },
    });

    // Track session
    const expiresAt = new Date(Date.now() + data.session.expires_in * 1000);
    const sessionTtlMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const refreshTokenExpiresAt = new Date(Date.now() + sessionTtlMs);
    try {
      const [accessTokenHash, refreshTokenHash] = await Promise.all([
        hashToken(data.session.access_token),
        hashToken(data.session.refresh_token),
      ]);
      await prisma.auth_sessions.create({
        data: {
          profileId: data.user.id,
          accessToken: accessTokenHash,
          refreshToken: refreshTokenHash,
          refreshTokenExpiresAt,
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
    const dbProfile = await prisma.profiles.findUnique({
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

    void logAction(data.user.id, "auth.login", {
      ipAddress: clientIp,
      userAgent: userAgent,
    }, ctx.env!);

    // Security: Set httpOnly cookies instead of returning tokens in response
    const body = {
      success: true,
      data: {
        user: dbProfile,
        message: "Login successful",
      },
      timestamp: new Date().toISOString(),
    };

    const accessTokenCookie = buildCookieString(
      COOKIE_CONFIG.ACCESS_TOKEN.name,
      data.session.access_token,
      COOKIE_CONFIG.ACCESS_TOKEN,
      ctx.env
    );
    const refreshTokenCookie = buildCookieString(
      COOKIE_CONFIG.REFRESH_TOKEN.name,
      data.session.refresh_token,
      COOKIE_CONFIG.REFRESH_TOKEN,
      ctx.env
    );

    const response = new Response(JSON.stringify(body), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": [accessTokenCookie, refreshTokenCookie].join(", "),
      },
    });

    return response;
  } catch (err) {
    return serverError(err);
  }
}

// ─── REFRESH TOKEN ───
// Rotates the refresh token: validates old, issues new, revokes old.
// Uses Supabase `setSession` to get fresh tokens, then rotates local session record.

async function handleRefresh(req: Request, ctx: RequestContext): Promise<Response> {
  try {
    // Security: Read refresh token from httpOnly cookie instead of request body
    const cookieHeader = req.headers.get("Cookie");
    const cookies = cookieHeader ? parseCookies(cookieHeader) : {};
    const refreshToken = cookies[COOKIE_CONFIG.REFRESH_TOKEN.name];

    if (!refreshToken || typeof refreshToken !== "string") {
      return unauthorized("Refresh token not found in cookies");
    }

    const clientIp = req.headers.get("x-forwarded-for") ?? req.headers.get("cf-connecting-ip") ?? "unknown";

    const rateLimitResponse = await withRateLimit(
      `${clientIp}:refresh-token`,
      { windowMs: 60_000, maxRequests: 10, message: "Too many refresh attempts. Try again in 1 minute." },
      ctx.env
    );
    if (rateLimitResponse) return rateLimitResponse;

    const prisma = getPrisma(ctx.env!);

    // 1. Find the active session with this refresh token
    const refreshTokenHash = await hashToken(refreshToken);
    const oldSession = await prisma.auth_sessions.findFirst({
      where: {
        OR: [
          { refreshToken: refreshTokenHash },
          // One-time compatibility for sessions created before token hashing.
          { refreshToken },
        ],
      },
    });

    if (!oldSession || !oldSession.isActive) {
      return unauthorized("Invalid or revoked refresh token");
    }

    // 2. Check if refresh token itself is expired
    if (oldSession.refreshTokenExpiresAt && new Date() > oldSession.refreshTokenExpiresAt) {
      await prisma.auth_sessions.update({
        where: { id: oldSession.id },
        data: { isActive: false, revokedAt: new Date() },
      });
      return unauthorized("Refresh token expired — please log in again");
    }

    // 3. Call Supabase to exchange refresh token for new session tokens
    const supabase = getAnonClient(ctx.env!);
    const { data: sbData, error: sbError } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (sbError || !sbData.session) {
      // Supabase rejected the refresh — revoke the session
      await prisma.auth_sessions.update({
        where: { id: oldSession.id },
        data: { isActive: false, revokedAt: new Date() },
      }).catch(() => {});
      return unauthorized("Session expired — please log in again");
    }

    const userAgent = req.headers.get("user-agent");
    const newExpiresAt = new Date(Date.now() + sbData.session.expires_in * 1000);
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days for refresh
    const [newAccessTokenHash, newRefreshTokenHash] = await Promise.all([
      hashToken(sbData.session.access_token),
      hashToken(sbData.session.refresh_token),
    ]);

    // 4. Rotate within a transaction with row lock to prevent race conditions
    //    Two concurrent refresh requests for the same session are serialized
    //    via SELECT ... FOR UPDATE on the old session row.
    const result = await prisma.$transaction(async (tx) => {
      // Lock the old session row — blocks concurrent refreshes until this tx completes
      const lockedRows = await tx.$queryRawUnsafe<Array<{ id: string; is_active: boolean }>>(
        `SELECT id, is_active FROM auth_sessions WHERE id = $1::uuid FOR UPDATE`,
        oldSession.id
      );

      if (!lockedRows.length || !lockedRows[0].is_active) {
        // Another concurrent request already rotated this session
        return { type: "conflict" as const };
      }

      if (newRefreshTokenHash === refreshTokenHash) {
        // Supabase returned the same refresh token; update the record in place
        await tx.auth_sessions.update({
          where: { id: oldSession.id },
          data: {
            accessToken: newAccessTokenHash,
            refreshToken: newRefreshTokenHash,
            refreshTokenExpiresAt: refreshExpiresAt,
            expiresAt: newExpiresAt,
            lastActiveAt: new Date(),
          },
        });
        return { type: "updated" as const, sessionId: oldSession.id };
      }

      // Create new session and revoke old one atomically
      const created = await tx.auth_sessions.create({
        data: {
          profileId: oldSession.profileId,
          accessToken: newAccessTokenHash,
          refreshToken: newRefreshTokenHash,
          refreshTokenExpiresAt: refreshExpiresAt,
          userAgent: userAgent ?? oldSession.userAgent,
          ipAddress: clientIp,
          deviceName: oldSession.deviceName,
          expiresAt: newExpiresAt,
          rotatedFromSessionId: oldSession.id,
        },
      });
      await tx.auth_sessions.update({
        where: { id: oldSession.id },
        data: { isActive: false, revokedAt: new Date() },
      });
      return { type: "rotated" as const, session: created };
    });

    if (result.type === "conflict") {
      return unauthorized("Session already refreshed — please try again");
    }

    void logAction(oldSession.profileId, "auth.token_refresh", {
      metadata: {
        rotatedFromSession: oldSession.id,
        newSessionId: result.type === "rotated" ? result.session.id : result.sessionId,
      },
      ipAddress: clientIp,
      userAgent: userAgent,
    }, ctx.env!);

    let response = success({ message: "Token refreshed successfully" });

    response = setCookie(response, COOKIE_CONFIG.ACCESS_TOKEN.name, sbData.session.access_token, COOKIE_CONFIG.ACCESS_TOKEN, ctx.env!);
    response = setCookie(response, COOKIE_CONFIG.REFRESH_TOKEN.name, sbData.session.refresh_token, COOKIE_CONFIG.REFRESH_TOKEN, ctx.env!);

    return response;
  } catch (err) {
    console.error("[AUTH] handleRefresh error:", err);
    return serverError(err);
  }
}

// ─── LOGOUT ───

async function handleLogout(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  const prisma = getPrisma(ctx.env!);

  // Revoke the specific session for this access token (with audit trail).
  // The app authenticates via httpOnly cookies, so read the access token
  // from the cookie (the Authorization header is not sent by the client).
  const cookies = parseCookies(req.headers.get("cookie") ?? "");
  const accessToken = cookies[COOKIE_CONFIG.ACCESS_TOKEN.name];
  if (accessToken) {
    const tokenHash = await hashToken(accessToken);
    await prisma.auth_sessions.updateMany({
      where: {
        profileId: ctx.userId,
        isActive: true,
        OR: [
          { accessToken: tokenHash },
          // One-time compatibility for sessions created before token hashing.
          { accessToken },
        ],
      },
      data: { isActive: false, revokedAt: new Date() },
    }).catch(() => {});
  }

  // Invalidate all Supabase sessions for this user
  try {
    const supabase = getAdminClient(ctx.env!);
    await supabase.auth.admin.signOut(ctx.userId);
  } catch {
    // Non-critical
  }

  void logAction(ctx.userId, "auth.logout", extractRequestMeta(req), ctx.env!);

  // Security: Clear httpOnly cookies
  const response = success({ message: "Logged out successfully" });
  clearCookie(response, COOKIE_CONFIG.ACCESS_TOKEN.name, { path: "/", sameSite: "lax" }, ctx.env!);
  clearCookie(response, COOKIE_CONFIG.REFRESH_TOKEN.name, { path: "/", sameSite: "strict" }, ctx.env!);

  return response;
}

// ─── ME ───

async function handleMe(_req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  const prisma = getPrisma(ctx.env!);
  const profile = await prisma.profiles.findUnique({
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
  if (!profile.emailVerified) return unauthorized("Please verify your email before accessing your account.");

  return success({ user: profile });
}

// ─── UPDATE ME ───

async function handleUpdateMe(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  const parsed = await validateBody(req, updateProfileSchema);
  if ("response" in parsed) return parsed.response;
  const updateData = parsed.data;

  if (Object.keys(updateData).length === 0) {
    return badRequest("No valid fields to update");
  }

  const prisma = getPrisma(ctx.env!);
  try {
    const updated = await prisma.profiles.update({
      where: { id: ctx.userId },
      data: updateData as Prisma.profilesUpdateInput,
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
    console.error("[AUTH] Failed to update profile:", err);
    return serverError(err);
  }
}

// ─── CHANGE EMAIL (initiate) ───

async function handleChangeEmail(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  const rateLimitResponse = await withRateLimit(
    `user:${ctx.userId}:change-email`,
    RATE_LIMIT_CONFIG.auth,
    ctx.env
  );
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = await validateBody(req, emailChangeSchema);
  if ("response" in parsed) return parsed.response;
  const { newEmail } = parsed.data;

  const normalizedEmail = newEmail.toLowerCase().trim();

  const prisma = getPrisma(ctx.env!);

  // Check new email is not already taken by another profile
  const existing = await prisma.profiles.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existing) {
    return badRequest("This email is already in use");
  }

  // Generate 6-digit verification code
  const pendingEmailToken = generateVerificationCode();
  const pendingEmailTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Store pending email info
  await prisma.profiles.update({
    where: { id: ctx.userId },
    data: {
      pendingEmail: normalizedEmail,
      pendingEmailToken,
      pendingEmailTokenExpiresAt,
    },
  });

  // Send verification code to the new email
  const profile = await prisma.profiles.findUnique({
    where: { id: ctx.userId },
    select: { firstName: true, email: true },
  });

  const emailResult = await sendEmailNotification("email_change", {
    email: normalizedEmail,
    firstName: profile?.firstName || "there",
    verificationCode: pendingEmailToken,
  }, ctx.env!, true);
  
  if (!emailResult.success) {
    console.error("[AUTH] Failed to send email change verification:", emailResult.error);
  }

  return success({ 
    message: "Verification code sent to your new email address" + (emailResult.success ? "" : " Note: There may be a delay in receiving the verification email."),
    emailSent: emailResult.success,
  });
}

// ─── VERIFY EMAIL CHANGE ───

async function handleVerifyEmailChange(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const { code } = body;

  if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    return badRequest("Verification code must be a 6-digit number");
  }

  const prisma = getPrisma(ctx.env!);
  const profile = await prisma.profiles.findUnique({
    where: { id: ctx.userId },
    select: {
      id: true,
      email: true,
      pendingEmail: true,
      pendingEmailToken: true,
      pendingEmailTokenExpiresAt: true,
    },
  });

  if (!profile) {
    return unauthorized("Profile not found");
  }

  if (!profile.pendingEmail || !profile.pendingEmailToken) {
    return badRequest("No pending email change. Request a change first.");
  }

  if (profile.pendingEmailToken !== code) {
    return badRequest("Invalid verification code");
  }

  if (profile.pendingEmailTokenExpiresAt && profile.pendingEmailTokenExpiresAt < new Date()) {
    return badRequest("Verification code has expired. Request a new one.");
  }

  const newEmail = profile.pendingEmail;

  // Update email in Prisma profile and clear pending fields FIRST
  // so that if this fails, Supabase auth is never changed (avoiding orphan state)
  try {
    await prisma.profiles.update({
      where: { id: ctx.userId },
      data: {
        email: newEmail,
        pendingEmail: null,
        pendingEmailToken: null,
        pendingEmailTokenExpiresAt: null,
      },
    });
  } catch (err) {
    console.error("[AUTH] Failed to update profile email:", err);
    return serverError(new Error("Failed to update email. Please try again."));
  }

  // Update email in Supabase Auth SECOND (after Prisma succeeds)
  try {
    const supabase = getAdminClient(ctx.env!);
    const { error: supabaseError } = await supabase.auth.admin.updateUserById(ctx.userId, {
      email: newEmail,
      email_confirm: true,
    });

    if (supabaseError) {
      console.error("[AUTH] Supabase email update failed after Prisma update:", supabaseError);
      // Attempt to roll back Prisma change
      try {
        await prisma.profiles.update({
          where: { id: ctx.userId },
          data: { email: profile.email, pendingEmail: newEmail },
        });
      } catch (rollbackErr) {
        console.error("[AUTH] Failed to rollback Prisma email after Supabase error:", rollbackErr);
      }
      return serverError(new Error("Failed to update email. Please try again."));
    }
  } catch (err) {
    console.error("[AUTH] Supabase email update threw after Prisma update:", err);
    // Attempt to roll back Prisma change
    try {
      await prisma.profiles.update({
        where: { id: ctx.userId },
        data: { email: profile.email, pendingEmail: newEmail },
      });
    } catch (rollbackErr) {
      console.error("[AUTH] Failed to rollback Prisma email after Supabase error:", rollbackErr);
    }
    return serverError(new Error("Failed to update email. Please try again."));
  }

  void logAction(ctx.userId, "auth.email_changed", {
    metadata: { oldEmail: profile.email, newEmail },
  }, ctx.env!);

  return success({ message: "Email updated successfully" });
}

// ─── FORGOT PASSWORD (send 6-digit code) ───

async function handleForgotPassword(req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const parsed = await validateBody(req, forgotPasswordSchema);
    if ("response" in parsed) return parsed.response;
    const { email } = parsed.data;

    const normalizedEmail = email.toLowerCase().trim();

    const prisma = getPrisma(ctx.env!);
    const profile = await prisma.profiles.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, firstName: true, email: true },
    });

    if (!profile) {
      return success({ message: "If an account exists with this email, a verification code has been sent." });
    }

    // Generate 6-digit code
    const resetPasswordToken = generateVerificationCode();
    const resetPasswordTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.profiles.update({
      where: { id: profile.id },
      data: { resetPasswordToken, resetPasswordTokenExpiresAt },
    });

    const emailResult = await sendEmailNotification("password_reset", {
      email: normalizedEmail,
      firstName: profile.firstName,
      verificationCode: resetPasswordToken,
    }, ctx.env!, true);
    
    if (!emailResult.success) {
      console.error("[AUTH] Failed to send password reset email:", emailResult.error);
    }

    return success({ 
      message: "If an account exists with this email, a verification code has been sent." + (emailResult.success ? "" : " Note: There may be a delay in receiving the verification email."),
      emailSent: emailResult.success,
    });
  } catch (err) {
    console.error("[AUTH] handleForgotPassword error:", err);
    return serverError(err);
  }
}

// ─── VERIFY RESET CODE ───

async function handleVerifyResetCode(req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const parsed = await validateBody(req, verifyResetCodeSchema);
    if ("response" in parsed) return parsed.response;
    const { email, code } = parsed.data;

    const normalizedEmail = email.toLowerCase().trim();
    const ipAddress = req.headers.get("CF-Connecting-IP") || req.headers.get("X-Forwarded-For") || "unknown";

    const prisma = getPrisma(ctx.env!);

    // Check if this email is locked out. Count attempts by email (not by the
    // submitted code) so a brute-forcer can't bypass the limit with new codes.
    const recentAttempts = await prisma.verification_attempts.findMany({
      where: {
        email: normalizedEmail,
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) }, // Last 10 minutes
      },
      orderBy: { createdAt: "desc" },
    });

    // Count failed attempts for this code
    const failedAttempts = recentAttempts.filter(a => !a.success).length;
    
    // Check if locked out
    const lockedAttempt = recentAttempts.find(a => a.lockedUntil && a.lockedUntil > new Date());
    if (lockedAttempt && lockedAttempt.lockedUntil) {
      const remainingTime = Math.ceil((lockedAttempt.lockedUntil.getTime() - Date.now()) / 60000);
      return badRequest(`Too many failed attempts. Try again in ${remainingTime} minutes.`);
    }

    // Lockout after 5 failed attempts
    if (failedAttempts >= 5) {
      const lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      await prisma.verification_attempts.create({
        data: {
          email: normalizedEmail,
          code,
          ipAddress,
          success: false,
          lockedUntil,
        },
      });
      return badRequest("Too many failed attempts. Please request a new verification code.");
    }

    const profile = await prisma.profiles.findFirst({
      where: { email: normalizedEmail, resetPasswordToken: code },
      select: { id: true, email: true, resetPasswordTokenExpiresAt: true },
    });

    if (!profile) {
      // Record failed attempt
      await prisma.verification_attempts.create({
        data: {
          profileId: null,
          email: normalizedEmail,
          code,
          ipAddress,
          success: false,
        },
      });
      return badRequest("Invalid verification code");
    }

    if (profile.resetPasswordTokenExpiresAt && profile.resetPasswordTokenExpiresAt < new Date()) {
      return badRequest("Verification code has expired. Request a new one.");
    }

    // Record successful attempt
    await prisma.verification_attempts.create({
      data: {
        profileId: profile.id,
        email: normalizedEmail,
        code,
        ipAddress,
        success: true,
      },
    });

    return success({ message: "Code verified successfully" });
  } catch (err) {
    console.error("[AUTH] handleVerifyResetCode error:", err);
    return serverError(err);
  }
}

// ─── RESET PASSWORD ───

async function handleResetPassword(req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const parsed = await validateBody(req, resetPasswordSchema);
    if ("response" in parsed) return parsed.response;
    const { email, code, password } = parsed.data;

    const normalizedEmail = email.toLowerCase().trim();

    const prisma = getPrisma(ctx.env!);
    
    // Fix race condition by wrapping in transaction to prevent token reuse (R6)
    const profileId = await prisma.$transaction(async (tx) => {
      const profile = await tx.profiles.findFirst({
        where: { email: normalizedEmail, resetPasswordToken: code },
        select: { id: true, resetPasswordTokenExpiresAt: true },
      });

      if (!profile) {
        throw new Error("Invalid verification code");
      }

      if (profile.resetPasswordTokenExpiresAt && profile.resetPasswordTokenExpiresAt < new Date()) {
        throw new Error("Verification code has expired. Request a new one.");
      }

      // Clear reset token immediately to prevent reuse
      await tx.profiles.update({
        where: { id: profile.id },
        data: {
          resetPasswordToken: null,
          resetPasswordTokenExpiresAt: null,
        },
      });

      return profile.id;
    });

    // Update password via Supabase admin API (outside transaction due to external API)
    const supabase = getAdminClient(ctx.env!);
    const { error: updateError } = await supabase.auth.admin.updateUserById(profileId, {
      password,
    });

    if (updateError) return badRequest(updateError.message);

    try {
      await supabase.auth.admin.signOut(profileId);
      await prisma.auth_sessions.updateMany({
        where: { profileId, isActive: true },
        data: { isActive: false },
      }).catch(() => {});
    } catch {
      // Non-critical
    }

    void logAction(null, "auth.password_reset", {
      metadata: { email: normalizedEmail },
      ...extractRequestMeta(req),
    }, ctx.env!);

    return success({ message: "Password updated successfully" });
  } catch (err) {
    console.error("[AUTH] handleResetPassword error:", err);
    return serverError(err);
  }
}

// ─── CHANGE PASSWORD ───

async function handleChangePassword(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  const rateLimitResponse = await withRateLimit(
    `user:${ctx.userId}:change-password`,
    RATE_LIMIT_CONFIG.auth,
    ctx.env
  );
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = await validateBody(req, changePasswordSchema);
  if ("response" in parsed) return parsed.response;
  const { currentPassword, newPassword } = parsed.data;

  if (currentPassword === newPassword) {
    return badRequest("New password must be different from current password");
  }

  const prisma = getPrisma(ctx.env!);
  const supabase = getAdminClient(ctx.env!);

  // Verify current password by attempting sign in
  const user = await prisma.profiles.findUnique({ where: { id: ctx.userId } });
  if (!user) return unauthorized();

  const anonClient = getAnonClient(ctx.env!);
  const { error: verifyError } = await anonClient.auth.signInWithPassword({
    email: user.email,
    password: currentPassword as string,
  });

  if (verifyError) {
    return badRequest("Current password is incorrect");
  }

  // Update password
  const { error: updateError } = await supabase.auth.admin.updateUserById(ctx.userId, {
    password: newPassword as string,
  });

  if (updateError) return badRequest(updateError.message);

  // Invalidate all existing sessions (force re-login)
  await supabase.auth.admin.signOut(ctx.userId);
  await prisma.auth_sessions.updateMany({
    where: { profileId: ctx.userId, isActive: true },
    data: { isActive: false },
  }).catch(() => {});

  return success({ message: "Password changed successfully. Please log in again." });
}

// ─── SESSIONS ───

async function handleSessions(_req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  const prisma = getPrisma(ctx.env!);
  const sessions = await prisma.auth_sessions.findMany({
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
  const masked = sessions.map((s: { ipAddress: string | null }) => ({
    ...s,
    ipAddress: maskIp(s.ipAddress),
  }));

  return success({ sessions: masked });
}

async function handleDeleteSession(_req: Request, ctx: RequestContext, sessionId: string): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  const prisma = getPrisma(ctx.env!);
  await prisma.auth_sessions.updateMany({
    where: { id: sessionId, profileId: ctx.userId },
    data: { isActive: false },
  }).catch(() => {});

  return success({ message: "Session terminated" });
}

// ─── HELPERS ───

async function findSupabaseUserByEmail(
  supabase: ReturnType<typeof getAdminClient>,
  email: string
): Promise<string | null> {
  // Supabase admin API has no direct "get user by email", so paginate the
  // user list and match on the normalized email.
  try {
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data, error: listError } = await supabase.auth.admin.listUsers({ page, perPage });
      if (listError) return null;
      const found = data.users.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );
      if (found) return found.id;
      if (data.users.length < perPage) break;
      page++;
    }
  } catch {
    return null;
  }
  return null;
}

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
