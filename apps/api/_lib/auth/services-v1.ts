/**
 * Authentication services — JWT + bcrypt implementation for V1.
 * Self-contained authentication without external dependencies.
 * Secrets (JWT secret, etc.) are passed from the Cloudflare Env binding.
 */

import type { User, Session } from '@prisma/client';

import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  type EmailConfig,
} from '../email/service.ts';
import { ApiError } from '../http/errors.ts';
import { getPrisma } from '../prisma.ts';

import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  type JwtPayload,
} from './jwt.ts';
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from './password.ts';

// ── Token Generation ───────────────────────────────────────────────────────

async function generateSecureToken(length: number = 32): Promise<string> {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function withTimeout<T>(promise: Promise<T>, ms = 40000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Database timeout')), ms),
    ),
  ]);
}

// ── Registration Service ─────────────────────────────────────────────────────

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  locale?: string;
  /** Cloudflare Env secrets — JWT secret and email config. */
  jwtSecret: string;
  emailConfig: EmailConfig;
  appUrl?: string;
}

export interface RegisterResult {
  user: User;
  requiresEmailVerification: boolean;
}

/**
 * Register a new user with bcrypt password hashing.
 * Rate limiting: 10/min per IP (handled at handler level).
 */
export async function register(input: RegisterInput): Promise<RegisterResult> {
  const {
    email,
    password,
    firstName,
    lastName,
    locale = 'en-IN',
    jwtSecret,
    emailConfig,
    appUrl,
  } = input;

  // 1. Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.valid) {
    throw ApiError.validation(passwordValidation.errors.join(', '));
  }

  // 2. Check if user already exists
  const existingUser = await withTimeout(
    getPrisma().user.findUnique({
      where: { email: email.toLowerCase() },
    }),
  );

  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists');
  }

  // 3. Hash password
  const hashedPassword = await hashPassword(password);

  // 4. Create user
  const user = await withTimeout(
    getPrisma().user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName,
        lastName,
        role: 'customer',
        status: 'pending_verification', // Pending email verification
        locale,
      },
    }),
  );

  // 5. Generate verification token
  const token = await generateSecureToken();
  const hashedToken = await hashToken(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // 6. Create email verification record
  await withTimeout(
    getPrisma().emailVerification.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
      },
    }),
  );

  // 7. Send verification email
  try {
    await sendVerificationEmail(
      emailConfig,
      user.email,
      token,
      appUrl ?? 'https://nabome.online',
    );
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }

  return { user, requiresEmailVerification: true };
}

// ── Login Service ───────────────────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
  ipAddress?: string;
  userAgent?: string;
  /** Cloudflare Env secrets — JWT secret. */
  jwtSecret: string;
}

export interface LoginResult {
  user: User;
  session: Session;
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
}

/**
 * Authenticate user with bcrypt password verification.
 * Rate limiting: 20/min per IP (handled at handler level).
 * Account lockout: 5 failed attempts, 15-minute lockout.
 */
