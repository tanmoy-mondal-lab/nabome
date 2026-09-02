/**
 * Order API Handlers
 * Source: ORDER_MANAGEMENT_ARCHITECTURE.md, REST_API_SPECIFICATION.md
 *
 * Order endpoints for the complete order lifecycle management.
 * Implements REST API for customers, shop owners, and admins.
 */

import { z } from 'zod';

import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { OrderService } from '../../_lib/order/service.ts';
import { ReturnsService } from '../../_lib/returns/service.ts';
import { register } from '../register.ts';

// Order status enums (placeholder - will be imported from @nabome/order when configured)
enum OrderStatus {
  DRAFT = 'draft',
  PENDING_PAYMENT = 'pending_payment',
  PAYMENT_AUTHORIZED = 'payment_authorized',
  PAYMENT_FAILED = 'payment_failed',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  PACKED = 'packed',
  READY_FOR_SHIPMENT = 'ready_for_shipment',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  RETURNED = 'returned',
  CLOSED = 'closed',
}

enum CustomerVisibleOrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  PACKING = 'packing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
  REFUNDED = 'refunded',
  COMPLETED = 'completed',
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for order status transition request
 */
const transitionOrderSchema = z.object({
  to: z.nativeEnum(OrderStatus),
  reason: z.string().optional(),
});

/**
 * Schema for order cancellation request
 */
const cancelOrderSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required'),
});

/**
 * Schema for return request
 */
const returnRequestSchema = z.object({
  items: z.array(
    z.object({
      orderItemId: z.string(),
      quantity: z.number().min(1),
    }),
  ),
  reason: z.string().min(1, 'Return reason is required'),
});

/**
 * Schema for refund request
 */
const refundRequestSchema = z.object({
  amount: z.string().min(1, 'Refund amount is required'),
  reason: z.string().min(1, 'Refund reason is required'),
});

/**
 * Schema for adding order note
 */
const addNoteSchema = z.object({
  note: z
    .string()
    .min(1, 'Note is required')
    .max(500, 'Note must be less than 500 characters'),
});

/**
 * Schema for order query options
 */
const orderQuerySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  customerVisibleStatus: z.nativeEnum(CustomerVisibleOrderStatus).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'orderNumber', 'amounts.grandTotal'])
    .default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Schema for bulk status update
 */
const bulkStatusUpdateSchema = z.object({
  orderIds: z.array(z.string()).min(1, 'At least one order ID is required'),
  to: z.nativeEnum(OrderStatus),
  reason: z.string().optional(),
});

/**
 * POST /api/v1/orders/create-from-checkout — Create order from validated checkout snapshot
 */
export async function handleCreateOrderFromCheckout(
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
    const { checkoutSessionId, paymentMethod, paymentToken } = body;

    if (!checkoutSessionId || typeof checkoutSessionId !== 'string') {
      return errorJson(
        ApiError.validation('checkoutSessionId is required'),
        context.requestId,
      );
    }

    // Import CheckoutService to get the validated snapshot
    const { CheckoutService } = await import('../../_lib/checkout/service.ts');

    // Get the checkout session response to validate it
    const checkoutResponse =
      await CheckoutService.getCheckoutSessionResponse(checkoutSessionId);
    if (
      !checkoutResponse.checkoutSession ||
      checkoutResponse.checkoutSession.status !== 'completed'
    ) {
      return errorJson(
        ApiError.validation('Checkout session not completed'),
        context.requestId,
      );
    }

    // Get the validated snapshot from checkout
    const snapshot = await CheckoutService.completeCheckout({
      checkoutSessionId,
      paymentMethod: paymentMethod as string,
      paymentToken: paymentToken as string | undefined,
    });

    // Create order from the validated snapshot using static method
    const order = await OrderService.createFromCheckout(snapshot);

    return okJson({ order }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to create order'),
      context.requestId,
    );
  }
}

// ============================================================================
// CUSTOMER ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/orders — Get customer's orders
 */
