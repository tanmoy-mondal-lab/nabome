/**
 * Dashboard API Handlers
 * Source: SHOP_OWNER_DASHBOARD_ARCHITECTURE.md, REST_API_SPECIFICATION.md
 *
 * Dashboard endpoints for shop owner business overview
 * Implements REST API for dashboard KPIs, analytics, and activity
 */

import { z } from 'zod';

import { DashboardService } from '../../_lib/dashboard/service.ts';
import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { register } from '../register.ts';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for revenue period query
 */
const revenuePeriodSchema = z.object({
  period: z.enum(['today', '7d', '30d', '90d', 'custom']).default('today'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * Schema for dashboard query options
 */
const dashboardQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
});

// ============================================================================
// SHOP OWNER DASHBOARD ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/shop/dashboard — Get complete dashboard data
 */
export async function handleGetShopDashboard(
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

    const dashboardData = await DashboardService.getDashboardData(userId);

    return okJson({ dashboard: dashboardData }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch dashboard data'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/shop/analytics/revenue — Get revenue summary
 */
export async function handleGetRevenueSummary(
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
    const query = revenuePeriodSchema.parse(
      Object.fromEntries(url.searchParams),
    );

    const revenueSummary = await DashboardService.getRevenueSummary(
      userId,
      query,
    );

    return okJson({ revenue: revenueSummary }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/shop/orders/summary — Get orders summary
 */
export async function handleGetOrdersSummary(
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

    const ordersSummary = await DashboardService.getOrdersSummary(userId);

    return okJson({ orders: ordersSummary }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch orders summary'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/shop/finance/earnings — Get earnings summary
 */
export async function handleGetEarningsSummary(
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

    const earningsSummary = await DashboardService.getEarningsSummary(userId);

    return okJson({ earnings: earningsSummary }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch earnings summary'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/shop/inventory/alerts — Get inventory alerts
 */
export async function handleGetInventoryAlerts(
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
    const query = dashboardQuerySchema.parse(
      Object.fromEntries(url.searchParams),
    );

    const alerts = await DashboardService.getInventoryAlerts(userId, query);

    return okJson({ alerts, total: alerts.length }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch inventory alerts'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/shop/activity — Get recent activity
 */
export async function handleGetRecentActivity(
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
    const query = dashboardQuerySchema.parse(
      Object.fromEntries(url.searchParams),
    );

    const activity = await DashboardService.getRecentActivity(userId, query);

    return okJson({ activity, total: activity.length }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch recent activity'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/shop/analytics/performance — Get performance metrics
 */
export async function handleGetPerformanceMetrics(
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

    const performance = await DashboardService.getPerformanceMetrics(userId);

    return okJson({ performance }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch performance metrics'),
      context.requestId,
    );
  }
}

// ============================================================================
// ROUTE REGISTRATION
// ============================================================================

// Shop owner dashboard routes
register('GET', 'shop/dashboard', handleGetShopDashboard);
register('GET', 'shop/analytics/revenue', handleGetRevenueSummary);
register('GET', 'shop/orders/summary', handleGetOrdersSummary);
register('GET', 'shop/finance/earnings', handleGetEarningsSummary);
register('GET', 'shop/inventory/alerts', handleGetInventoryAlerts);
register('GET', 'shop/activity', handleGetRecentActivity);
register('GET', 'shop/analytics/performance', handleGetPerformanceMetrics);
