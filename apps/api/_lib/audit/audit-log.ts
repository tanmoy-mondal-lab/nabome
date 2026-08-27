/**
 * Audit logging service — comprehensive logging of all identity events.
 * Tracks authentication, authorization, user management, and security events.
 * Integrates with Cloudflare Workers Analytics Engine or external logging service.
 */

// ── Audit Event Types ───────────────────────────────────────────────────────

export enum AuditEventType {
  // Authentication Events
  USER_REGISTERED = 'USER_REGISTERED',
  USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS',
  USER_LOGIN_FAILED = 'USER_LOGIN_FAILED',
  USER_LOGOUT = 'USER_LOGOUT',
  SESSION_CREATED = 'SESSION_CREATED',
  SESSION_REFRESHED = 'SESSION_REFRESHED',
  SESSION_REVOKED = 'SESSION_REVOKED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Password Events
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',

  // Email Verification Events
  EMAIL_VERIFICATION_REQUESTED = 'EMAIL_VERIFICATION_REQUESTED',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  EMAIL_VERIFICATION_RESENT = 'EMAIL_VERIFICATION_RESENT',

  // Profile Events
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  AVATAR_UPDATED = 'AVATAR_UPDATED',
  AVATAR_REMOVED = 'AVATAR_REMOVED',

  // Address Events
  ADDRESS_CREATED = 'ADDRESS_CREATED',
  ADDRESS_UPDATED = 'ADDRESS_UPDATED',
  ADDRESS_DELETED = 'ADDRESS_DELETED',
  ADDRESS_SET_DEFAULT = 'ADDRESS_SET_DEFAULT',

  // Settings Events
  ACCOUNT_SETTINGS_UPDATED = 'ACCOUNT_SETTINGS_UPDATED',

  // Role & Permission Events
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',

  // Account Events
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  ACCOUNT_REACTIVATED = 'ACCOUNT_REACTIVATED',
  ACCOUNT_DELETED = 'ACCOUNT_DELETED',

  // Security Events
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  BRUTE_FORCE_DETECTED = 'BRUTE_FORCE_DETECTED',
  CSRF_VIOLATION = 'CSRF_VIOLATION',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // Authorization Events
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'UNAUTHORIZED_ACCESS_ATTEMPT',
  RESOURCE_ACCESS_GRANTED = 'RESOURCE_ACCESS_GRANTED',
  RESOURCE_ACCESS_DENIED = 'RESOURCE_ACCESS_DENIED',
}

// ── Audit Event Interface ───────────────────────────────────────────────────

export interface AuditEvent {
  id: string;
  eventType: AuditEventType;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'auth' | 'user' | 'security' | 'authorization' | 'system';
}

// ── Audit Logger ───────────────────────────────────────────────────────────

interface RetentionPolicy {
  maxAgeDays: number;
  maxEvents: number;
  severityBasedRetention: {
    critical: number; // days
    error: number;
    warning: number;
    info: number;
  };
}

class AuditLogger {
  private static instance: AuditLogger;
  private events: AuditEvent[] = [];
  private maxBufferSize = 1000;
  private retentionPolicy: RetentionPolicy = {
    maxAgeDays: 90,
    maxEvents: 10000,
    severityBasedRetention: {
      critical: 365, // Keep critical logs for 1 year
      error: 180, // Keep error logs for 6 months
      warning: 90, // Keep warning logs for 90 days
      info: 30, // Keep info logs for 30 days
    },
  };

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Log an audit event.
   */
  async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    // Add to buffer
    this.events.push(auditEvent);

    // Apply retention policies
    await this.applyRetentionPolicies();

    // Send to external logging service (placeholder)
    await this.sendToExternalService(auditEvent);

