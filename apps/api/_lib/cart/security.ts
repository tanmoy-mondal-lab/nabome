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
    guestId?: string | null,
    cartGuestId?: string | null,
  ): boolean {
    if (userId && cartUserId) return userId === cartUserId;
    if (!userId && !cartUserId)
      return !!guestId && !!cartGuestId && guestId === cartGuestId;
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
    context: RequestContext,
    token: string | null,
  ): boolean {
    const cookie = (context as any).csrfCookie as string | undefined;
    if (!cookie || !token) return false;
    if (cookie.length !== token.length) return false;
    let d = 0;
    for (let i = 0; i < cookie.length; i++)
      d |= cookie.charCodeAt(i) ^ token.charCodeAt(i);
    return d === 0;
  }

  static async checkRateLimit(context: RequestContext): Promise<boolean> {
    const { checkRateLimit, clientKey } = await import('../ratelimit.ts');
    const fakeReq = {
      headers: {
        get: (k: string) =>
          k === 'cf-connecting-ip' || k === 'x-forwarded-for'
            ? (context as any).ip
            : null,
      },
    } as unknown as Request;
    void fakeReq;
    const key = `cart:${context.userId ?? context.guestId ?? 'anon'}`;
    const r = await checkRateLimit((context.env as any).KV, 'public', key);
    return r.allowed;
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