export async function login(input: LoginInput): Promise<LoginResult> {
  const {
    email,
    password,
    rememberMe = false,
    ipAddress,
    userAgent,
    jwtSecret,
  } = input;

  // 1. Find user by email first to check per-user lockout
  const user = await withTimeout(
    getPrisma().user.findUnique({
      where: { email: email.toLowerCase() },
    }),
  );

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // 2. Check account lockout status (per-user)
  const recentFailures = await withTimeout(
    getPrisma().loginHistory.count({
      where: {
        userId: user.id,
        success: false,
        createdAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
        },
      },
    }),
  );

  if (recentFailures >= 5) {
    throw ApiError.rateLimited(
      'Account temporarily locked due to too many failed attempts. Please try again in 15 minutes.',
    );
  }

  // 3. Verify password
  if (!user.passwordHash) {
    await withTimeout(
      getPrisma().loginHistory.create({
        data: {
          userId: user.id,
          ipAddress,
          userAgent,
          success: false,
          failureReason: 'NO_PASSWORD_SET',
        },
      }),
    );
    throw ApiError.unauthorized('Invalid email or password');
  }
  const passwordValid = await verifyPassword(password, user.passwordHash);
  if (!passwordValid) {
    // Log failed attempt
    await withTimeout(
      getPrisma().loginHistory.create({
        data: {
          userId: user.id,
          ipAddress,
          userAgent,
          success: false,
          failureReason: 'INVALID_CREDENTIALS',
        },
      }),
    );

    throw ApiError.unauthorized('Invalid email or password');
  }

  // 4. Check if account is active
  if (user.status === 'suspended' || user.status === 'banned') {
    throw ApiError.forbidden('Account is suspended');
  }

  // 5. Generate tokens
  const accessToken = generateAccessToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    jwtSecret,
  );
  const refreshToken = generateRefreshToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      rememberMe,
    },
    jwtSecret,
  );
  const csrfToken = await generateSecureToken();

  // 6. Create session
  const expiresAt = new Date(
    Date.now() +
      (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000),
  );

  // Enforce max 5 sessions per user
  const sessionCount = await getPrisma().session.count({
    where: {
      userId: user.id,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (sessionCount >= 5) {
    // Revoke oldest session
    const oldestSession = await getPrisma().session.findFirst({
      where: {
        userId: user.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (oldestSession) {
      await getPrisma().session.update({
        where: { id: oldestSession.id },
        data: { revokedAt: new Date() },
      });
    }
  }

  const session = await getPrisma().session.create({
    data: {
      userId: user.id,
      refreshToken: await hashToken(refreshToken),
      csrfToken: await hashToken(csrfToken),
      userAgent,
      ipAddress,
      expiresAt,
    },
  });

  // 7. Log successful login
  await getPrisma().loginHistory.create({
    data: {
      userId: user.id,
      ipAddress,
      userAgent,
      success: true,
    },
  });

  // 8. Update last login
  await getPrisma().user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    user,
    session,
    accessToken,
    refreshToken,
    csrfToken,
  };
}

// ── Logout Service ─────────────────────────────────────────────────────────

export async function logout(sessionId: string): Promise<void> {
  await getPrisma().session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  });
}

export async function logoutAll(userId: string): Promise<void> {
  await getPrisma().session.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
}

// ── Session Refresh Service ─────────────────────────────────────────────────

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  session: Session;
}

export async function refreshSession(
  refreshToken: string,
  jwtSecret: string,
): Promise<RefreshResult> {
  // 1. Verify JWT
  let payload: JwtPayload;
  try {
    payload = verifyToken(refreshToken, jwtSecret);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  // 2. Find session by refresh token hash
  const hashedToken = await hashToken(refreshToken);
  const session = await getPrisma().session.findFirst({
    where: {
      refreshToken: hashedToken,
      userId: payload.userId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!session) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  if (!session.user.isActive) {
    throw ApiError.forbidden('Account is inactive');
  }

  // 3. Generate new tokens
  const newAccessToken = generateAccessToken(
    {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
    },
    jwtSecret,
  );
  const newRefreshToken = generateRefreshToken(
    {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
      rememberMe: payload.rememberMe ?? false,
    },
    jwtSecret,
  );
  const newCsrfToken = await generateSecureToken();

  // 4. Update session with extended expiration (preserve remember-me choice)
  const rememberMe = payload.rememberMe ?? false;
  const newExpiresAt = new Date(
    Date.now() +
      (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000),
  );
  await getPrisma().session.update({
    where: { id: session.id },
    data: {
      refreshToken: await hashToken(newRefreshToken),
      csrfToken: await hashToken(newCsrfToken),
      expiresAt: newExpiresAt,
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    csrfToken: newCsrfToken,
    session: { ...session, expiresAt: newExpiresAt },
  };
}

// ── Password Reset Service ───────────────────────────────────────────────────

export interface PasswordResetRequestInput {
  email: string;
  /** Cloudflare Env secrets — email config. */
  emailConfig: EmailConfig;
}

export async function requestPasswordReset(
  input: PasswordResetRequestInput,
): Promise<void> {
  const { email, emailConfig } = input;

  const user = await getPrisma().user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    // Always return success to prevent email enumeration
    return;
  }

  // Generate reset token
  const token = await generateSecureToken();
  const hashedToken = await hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Create or update password reset record
  const existingReset = await getPrisma().passwordReset.findFirst({
    where: { userId: user.id },
  });

  if (existingReset) {
    await getPrisma().passwordReset.update({
      where: { id: existingReset.id },
      data: {
        token: hashedToken,
        expiresAt,
      },
    });
  } else {
    await getPrisma().passwordReset.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
      },
    });
  }

  // Send password reset email
  try {
    await sendPasswordResetEmail(emailConfig, user.email, token);
  } catch (error) {
    // Log error but don't fail the request - user can still reset if they have the token
    console.error('Failed to send password reset email:', error);
  }
}

export interface PasswordResetConfirmInput {
  token: string;
  newPassword: string;
}

export async function confirmPasswordReset(
  input: PasswordResetConfirmInput,
): Promise<void> {
  const { token, newPassword } = input;

  // Validate password strength
  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.valid) {
    throw ApiError.validation(passwordValidation.errors.join(', '));
  }

  // Find valid password reset record
  const hashedToken = await hashToken(token);
  const resetRecord = await getPrisma().passwordReset.findFirst({
    where: {
      token: hashedToken,
      expiresAt: { gt: new Date() },
    },
  });

  if (!resetRecord) {
    throw ApiError.validation('Invalid or expired password reset token');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user password
  await getPrisma().user.update({
    where: { id: resetRecord.userId },
    data: { passwordHash: hashedPassword },
  });

  // Delete password reset record
  await getPrisma().passwordReset.delete({
    where: { id: resetRecord.id },
  });

  // Revoke all sessions for security
  await logoutAll(resetRecord.userId);
}

// ── Email Verification Service ───────────────────────────────────────────────

export interface VerifyEmailInput {
  token: string;
}

export async function verifyEmail(input: VerifyEmailInput): Promise<void> {
  const { token } = input;

  // Find valid email verification record
  const hashedToken = await hashToken(token);
  const verificationRecord = await getPrisma().emailVerification.findFirst({
    where: {
      token: hashedToken,
      expiresAt: { gt: new Date() },
    },
  });

  if (!verificationRecord) {
    throw ApiError.validation('Invalid or expired verification token');
  }

  // Update user email verification status
  await getPrisma().user.update({
    where: { id: verificationRecord.userId },
    data: {
      status: 'active',
      emailVerifiedAt: new Date(),
    },
  });

  // Delete verification record
  await getPrisma().emailVerification.delete({
    where: { id: verificationRecord.id },
  });
}

export async function resendVerificationEmail(
  userId: string,
  emailConfig: EmailConfig,
): Promise<void> {
  const user = await getPrisma().user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.emailVerifiedAt) {
    throw ApiError.validation('Email already verified');
  }

  // Generate new verification token
  const token = await generateSecureToken();
  const hashedToken = await hashToken(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create or update verification record
  const existingVerification = await getPrisma().emailVerification.findFirst({
    where: { userId: user.id },
  });

  if (existingVerification) {
    await getPrisma().emailVerification.update({
      where: { id: existingVerification.id },
      data: {
        token: hashedToken,
        expiresAt,
      },
    });
  } else {
    await getPrisma().emailVerification.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
      },
    });
  }

  // Send verification email
  try {
    await sendVerificationEmail(emailConfig, user.email, token);
  } catch (error) {
    // Log error but don't fail the request - user can request resend
    console.error('Failed to send verification email:', error);
  }
}
