/**
 * Checkout Security Middleware
 *
 * RBAC, CSRF protection, and validation for checkout operations.
 * Integrates with existing auth middleware patterns.
 *
 * This provides:
 * - Checkout-specific RBAC
 * - CSRF protection for checkout mutations
 * - Checkout session ownership validation
 * - Rate limiting for checkout operations
 * - Input validation enforcement
 */

import {
  requireAuth,
  optionalAuth,
  requireCsrf,
} from '../auth/auth-middleware.ts';
import type { AuthenticatedContext } from '../auth/middleware.ts';
import { ApiError } from '../http/errors.ts';

// ── Checkout RBAC ─────────────────────────────────────────────────────────────

/**
 * Checkout permissions based on user role
 */
export const CHECKOUT_PERMISSIONS = {
  // All authenticated users can start checkout
  start_checkout: ['customer', 'admin', 'seller'],
  // Only checkout owner can modify their checkout
  modify_checkout: ['customer', 'admin'],
  // Only checkout owner can complete checkout
  complete_checkout: ['customer', 'admin'],
  // Admin can view any checkout
  view_any_checkout: ['admin'],
  // Users can only view their own checkouts
  view_own_checkout: ['customer', 'admin', 'seller'],
  // Address management
  manage_addresses: ['customer', 'admin'],
  // Coupon application
  apply_coupon: ['customer', 'admin'],
  // Tax calculation (public)
  calculate_tax: ['customer', 'admin', 'seller', 'guest'],
} as const;

/**
 * Check if user has permission for checkout operation
 */
export function hasCheckoutPermission(
  userRole: string,
  permission: keyof typeof CHECKOUT_PERMISSIONS,
): boolean {
  const allowedRoles = CHECKOUT_PERMISSIONS[permission];
  return (
    allowedRoles.includes(userRole as any) || permission === 'calculate_tax'
  );
}

/**
 * Require checkout permission - throws if user lacks permission
 */
export function requireCheckoutPermission(
  context: AuthenticatedContext | null,
  permission: keyof typeof CHECKOUT_PERMISSIONS,
): void {
  if (!context) {
    // Guest users only have limited permissions
    if (permission !== 'calculate_tax') {
      throw ApiError.unauthorized('Authentication required for this operation');
    }
    return;
  }

  if (!hasCheckoutPermission(context.role, permission)) {
    throw ApiError.forbidden('Insufficient permissions for this operation');
  }
}

// ── Checkout Session Ownership Validation ─────────────────────────────────────

/**
 * Validate that user owns the checkout session
 * Admin users can access any checkout
 */
export async function validateCheckoutOwnership(
  checkoutSessionId: string,
  userId: string | null,
  userRole: string,
): Promise<void> {
  if (userRole === 'admin') return;
  if (!userId) throw ApiError.unauthorized('Authentication required');
  const { CheckoutRepository } = await import('./repository.ts');
  const session =
    await CheckoutRepository.findCheckoutSessionById(checkoutSessionId);
  if (!session) throw ApiError.notFound('Checkout session not found');
  const ownerId = (session as any).userId ?? (session as any).user_id ?? null;
  if (ownerId && ownerId !== userId) {
    throw ApiError.forbidden('You do not have access to this checkout session');
  }
  if (!ownerId) {
    const guestId =
      (session as any).guestId ?? (session as any).guest_id ?? null;
    if (guestId)
      throw ApiError.forbidden('Guest checkout — use guest validation');
  }
}

/**
 * Validate guest checkout access
 */
export async function validateGuestCheckout(
  checkoutSessionId: string,
  guestId: string | null,
): Promise<void> {
  if (!guestId)
    throw ApiError.unauthorized('Guest ID required for guest checkout');
  const { CheckoutRepository } = await import('./repository.ts');
  const session =
    await CheckoutRepository.findCheckoutSessionById(checkoutSessionId);
  if (!session) throw ApiError.notFound('Checkout session not found');
  const sessionGuestId =
    (session as any).guestId ?? (session as any).guest_id ?? null;
  if (sessionGuestId && sessionGuestId !== guestId) {
    throw ApiError.forbidden('You do not have access to this checkout session');
  }
}

// ── Checkout Rate Limiting ─────────────────────────────────────────────────────

/**
 * Checkout-specific rate limits
 */
export const CHECKOUT_RATE_LIMITS = {
  start_checkout: { limit: 10, windowSeconds: 60 }, // 10 checkouts per minute
  update_checkout: { limit: 30, windowSeconds: 60 }, // 30 updates per minute
  apply_coupon: { limit: 5, windowSeconds: 60 }, // 5 coupon attempts per minute
  validate_checkout: { limit: 20, windowSeconds: 60 }, // 20 validations per minute
  complete_checkout: { limit: 5, windowSeconds: 60 }, // 5 completions per minute
} as const;

/**
 * Apply checkout-specific rate limit
 * Placeholder - will integrate with KV
 */
