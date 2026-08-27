/**
 * Session management services — app-side session lifecycle management.
 * Integrates with @nabome/auth session contract and Prisma Session model.
 * Handles session creation, validation, rotation, expiration, and revocation.
 */

import type { Session, User } from '@prisma/client';

import type { SessionInfo } from '@nabome/auth';
import { SESSION } from '@nabome/constants';

import { ApiError } from '../http/errors.ts';

// ── Session TTL Constants ───────────────────────────────────────────────────

const SESSION_TTL = {
  accessTokenMs: SESSION.accessTokenTtlMinutes * 60 * 1000,
  refreshTokenMs: SESSION.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
  csrfTokenMs: SESSION.csrfTokenTtlHours * 60 * 60 * 1000,
} as const;

const MAX_SESSIONS_PER_USER = SESSION.maxSessionsPerUser;

import { getPrisma as getSharedPrisma } from '../prisma.ts';

function getPrisma() {
  return getSharedPrisma() as any;
}

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

// ── Session Creation ───────────────────────────────────────────────────────

export interface CreateSessionInput {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  rememberMe?: boolean;
}

export interface CreateSessionResult {
  session: Session;
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  sessionInfo: SessionInfo;
}

/**
 * Create a new session for a user.
 * Enforces max 5 sessions per user (SESSION.maxSessionsPerUser).
 * Returns tokens and session info for cookie setting.
 */
export async function createSession(
  input: CreateSessionInput,
): Promise<CreateSessionResult> {
  const { userId, ipAddress, userAgent, rememberMe = false } = input;

  // 1. Generate tokens
  const accessToken = await generateSecureToken();
  const refreshToken = await generateSecureToken();
  const csrfToken = await generateSecureToken();

  // 2. Calculate expiry
  const accessTokenExpiresAt = Date.now() + SESSION_TTL.accessTokenMs;
  const refreshTokenExpiresAt =
    Date.now() +
    (rememberMe ? 30 * 24 * 60 * 60 * 1000 : SESSION_TTL.refreshTokenMs);

  // 3. Enforce max sessions
  const sessionCount = await getPrisma().session.count({
    where: {
      userId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (sessionCount >= MAX_SESSIONS_PER_USER) {
    // Revoke oldest session
    const oldestSession = await getPrisma().session.findFirst({
      where: {
        userId,
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

  // 4. Create session in database
  const session = await getPrisma().session.create({
    data: {
      userId,
      refreshToken: await hashToken(refreshToken),
      userAgent,
      ipAddress,
      expiresAt: new Date(refreshTokenExpiresAt),
    },
  });

  // 5. Build session info for response
  const sessionInfo: SessionInfo = {
    sessionId: session.id,
    userId: session.userId,
    role: 'customer', // Will be populated from user
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  };

  return {
    session,
    accessToken,
    refreshToken,
    csrfToken,
    sessionInfo,
  };
}

// ── Session Validation ─────────────────────────────────────────────────────

export interface ValidateSessionResult {
  session: Session;
  user: User;
  sessionInfo: SessionInfo;
}

/**
 * Validate a session by refresh token.
 * Checks revocation, expiration, and user status.
 */
export async function validateSession(
  refreshToken: string,
): Promise<ValidateSessionResult> {
  const hashedToken = await hashToken(refreshToken);
  const session = await getPrisma().session.findUnique({
    where: { refreshToken: hashedToken },
    include: { user: true },
  });

  if (!session) {
    throw ApiError.unauthorized('Invalid session');
  }

  if (session.revokedAt) {
    throw ApiError.unauthorized('Session revoked');
  }

  if (session.expiresAt < new Date()) {
    throw ApiError.unauthorized('Session expired');
  }

  if (!session.user.isActive) {
    throw ApiError.forbidden('Account inactive');
  }

  const sessionInfo: SessionInfo = {
    sessionId: session.id,
    userId: session.userId,
    role: session.user.role,
    accessTokenExpiresAt: Date.now() + SESSION_TTL.accessTokenMs,
    refreshTokenExpiresAt: session.expiresAt.getTime(),
  };

  return {
    session,
    user: session.user,
    sessionInfo,
  };
}

// ── Session Rotation ───────────────────────────────────────────────────────

export interface RotateSessionResult {
  session: Session;
  newRefreshToken: string;
  newCsrfToken: string;
  sessionInfo: SessionInfo;
}

/**
 * Rotate refresh token (security best practice).
 * Generates new tokens and updates session expiry.
 */
export async function rotateSession(
  oldRefreshToken: string,
): Promise<RotateSessionResult> {
  const hashedToken = await hashToken(oldRefreshToken);
  const session = await getPrisma().session.findUnique({
    where: { refreshToken: hashedToken },
    include: { user: true },
  });

  if (!session) {
    throw ApiError.unauthorized('Invalid session');
  }

  if (session.revokedAt) {
    throw ApiError.unauthorized('Session revoked');
  }

  // Generate new tokens
  const newRefreshToken = await generateSecureToken();
  const newCsrfToken = await generateSecureToken();
  const newExpiresAt = new Date(Date.now() + SESSION_TTL.refreshTokenMs);

  // Update session
  const updatedSession = await getPrisma().session.update({
    where: { id: session.id },
    data: {
      refreshToken: await hashToken(newRefreshToken),
      expiresAt: newExpiresAt,
    },
  });

  const sessionInfo: SessionInfo = {
    sessionId: updatedSession.id,
    userId: updatedSession.userId,
    role: session.user.role,
    accessTokenExpiresAt: Date.now() + SESSION_TTL.accessTokenMs,
    refreshTokenExpiresAt: newExpiresAt.getTime(),
  };

  return {
    session: updatedSession,
    newRefreshToken,
    newCsrfToken,
    sessionInfo,
  };
}

// ── Session Revocation ─────────────────────────────────────────────────────

/**
 * Revoke a specific session.
 */
export async function revokeSession(sessionId: string): Promise<void> {
  await getPrisma().session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  });
}

/**
 * Revoke all sessions for a user.
 */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  await getPrisma().session.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
}

/**
 * Revoke all sessions except the current one.
 */
export async function revokeOtherSessions(
  userId: string,
  currentSessionId: string,
): Promise<void> {
  await getPrisma().session.updateMany({
    where: {
      userId,
      id: { not: currentSessionId },
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
}

// ── Session Query ──────────────────────────────────────────────────────────

export interface SessionListItem {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

/**
 * List all active sessions for a user.
 */
export async function listUserSessions(
  userId: string,
  currentSessionId?: string,
): Promise<SessionListItem[]> {
  const sessions = await getPrisma().session.findMany({
    where: {
      userId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  return sessions.map((session: Session) => ({
    id: session.id,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    createdAt: session.createdAt.toISOString(),
    expiresAt: session.expiresAt.toISOString(),
    isCurrent: session.id === currentSessionId,
  }));
}

/**
 * Get session count for a user.
 */
export async function getSessionCount(userId: string): Promise<number> {
  return getPrisma().session.count({
    where: {
      userId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
}

// ── Session Cleanup ────────────────────────────────────────────────────────

/**
 * Clean up expired sessions (should be run periodically).
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await getPrisma().session.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
  return result.count;
}

/**
 * Clean up revoked sessions older than specified days.
 */
export async function cleanupRevokedSessions(
  daysOld: number = 30,
): Promise<number> {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  const result = await getPrisma().session.deleteMany({
    where: {
      revokedAt: { lt: cutoffDate },
    },
  });
  return result.count;
}