    // Log to console for development
    // @ts-ignore - ENVIRONMENT will be set by Cloudflare Workers
    if (globalThis.ENVIRONMENT === 'development') {
      console.log('[AUDIT]', JSON.stringify(auditEvent));
    }
  }

  /**
   * Get recent events from buffer.
   */
  getRecentEvents(limit: number = 100): AuditEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Clear event buffer.
   */
  clearBuffer(): void {
    this.events = [];
  }

  /**
   * Apply retention policies to clean up old events.
   */
  private async applyRetentionPolicies(): Promise<void> {
    const now = Date.now();

    // Remove events older than max age based on severity
    this.events = this.events.filter((event) => {
      const ageMs = now - event.timestamp;
      const retentionDays =
        this.retentionPolicy.severityBasedRetention[event.severity] ||
        this.retentionPolicy.maxAgeDays;
      const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
      return ageMs < retentionMs;
    });

    // Trim buffer if it exceeds max events
    if (this.events.length > this.retentionPolicy.maxEvents) {
      this.events = this.events.slice(-this.retentionPolicy.maxEvents);
    }

    // Trim buffer if it exceeds max buffer size (immediate memory limit)
    if (this.events.length > this.maxBufferSize) {
      this.events = this.events.slice(-this.maxBufferSize);
    }
  }

  /**
   * Manually trigger cleanup of old events.
   */
  async cleanupOldEvents(): Promise<number> {
    const beforeCount = this.events.length;
    await this.applyRetentionPolicies();
    const afterCount = this.events.length;
    return beforeCount - afterCount;
  }

  /**
   * Get retention policy configuration.
   */
  getRetentionPolicy(): RetentionPolicy {
    return { ...this.retentionPolicy };
  }

  /**
   * Update retention policy configuration.
   */
  updateRetentionPolicy(policy: Partial<RetentionPolicy>): void {
    this.retentionPolicy = {
      ...this.retentionPolicy,
      ...policy,
      severityBasedRetention: {
        ...this.retentionPolicy.severityBasedRetention,
        ...policy.severityBasedRetention,
      },
    };
  }

  /**
   * Get statistics about the audit log buffer.
   */
  getStats(): {
    totalEvents: number;
    eventsBySeverity: Record<string, number>;
    eventsByCategory: Record<string, number>;
    oldestEventAge: number;
    newestEventAge: number;
  } {
    const now = Date.now();
    const eventsBySeverity: Record<string, number> = {};
    const eventsByCategory: Record<string, number> = {};

    for (const event of this.events) {
      eventsBySeverity[event.severity] =
        (eventsBySeverity[event.severity] || 0) + 1;
      eventsByCategory[event.category] =
        (eventsByCategory[event.category] || 0) + 1;
    }

    const oldestEventAge =
      this.events.length > 0 ? now - (this.events[0]?.timestamp || 0) : 0;
    const newestEventAge =
      this.events.length > 0
        ? now - (this.events[this.events.length - 1]?.timestamp || 0)
        : 0;

    return {
      totalEvents: this.events.length,
      eventsBySeverity,
      eventsByCategory,
      oldestEventAge,
      newestEventAge,
    };
  }

  /**
   * Generate unique event ID.
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send event to external logging service.
   * Integrates with Cloudflare Workers Analytics Engine.
   */
  private async sendToExternalService(event: AuditEvent): Promise<void> {
    // Send to Cloudflare Workers Analytics Engine
    // This is a placeholder implementation - in production, you would use:
    // - Cloudflare Workers Analytics Engine
    // - Or an external service like Datadog, LogRocket, etc.

    // For now, we'll log to console in development
    // @ts-ignore - ENVIRONMENT will be set by Cloudflare Workers
    if (globalThis.ENVIRONMENT === 'development') {
      console.log('[AUDIT EXTERNAL]', JSON.stringify(event));
    }

    // TODO: Implement actual external service integration
    // Example:
    // await fetch('https://analytics.example.com/audit', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(event),
    // });
  }
}

// ── Convenience Functions ───────────────────────────────────────────────────

const logger = AuditLogger.getInstance();

/**
 * Log user registration.
 */
export async function logUserRegistered(
  userId: string,
  email: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  await logger.log({
    eventType: AuditEventType.USER_REGISTERED,
    userId,
    ipAddress,
    userAgent,
    metadata: { email },
    severity: 'info',
    category: 'auth',
  });
}

/**
 * Log successful login.
 */
export async function logLoginSuccess(
  userId: string,
  sessionId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  await logger.log({
    eventType: AuditEventType.USER_LOGIN_SUCCESS,
    userId,
    sessionId,
    ipAddress,
    userAgent,
    severity: 'info',
    category: 'auth',
  });
}

/**
 * Log failed login.
 */
export async function logLoginFailed(
  email: string,
  reason: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  await logger.log({
    eventType: AuditEventType.USER_LOGIN_FAILED,
    ipAddress,
    userAgent,
    metadata: { email, reason },
    severity: 'warning',
    category: 'security',
  });
}

/**
 * Log logout.
 */
export async function logLogout(
  userId: string,
  sessionId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  await logger.log({
    eventType: AuditEventType.USER_LOGOUT,
    userId,
    sessionId,
    ipAddress,
    userAgent,
    severity: 'info',
    category: 'auth',
  });
}

