/**
 * Fulfillment API Handlers
 *
 * Handles all fulfillment-related API endpoints.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

import { createFulfillmentService } from '@nabome/shipping';
import { FulfillmentStatus } from '@nabome/shipping';

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
// @ts-ignore - Shipping package will be built
// @ts-ignore - shipping package types
// @ts-ignore - shipping package types

/**
 * GET /fulfillment/queue
 * Get fulfillment queue items with optional filters
 */
export const getFulfillmentQueue: RouteHandler = async (
  request,
  context,
  _params,
) => {
  const requestId = context.requestId;
  const logger = withRequestId(getLogger(context.env), requestId);

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const assignedTo = url.searchParams.get('assignedTo');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    const prisma = getPrisma() as any;
    const fulfillmentService = createFulfillmentService(prisma);

    const queueItems = await fulfillmentService.getPendingFulfillmentQueue({
      status: (status as FulfillmentStatus) || undefined,
      assignedTo: assignedTo || undefined,
      limit,
      offset,
    });

    return okJson({ queueItems, total: queueItems.length }, requestId);
  } catch (error) {
    logger.error({ error }, 'Error fetching fulfillment queue');
    return errorJson(
      ApiError.internal('Failed to fetch fulfillment queue'),
      requestId,
    );
  }
};

/**
 * GET /fulfillment/{id}
 * Get a specific fulfillment queue item by ID
 */
export const getFulfillmentById: RouteHandler = async (
  _request,
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
    const fulfillmentService = createFulfillmentService(prisma);

    const fulfillmentItem = await (prisma.fulfillmentQueue.findUnique as any)({
      where: { id: id! },
      include: {
        order: {
          include: {
            items: true,
            shippingAddress: true,
          },
        },
        pickListItems: true,
      },
    });

    if (!fulfillmentItem) {
      return errorJson(
        ApiError.notFound('Fulfillment item not found'),
        requestId,
      );
    }

    return okJson({ fulfillmentItem }, requestId);
  } catch (error) {
    logger.error({ error, id }, 'Error fetching fulfillment item');
    return errorJson(
      ApiError.internal('Failed to fetch fulfillment item'),
      requestId,
    );
  }
};

/**
 * PATCH /fulfillment/{id}
 * Update a fulfillment queue item
 */
export const updateFulfillment: RouteHandler = async (
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
    const { status, assignedTo } = body;

    const prisma = getPrisma() as any;
    const fulfillmentService = createFulfillmentService(prisma);

    let result;
    if (status === FulfillmentStatus.IN_PROGRESS && assignedTo) {
      result = await fulfillmentService.startFulfillment(id!, assignedTo);
    } else if (status === FulfillmentStatus.COMPLETED) {
      result = await fulfillmentService.completeFulfillment(id!);
    } else if (status === FulfillmentStatus.FAILED) {
      result = await fulfillmentService.failFulfillment(id!);
    } else if (status === FulfillmentStatus.CANCELLED) {
      result = await fulfillmentService.cancelFulfillment(id!);
    } else {
      result = await fulfillmentService.assignFulfillmentItem(id!, assignedTo);
    }

    return okJson({ fulfillmentItem: result }, requestId);
  } catch (error) {
    logger.error({ error, id }, 'Error updating fulfillment item');
    return errorJson(
      ApiError.internal('Failed to update fulfillment item'),
      requestId,
    );
  }
};

/**
 * POST /fulfillment
 * Add an order to the fulfillment queue
 */
export const createFulfillment: RouteHandler = async (
  request,
  context,
  _params,
) => {
  const requestId = context.requestId;
  const logger = withRequestId(getLogger(context.env), requestId);

  try {
    const body = (await request.json()) as Record<string, any>;
    const { orderId, shipmentId, priority } = body;

    if (!orderId) {
      return errorJson(
        ApiError.badRequest('Missing required field: orderId'),
        requestId,
      );
    }

    const prisma = getPrisma() as any;
    const fulfillmentService = createFulfillmentService(prisma);

    const fulfillmentItem = await fulfillmentService.addToFulfillmentQueue(
      orderId,
      shipmentId || null,
      priority || 0,
    );

    return okJson({ fulfillmentItem }, requestId);
  } catch (error) {
    logger.error({ error }, 'Error creating fulfillment item');
    return errorJson(
      ApiError.internal('Failed to create fulfillment item'),
      requestId,
    );
  }
};
