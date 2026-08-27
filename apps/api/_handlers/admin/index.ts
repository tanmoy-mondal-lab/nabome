/**
 * Admin API Handlers
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md, REST_API_SPECIFICATION.md
 *
 * Admin endpoints for platform governance, operations, monitoring, and administration
 * Implements REST API for admin dashboard with strict RBAC and audit logging
 */

import { z } from 'zod';

import * as AdminService from '../../_lib/admin/service.ts';
import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { register } from '../register.ts';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for pagination query
 */
const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

/**
 * Schema for search query
 */
const searchSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  shopId: z.string().optional(),
  customerId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  ...paginationSchema.shape,
});

// ============================================================================
// PLATFORM OVERVIEW ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/admin/platform/kpis — Get platform KPIs
 */
export async function handleGetPlatformKPIs(
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

    const kpis = await AdminService.getPlatformKPIs();

    return okJson({ kpis }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch platform KPIs'),
      context.requestId,
    );
  }
}

// ============================================================================
// SHOP MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/admin/shops — List shops with filters
 */
export async function handleListShops(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const shops = await AdminService.listShops(query);

    return okJson({ shops, total: shops.length }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/admin/shops/:id/approve — Approve a shop
 */
export async function handleApproveShop(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  const userId = context.userId;
  const userRole = context.userRole;

  if (!userId || userRole !== 'admin') {
    return errorJson(
      ApiError.forbidden('Admin access required'),
      context.requestId,
    );
  }

  // Type guard: userId is guaranteed to be string after the check above
  const adminUserId = userId as string;

  try {
    const shopId = params.id!;
    const body = (await request.json()) as { reason?: string };
    const reason = body.reason || '';

    await AdminService.approveShop(shopId, adminUserId, reason);

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to approve shop'),
      context.requestId,
    );
  }
}

/**
 * POST /api/v1/admin/shops/:id/suspend — Suspend a shop
 */
export async function handleSuspendShop(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  const userId = context.userId;
  const userRole = context.userRole;

  if (!userId || userRole !== 'admin') {
    return errorJson(
      ApiError.forbidden('Admin access required'),
      context.requestId,
    );
  }

  const adminUserId = userId as string;

  try {
    const shopId = params.id!;
    const body = (await request.json()) as { reason?: string };
    const reason = body.reason || '';

    await AdminService.suspendShop(shopId, adminUserId, reason);

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to suspend shop'),
      context.requestId,
    );
  }
}

// ============================================================================
// CUSTOMER MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/admin/customers — List customers with filters
 */
export async function handleListCustomers(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const customers = await AdminService.listCustomers(query);

    return okJson({ customers, total: customers.length }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/admin/customers/:id/lock — Lock a customer account
 */
export async function handleLockCustomer(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  const userId = context.userId;
  const userRole = context.userRole;

  if (!userId || userRole !== 'admin') {
    return errorJson(
      ApiError.forbidden('Admin access required'),
      context.requestId,
    );
  }

  const adminUserId = userId as string;

  try {
    const customerId = params.id!;
    const body = (await request.json()) as { reason?: string };
    const reason = body.reason || '';

    await AdminService.lockCustomer(customerId, adminUserId, reason);

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to lock customer'),
      context.requestId,
    );
  }
}

/**
 * POST /api/v1/admin/customers/:id/unlock — Unlock a customer account
 */
export async function handleUnlockCustomer(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  const userId = context.userId;
  const userRole = context.userRole;

  if (!userId || userRole !== 'admin') {
    return errorJson(
      ApiError.forbidden('Admin access required'),
      context.requestId,
    );
  }

  const adminUserId = userId as string;

  try {
    const customerId = params.id!;
    const body = (await request.json()) as { reason?: string };
    const reason = body.reason || '';

    await AdminService.unlockCustomer(customerId, adminUserId, reason);

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to unlock customer'),
      context.requestId,
    );
  }
}

// ============================================================================
// PRODUCT GOVERNANCE ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/admin/products/search — Search products globally
 */
