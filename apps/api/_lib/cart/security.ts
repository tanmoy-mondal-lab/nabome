import type { RequestContext } from '../http/context.ts';
import { ApiError } from '../http/errors.ts';
import { getLogger } from '../logger.ts';

export function generateCsrfTokenForSession(_sessionId: string): string {
  throw new Error(
    'Use cookie double-submit CSRF via _lib/auth.ts — in-memory CSRF is deprecated',
  );
}

export class CartSecurityService {
  static canAccessCart(
    userId: string | null,
    cartUserId: string | null,
  ): boolean {
    if (userId && cartUserId) return userId === cartUserId;
    if (!userId && !cartUserId) return true;
    return false;
  }

  static canModifyCart(
    userId: string | null,
    cartUserId: string | null,
  ): boolean {
    return this.canAccessCart(userId, cartUserId);
  }

  static logAuditEvent(
    context: RequestContext,
    action: string,
    details: Record<string, unknown>,
  ): void {
    try {
      const logger = getLogger(context.env as any);
      logger.info(
        {
          requestId: context.requestId,
          userId: context.userId,
          action,
          details,
        },
        'cart:audit',
      );
    } catch {
      console.log(
        '[AUDIT]',
        JSON.stringify({
          requestId: context.requestId,
          userId: context.userId,
          action,
          details,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }

  static validateCsrfToken(
    _context: RequestContext,
    _token: string | null,
  ): boolean {
    return true;
  }

  static async checkRateLimit(
    _userId: string | null,
    _guestId: string | null,
  ): Promise<boolean> {
    return true;
  }

  static sanitizeInput(
    input: Record<string, unknown>,
  ): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string')
        sanitized[key] = value.replace(/[<>]/g, '');
      else if (typeof value === 'number')
        sanitized[key] = Math.max(0, Math.min(value, 1000000));
      else sanitized[key] = value;
    }
    return sanitized;
  }

  static validateCartOwnership(
    context: RequestContext,
    cartUserId: string | null,
    cartGuestId: string | null,
  ): boolean {
    const requestUserId = context.userId;
    const requestGuestId = context.guestId;
    if (cartUserId) return requestUserId === cartUserId;
    if (cartGuestId) return !!requestGuestId && requestGuestId === cartGuestId;
    return false;
  }

  static requireCartOwnership(
    context: RequestContext,
    cartUserId: string | null,
    cartGuestId: string | null,
  ): void {
    if (!this.validateCartOwnership(context, cartUserId, cartGuestId)) {
      throw ApiError.forbidden('You do not have access to this cart');
    }
  }
}
