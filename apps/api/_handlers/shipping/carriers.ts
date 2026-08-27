/**
 * Carrier API Handlers
 *
 * Handles all carrier-related API endpoints.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

import { PrismaClient } from '@prisma/client';

import { createCarrierService } from '@nabome/shipping';
import type { CarrierType } from '@nabome/shipping';

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
 * GET /carriers
 * Get all carriers
 */
export const getCarriers: RouteHandler = async (_request, context, _params) => {
  const requestId = context.requestId;
  const logger = withRequestId(getLogger(context.env), requestId);

  try {
    const prisma = new PrismaClient();
    const carrierService = createCarrierService(prisma);

    const carriers = await carrierService.getCarriers();
    await prisma.$disconnect();

    return okJson({ carriers }, requestId);
  } catch (error) {
    logger.error({ error }, 'Error fetching carriers');
    return errorJson(ApiError.internal('Failed to fetch carriers'), requestId);
  }
};

/**
 * GET /carriers/{code}
 * Get a specific carrier by code
 */
export const getCarrierById: RouteHandler = async (
  _request,
  context,
  params,
) => {
  const requestId = context.requestId;
  const logger = withRequestId(getLogger(context.env), requestId);
  const { code } = params;
  if (!code)
    return errorJson(ApiError.badRequest('Missing code'), context.requestId);

  try {
    const prisma = new PrismaClient();
    const carrierService = createCarrierService(prisma);

    const carrier = await carrierService.getCarrierByCode(code! as CarrierType);
    await prisma.$disconnect();

    if (!carrier) {
      return errorJson(ApiError.notFound('Carrier not found'), requestId);
    }

    return okJson({ carrier }, requestId);
  } catch (error) {
    logger.error({ error, code }, 'Error fetching carrier');
    return errorJson(ApiError.internal('Failed to fetch carrier'), requestId);
  }
};

/**
 * POST /carriers
 * Register a new carrier
 */
export const registerCarrier: RouteHandler = async (
  request,
  context,
  _params,
) => {
  const requestId = context.requestId;
  const logger = withRequestId(getLogger(context.env), requestId);

  try {
    const body = (await request.json()) as Record<string, any>;
    const { code, name, displayName, config, trackingUrlTemplate } = body;

    if (!code || !name || !displayName) {
      return errorJson(
        ApiError.badRequest('Missing required fields'),
        requestId,
      );
    }

    const prisma = new PrismaClient();
    const carrierService = createCarrierService(prisma);

    const carrier = await carrierService.registerCarrier(
      code as CarrierType,
      name,
      displayName,
      config,
      trackingUrlTemplate,
    );

    await prisma.$disconnect();

    return okJson({ carrier }, requestId);
  } catch (error) {
    logger.error({ error }, 'Error registering carrier');
    return errorJson(
      ApiError.internal('Failed to register carrier'),
      requestId,
    );
  }
};

/**
 * PATCH /carriers/{code}
 * Update carrier configuration
 */
export const updateCarrier: RouteHandler = async (request, context, params) => {
  const requestId = context.requestId;
  const logger = withRequestId(getLogger(context.env), requestId);
  const { code } = params;
  if (!code)
    return errorJson(ApiError.badRequest('Missing code'), context.requestId);

  try {
    const body = (await request.json()) as Record<string, any>;
    const { config } = body;

    const prisma = new PrismaClient();
    const carrierService = createCarrierService(prisma);

    const carrier = await carrierService.updateCarrierConfig(
      code! as CarrierType,
      config,
    );
    await prisma.$disconnect();

    if (!carrier) {
      return errorJson(ApiError.notFound('Carrier not found'), requestId);
    }

    return okJson({ carrier }, requestId);
  } catch (error) {
    logger.error({ error, code }, 'Error updating carrier');
    return errorJson(ApiError.internal('Failed to update carrier'), requestId);
  }
};

/**
 * POST /carriers/rates
 * Calculate shipping rates
 */
export const calculateRates: RouteHandler = async (
  request,
  context,
  _params,
) => {
  const requestId = context.requestId;
  const logger = withRequestId(getLogger(context.env), requestId);

  try {
    const body = (await request.json()) as Record<string, any>;
    const { origin, destination, weight, dimensions, shippingMethods } = body;

    if (!origin || !destination || !weight) {
      return errorJson(
        ApiError.badRequest('Missing required fields'),
        requestId,
      );
    }

    const prisma = new PrismaClient();
    const carrierService = createCarrierService(prisma);

    const rates = await carrierService.calculateRates({
      origin,
      destination,
      weight,
      dimensions: dimensions || { length: 0, width: 0, height: 0 },
      shippingMethods,
    });

    await prisma.$disconnect();

    return okJson({ rates }, requestId);
  } catch (error) {
    logger.error({ error }, 'Error calculating rates');
    return errorJson(ApiError.internal('Failed to calculate rates'), requestId);
  }
};