export async function handleGetCustomerOrders(
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

    const url = new URL(_request.url);
    const queryOptions = orderQuerySchema.parse(
      Object.fromEntries(url.searchParams),
    );

    const orders = await OrderService.getUserOrders(userId, queryOptions);

    return okJson({ orders, total: orders.length }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/orders/{id} — Get order details
 */
export async function handleGetOrder(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const { id } = params;

    if (!userId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const order = await OrderService.getOrderById(id || '');

    if (!order) {
      return errorJson(ApiError.notFound('Order not found'), context.requestId);
    }

    // Verify customer owns this order
    if (order.userId !== userId) {
      return errorJson(ApiError.forbidden('Access denied'), context.requestId);
    }

    return okJson({ order }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to retrieve order'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/orders/{id}/timeline — Get order timeline (customer: filtered)
 */
export async function handleGetOrderTimeline(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const { id } = params;

    if (!userId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const url = new URL(_request.url);
    const limit = Math.min(
      Math.max(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 1),
      100,
    );
    const offset = Math.max(
      parseInt(url.searchParams.get('offset') || '0', 10) || 0,
      0,
    );

    const order = await OrderService.getOrderById(id || '');

    if (!order) {
      return errorJson(ApiError.notFound('Order not found'), context.requestId);
    }

    if (order.userId !== userId && context.userRole !== 'admin') {
      return errorJson(ApiError.forbidden('Access denied'), context.requestId);
    }

    const isCustomer =
      context.userRole === 'customer' ||
      (!context.userRole && order.userId === userId);
    const timeline = await OrderService.getOrderTimeline(id || '', {
      limit,
      offset,
      customerVisibleOnly: isCustomer,
    });

    return okJson({ timeline }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to retrieve order timeline'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/shop/orders/{id}/timeline — Shop timeline (all events)
 */
export async function handleGetShopOrderTimeline(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const userRole = context.userRole;
    const { id } = params;

    if (!userId || userRole !== 'shop_owner') {
      return errorJson(
        ApiError.forbidden('Shop owner access required'),
        context.requestId,
      );
    }

    const url = new URL(_request.url);
    const limit = Math.min(
      Math.max(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 1),
      100,
    );
    const offset = Math.max(
      parseInt(url.searchParams.get('offset') || '0', 10) || 0,
      0,
    );

    const order = await OrderService.getOrderById(id || '');
    if (!order)
      return errorJson(ApiError.notFound('Order not found'), context.requestId);

    const prisma = (await import('../../_lib/prisma.ts')).getPrisma() as any;
    const shop = await prisma.shop.findUnique({
      where: { ownerId: userId, isActive: true },
    });
    if (!shop || order.shopId !== shop.id) {
      return errorJson(
        ApiError.forbidden('You do not have access to this order'),
        context.requestId,
      );
    }

    const timeline = await OrderService.getOrderTimeline(id || '', {
      limit,
      offset,
      customerVisibleOnly: false,
    });
    return okJson({ timeline }, context.requestId);
  } catch (error) {
    if (error instanceof Error)
      return errorJson(ApiError.internal(error.message), context.requestId);
    return errorJson(
      ApiError.internal('Failed to retrieve order timeline'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/admin/orders/{id}/timeline — Admin timeline (all events)
 */
export async function handleGetAdminOrderTimeline(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const userRole = context.userRole;
    const { id } = params;

    if (!userId || userRole !== 'admin') {
      return errorJson(
        ApiError.forbidden('Admin access required'),
        context.requestId,
      );
    }

    const url = new URL(_request.url);
    const limit = Math.min(
      Math.max(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 1),
      100,
    );
    const offset = Math.max(
      parseInt(url.searchParams.get('offset') || '0', 10) || 0,
      0,
    );

    const order = await OrderService.getOrderById(id || '');
    if (!order)
      return errorJson(ApiError.notFound('Order not found'), context.requestId);

    const timeline = await OrderService.getOrderTimeline(id || '', {
      limit,
      offset,
      customerVisibleOnly: false,
    });
    return okJson({ timeline }, context.requestId);
  } catch (error) {
    if (error instanceof Error)
      return errorJson(ApiError.internal(error.message), context.requestId);
    return errorJson(
      ApiError.internal('Failed to retrieve order timeline'),
      context.requestId,
    );
  }
}

/**
 * POST /api/v1/orders/{id}/cancel — Cancel order
 */
export async function handleCancelOrder(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const { id } = params;

    if (!userId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const validated = cancelOrderSchema.parse(body);

    const order = await OrderService.getOrderById(id || '');

    if (!order) {
      return errorJson(ApiError.notFound('Order not found'), context.requestId);
    }

    // Verify customer owns this order
    if (order.userId !== userId) {
      return errorJson(ApiError.forbidden('Access denied'), context.requestId);
    }

    const result = await OrderService.cancelOrder(
      id || '',
      validated.reason,
      userId,
    );

    if (!result.success) {
      return errorJson(
        ApiError.badRequest(result.error || 'Failed to cancel order'),
        context.requestId,
      );
    }

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/orders/{id}/return — Request return
 */
export async function handleRequestReturn(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const { id } = params;

    if (!userId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const body = (await request.json()) as Record<string, unknown>;

    const order = await OrderService.getOrderById(id || '');

    if (!order) {
      return errorJson(ApiError.notFound('Order not found'), context.requestId);
    }

    // Verify customer owns this order
    if (order.userId !== userId) {
      return errorJson(ApiError.forbidden('Access denied'), context.requestId);
    }

    // Implement return request using ReturnsService
    const returnRequest = await ReturnsService.requestReturn({
      orderId: id || '',
      userId,
      items: body.items as Array<{
        orderItemId: string;
        quantity: number;
        reason: string;
      }>,
      reason: body.reason as string,
      reasonDetail: body.reasonDetail as string | undefined,
    });

    return okJson({ success: true, data: returnRequest }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

// ============================================================================
// SHOP OWNER ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/shop/orders — Get shop owner's orders
 */
export async function handleGetShopOrders(
  _request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const userRole = context.userRole;

    if (!userId || userRole !== 'shop_owner') {
      return errorJson(
        ApiError.forbidden('Shop owner access required'),
        context.requestId,
      );
    }

    const url = new URL(_request.url);
    const queryOptions = orderQuerySchema.parse(
      Object.fromEntries(url.searchParams),
    );

    const orders = await OrderService.getOrders({
      ...queryOptions,
      shopOwnerId: userId,
    });

    return okJson({ orders, total: orders.length }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/shop/orders/{id} — Get shop order details
 */
export async function handleGetShopOrder(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const userRole = context.userRole;
    const { id } = params;

    if (!userId || userRole !== 'shop_owner') {
      return errorJson(
        ApiError.forbidden('Shop owner access required'),
        context.requestId,
      );
    }

    const order = await OrderService.getOrderById(id || '');

    if (!order) {
      return errorJson(ApiError.notFound('Order not found'), context.requestId);
    }

    // Verify shop owner has access to this order (multi-tenant check)
    const prisma = (await import('../../_lib/prisma.ts')).getPrisma() as any;
    const shop = await prisma.shop.findUnique({
      where: { ownerId: userId, isActive: true },
    });

    if (!shop || order.shopId !== shop.id) {
      return errorJson(
        ApiError.forbidden('You do not have access to this order'),
        context.requestId,
      );
    }

    return okJson({ order }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to retrieve order'),
      context.requestId,
    );
  }
}

/**
 * POST /api/v1/shop/orders/{id}/note — Add note to order
 */
export async function handleAddShopOrderNote(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const userRole = context.userRole;
    const { id } = params;

    if (!userId || userRole !== 'shop_owner') {
      return errorJson(
        ApiError.forbidden('Shop owner access required'),
        context.requestId,
      );
    }

    const { getPrisma } = await import('../../_lib/prisma.ts');
    const prisma = getPrisma() as any;
    const order = await prisma.order.findUnique({ where: { id: id || '' }, select: { shopId: true } });
    if (!order) return errorJson(ApiError.notFound('Order not found'), context.requestId);
    const { hasShopAccess } = await import('../../_lib/shop/staff-service.ts');
    if (!(await hasShopAccess(userId, order.shopId))) return errorJson(ApiError.forbidden('Forbidden'), context.requestId);
    const body = (await request.json()) as Record<string, unknown>;
    const validated = addNoteSchema.parse(body);

    const result = await OrderService.addNote(
      id || '',
      validated.note,
      userId,
      'shop_owner',
    );

    if (!result.success) {
      return errorJson(
        ApiError.badRequest(result.error || 'Failed to add note'),
        context.requestId,
      );
    }

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/shop/orders/{id}/transition — Transition order status
 */
export async function handleTransitionShopOrder(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const userRole = context.userRole;
    const { id } = params;

    if (!userId || userRole !== 'shop_owner') {
      return errorJson(
        ApiError.forbidden('Shop owner access required'),
        context.requestId,
      );
    }
    const prismaTr = (await import('../../_lib/prisma.ts')).getPrisma() as any;
    const ordChk = await prismaTr.order.findUnique({ where: { id: id || '' }, select: { shopId: true } });
    if (!ordChk) return errorJson(ApiError.notFound('Order not found'), context.requestId);
    const { hasShopAccess: hsa2 } = await import('../../_lib/shop/staff-service.ts');
    if (!(await hsa2(userId, ordChk.shopId))) return errorJson(ApiError.forbidden('Forbidden'), context.requestId);

    const body = (await request.json()) as Record<string, unknown>;
    const validated = transitionOrderSchema.parse(body);

    const result = await OrderService.transitionOrder({
      orderId: id || '',
      to: validated.to,
      reason: validated.reason,
      performedBy: userId,
      performedByType: 'shop_owner',
    });

    if (!result.success) {
      return errorJson(
        ApiError.badRequest(result.error || 'Failed to transition order'),
        context.requestId,
      );
    }

    return okJson(
      { success: true, newStatus: result.newStatus },
      context.requestId,
    );
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/admin/orders — Get all orders (admin)
 */
export async function handleGetAdminOrders(
  _request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const userRole = context.userRole;

    if (!userId || userRole !== 'admin') {
      return errorJson(
        ApiError.forbidden('Admin access required'),
        context.requestId,
      );
    }

    const url = new URL(_request.url);
    const queryOptions = orderQuerySchema.parse(
      Object.fromEntries(url.searchParams),
    );

    const orders = await OrderService.getOrders(queryOptions);

    const count = await OrderService.getOrdersCount(queryOptions);

    return okJson({ orders, total: count }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/admin/orders/{id} — Get order details (admin)
 */
export async function handleGetAdminOrder(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const userRole = context.userRole;
    const { id } = params;

    if (!userId || userRole !== 'admin') {
      return errorJson(
        ApiError.forbidden('Admin access required'),
        context.requestId,
      );
    }

    const order = await OrderService.getOrderById(id || '');

    if (!order) {
      return errorJson(ApiError.notFound('Order not found'), context.requestId);
    }

    return okJson({ order }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to retrieve order'),
      context.requestId,
    );
  }
}

/**
 * POST /api/v1/admin/orders/{id}/transition — Transition order status (admin override)
 */
export async function handleTransitionAdminOrder(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const userRole = context.userRole;
    const { id } = params;

    if (!userId || userRole !== 'admin') {
      return errorJson(
        ApiError.forbidden('Admin access required'),
        context.requestId,
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const validated = transitionOrderSchema.parse(body);

    const result = await OrderService.transitionOrder({
      orderId: id || '',
      to: validated.to,
      reason: validated.reason,
      performedBy: userId,
      performedByType: 'admin',
    });

    if (!result.success) {
      return errorJson(
        ApiError.badRequest(result.error || 'Failed to transition order'),
        context.requestId,
      );
    }

    return okJson(
      { success: true, newStatus: result.newStatus },
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
 * POST /api/v1/admin/orders/{id}/cancel — Cancel order (admin)
 */
export async function handleCancelAdminOrder(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const userRole = context.userRole;
    const { id } = params;

    if (!userId || userRole !== 'admin') {
      return errorJson(
        ApiError.forbidden('Admin access required'),
        context.requestId,
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const validated = cancelOrderSchema.parse(body);

    const result = await OrderService.cancelOrder(
      id || '',
      validated.reason,
      userId,
    );

    if (!result.success) {
      return errorJson(
        ApiError.badRequest(result.error || 'Failed to cancel order'),
        context.requestId,
      );
    }

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/admin/orders/{id}/refund — Process refund (admin)
 */
export async function handleRefundAdminOrder(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const userRole = context.userRole;
    const { id } = params;

    if (!userId || userRole !== 'admin') {
      return errorJson(
        ApiError.forbidden('Admin access required'),
        context.requestId,
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const validated = refundRequestSchema.parse(body);

    const result = await OrderService.processRefund(
      id || '',
      parseFloat(validated.amount as string),
      validated.reason,
    );

    if (!result.success) {
      return errorJson(
        ApiError.badRequest(result.error || 'Failed to process refund'),
        context.requestId,
      );
    }

    return okJson(
      { success: true, refundId: result.refundId },
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
 * POST /api/v1/admin/orders/{id}/note — Add note to order (admin)
 */
export async function handleAddAdminOrderNote(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const userRole = context.userRole;
    const { id } = params;

    if (!userId || userRole !== 'admin') {
      return errorJson(
        ApiError.forbidden('Admin access required'),
        context.requestId,
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const validated = addNoteSchema.parse(body);

    const result = await OrderService.addNote(
      id || '',
      validated.note,
      userId,
      'admin',
    );

    if (!result.success) {
      return errorJson(
        ApiError.badRequest(result.error || 'Failed to add note'),
        context.requestId,
      );
    }

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/admin/orders/bulk-transition — Bulk status update (admin)
 */
export async function handleBulkStatusUpdate(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const userRole = context.userRole;

    if (!userId || userRole !== 'admin') {
      return errorJson(
        ApiError.forbidden('Admin access required'),
        context.requestId,
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const validated = bulkStatusUpdateSchema.parse(body);

    const results = [];

    for (const orderId of validated.orderIds) {
      const result = await OrderService.transitionOrder({
        orderId,
        to: validated.to,
        reason: validated.reason,
        performedBy: userId,
        performedByType: 'admin',
      });
      results.push({ orderId, success: result.success, error: result.error });
    }

    return okJson({ results }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/admin/orders/stats — Get order statistics (admin)
 */
export async function handleGetOrderStats(
  _request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const userRole = context.userRole;

    if (!userId || userRole !== 'admin') {
      return errorJson(
        ApiError.forbidden('Admin access required'),
        context.requestId,
      );
    }

    const dashboardStats = await OrderService.getDashboardStats();
    const summary = await OrderService.getSummary();

    return okJson({ dashboardStats, summary }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to retrieve order statistics'),
      context.requestId,
    );
  }
}

// ============================================================================
// PUBLIC ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/orders/lookup/{orderNumber} — Lookup order by order number (public with email verification)
 */
export async function handleLookupOrder(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const { orderNumber } = params;
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return errorJson(
        ApiError.validation('Email is required for order lookup'),
        context.requestId,
      );
    }

    const order = await OrderService.getOrderByNumber(orderNumber || '');

    if (!order) {
      return errorJson(ApiError.notFound('Order not found'), context.requestId);
    }

    // Verify email matches order
    if (order.customerEmail !== email) {
      return errorJson(
        ApiError.forbidden('Email does not match order'),
        context.requestId,
      );
    }

    // Return limited order data for public lookup
    const publicOrderData = {
      orderNumber: order.orderNumber,
      status: order.status,
      customerVisibleStatus: order.customerVisibleStatus,
      items: order.items.map((item: any) => ({
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
      amounts: order.amounts,
      createdAt: order.createdAt,
    };

    return okJson({ order: publicOrderData }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to lookup order'),
      context.requestId,
    );
  }
}

// ============================================================================
// ROUTE REGISTRATION
// ============================================================================

// Register routes
register('POST', 'orders/create-from-checkout', handleCreateOrderFromCheckout);
register('GET', 'orders', handleGetCustomerOrders);
register('GET', 'orders/{id}', handleGetOrder);
register('GET', 'orders/{id}/timeline', handleGetOrderTimeline);
register('GET', 'shop/orders/{id}/timeline', handleGetShopOrderTimeline);
register('GET', 'admin/orders/{id}/timeline', handleGetAdminOrderTimeline);
register('POST', 'orders/{id}/cancel', handleCancelOrder);
register('POST', 'orders/{id}/return', handleRequestReturn);

// Shop owner routes
register('GET', 'shop/orders', handleGetShopOrders);
register('GET', 'shop/orders/{id}', handleGetShopOrder);
register('POST', 'shop/orders/{id}/note', handleAddShopOrderNote);
register('POST', 'shop/orders/{id}/transition', handleTransitionShopOrder);

// Admin routes
register('GET', 'admin/orders', handleGetAdminOrders);
register('GET', 'admin/orders/{id}', handleGetAdminOrder);
register('POST', 'admin/orders/{id}/transition', handleTransitionAdminOrder);
register('POST', 'admin/orders/{id}/cancel', handleCancelAdminOrder);
register('POST', 'admin/orders/{id}/refund', handleRefundAdminOrder);
register('POST', 'admin/orders/{id}/note', handleAddAdminOrderNote);
register('POST', 'admin/orders/bulk-transition', handleBulkStatusUpdate);
register('GET', 'admin/orders/stats', handleGetOrderStats);

// Public routes
register('GET', 'orders/lookup/{orderNumber}', handleLookupOrder);
