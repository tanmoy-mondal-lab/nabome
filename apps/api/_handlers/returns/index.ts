/**
 * Returns API Handlers
 * Source: REST_API_SPECIFICATION.md
 *
 * Return and refund endpoints for customers and admins.
 */

import { z } from 'zod';

import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { OrderService } from '../../_lib/order/service.ts';
import { ReturnsService } from '../../_lib/returns/service.ts';
import { register } from '../register.ts';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for return request
 */
const returnRequestSchema = z.object({
  items: z.array(
    z.object({
      orderItemId: z.string(),
      quantity: z.number().min(1),
      reason: z.string().min(1),
    }),
  ),
  reason: z.string().min(1, 'Return reason is required'),
});

/**
 * Schema for return status update (admin)
 */
const returnStatusSchema = z.object({
  status: z.enum([
    'requested',
    'approved',
    'rejected',
    'received',
    'refunded',
    'completed',
  ]),
  reason: z.string().optional(),
});

// ============================================================================
// CUSTOMER ENDPOINTS
// ============================================================================

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
    const validated = returnRequestSchema.parse(body);

    const returnRequest = await ReturnsService.requestReturn({
      orderId: id || '',
      userId,
      items: validated.items,
      reason: validated.reason,
      reasonDetail: body.reasonDetail as string | undefined,
    });

    return okJson({ returnRequest }, context.requestId);
  } catch (error) {
    if (error instanceof ApiError) {
      return errorJson(error, context.requestId);
    }
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/orders/{id}/returns — Get return history for order
 */
export async function handleGetOrderReturns(
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

    const returns = await ReturnsService.getOrderReturns(id || '', userId);

    return okJson({ returns }, context.requestId);
  } catch (error) {
    if (error instanceof ApiError) {
      return errorJson(error, context.requestId);
    }
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch returns'),
      context.requestId,
    );
  }
}

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/admin/returns — List all returns (admin)
 */
export async function handleListReturns(
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

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
    const limit = Math.min(
      100,
      Math.max(1, Number(url.searchParams.get('limit') ?? 20)),
    );

    const result = await ReturnsService.listReturns({
      status: status || undefined,
      page,
      limit,
    });

    return okJson(result, context.requestId);
  } catch (error) {
    if (error instanceof ApiError) {
      return errorJson(error, context.requestId);
    }
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch returns'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/admin/returns/{id} — Get return details (admin)
 */
export async function handleGetReturn(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
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

    const { id } = params;

    const returnRequest = await ReturnsService.getReturn(id || '');

    return okJson({ return: returnRequest }, context.requestId);
  } catch (error) {
    if (error instanceof ApiError) {
      return errorJson(error, context.requestId);
    }
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch return'),
      context.requestId,
    );
  }
}

/**
 * POST /api/v1/admin/returns/{id}/status — Update return status (admin)
 */
export async function handleUpdateReturnStatus(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
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

    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;
    const validated = returnStatusSchema.parse(body);

    const updatedReturn = await ReturnsService.updateReturnStatus(id || '', {
      status: validated.status,
      reason: validated.reason,
      adminId: userId,
    });

    return okJson({ success: true, return: updatedReturn }, context.requestId);
  } catch (error) {
    if (error instanceof ApiError) {
      return errorJson(error, context.requestId);
    }
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

// Register routes
register('POST', 'orders/{id}/return', handleRequestReturn);
register('GET', 'orders/{id}/returns', handleGetOrderReturns);
register('GET', 'admin/returns', handleListReturns);
register('GET', 'admin/returns/{id}', handleGetReturn);
register('POST', 'admin/returns/{id}/status', handleUpdateReturnStatus);
