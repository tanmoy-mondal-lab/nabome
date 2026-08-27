/**
 * Warehouse API Handlers
 * Source: REST_API_SPECIFICATION.md, VARIANT_INVENTORY_ENGINE_ARCHITECTURE.md
 *
 * API endpoints for warehouse management.
 */

import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { warehouseService } from '../../_lib/inventory/service.ts';
import { register } from '../register.ts';

/**
 * GET /api/v1/warehouses — Get all warehouses
 */
export async function handleWarehousesList(
  _request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const warehouses = await warehouseService.findAll();
    return okJson({ warehouses }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to get warehouses'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/warehouses/active — Get active warehouses only
 */
export async function handleWarehousesActive(
  _request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const warehouses = await warehouseService.findActive();
    return okJson({ warehouses }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to get active warehouses'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/warehouses/{id} — Get warehouse by ID
 */
export async function handleWarehouseGet(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const { id } = params;
    if (!id) {
      return errorJson(
        ApiError.validation('Warehouse ID is required'),
        context.requestId,
      );
    }

    const warehouse = await warehouseService.findById(id);

    if (!warehouse) {
      return errorJson(
        ApiError.notFound('Warehouse not found'),
        context.requestId,
      );
    }

    return okJson(warehouse, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to get warehouse'),
      context.requestId,
    );
  }
}

/**
 * POST /api/v1/warehouses — Create a new warehouse
 */
export async function handleWarehouseCreate(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const body = (await request.json()) as {
      name?: string;
      code?: string;
      address?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      phone?: string;
      email?: string;
      priority?: number;
    };
    const {
      name,
      code,
      address,
      city,
      state,
      postalCode,
      country,
      phone,
      email,
      priority,
    } = body;

    if (!name || !code || !address || !city || !state || !postalCode) {
      return errorJson(
        ApiError.validation(
          'name, code, address, city, state, and postalCode are required',
        ),
        context.requestId,
      );
    }

    const result = await warehouseService.create({
      name,
      code,
      address,
      city,
      state,
      postalCode,
      country,
      phone,
      email,
      priority,
    });

    if (!result.success) {
      return errorJson(
        ApiError.validation(result.error || 'Failed to create warehouse'),
        context.requestId,
      );
    }

    return okJson(result.warehouse, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * PUT /api/v1/warehouses/{id} — Update warehouse
 */
export async function handleWarehouseUpdate(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const { id } = params;
    if (!id) {
      return errorJson(
        ApiError.validation('Warehouse ID is required'),
        context.requestId,
      );
    }

    const body = (await request.json()) as {
      name?: string;
      address?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      phone?: string;
      email?: string;
      status?: string;
      priority?: number;
      isActive?: boolean;
    };
    const {
      name,
      address,
      city,
      state,
      postalCode,
      country,
      phone,
      email,
      status,
      priority,
      isActive,
    } = body;

    const result = await warehouseService.update(id, {
      name,
      address,
      city,
      state,
      postalCode,
      country,
      phone,
      email,
      status: status as any,
      priority,
      isActive,
    });

    if (!result.success) {
      return errorJson(
        ApiError.validation(result.error || 'Failed to update warehouse'),
        context.requestId,
      );
    }

    return okJson(result.warehouse, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * DELETE /api/v1/warehouses/{id} — Delete warehouse (soft delete)
 */
export async function handleWarehouseDelete(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const { id } = params;
    if (!id) {
      return errorJson(
        ApiError.validation('Warehouse ID is required'),
        context.requestId,
      );
    }

    const result = await warehouseService.delete(id);

    if (!result.success) {
      return errorJson(
        ApiError.validation(result.error || 'Failed to delete warehouse'),
        context.requestId,
      );
    }

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to delete warehouse'),
      context.requestId,
    );
  }
}

// Register warehouse routes
register('GET', 'warehouses', handleWarehousesList);
register('GET', 'warehouses/active', handleWarehousesActive);
register('GET', 'warehouses/{id}', handleWarehouseGet);
register('POST', 'warehouses', handleWarehouseCreate);
register('PUT', 'warehouses/{id}', handleWarehouseUpdate);
register('DELETE', 'warehouses/{id}', handleWarehouseDelete);
