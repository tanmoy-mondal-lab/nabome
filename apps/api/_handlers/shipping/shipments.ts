/**
 * Shipment API Handlers
 *
 * Handles all shipment-related API endpoints.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

import {
  createShipmentService, // @ts-ignore - shipping package types
} from '@nabome/shipping';
import {
  type ShipmentStatus,
  ActorType,
  ShippingMethod,
  type CarrierType,
  // @ts-ignore - shipping package types
} from '@nabome/shipping';

import type { RequestContext } from '../../_lib/http/context.ts';
import {
  ApiError,
  errorJson,
  getLogger,
  okJson,
  withRequestId,
} from '../../_lib/index.ts';
import { getPrisma } from '../../_lib/prisma.ts';
import type { RouteHandler } from '../register.ts';
// @ts-ignore - Prisma client will be available in runtime
// @ts-ignore - shipping package types

/**
 * GET /shipments
 * Get all shipments with optional filters
 */
export const getShipments: RouteHandler = async (request, context, _params) => {
  const requestId = context.requestId;
  const logger = withRequestId(getLogger(context.env), requestId);

  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('orderId');
    const status = url.searchParams.get('status');
    const carrierCode = url.searchParams.get('carrierCode');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    const prisma = getPrisma() as any;
    const shipmentService = createShipmentService(prisma);

    const shipments = await shipmentService.queryShipments({
      orderId: orderId || undefined,
      status: (status as ShipmentStatus) || undefined,
      carrierCode: (carrierCode as CarrierType) || undefined,
      limit,
      offset,
    });

    return okJson({ shipments, total: shipments.length }, requestId);
  } catch (error) {
    logger.error({ error }, 'Error fetching shipments');
    return errorJson(ApiError.internal('Failed to fetch shipments'), requestId);
  }
};

/**
 * GET /shipments/{id}
 * Get a specific shipment by ID
 */
export const getShipmentById: RouteHandler = async (
  request,
  context,
  params,
) => {
  const requestId = context.requestId;
  const logger = withRequestId(getLogger(context.env), requestId);
  const { id } = params;
  if (!id)
    return errorJson(ApiError.badRequest('Missing id'), context.requestId);

  try {
    const prisma = getPrisma() as any;
    const shipmentService = createShipmentService(prisma);

    const shipment = await shipmentService.getShipmentById(id!);
    if (!shipment) {
      return errorJson(ApiError.notFound('Shipment not found'), requestId);
    }

    return okJson({ shipment }, requestId);
  } catch (error) {
    logger.error({ error, id }, 'Error fetching shipment');
    return errorJson(ApiError.internal('Failed to fetch shipment'), requestId);
  }
};

/**
 * POST /shipments
 * Create a new shipment
 */
export const createShipment: RouteHandler = async (
  request,
  context,
  _params,
) => {
  const requestId = context.requestId;
  const logger = withRequestId(getLogger(context.env), requestId);

  try {
    const body = (await request.json()) as Record<string, any>;
    const {
      orderId,
      shippingMethod,
      carrierCode,
      trackingNumber,
      estimatedDeliveryDate,
      items,
      shippingAddress,
    } = body;

    if (!orderId || !items || !Array.isArray(items)) {
      return errorJson(
        ApiError.badRequest('Missing required fields'),
        requestId,
      );
    }

    const prisma = getPrisma() as any;
    const shipmentService = createShipmentService(prisma);

    const shipment = await shipmentService.createShipment(
      {
        orderId,
        shippingMethod: shippingMethod || ShippingMethod.STANDARD,
        carrierCode: carrierCode || null,
        trackingNumber: trackingNumber || null,
        estimatedDeliveryDate: estimatedDeliveryDate
          ? new Date(estimatedDeliveryDate)
          : null,
        items,
      },
      shippingAddress,
      ActorType.SYSTEM,
      null,
    );

    return okJson({ shipment }, requestId);
  } catch (error) {
    logger.error({ error }, 'Error creating shipment');
    return errorJson(ApiError.internal('Failed to create shipment'), requestId);
  }
};

/**
 * PATCH /shipments/{id}/status
 * Update shipment status
 */
export const updateShipmentStatus: RouteHandler = async (
  request,
  context,
  params,
) => {
  const requestId = context.requestId;
  const logger = withRequestId(getLogger(context.env), requestId);
  const { id } = params;
  if (!id)
    return errorJson(ApiError.badRequest('Missing id'), context.requestId);

  try {
    const body = (await request.json()) as Record<string, any>;
    const { status, actorType, actorId, reason, metadata } = body;

    if (!status || !actorType) {
      return errorJson(
        ApiError.badRequest('Missing required fields'),
        requestId,
      );
    }

    const prisma = getPrisma() as any;
    const shipmentService = createShipmentService(prisma);

    const result = await shipmentService.updateShipmentStatus({
      shipmentId: id!,
      status: status as ShipmentStatus,
      actorType: actorType as ActorType,
      actorId: actorId || null,
      reason,
      metadata,
    });

    if (!result.success) {
      return errorJson(
        ApiError.badRequest(result.error || 'Invalid status transition'),
        requestId,
      );
    }

    return okJson({ result }, requestId);
  } catch (error) {
    logger.error({ error, id }, 'Error updating shipment status');
    return errorJson(
      ApiError.internal('Failed to update shipment status'),
      requestId,
    );
  }
};

/**
 * DELETE /shipments/{id}
 * Soft delete a shipment
 */
export const deleteShipment: RouteHandler = async (
  request,
  context,
  params,
) => {
  const requestId = context.requestId;
  const logger = withRequestId(getLogger(context.env), requestId);
  const { id } = params;
  if (!id)
    return errorJson(ApiError.badRequest('Missing id'), context.requestId);

  try {
    const prisma = getPrisma() as any;
    const shipmentService = createShipmentService(prisma);

    await shipmentService.deleteShipment(id!);
    return okJson({ message: 'Shipment deleted successfully' }, requestId);
  } catch (error) {
    logger.error({ error, id }, 'Error deleting shipment');
    return errorJson(ApiError.internal('Failed to delete shipment'), requestId);
  }
};

/**
 * GET /orders/{orderId}/shipments
 * Get all shipments for an order
 */
export const getShipmentsByOrder: RouteHandler = async (
  request,
  context,
  params,
) => {
  const requestId = context.requestId;
  const logger = withRequestId(getLogger(context.env), requestId);
  const { orderId } = params;
  if (!orderId)
    return errorJson(ApiError.badRequest('Missing orderId'), context.requestId);

  try {
    const prisma = getPrisma() as any;
    const shipmentService = createShipmentService(prisma);

    const shipments = await shipmentService.getShipmentsByOrderId(orderId!);
    return okJson({ shipments }, requestId);
  } catch (error) {
    logger.error({ error, orderId }, 'Error fetching shipments for order');
    return errorJson(
      ApiError.internal('Failed to fetch shipments for order'),
      requestId,
    );
  }
};
