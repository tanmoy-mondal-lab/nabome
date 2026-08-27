/**
 * Inventory API Handlers
 * Source: REST_API_SPECIFICATION.md, VARIANT_INVENTORY_ENGINE_ARCHITECTURE.md
 *
 * API endpoints for inventory management, stock movements, reservations,
 * warehouse management, and availability checks.
 */

import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import type { StockMovementType } from '../../_lib/inventory/repository.ts';
import { inventoryService } from '../../_lib/inventory/service.ts';
import { register } from '../register.ts';

/**
 * GET /api/v1/inventory/summary — Get inventory summary
 */
export async function handleInventorySummary(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const summary = await inventoryService.getSummary();
    return okJson(summary, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to get inventory summary'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/inventory/availability — Check availability for variants
 */
export async function handleInventoryAvailability(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const variantIds = url.searchParams.get('variantIds')?.split(',');

    if (!variantIds || variantIds.length === 0) {
      return errorJson(
        ApiError.validation('variantIds parameter is required'),
        context.requestId,
      );
    }

    const results = await inventoryService.checkAvailability(variantIds);
    return okJson({ results }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/inventory/reserve — Reserve stock
 */
export async function handleInventoryReserve(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const body = (await request.json()) as {
      variantId?: string;
      quantity?: number;
      cartId?: string;
      orderId?: string;
      warehouseId?: string;
    };
    const { variantId, quantity, cartId, orderId, warehouseId } = body;

    if (!variantId || !quantity) {
      return errorJson(
        ApiError.validation('variantId and quantity are required'),
        context.requestId,
      );
    }

    const result = await inventoryService.reserveStock(
      variantId,
      quantity,
      cartId,
      orderId,
      warehouseId,
    );

    if (!result.success) {
      return errorJson(
        ApiError.validation(result.error || 'Reservation failed'),
        context.requestId,
      );
    }

    return okJson({ reservationId: result.reservationId }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/inventory/reserve/{id}/release — Release a reservation
 */
export async function handleInventoryReleaseReservation(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const { id } = params;
    if (!id) {
      return errorJson(
        ApiError.validation('Reservation ID is required'),
        context.requestId,
      );
    }
    const success = await inventoryService.releaseReservation(id);

    if (!success) {
      return errorJson(
        ApiError.notFound('Reservation not found or already released'),
        context.requestId,
      );
    }

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to release reservation'),
      context.requestId,
    );
  }
}

/**
 * POST /api/v1/inventory/reserve/{id}/convert — Convert reservation to sale
 */
export async function handleInventoryConvertReservation(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const { id } = params;
    if (!id) {
      return errorJson(
        ApiError.validation('Reservation ID is required'),
        context.requestId,
      );
    }
    const success = await inventoryService.convertReservation(id);

    if (!success) {
      return errorJson(
        ApiError.notFound('Reservation not found or already converted'),
        context.requestId,
      );
    }

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to convert reservation'),
      context.requestId,
    );
  }
}

/**
 * POST /api/v1/inventory/stock/add — Add stock to a variant
 */
export async function handleInventoryAddStock(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const body = (await request.json()) as {
      variantId?: string;
      quantity?: number;
      type?: StockMovementType;
      reason?: string;
      performedBy?: string;
      warehouseId?: string;
    };
    const { variantId, quantity, type, reason, performedBy, warehouseId } =
      body;

    if (!variantId || !quantity || !type) {
      return errorJson(
        ApiError.validation('variantId, quantity, and type are required'),
        context.requestId,
      );
    }

    const result = await inventoryService.addStock(
      variantId,
      quantity,
      type,
      reason,
      performedBy,
      warehouseId,
    );

    if (!result.success) {
      return errorJson(
        ApiError.validation(result.error || 'Failed to add stock'),
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
 * GET /api/v1/inventory/variant/{id}/movements — Get stock movement history for a variant
 */
export async function handleInventoryMovements(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const { id } = params;
    if (!id) {
      return errorJson(
        ApiError.validation('Variant ID is required'),
        context.requestId,
      );
    }
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit')
      ? parseInt(url.searchParams.get('limit')!)
      : 50;
    const offset = url.searchParams.get('offset')
      ? parseInt(url.searchParams.get('offset')!)
      : 0;

    const movements = await inventoryService.getMovementHistory(
      id,
      limit,
      offset,
    );
    return okJson({ movements }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to get movement history'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/inventory/variant/{id}/reservations — Get active reservations for a variant
 */
export async function handleInventoryReservations(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const { id } = params;
    if (!id) {
      return errorJson(
        ApiError.validation('Variant ID is required'),
        context.requestId,
      );
    }
    const reservations = await inventoryService.getActiveReservations(id);
    return okJson({ reservations }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to get reservations'),
      context.requestId,
    );
  }
}

/**
 * POST /api/v1/inventory/bulk-update — Bulk stock update
 */
export async function handleInventoryBulkUpdate(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const body = (await request.json()) as {
      updates?: Array<{
        variantId: string;
        quantity: number;
        type: StockMovementType;
        reason?: string;
      }>;
      performedBy?: string;
      performedByType?: string;
    };
    const { updates, performedBy, performedByType } = body;

    if (!updates || !Array.isArray(updates)) {
      return errorJson(
        ApiError.validation('updates array is required'),
        context.requestId,
      );
    }

    const result = await inventoryService.bulkUpdate({
      updates,
      performedBy,
      performedByType,
    });

    if (!result.success) {
      return errorJson(
        ApiError.validation(result.errors.join(', ')),
        context.requestId,
      );
    }

    return okJson({ success: true, errors: result.errors }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/inventory/transfer — Transfer stock between warehouses
 */
export async function handleInventoryTransfer(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const body = (await request.json()) as {
      variantId?: string;
      fromWarehouseId?: string;
      toWarehouseId?: string;
      quantity?: number;
      reason?: string;
      performedBy?: string;
    };
    const {
      variantId,
      fromWarehouseId,
      toWarehouseId,
      quantity,
      reason,
      performedBy,
    } = body;

    if (!variantId || !fromWarehouseId || !toWarehouseId || !quantity) {
      return errorJson(
        ApiError.validation(
          'variantId, fromWarehouseId, toWarehouseId, and quantity are required',
        ),
        context.requestId,
      );
    }

    const result = await inventoryService.transferStock({
      variantId,
      fromWarehouseId,
      toWarehouseId,
      quantity,
      reason,
      performedBy,
    });

    if (!result.success) {
      return errorJson(
        ApiError.validation(result.error || 'Transfer failed'),
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
 * POST /api/v1/inventory/expire-reservations — Expire old reservations (admin only)
 */
export async function handleInventoryExpireReservations(
  _request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const count = await inventoryService.expireOldReservations();
    return okJson({ expiredCount: count }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to expire reservations'),
      context.requestId,
    );
  }
}

// Register inventory routes
register('GET', 'inventory/summary', handleInventorySummary);
register('GET', 'inventory/availability', handleInventoryAvailability);
register('POST', 'inventory/reserve', handleInventoryReserve);
register(
  'POST',
  'inventory/reserve/{id}/release',
  handleInventoryReleaseReservation,
);
register(
  'POST',
  'inventory/reserve/{id}/convert',
  handleInventoryConvertReservation,
);
register('POST', 'inventory/stock/add', handleInventoryAddStock);
register('GET', 'inventory/variant/{id}/movements', handleInventoryMovements);
register(
  'GET',
  'inventory/variant/{id}/reservations',
  handleInventoryReservations,
);
register('POST', 'inventory/bulk-update', handleInventoryBulkUpdate);
register('POST', 'inventory/transfer', handleInventoryTransfer);
register(
  'POST',
  'inventory/expire-reservations',
  handleInventoryExpireReservations,
);