/**
 * Log session creation.
 */
export async function logSessionCreated(
  userId: string,
  sessionId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  await logger.log({
    eventType: AuditEventType.SESSION_CREATED,
    userId,
    sessionId,
    ipAddress,
    userAgent,
    severity: 'info',
    category: 'auth',
  });
}

/**
 * Log session refresh.
 */
export async function logSessionRefreshed(
  userId: string,
  sessionId: string,
  ipAddress?: string,
): Promise<void> {
  await logger.log({
    eventType: AuditEventType.SESSION_REFRESHED,
    userId,
    sessionId,
    ipAddress,
    severity: 'info',
    category: 'auth',
  });
}

/**
 * Log session revocation.
 */
export async function logSessionRevoked(
  userId: string,
  sessionId: string,
  reason: string,
  ipAddress?: string,
): Promise<void> {
  await logger.log({
    eventType: AuditEventType.SESSION_REVOKED,
    userId,
    sessionId,
    ipAddress,
    metadata: { reason },
    severity: 'warning',
    category: 'auth',
  });
}

/**
 * Log password reset request.
 */
export async function logPasswordResetRequested(
  email: string,
  ipAddress?: string,
): Promise<void> {
  await logger.log({
    eventType: AuditEventType.PASSWORD_RESET_REQUESTED,
    ipAddress,
    metadata: { email },
    severity: 'info',
    category: 'auth',
  });
}

/**
 * Log password reset completion.
 */
export async function logPasswordResetCompleted(
  userId: string,
  ipAddress?: string,
): Promise<void> {
  await logger.log({
    eventType: AuditEventType.PASSWORD_RESET_COMPLETED,
    userId,
    ipAddress,
    severity: 'info',
    category: 'auth',
  });
}

/**
 * Log email verification.
 */
export async function logEmailVerified(
  userId: string,
  ipAddress?: string,
): Promise<void> {
  await logger.log({
    eventType: AuditEventType.EMAIL_VERIFIED,
    userId,
    ipAddress,
    severity: 'info',
    category: 'auth',
  });
}

/**
 * Log profile update.
 */
export async function logProfileUpdated(
  userId: string,
  changes: Record<string, unknown>,
  ipAddress?: string,
): Promise<void> {
  await logger.log({
    eventType: AuditEventType.PROFILE_UPDATED,
    userId,
    ipAddress,
    metadata: { changes },
    severity: 'info',
    category: 'user',
  });
}

/**
 * Log role change.
 */
export async function logRoleChanged(
  userId: string,
  oldRole: string,
  newRole: string,
  changedBy: string,
  ipAddress?: string,
): Promise<void> {
  await logger.log({
    eventType: AuditEventType.ROLE_CHANGED,
    userId,
    ipAddress,
    metadata: { oldRole, newRole, changedBy },
    severity: 'warning',
    category: 'authorization',
  });
}

/**
 * Log account lockout.
 */
export async function logAccountLocked(
  userId: string,
  reason: string,
  ipAddress?: string,
): Promise<void> {
  await logger.log({
    eventType: AuditEventType.ACCOUNT_LOCKED,
    userId,
    ipAddress,
    metadata: { reason },
    severity: 'warning',
    category: 'security',
  });
}

/**
 * Log permission denied.
 */
export async function logPermissionDenied(
  userId: string,
  permission: string,
  resource: string,
  ipAddress?: string,
): Promise<void> {
  await logger.log({
    eventType: AuditEventType.PERMISSION_DENIED,
    userId,
    ipAddress,
    metadata: { permission, resource },
    severity: 'warning',
    category: 'authorization',
  });
}

/**
 * Log rate limit exceeded.
 */
export async function logRateLimitExceeded(
  identifier: string,
  action: string,
  ipAddress?: string,
): Promise<void> {
  await logger.log({
    eventType: AuditEventType.RATE_LIMIT_EXCEEDED,
    ipAddress,
    metadata: { identifier, action },
    severity: 'warning',
    category: 'security',
  });
}

/**
 * Log suspicious activity.
 */
export async function logSuspiciousActivity(
  activity: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  await logger.log({
    eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
    userId,
    ipAddress,
    userAgent,
    metadata: { activity },
    severity: 'error',
    category: 'security',
  });
}

/**
 * Log custom audit event.
 */
export async function logAuditEvent(
  event: Omit<AuditEvent, 'id' | 'timestamp'>,
): Promise<void> {
  await logger.log(event);
}

// ── Export logger instance for advanced usage ───────────────────────────────

export { logger };