export async function handleSearchProducts(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const products = await AdminService.searchProducts(query);

    return okJson({ products, total: products.length }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/admin/products/moderation-queue — Get moderation queue
 */
export async function handleGetModerationQueue(
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
    const query = paginationSchema.parse(Object.fromEntries(url.searchParams));

    const queue = await AdminService.getModerationQueue(query);

    return okJson({ queue, total: queue.length }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/admin/products/:id/approve — Approve a product
 */
export async function handleApproveProduct(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  const userId = context.userId;
  const userRole = context.userRole;

  if (!userId || userRole !== 'admin') {
    return errorJson(
      ApiError.forbidden('Admin access required'),
      context.requestId,
    );
  }

  const adminUserId = userId as string;

  try {
    const productId = params.id!;

    await AdminService.approveProduct(productId, adminUserId);

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to approve product'),
      context.requestId,
    );
  }
}

/**
 * POST /api/v1/admin/products/:id/reject — Reject a product
 */
export async function handleRejectProduct(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  const userId = context.userId;
  const userRole = context.userRole;

  if (!userId || userRole !== 'admin') {
    return errorJson(
      ApiError.forbidden('Admin access required'),
      context.requestId,
    );
  }

  const adminUserId = userId as string;

  try {
    const productId = params.id!;
    const body = (await request.json()) as { reason?: string };
    const reason = body.reason || '';

    await AdminService.rejectProduct(productId, adminUserId, reason);

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to reject product'),
      context.requestId,
    );
  }
}

// ============================================================================
// SECURITY OPERATIONS ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/admin/security/sessions — Get active sessions
 */
export async function handleGetActiveSessions(
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
    const query = paginationSchema.parse(Object.fromEntries(url.searchParams));

    const sessions = await AdminService.getActiveSessions(query);

    return okJson({ sessions, total: sessions.length }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * DELETE /api/v1/admin/security/sessions/:id — Revoke a session
 */
export async function handleRevokeSession(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  const userId = context.userId;
  const userRole = context.userRole;

  if (!userId || userRole !== 'admin') {
    return errorJson(
      ApiError.forbidden('Admin access required'),
      context.requestId,
    );
  }

  const adminUserId = userId as string;

  try {
    const sessionId = params.id!;

    await AdminService.revokeSession(sessionId, adminUserId);

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to revoke session'),
      context.requestId,
    );
  }
}

// ============================================================================
// SYSTEM OPERATIONS ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/admin/system/health — Get system health status
 */
export async function handleGetSystemHealth(
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

    const health = await AdminService.getSystemHealth();

    return okJson({ health }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch system health'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/admin/system/jobs — Get background jobs
 */
export async function handleGetBackgroundJobs(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const jobs = await AdminService.getBackgroundJobs(query);

    return okJson({ jobs, total: jobs.length }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

// ============================================================================
// PAYMENTS GOVERNANCE
// ============================================================================

/**
 * GET /api/v1/admin/payments/health — Get payment provider health
 */
export async function handleGetPaymentProviderHealth(
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

    const health = await AdminService.getPaymentProviderHealth();

    return okJson({ health }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch payment provider health'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/admin/payments/transactions — Search transactions
 */
export async function handleSearchTransactions(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const transactions = await AdminService.searchTransactions(query);

    return okJson(
      { transactions, total: transactions.length },
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
 * GET /api/v1/admin/payments/settlements — Get settlement monitoring
 */
export async function handleGetSettlements(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const settlements = await AdminService.getSettlements(query);

    return okJson(
      { settlements, total: settlements.length },
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
 * GET /api/v1/admin/payments/refunds — Get refund monitoring
 */
export async function handleGetRefunds(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const refunds = await AdminService.getRefunds(query);

    return okJson({ refunds, total: refunds.length }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/admin/payments/exceptions — Get financial exceptions
 */
export async function handleGetFinancialExceptions(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const exceptions = await AdminService.getFinancialExceptions(query);

    return okJson({ exceptions, total: exceptions.length }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

// ============================================================================
// RETURNS GOVERNANCE
// ============================================================================

/**
 * GET /api/v1/admin/returns/queue — Get global returns queue
 */
export async function handleGetReturnsQueue(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const returns = await AdminService.getReturnsQueue(query);

    return okJson({ returns, total: returns.length }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/admin/returns/:id/override-policy — Override return policy
 */
export async function handleOverrideReturnPolicy(
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

    const adminUserId = userId as string;
    const returnId = params.id!;
    const body = (await request.json()) as { reason?: string };
    const reason = body.reason || '';

    await AdminService.overrideReturnPolicy(returnId, adminUserId, reason);

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to override return policy'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/admin/returns/disputes — Get dispute resolution queue
 */
export async function handleGetDisputes(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const disputes = await AdminService.getDisputes(query);

    return okJson({ disputes, total: disputes.length }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/admin/returns/fraud-review — Get fraud review queue
 */
export async function handleGetFraudReview(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const fraudReviews = await AdminService.getFraudReview(query);

    return okJson(
      { fraudReviews, total: fraudReviews.length },
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
// ORDER GOVERNANCE
// ============================================================================

/**
 * GET /api/v1/admin/orders/search — Global order search
 */
export async function handleSearchOrders(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const orders = await AdminService.searchOrders(query);

    return okJson({ orders, total: orders.length }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/admin/orders/exceptions — Get exception queue
 */
export async function handleGetOrderExceptions(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const exceptions = await AdminService.getOrderExceptions(query);

    return okJson({ exceptions, total: exceptions.length }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/admin/orders/:id/intervene — Manual intervention
 */
export async function handleManualIntervention(
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

    const adminUserId = userId as string;
    const orderId = params.id!;
    const body = (await request.json()) as { action: string; reason?: string };
    const { action, reason } = body;

    await AdminService.manualIntervention(orderId, action, adminUserId, reason);

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to perform manual intervention'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/admin/orders/:id/audit-timeline — Get audit timeline
 */
export async function handleGetOrderAuditTimeline(
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

    const orderId = params.id!;
    const timeline = await AdminService.getOrderAuditTimeline(orderId);

    return okJson({ timeline }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch audit timeline'),
      context.requestId,
    );
  }
}

// ============================================================================
// SECURITY OPERATIONS
// ============================================================================

/**
 * GET /api/v1/admin/security/audit-logs — Get audit logs
 */
export async function handleGetAuditLogs(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const logs = await AdminService.getAuditLogs(query);

    return okJson({ logs, total: logs.length }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/admin/security/rbac — Get RBAC configuration
 */
export async function handleGetRBAC(
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

    const rbac = await AdminService.getRBAC();

    return okJson({ rbac }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch RBAC configuration'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/admin/security/permissions — Get permission matrix
 */
export async function handleGetPermissions(
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

    const permissions = await AdminService.getPermissions();

    return okJson({ permissions }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch permission matrix'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/admin/security/failed-logins — Get failed login monitoring
 */
export async function handleGetFailedLogins(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const failedLogins = await AdminService.getFailedLogins(query);

    return okJson(
      { failedLogins, total: failedLogins.length },
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
 * GET /api/v1/admin/security/alerts — Get security alerts
 */
export async function handleGetSecurityAlerts(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const alerts = await AdminService.getSecurityAlerts(query);

    return okJson({ alerts, total: alerts.length }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

// ============================================================================
// REPORTS
// ============================================================================

/**
 * GET /api/v1/admin/reports/revenue — Generate revenue report
 */
export async function handleGenerateRevenueReport(
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

    const adminUserId = userId as string;
    const url = new URL(request.url);
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const report = await AdminService.generateRevenueReport(query, adminUserId);

    return okJson({ report }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/admin/reports/commerce — Generate commerce report
 */
export async function handleGenerateCommerceReport(
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

    const adminUserId = userId as string;
    const url = new URL(request.url);
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const report = await AdminService.generateCommerceReport(
      query,
      adminUserId,
    );

    return okJson({ report }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/admin/reports/customers — Generate customer report
 */
export async function handleGenerateCustomerReport(
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

    const adminUserId = userId as string;
    const url = new URL(request.url);
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const report = await AdminService.generateCustomerReport(
      query,
      adminUserId,
    );

    return okJson({ report }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/admin/reports/shops — Generate shop report
 */
export async function handleGenerateShopReport(
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

    const adminUserId = userId as string;
    const url = new URL(request.url);
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const report = await AdminService.generateShopReport(query, adminUserId);

    return okJson({ report }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/admin/reports/security — Generate security report
 */
export async function handleGenerateSecurityReport(
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

    const adminUserId = userId as string;
    const url = new URL(request.url);
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const report = await AdminService.generateSecurityReport(
      query,
      adminUserId,
    );

    return okJson({ report }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/admin/reports/audit — Generate audit report
 */
export async function handleGenerateAuditReport(
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

    const adminUserId = userId as string;
    const url = new URL(request.url);
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const report = await AdminService.generateAuditReport(query, adminUserId);

    return okJson({ report }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/admin/reports/operations — Generate operations report
 */
export async function handleGenerateOperationsReport(
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

    const adminUserId = userId as string;
    const url = new URL(request.url);
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const report = await AdminService.generateOperationsReport(
      query,
      adminUserId,
    );

    return okJson({ report }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * GET /api/v1/admin/analytics/commerce — Get commerce analytics
 */
export async function handleGetCommerceAnalytics(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const analytics = await AdminService.getCommerceAnalytics(query);

    return okJson({ analytics }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/admin/analytics/operational — Get operational analytics
 */
export async function handleGetOperationalAnalytics(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const analytics = await AdminService.getOperationalAnalytics(query);

    return okJson({ analytics }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/admin/analytics/security — Get security analytics
 */
export async function handleGetSecurityAnalytics(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const analytics = await AdminService.getSecurityAnalytics(query);

    return okJson({ analytics }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/admin/analytics/performance — Get performance analytics
 */
export async function handleGetPerformanceAnalytics(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const analytics = await AdminService.getPerformanceAnalytics(query);

    return okJson({ analytics }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/admin/analytics/customers — Get customer analytics
 */
export async function handleGetCustomerAnalytics(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const analytics = await AdminService.getCustomerAnalytics(query);

    return okJson({ analytics }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/admin/analytics/shops — Get shop analytics
 */
export async function handleGetShopAnalytics(
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
    const query = searchSchema.parse(Object.fromEntries(url.searchParams));

    const analytics = await AdminService.getShopAnalytics(query);

    return okJson({ analytics }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

// ============================================================================
// SETTINGS
// ============================================================================

/**
 * GET /api/v1/admin/settings/global — Get global settings
 */
export async function handleGetGlobalSettings(
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

    const settings = await AdminService.getGlobalSettings();

    return okJson({ settings }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch global settings'),
      context.requestId,
    );
  }
}

/**
 * PUT /api/v1/admin/settings/global — Update global settings
 */
export async function handleUpdateGlobalSettings(
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

    const adminUserId = userId as string;
    const body = (await request.json()) as Record<string, any>;

    const settings = await AdminService.updateGlobalSettings(body, adminUserId);

    return okJson({ settings }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to update global settings'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/admin/settings/tax — Get tax settings
 */
export async function handleGetTaxSettings(
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

    const settings = await AdminService.getTaxSettings();

    return okJson({ settings }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch tax settings'),
      context.requestId,
    );
  }
}

/**
 * PUT /api/v1/admin/settings/tax — Update tax settings
 */
export async function handleUpdateTaxSettings(
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

    const adminUserId = userId as string;
    const body = (await request.json()) as Record<string, any>;

    const settings = await AdminService.updateTaxSettings(body, adminUserId);

    return okJson({ settings }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to update tax settings'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/admin/settings/commission — Get commission settings
 */
export async function handleGetCommissionSettings(
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

    const settings = await AdminService.getCommissionSettings();

    return okJson({ settings }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch commission settings'),
      context.requestId,
    );
  }
}

/**
 * PUT /api/v1/admin/settings/commission — Update commission settings
 */
export async function handleUpdateCommissionSettings(
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

    const adminUserId = userId as string;
    const body = (await request.json()) as Record<string, any>;

    const settings = await AdminService.updateCommissionSettings(
      body,
      adminUserId,
    );

    return okJson({ settings }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to update commission settings'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/admin/settings/shipping — Get shipping defaults
 */
export async function handleGetShippingSettings(
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

    const settings = await AdminService.getShippingSettings();

    return okJson({ settings }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch shipping settings'),
      context.requestId,
    );
  }
}

/**
 * PUT /api/v1/admin/settings/shipping — Update shipping defaults
 */
export async function handleUpdateShippingSettings(
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

    const adminUserId = userId as string;
    const body = (await request.json()) as Record<string, any>;

    const settings = await AdminService.updateShippingSettings(
      body,
      adminUserId,
    );

    return okJson({ settings }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to update shipping settings'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/admin/settings/payment — Get payment provider configuration
 */
export async function handleGetPaymentSettings(
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

    const settings = await AdminService.getPaymentSettings();

    return okJson({ settings }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch payment settings'),
      context.requestId,
    );
  }
}

/**
 * PUT /api/v1/admin/settings/payment — Update payment provider configuration
 */
export async function handleUpdatePaymentSettings(
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

    const adminUserId = userId as string;
    const body = (await request.json()) as Record<string, any>;

    const settings = await AdminService.updatePaymentSettings(
      body,
      adminUserId,
    );

    return okJson({ settings }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to update payment settings'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/admin/settings/cms — Get CMS defaults
 */
export async function handleGetCMSSettings(
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

    const settings = await AdminService.getCMSSettings();

    return okJson({ settings }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch CMS settings'),
      context.requestId,
    );
  }
}

/**
 * PUT /api/v1/admin/settings/cms — Update CMS defaults
 */
export async function handleUpdateCMSSettings(
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

    const adminUserId = userId as string;
    const body = (await request.json()) as Record<string, any>;

    const settings = await AdminService.updateCMSSettings(body, adminUserId);

    return okJson({ settings }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to update CMS settings'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/admin/settings/notifications — Get notification templates
 */
export async function handleGetNotificationSettings(
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

    const settings = await AdminService.getNotificationSettings();

    return okJson({ settings }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch notification settings'),
      context.requestId,
    );
  }
}

/**
 * PUT /api/v1/admin/settings/notifications — Update notification templates
 */
export async function handleUpdateNotificationSettings(
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

    const adminUserId = userId as string;
    const body = (await request.json()) as Record<string, any>;

    const settings = await AdminService.updateNotificationSettings(
      body,
      adminUserId,
    );

    return okJson({ settings }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to update notification settings'),
      context.requestId,
    );
  }
}

/**
 * GET /api/v1/admin/settings/feature-flags — Get feature flags
 */
export async function handleGetFeatureFlags(
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

    const flags = await AdminService.getFeatureFlags();

    return okJson({ flags }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to fetch feature flags'),
      context.requestId,
    );
  }
}

/**
 * PUT /api/v1/admin/settings/feature-flags/:id — Update feature flag
 */
export async function handleUpdateFeatureFlag(
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

    const adminUserId = userId as string;
    const flagId = params.id!;
    const body = (await request.json()) as {
      enabled: boolean;
      reason?: string;
    };

    const flag = await AdminService.updateFeatureFlag(
      flagId,
      body.enabled,
      adminUserId,
      body.reason,
    );

    return okJson({ flag }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to update feature flag'),
      context.requestId,
    );
  }
}

// ============================================================================
// ROUTE REGISTRATION
// ============================================================================

// Platform overview
register('GET', 'admin/platform/kpis', handleGetPlatformKPIs);

// Shop management
register('GET', 'admin/shops', handleListShops);
register('POST', 'admin/shops/:id/approve', handleApproveShop);
register('POST', 'admin/shops/:id/suspend', handleSuspendShop);

// Customer management
register('GET', 'admin/customers', handleListCustomers);
register('POST', 'admin/customers/:id/lock', handleLockCustomer);
register('POST', 'admin/customers/:id/unlock', handleUnlockCustomer);

// Product governance
register('GET', 'admin/products/search', handleSearchProducts);
register('GET', 'admin/products/moderation-queue', handleGetModerationQueue);
register('POST', 'admin/products/:id/approve', handleApproveProduct);
register('POST', 'admin/products/:id/reject', handleRejectProduct);

// Security operations
register('GET', 'admin/security/audit-logs', handleGetAuditLogs);
register('GET', 'admin/security/sessions', handleGetActiveSessions);
register('DELETE', 'admin/security/sessions/:id', handleRevokeSession);
register('GET', 'admin/security/rbac', handleGetRBAC);
register('GET', 'admin/security/permissions', handleGetPermissions);
register('GET', 'admin/security/failed-logins', handleGetFailedLogins);
register('GET', 'admin/security/alerts', handleGetSecurityAlerts);

// System operations
register('GET', 'admin/system/health', handleGetSystemHealth);
register('GET', 'admin/system/jobs', handleGetBackgroundJobs);

// Payments governance
register('GET', 'admin/payments/health', handleGetPaymentProviderHealth);
register('GET', 'admin/payments/transactions', handleSearchTransactions);
register('GET', 'admin/payments/settlements', handleGetSettlements);
register('GET', 'admin/payments/refunds', handleGetRefunds);
register('GET', 'admin/payments/exceptions', handleGetFinancialExceptions);

// Returns governance
register('GET', 'admin/returns/queue', handleGetReturnsQueue);
register(
  'POST',
  'admin/returns/:id/override-policy',
  handleOverrideReturnPolicy,
);
register('GET', 'admin/returns/disputes', handleGetDisputes);
register('GET', 'admin/returns/fraud-review', handleGetFraudReview);

// Order governance
register('GET', 'admin/orders/search', handleSearchOrders);
register('GET', 'admin/orders/exceptions', handleGetOrderExceptions);
register('POST', 'admin/orders/:id/intervene', handleManualIntervention);
register('GET', 'admin/orders/:id/audit-timeline', handleGetOrderAuditTimeline);

// Reports
register('GET', 'admin/reports/revenue', handleGenerateRevenueReport);
register('GET', 'admin/reports/commerce', handleGenerateCommerceReport);
register('GET', 'admin/reports/customers', handleGenerateCustomerReport);
register('GET', 'admin/reports/shops', handleGenerateShopReport);
register('GET', 'admin/reports/security', handleGenerateSecurityReport);
register('GET', 'admin/reports/audit', handleGenerateAuditReport);
register('GET', 'admin/reports/operations', handleGenerateOperationsReport);

// Analytics
register('GET', 'admin/analytics/commerce', handleGetCommerceAnalytics);
register('GET', 'admin/analytics/operational', handleGetOperationalAnalytics);
register('GET', 'admin/analytics/security', handleGetSecurityAnalytics);
register('GET', 'admin/analytics/performance', handleGetPerformanceAnalytics);
register('GET', 'admin/analytics/customers', handleGetCustomerAnalytics);
register('GET', 'admin/analytics/shops', handleGetShopAnalytics);

// Settings
register('GET', 'admin/settings/global', handleGetGlobalSettings);
register('PUT', 'admin/settings/global', handleUpdateGlobalSettings);
register('GET', 'admin/settings/tax', handleGetTaxSettings);
register('PUT', 'admin/settings/tax', handleUpdateTaxSettings);
register('GET', 'admin/settings/commission', handleGetCommissionSettings);
register('PUT', 'admin/settings/commission', handleUpdateCommissionSettings);
register('GET', 'admin/settings/shipping', handleGetShippingSettings);
register('PUT', 'admin/settings/shipping', handleUpdateShippingSettings);
register('GET', 'admin/settings/payment', handleGetPaymentSettings);
register('PUT', 'admin/settings/payment', handleUpdatePaymentSettings);
register('GET', 'admin/settings/cms', handleGetCMSSettings);
register('PUT', 'admin/settings/cms', handleUpdateCMSSettings);
register('GET', 'admin/settings/notifications', handleGetNotificationSettings);
register(
  'PUT',
  'admin/settings/notifications',
  handleUpdateNotificationSettings,
);
register('GET', 'admin/settings/feature-flags', handleGetFeatureFlags);
register('PUT', 'admin/settings/feature-flags/:id', handleUpdateFeatureFlag);
