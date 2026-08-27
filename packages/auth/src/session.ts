import { SESSION } from '@nabome/constants';
import type { Role } from '@nabome/types';

/**
 * Session contract shared between the API (session middleware) and clients
 * (cookie handling). Session table lives in PostgreSQL; tokens are opaque.
 * Timing: access 15 min / refresh 7 days / CSRF 4 hours; max 5 sessions
 * (TECH_STACK §4.1).
 */

export interface SessionInfo {
  sessionId: string;
  userId: string;
  role: Role;
  /** Expiry of the access token (epoch ms). */
  accessTokenExpiresAt: number;
  /** Expiry of the refresh token (epoch ms). */
  refreshTokenExpiresAt: number;
}

export interface AuthenticatedContext extends SessionInfo {
  /** Permissions precomputed for the request (audit-friendly). */
  permissions: string[];
}

export const SESSION_TTL = {
  accessTokenMs: SESSION.accessTokenTtlMinutes * 60 * 1000,
  refreshTokenMs: SESSION.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
  csrfTokenMs: SESSION.csrfTokenTtlHours * 60 * 60 * 1000,
} as const;

export const MAX_SESSIONS_PER_USER = SESSION.maxSessionsPerUser;

export const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
} as const;

export function isPasswordPolicyCompliant(password: string): boolean {
  return (
    password.length >= PASSWORD_POLICY.minLength &&
    password.length <= PASSWORD_POLICY.maxLength
  );
}
