/**
 * Tracking API Handlers
 *
 * Handles all tracking-related API endpoints.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

import { PrismaClient } from '@prisma/client';

import { createTrackingService } from '@nabome/shipping';
import type { TrackingEventType, ActorType } from '@nabome/shipping';

import type { RequestContext } from '../../_lib/http/context.ts';
import {
  ApiError,
  errorJson,
  getLogger,
  okJson,
  withRequestId,
} from '../../_lib/index.ts';
import type { RouteHandler } from '../register.ts';
// @ts-ignore - Prisma client will be available in runtime
// @ts-ignore - Shipping package will be built
// @ts-ignore - shipping package types
// @ts-ignore - shipping package types

/**
 * GET /shipments/{id}/tracking
 * Get tracking timeline for a shipment
 */
export const getTrackingTimeline: RouteHandler = async (
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
    const prisma = new PrismaClient();
    const trackingService = createTrackingService(prisma);

    const timeline = await trackingService.getTrackingTimeline(id!);
    await prisma.$disconnect();

    if (!timeline) {
      return errorJson(ApiError.notFound('Shipment not found'), requestId);
    }

    return okJson({ timeline }, requestId);
  } catch (error) {
    logger.error({ error, id }, 'Error fetching tracking timeline');
    return errorJson(
      ApiError.internal('Failed to fetch tracking timeline'),
      requestId,
    );
  }
};

/**
 * GET /tracking/{trackingNumber}
 * Get tracking timeline by tracking number
 */
export const getTrackingByNumber: RouteHandler = async (
  _request,
  context,
  params,
) => {
  const requestId = context.requestId;
  const logger = withRequestId(getLogger(context.env), requestId);
  const { trackingNumber } = params;
  if (!trackingNumber)
    return errorJson(
      ApiError.badRequest('Missing trackingNumber'),
      context.requestId,
    );

  try {
    const prisma = new PrismaClient();
    const trackingService = createTrackingService(prisma);

    const timeline = await trackingService.getTrackingTimelineByNumber(
      trackingNumber!,
    );
    await prisma.$disconnect();

    if (!timeline) {
      return errorJson(
        ApiError.notFound('Tracking number not found'),
        requestId,
      );
    }

    return okJson({ timeline }, requestId);
  } catch (error) {
    logger.error(
      { error, trackingNumber },
      'Error fetching tracking by number',
    );
    return errorJson(ApiError.internal('Failed to fetch tracking'), requestId);
  }
};

/**
 * POST /shipments/{id}/tracking/events
 * Add a tracking event to a shipment
 */
export const addTrackingEvent: RouteHandler = async (
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
    const { status, location, description, actorType, actorId, metadata } =
      body;

    if (!status || !description) {
      return errorJson(
        ApiError.badRequest('Missing required fields'),
        requestId,
      );
    }

    const prisma = new PrismaClient();
    const trackingService = createTrackingService(prisma);

    const result = await trackingService.addTrackingEvent(
      id!,
      status as TrackingEventType,
      location || null,
      description,
      actorType as ActorType,
      actorId || null,
      metadata,
    );

    await prisma.$disconnect();

    if (!result.success) {
      return errorJson(
        ApiError.badRequest(result.error || 'Failed to add tracking event'),
        requestId,
      );
    }

    return okJson({ result }, requestId);
  } catch (error) {
    logger.error({ error, id }, 'Error adding tracking event');
    return errorJson(
      ApiError.internal('Failed to add tracking event'),
      requestId,
    );
  }
};
