/**
 * Checkout API Handlers
 * Source: REST_API_SPECIFICATION.md, SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md
 *
 * Checkout endpoints for the complete checkout lifecycle.
 */

import { AddressService } from '../../_lib/checkout/address-service.ts';
import { CouponService } from '../../_lib/checkout/coupon-service.ts';
import { CheckoutService } from '../../_lib/checkout/service.ts';
import { TaxService } from '../../_lib/checkout/tax-service.ts';
import {
  startCheckoutSchema,
  updateCheckoutSchema,
  validateCheckoutSchema,
  completeCheckoutSchema,
  resumeCheckoutSchema,
  addressSchema,
} from '../../_lib/checkout/types.ts';
import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { register } from '../register.ts';

/**
 * POST /api/v1/checkout/start — Start a new checkout session
 */
export async function handleCheckoutStart(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const guestId = request.headers.get('x-guest-id') || null;

    if (!userId && !guestId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const validated = startCheckoutSchema.parse({
      ...body,
      userId: userId || undefined,
      guestId: guestId || undefined,
    });

    const session = await CheckoutService.startCheckout(validated);

    return okJson({ session }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/checkout/resume — Resume an existing checkout session
 */
export async function handleCheckoutResume(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const guestId = request.headers.get('x-guest-id') || null;

    if (!userId && !guestId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const validated = resumeCheckoutSchema.parse({
      ...body,
      userId: userId || undefined,
      guestId: guestId || undefined,
    });

    const session = await CheckoutService.resumeCheckout(validated);

    return okJson({ session }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/checkout/validate — Validate checkout session
 */
export async function handleCheckoutValidate(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const guestId = request.headers.get('x-guest-id') || null;

    if (!userId && !guestId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const body = await request.json();
    const validated = validateCheckoutSchema.parse(body);

    const result = await CheckoutService.validateCheckout(validated);

    return okJson(result, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * PUT /api/v1/checkout/{id} — Update checkout session
 */
export async function handleCheckoutUpdate(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const guestId = request.headers.get('x-guest-id') || null;

    if (!userId && !guestId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;
    const validated = updateCheckoutSchema.parse({
      ...body,
      checkoutSessionId: id,
    });

    const session = await CheckoutService.updateCheckout(validated);

    return okJson({ session }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/checkout/{id}/lock — Lock checkout for payment
 */
export async function handleCheckoutLock(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const guestId = request.headers.get('x-guest-id') || null;

    if (!userId && !guestId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const { id } = params;

    const session = await CheckoutService.lockCheckout(id || '');

    return okJson({ session }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/checkout/{id}/complete — Complete checkout
 */
export async function handleCheckoutComplete(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const guestId = request.headers.get('x-guest-id') || null;

    if (!userId && !guestId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;
    const validated = completeCheckoutSchema.parse({
      ...body,
      checkoutSessionId: id,
    });

    // Payment retry logic with exponential backoff
    const maxRetries = 3;
    let lastError: Error | null = null;
    const retryLog: Array<{
      attempt: number;
      error: string;
      timestamp: string;
      backoffMs: number;
    }> = [];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const snapshot = await CheckoutService.completeCheckout(validated);

        // Log successful payment
        console.log(
          '[PAYMENT] Payment succeeded on attempt',
          attempt,
          'for checkout',
          id,
          {
            requestId: context.requestId,
            userId: context.userId,
            timestamp: new Date().toISOString(),
          },
        );

        return okJson({ snapshot }, context.requestId);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // Check if error is retryable (network timeout, gateway error)
        const isRetryable =
          lastError.message.includes('timeout') ||
          lastError.message.includes('gateway') ||
          lastError.message.includes('network');

        // Calculate backoff time
        const backoffMs = Math.pow(2, attempt - 1) * 1000;

        // Log retry attempt with details
        const logEntry = {
          attempt,
          error: lastError.message,
          timestamp: new Date().toISOString(),
          backoffMs,
          isRetryable,
          checkoutSessionId: id,
          requestId: context.requestId,
          userId: context.userId,
        };

        retryLog.push(logEntry);

        console.error('[PAYMENT] Payment attempt failed', logEntry);

        if (!isRetryable || attempt === maxRetries) {
          // Not retryable or max retries reached - log final failure
          console.error('[PAYMENT] Payment failed after', attempt, 'attempts', {
            checkoutSessionId: id,
            requestId: context.requestId,
            userId: context.userId,
            totalRetries: attempt,
            finalError: lastError.message,
            retryLog,
            timestamp: new Date().toISOString(),
          });
          break;
        }

        // Exponential backoff: 1s, 2s, 4s
        console.log(
          '[PAYMENT] Retrying payment in',
          backoffMs,
          'ms (attempt',
          attempt,
          'of',
          maxRetries,
          ')',
        );
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    // All retries failed
    if (lastError) {
      return errorJson(
        ApiError.internal(
          `Payment failed after ${maxRetries} retries: ${lastError.message}`,
        ),
        context.requestId,
      );
    }

    return errorJson(ApiError.internal('Payment failed'), context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/checkout/{id} — Get checkout session details
 */
export async function handleCheckoutGet(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const guestId = request.headers.get('x-guest-id') || null;

    if (!userId && !guestId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const { id } = params;

    const response = await CheckoutService.getCheckoutSessionResponse(id || '');

    return okJson(response, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/checkout/{id}/summary — Get checkout summary
 */
export async function handleCheckoutSummary(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const guestId = request.headers.get('x-guest-id') || null;

    if (!userId && !guestId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const { id } = params;

    const response = await CheckoutService.getCheckoutSummaryResponse(id || '');

    return okJson(response, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

// ============================================================================
// ADDRESS ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/checkout/addresses — Get user addresses
 */
export async function handleAddressesGet(
  _request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;

    if (!userId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const addresses = await AddressService.getAddresses(userId);
    const defaultAddress = await AddressService.getDefaultAddress(userId);

    return okJson({ addresses, defaultAddress }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to retrieve addresses'),
      context.requestId,
    );
  }
}

/**
 * POST /api/v1/checkout/addresses — Create address
 */
export async function handleAddressCreate(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;

    if (!userId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const validated = addressSchema.parse(body);

    const address = await AddressService.createAddress(userId, validated);

    return okJson({ address }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * PUT /api/v1/checkout/addresses/{id} — Update address
 */
export async function handleAddressUpdate(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;

    if (!userId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;
    const validated = { ...body, id: id || '' };

    const address = await AddressService.updateAddress(userId, validated);

    return okJson({ address }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * DELETE /api/v1/checkout/addresses/{id} — Delete address
 */
export async function handleAddressDelete(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;

    if (!userId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const { id } = params;

    await AddressService.deleteAddress(userId, id || '');

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/checkout/addresses/{id}/default — Set address as default
 */
export async function handleAddressSetDefault(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;

    if (!userId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const { id } = params;

    const address = await AddressService.setDefaultAddress(userId, id || '');

    return okJson({ address }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

// ============================================================================
// COUPON ENDPOINTS
// ============================================================================

/**
 * POST /api/v1/checkout/coupons/apply — Apply coupon
 */
export async function handleCouponApply(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const guestId = request.headers.get('x-guest-id') || null;

    if (!userId && !guestId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const { code, checkoutSessionId } = body;

    if (!checkoutSessionId || typeof checkoutSessionId !== 'string') {
      return errorJson(
        ApiError.validation('checkoutSessionId is required'),
        context.requestId,
      );
    }

    const result = await CouponService.applyCoupon(
      checkoutSessionId,
      code as string,
    );

    return okJson(result, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/checkout/coupons/remove — Remove coupon
 */
export async function handleCouponRemove(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const guestId = request.headers.get('x-guest-id') || null;

    if (!userId && !guestId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const { checkoutSessionId } = body;

    if (!checkoutSessionId || typeof checkoutSessionId !== 'string') {
      return errorJson(
        ApiError.validation('checkoutSessionId is required'),
        context.requestId,
      );
    }

    await CouponService.removeCoupon(checkoutSessionId);

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

// ============================================================================
// TAX ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/checkout/tax/calculate — Calculate tax
 */
export async function handleTaxCalculate(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const guestId = request.headers.get('x-guest-id') || null;

    if (!userId && !guestId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const url = new URL(request.url);
    const subtotal = parseFloat(url.searchParams.get('subtotal') || '0');
    const region = url.searchParams.get('region') || 'IN';

    const result = await TaxService.calculateTax({ subtotal, region });

    return okJson(result, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to calculate tax'),
      context.requestId,
    );
  }
}

// ============================================================================
// SHIPPING ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/checkout/shipping/rates — Get available shipping rates
 */
export async function handleShippingRates(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const guestId = request.headers.get('x-guest-id') || null;

    if (!userId && !guestId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const { origin, destination, weight, dimensions, shippingMethods } = body;

    if (!origin || !destination || !weight) {
      return errorJson(
        ApiError.badRequest(
          'Missing required fields: origin, destination, weight',
        ),
        context.requestId,
      );
    }

    // Validate origin and destination structure
    if (
      typeof origin !== 'object' ||
      !('postalCode' in origin) ||
      !('country' in origin)
    ) {
      return errorJson(
        ApiError.badRequest(
          'Invalid origin format: requires postalCode and country',
        ),
        context.requestId,
      );
    }

    if (
      typeof destination !== 'object' ||
      !('postalCode' in destination) ||
      !('country' in destination)
    ) {
      return errorJson(
        ApiError.badRequest(
          'Invalid destination format: requires postalCode and country',
        ),
        context.requestId,
      );
    }

    // Calculate shipping rates using proper shipping service
    const { ShippingService } = await import('../../_lib/shipping/service.ts');

    const rates = await ShippingService.calculateRates({
      origin: origin as { postalCode: string; country: string; state?: string },
      destination: destination as {
        postalCode: string;
        country: string;
        state?: string;
      },
      weight: weight as number,
      dimensions: dimensions as
        { length: number; width: number; height: number } | undefined,
      shippingMethods: shippingMethods as string[] | undefined,
    });

    return okJson({ rates }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to retrieve shipping rates'),
      context.requestId,
    );
  }
}

// Register routes
register('POST', 'checkout/start', handleCheckoutStart);
register('POST', 'checkout/resume', handleCheckoutResume);
register('POST', 'checkout/validate', handleCheckoutValidate);
register('PUT', 'checkout/{id}', handleCheckoutUpdate);
register('POST', 'checkout/{id}/lock', handleCheckoutLock);
register('POST', 'checkout/{id}/complete', handleCheckoutComplete);
register('GET', 'checkout/{id}', handleCheckoutGet);
register('GET', 'checkout/{id}/summary', handleCheckoutSummary);

// Address routes
register('GET', 'checkout/addresses', handleAddressesGet);
register('POST', 'checkout/addresses', handleAddressCreate);
register('PUT', 'checkout/addresses/{id}', handleAddressUpdate);
register('DELETE', 'checkout/addresses/{id}', handleAddressDelete);
register('POST', 'checkout/addresses/{id}/default', handleAddressSetDefault);

// Coupon routes
register('POST', 'checkout/coupons/apply', handleCouponApply);
register('POST', 'checkout/coupons/remove', handleCouponRemove);

// Tax routes
register('GET', 'checkout/tax/calculate', handleTaxCalculate);

// Shipping routes
register('GET', 'checkout/shipping/rates', handleShippingRates);
