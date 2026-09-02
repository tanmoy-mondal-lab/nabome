/**
 * Cart API Handlers
 * Source: REST_API_SPECIFICATION.md, SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md
 *
 * Cart endpoints for authenticated users and guests.
 */

import { CartService } from '../../_lib/cart/service.ts';
import {
  addToCartSchema,
  updateCartItemSchema,
  removeCartItemSchema,
  clearCartSchema,
  mergeCartSchema,
} from '../../_lib/cart/types.ts';
import { CartValidationService } from '../../_lib/cart/validation.ts';
import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { register } from '../register.ts';

/**
 * GET /api/v1/cart — Get current user's cart
 */
export async function handleCartGet(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const guestId = request.headers.get('x-guest-id') || null;
    const url = new URL(request.url);
    const couponCode = url.searchParams.get('couponCode')?.trim() ?? null;

    if (!userId && !guestId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const cart = userId
      ? await CartService.getUserCart(userId)
      : await CartService.getGuestCart(guestId || '');

    const totals = userId
      ? await CartService.calculateCartTotals(
          userId,
          null,
          undefined,
          couponCode,
        )
      : await CartService.calculateCartTotals(
          null,
          guestId || '',
          undefined,
          couponCode,
        );

    return okJson(
      {
        cart,
        totals,
      },
      context.requestId,
    );
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to retrieve cart'),
      context.requestId,
    );
  }
}

/**
 * POST /api/v1/cart/items — Add item to cart
 */
export async function handleCartItemAdd(
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
    const validated = addToCartSchema.parse(body);

    // Validate variant availability
    const availabilityCheck =
      await CartValidationService.validateVariantAvailability(
        validated.variantId,
        validated.quantity,
      );

    if (!availabilityCheck.valid) {
      return errorJson(
        ApiError.validation(availabilityCheck.error!),
        context.requestId,
      );
    }

    const item = await CartService.addItem(userId ?? null, guestId, validated);

    return okJson({ item }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * PUT /api/v1/cart/items/{id} — Update cart item
 */
export async function handleCartItemUpdate(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const { id } = params;
    if (!id)
      return errorJson(ApiError.validation('Missing id'), context.requestId);
    const userId = context.userId;
    const guestId = request.headers.get('x-guest-id') || null;

    if (!userId && !guestId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const validated = updateCartItemSchema.parse({ ...body, itemId: id! });

    const item = await CartService.updateItem(validated, { userId: userId ?? null, guestId });

    return okJson({ item }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * DELETE /api/v1/cart/items/{id} — Remove cart item
 */
export async function handleCartItemRemove(
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
    if (!id)
      return errorJson(ApiError.validation('Missing id'), context.requestId);
    const validated = removeCartItemSchema.parse({ itemId: id! });

    await CartService.removeItem(validated.itemId, { userId: userId ?? null, guestId });

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * DELETE /api/v1/cart — Clear cart
 */
export async function handleCartClear(
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

    const validated = clearCartSchema.parse({
      userId,
      guestId: guestId || null,
    });

    await CartService.clearCart(validated);

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/cart/merge — Merge guest cart to user cart
 */
export async function handleCartMerge(
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
    const validated = mergeCartSchema.parse({ ...body, userId });

    const cart = await CartService.mergeCart(validated);

    const totals = await CartService.calculateCartTotals(userId, null);

    return okJson(
      {
        cart,
        totals,
      },
      context.requestId,
    );
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/cart/validate — Validate cart
 */
export async function handleCartValidate(
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

    const result = await CartValidationService.validateCart(
      userId ?? null,
      guestId,
    );

    return okJson(result, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to validate cart'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/cart/count — Get cart item count
 */
export async function handleCartCount(
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

    const count = await CartService.getCartCount(userId);

    return okJson({ count }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to retrieve cart count'),
      context.requestId,
    );
  }
}

// Register routes
register('GET', 'cart', handleCartGet);
register('POST', 'cart/items', handleCartItemAdd);
register('PUT', 'cart/items/{id}', handleCartItemUpdate);
register('DELETE', 'cart/items/{id}', handleCartItemRemove);
register('DELETE', 'cart', handleCartClear);
register('POST', 'cart/merge', handleCartMerge);
register('POST', 'cart/validate', handleCartValidate);
register('GET', 'cart/count', handleCartCount);