export async function applyCheckoutRateLimit(
  request: Request,
  operation: keyof typeof CHECKOUT_RATE_LIMITS,
  identifier?: string,
  kv?: any,
): Promise<void> {
  let resolvedKv = kv;
  if (!resolvedKv) {
    try {
      const ctx =
        (request as any).__env ??
        (globalThis as any).__env ??
        (request as any).context?.env;
      resolvedKv = ctx?.KV;
    } catch {}
  }
  const { checkRateLimit, clientKey } = await import('../ratelimit.ts');
  const ip = clientKey(request);
  const key = identifier
    ? `checkout:${operation}:${identifier}`
    : `checkout:${operation}:${ip}`;
  const result = await checkRateLimit(resolvedKv, 'public', key);
  if (!result.allowed)
    throw ApiError.rateLimited('Checkout rate limit exceeded');
}

// ── Checkout CSRF Protection ────────────────────────────────────────────────────

/**
 * Enforce CSRF protection for checkout mutations
 */
export function requireCheckoutCsrf(request: Request): void {
  requireCsrf(request, 'csrf_token');
}

// ── Checkout Input Validation ────────────────────────────────────────────────────

/**
 * Validate checkout session ID format
 */
export function validateCheckoutSessionId(checkoutSessionId: string): void {
  if (!checkoutSessionId || typeof checkoutSessionId !== 'string') {
    throw ApiError.validation('Invalid checkout session ID');
  }

  // Validate UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(checkoutSessionId)) {
    throw ApiError.validation('Invalid checkout session ID format');
  }
}

/**
 * Validate guest ID format
 */
export function validateGuestId(guestId: string | null): void {
  if (guestId && typeof guestId === 'string') {
    // Guest ID should be a 64-character hex string
    const guestIdRegex = /^[a-f0-9]{64}$/i;
    if (!guestIdRegex.test(guestId)) {
      throw ApiError.validation('Invalid guest ID format');
    }
  }
}

/**
 * Validate cart ID format
 */
export function validateCartId(cartId: string): void {
  if (!cartId || typeof cartId !== 'string') {
    throw ApiError.validation('Invalid cart ID');
  }

  // Validate UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(cartId)) {
    throw ApiError.validation('Invalid cart ID format');
  }
}

/**
 * Validate payment method
 */
export function validatePaymentMethod(paymentMethod: string): void {
  const validMethods = ['razorpay', 'card', 'upi', 'netbanking', 'wallet'];
  if (!validMethods.includes(paymentMethod)) {
    throw ApiError.validation('Invalid payment method');
  }
}

/**
 * Validate coupon code format
 */
export function validateCouponCode(couponCode: string): void {
  if (!couponCode || typeof couponCode !== 'string') {
    throw ApiError.validation('Invalid coupon code');
  }

  // Coupon code should be alphanumeric, 4-20 characters
  const couponRegex = /^[A-Z0-9]{4,20}$/i;
  if (!couponRegex.test(couponCode)) {
    throw ApiError.validation('Invalid coupon code format');
  }
}

// ── Checkout Security Middleware Composers ───────────────────────────────────────

/**
 * Middleware for starting checkout (optional auth)
 */
export async function checkoutStartMiddleware(
  request: Request,
): Promise<AuthenticatedContext | null> {
  const context = await optionalAuth(request);

  if (context) {
    requireCheckoutPermission(context, 'start_checkout');
  }

  await applyCheckoutRateLimit(request, 'start_checkout', context?.userId);
  requireCheckoutCsrf(request);

  return context;
}

/**
 * Middleware for modifying checkout (required auth)
 */
export async function checkoutModifyMiddleware(
  request: Request,
): Promise<AuthenticatedContext> {
  const context = await requireAuth(request);

  requireCheckoutPermission(context, 'modify_checkout');
  await applyCheckoutRateLimit(request, 'update_checkout', context.userId);
  requireCheckoutCsrf(request);

  return context;
}

/**
 * Middleware for completing checkout (required auth)
 */
export async function checkoutCompleteMiddleware(
  request: Request,
): Promise<AuthenticatedContext> {
  const context = await requireAuth(request);

  requireCheckoutPermission(context, 'complete_checkout');
  await applyCheckoutRateLimit(request, 'complete_checkout', context.userId);
  requireCheckoutCsrf(request);

  return context;
}

/**
 * Middleware for address management (required auth)
 */
export async function addressManagementMiddleware(
  request: Request,
): Promise<AuthenticatedContext> {
  const context = await requireAuth(request);

  requireCheckoutPermission(context, 'manage_addresses');
  requireCheckoutCsrf(request);

  return context;
}

/**
 * Middleware for coupon application (optional auth)
 */
export async function couponApplyMiddleware(
  request: Request,
): Promise<AuthenticatedContext | null> {
  const context = await optionalAuth(request);

  if (context) {
    requireCheckoutPermission(context, 'apply_coupon');
  }

  await applyCheckoutRateLimit(request, 'apply_coupon', context?.userId);
  requireCheckoutCsrf(request);

  return context;
}

/**
 * Middleware for tax calculation (public)
 */
export async function taxCalculationMiddleware(
  request: Request,
): Promise<void> {
  await applyCheckoutRateLimit(request, 'validate_checkout');
  // No CSRF for GET requests
}

// ── Security Headers ─────────────────────────────────────────────────────────────

/**
 * Add security headers to checkout responses
 */
export function addCheckoutSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME sniffing
  headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  headers.set('X-XSS-Protection', '1; mode=block');

  // Strict transport security (if HTTPS)
  // headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Content security policy
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.razorpay.com;",
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
