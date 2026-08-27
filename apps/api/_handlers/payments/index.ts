/**
 * Payments API handlers — PAY-01..PAY-06 (REST_API_SPECIFICATION §7.16).
 *
 * Binding: PAYMENT_ENGINE_ARCHITECTURE.md — provider neutrality, refund
 * aggregates derived on read (ML-03), gateway source of truth (PAYMENT §9.8),
 * masked PII on list views, gateway fetch only through adapter contracts.
 */
import {
  deriveRefundAggregate,
  deriveOrderPaymentSubStatus,
  toPaise,
  createPaymentService,
  type PaymentProvider,
  type PaymentStatus,
  type RefundType,
  type RefundStatus,
} from '@nabome/payment';

import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson } from '../../_lib/http/response.ts';
import { resolveGateway } from '../../_lib/payment/gateway.ts';
import {
  buildReconReport,
  runReconciliation,
} from '../../_lib/payment/reconciliation.ts';
import { getPrisma } from '../../_lib/prisma.ts';
import { register } from '../register.ts';

// ──────────────────────────────────────────────────────────────────────────────
// PAY-01 · Payment methods
// ──────────────────────────────────────────────────────────────────────────────

async function paymentMethods(
  _request: Request,
  context: RequestContext,
): Promise<Response> {
  const env = context.env;
  const methods = [
    { id: 'razorpay', name: 'Razorpay', type: 'online', enabled: true },
  ];
  // COD available only when enabled globally and order ≤ max amount (BL §5.3.2).
  const codEnabled = (env.COD_ENABLED ?? 'false') === 'true';
  if (codEnabled) {
    methods.push({
      id: 'cod',
      name: 'Cash on Delivery',
      type: 'cod',
      enabled: true,
    });
  }
  return okJson({ methods }, context.requestId);
}

// ──────────────────────────────────────────────────────────────────────────────
// PAY-02 · Payment detail (refund aggregate derived — ML-03)
// ──────────────────────────────────────────────────────────────────────────────

async function paymentDetail(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  const prisma = getPrisma();
  const payment = await prisma.payment.findUnique({
    where: { id: params.id ?? '' },
    include: {
      order: { select: { id: true, shopId: true, userId: true } },
      refunds: {
        where: { isActive: true },
        select: { amount: true, status: true },
      },
    },
  });
  if (!payment) throw ApiError.notFound('Payment not found');
  await assertPaymentAccess(
    context,
    payment.order.userId,
    payment.order.shopId,
  );

  const aggregate = deriveRefundAggregate({
    paymentAmount: toPaise(payment.amount.toString()),
    refunds: payment.refunds.map((r) => ({
      amount: toPaise(r.amount.toString()),
      status: r.status as never,
    })),
  });

  return okJson(
    {
      paymentId: payment.id,
      orderId: payment.orderId,
      amount: payment.amount.toString(),
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      gatewayReference:
        context.userRole === 'admin' || context.userRole === 'shop_owner'
          ? payment.gatewayReference
          : undefined,
      failureReason: payment.failureReason,
      retryable: payment.status === 'failed' || payment.status === 'expired',
      expiresAt: payment.expiresAt,
      createdAt: payment.createdAt,
      refund: {
        refundedAmount: aggregate.refundedAmount / 100,
        remainingRefundable: aggregate.remainingRefundable / 100,
        aggregateStatus: aggregate.status,
      },
    },
    context.requestId,
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// PAY-03 · Order payment sub-status (CC-28 derived)
// ──────────────────────────────────────────────────────────────────────────────

async function orderPayment(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  const prisma = getPrisma();
  const order = await prisma.order.findUnique({
    where: { id: params.id ?? '' },
    include: {
      payments: {
        where: { isActive: true },
        include: {
          refunds: {
            where: { isActive: true },
            select: { amount: true, status: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
  if (!order) throw ApiError.notFound('Order not found');
  await assertPaymentAccess(context, order.userId, order.shopId);

  const payment = order.payments[0];
  if (!payment) {
    return okJson(
      {
        orderId: order.id,
        payment: null,
        paymentSubStatus: order.paymentSubStatus,
        refunds: [],
      },
      context.requestId,
    );
  }

  const aggregate = deriveRefundAggregate({
    paymentAmount: toPaise(payment.amount.toString()),
    refunds: payment.refunds.map((r) => ({
      amount: toPaise(r.amount.toString()),
      status: r.status as never,
    })),
  });
  const paymentStatus = aggregate.status ?? payment.status;
  const subStatus = deriveOrderPaymentSubStatus(
    paymentStatus as never,
    aggregate,
  );

  return okJson(
    {
      orderId: order.id,
      payment: {
        paymentId: payment.id,
        amount: payment.amount.toString(),
        currency: payment.currency,
        method: payment.method,
        status: paymentStatus,
      },
      paymentSubStatus: subStatus,
      refunds: payment.refunds.map((r) => ({
        amount: r.amount.toString(),
        status: r.status,
      })),
      refundedAmount: aggregate.refundedAmount / 100,
      remainingRefundable: aggregate.remainingRefundable / 100,
    },
    context.requestId,
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// PAY-04 · Payment list (shop/admin; masked PII)
// ──────────────────────────────────────────────────────────────────────────────

async function paymentList(
  request: Request,
  context: RequestContext,
): Promise<Response> {
  const prisma = getPrisma();
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const method = url.searchParams.get('method');
  const orderId = url.searchParams.get('orderId');
  const dateFrom = url.searchParams.get('dateFrom');
  const dateTo = url.searchParams.get('dateTo');
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const pageSize = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get('pageSize') ?? 20)),
  );

  if (context.userRole !== 'admin' && context.userRole !== 'shop_owner') {
    throw ApiError.forbidden(
      'Payment list requires shop owner or admin access',
    );
  }

  const where: Record<string, unknown> = {
    isActive: true,
    ...(status ? { status } : {}),
    ...(method ? { method } : {}),
    ...(orderId ? { orderId } : {}),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(dateTo) } : {}),
          },
        }
      : {}),
  };
  if (context.userRole === 'shop_owner') {
    where.order = { shopId: (await shopOwnerShopId(context)) ?? '' };
  }

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where: where as never,
      include: {
        order: { select: { id: true, shopId: true, itemsSubtotal: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.payment.count({ where: where as never }),
  ]);

  return okJson(
    {
      items: items.map((p) => ({
        paymentId: p.id,
        orderId: p.orderId,
        amount: p.amount.toString(),
        currency: p.currency,
        method: p.method,
        status: p.status,
        createdAt: p.createdAt,
        gatewayReference: p.gatewayReference,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    },
    context.requestId,
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// PAY-05/06 · Reconciliation (gateway = source of truth)
// ──────────────────────────────────────────────────────────────────────────────

async function reconciliationReport(
  _request: Request,
  context: RequestContext,
): Promise<Response> {
  if (context.userRole !== 'admin') throw ApiError.forbidden('Admin only');
  const report = await buildReconReport(context.env);
  return okJson(report, context.requestId);
}

async function reconciliationRun(
  _request: Request,
  context: RequestContext,
): Promise<Response> {
  if (context.userRole !== 'admin') throw ApiError.forbidden('Admin only');
  const result = await runReconciliation(context.env);
  return okJson(
    {
      jobId: result.jobId,
      summary: result.report.summary,
      mismatches: result.report.mismatches,
    },
    context.requestId,
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Role-scoped access (REST §6.7): customer owns, shop owner owns shop, admin all. */
async function assertPaymentAccess(
  context: RequestContext,
  orderUserId: string | null,
  orderShopId: string | null,
): Promise<void> {
  if (context.userRole === 'admin') return;
  if (context.userRole === 'shop_owner') {
    const shopId = await shopOwnerShopId(context);
    if (orderShopId && shopId && orderShopId === shopId) return;
    throw ApiError.notFound('Payment not found');
  }
  if (orderUserId && context.userId && orderUserId === context.userId) return;
  throw ApiError.notFound('Payment not found');
}

/** Shop id owned by the authenticated user (ownerId unique per shop). */
async function shopOwnerShopId(
  context: RequestContext,
): Promise<string | null> {
  if (!context.userId) return null;
  const prisma = getPrisma();
  const shop = await prisma.shop.findFirst({
    where: { ownerId: context.userId },
    select: { id: true },
  });
  return shop?.id ?? null;
}

register('GET', 'payments/methods', paymentMethods);
register('GET', 'payments/{id}', paymentDetail);
register('GET', 'orders/{id}/payment', orderPayment);
register('GET', 'payments', paymentList);
register('GET', 'admin/payments/reconciliation', reconciliationReport);
register('POST', 'admin/payments/reconciliation/run', reconciliationRun);

// ──────────────────────────────────────────────────────────────────────────────
// PAY-07 · Create payment
// ──────────────────────────────────────────────────────────────────────────────

async function createPayment(
  request: Request,
  context: RequestContext,
): Promise<Response> {
  const prisma = getPrisma();
  const body = (await request.json()) as {
    orderId: string;
    amount: string | number;
    currency: string;
    method: string;
    provider: string;
    customerEmail?: string;
    customerPhone?: string;
    metadata?: Record<string, unknown>;
  };

  const order = await prisma.order.findUnique({
    where: { id: body.orderId },
    select: {
      id: true,
      userId: true,
      shopId: true,
      grandTotal: true,
      currency: true,
    },
  });
  if (!order) throw ApiError.notFound('Order not found');
  if (order.userId !== context.userId)
    throw ApiError.forbidden('Order not accessible');
  const serverAmount = Number(order.grandTotal);
  const clientAmount = Number(body.amount);
  if (Math.abs(serverAmount - clientAmount) > 0.01)
    throw ApiError.badRequest(
      `Amount mismatch: expected ${serverAmount}, got ${clientAmount}`,
    );
  if (body.currency && body.currency !== order.currency)
    throw ApiError.badRequest('Currency mismatch');
  const idempotencyKey =
    request.headers.get('x-idempotency-key') ??
    request.headers.get('idempotency-key') ??
    undefined;
  if (idempotencyKey) (body as any).idempotencyKey = idempotencyKey;

  const gateway = resolveGateway(context.env);
  const repository = {
    createPayment: async (data: any) => prisma.payment.create({ data }),
    getPaymentById: async (id: string) =>
      prisma.payment.findUnique({ where: { id } }),
    getPaymentByOrderId: async (orderId: string) =>
      prisma.payment.findFirst({ where: { orderId } }),
    getPaymentByIdempotencyKey: async (key: string) =>
      prisma.payment.findUnique({ where: { idempotencyKey: key } }),
    updatePayment: async (id: string, data: any) =>
      prisma.payment.update({ where: { id }, data }),
    updatePaymentStatus: async (id: string, status: PaymentStatus) =>
      prisma.payment.update({ where: { id }, data: { status } }),
    listPayments: async () =>
      prisma.payment.findMany({ where: { isActive: true } }),
    createRefund: async (data: any) => prisma.refund.create({ data }),
    getRefundById: async (id: string) =>
      prisma.refund.findUnique({ where: { id } }),
    getRefundsByPaymentId: async (paymentId: string) =>
      prisma.refund.findMany({ where: { paymentId } }),
    getRefundsByOrderId: async (orderId: string) =>
      prisma.refund.findMany({ where: { orderId } }),
    updateRefund: async (id: string, data: any) =>
      prisma.refund.update({ where: { id }, data }),
    updateRefundStatus: async (id: string, status: any) =>
      prisma.refund.update({ where: { id }, data: { status } }),
    listRefunds: async () =>
      prisma.refund.findMany({ where: { isActive: true } }),
    createSettlement: async (data: any) => prisma.settlement.create({ data }),
    getSettlementById: async (id: string) =>
      prisma.settlement.findUnique({ where: { id } }),
    getSettlementByNumber: async (number: string) =>
      prisma.settlement.findUnique({ where: { settlementNumber: number } }),
    getSettlementsByShopId: async (shopId: string) =>
      prisma.settlement.findMany({ where: { shopId } }),
    updateSettlement: async (id: string, data: any) =>
      prisma.settlement.update({ where: { id }, data }),
    updateSettlementStatus: async (id: string, status: any) =>
      prisma.settlement.update({ where: { id }, data: { status } }),
    listSettlements: async () =>
      prisma.settlement.findMany({ where: { isActive: true } }),
    createTransaction: async (data: any) =>
      prisma.paymentTransaction.create({ data }),
    getTransactionsByPaymentId: async (paymentId: string) =>
      prisma.paymentTransaction.findMany({ where: { paymentId } }),
    updateTransaction: async (id: string, data: any) =>
      prisma.paymentTransaction.update({ where: { id }, data }),
    createWebhookEvent: async (data: any) =>
      prisma.webhookEvent.create({ data }),
    getWebhookEventById: async (id: string) =>
      prisma.webhookEvent.findUnique({ where: { id } }),
    getWebhookEventByProviderEventId: async (providerEventId: string) =>
      prisma.webhookEvent.findFirst({
        where: { eventId: providerEventId },
      }),
    updateWebhookEvent: async (id: string, data: any) =>
      prisma.webhookEvent.update({ where: { id }, data }),
    listWebhookEvents: async () => prisma.webhookEvent.findMany(),
    createFinanceRecord: async (data: any) =>
      prisma.financeRecord.create({ data }),
    getFinanceRecordById: async (id: string) =>
      prisma.financeRecord.findUnique({ where: { id } }),
    updateFinanceRecord: async (id: string, data: any) =>
      prisma.financeRecord.update({ where: { id }, data }),
    createLedgerEntry: async (data: any) => prisma.ledgerEntry.create({ data }),
    getLedgerEntriesByFinanceRecordId: async (financeRecordId: string) =>
      prisma.ledgerEntry.findMany({ where: { financeRecordId } }),
    getLedgerEntriesByReference: async (referenceId: string) =>
      prisma.ledgerEntry.findMany({
        where: { financeRecord: { referenceId } },
      }),
  };

  const paymentService = createPaymentService({
    gateway,
    repository: repository as any,
  });

  const result = await paymentService.createPayment({
    orderId: body.orderId,
    amount: body.amount,
    currency: body.currency,
    method: body.method,
    provider: body.provider as PaymentProvider,
    customerEmail: body.customerEmail,
    customerPhone: body.customerPhone,
    metadata: body.metadata,
  });

  if (!result.success) {
    throw ApiError.badRequest(result.error || 'Payment creation failed');
  }

  return okJson(result, context.requestId);
}

// ──────────────────────────────────────────────────────────────────────────────
// PAY-08 · Verify payment
// ──────────────────────────────────────────────────────────────────────────────

async function verifyPayment(
  request: Request,
  context: RequestContext,
): Promise<Response> {
  const body = (await request.json()) as {
    paymentId: string;
    gatewayOrderId: string;
    gatewayPaymentId: string;
    signature: string;
  };

  const prisma = getPrisma();
  const payment = await prisma.payment.findUnique({
    where: { id: body.paymentId },
    include: { order: { select: { userId: true } } },
  });
  if (!payment) throw ApiError.notFound('Payment not found');
  if (payment.order.userId !== context.userId)
    throw ApiError.forbidden('Payment not accessible');

  const gateway = resolveGateway(context.env);
  const repository = {
    getPaymentById: async (id: string) =>
      prisma.payment.findUnique({ where: { id } }),
    updatePayment: async (id: string, data: any) =>
      prisma.payment.update({ where: { id }, data }),
    updatePaymentStatus: async (id: string, status: PaymentStatus) =>
      prisma.payment.update({ where: { id }, data: { status } }),
    createTransaction: async (data: any) =>
      prisma.paymentTransaction.create({ data }),
    createFinanceRecord: async () => {
      throw new Error('Not implemented');
    },
    createLedgerEntry: async () => {
      throw new Error('Not implemented');
    },
    // Add other required methods as stubs
    createPayment: async () => {
      throw new Error('Not implemented');
    },
    getPaymentByOrderId: async () => null,
    getPaymentByIdempotencyKey: async () => null,
    listPayments: async () => [],
    createRefund: async () => {
      throw new Error('Not implemented');
    },
    getRefundById: async () => null,
    getRefundsByPaymentId: async () => [],
    getRefundsByOrderId: async () => [],
    updateRefund: async () => {
      throw new Error('Not implemented');
    },
    updateRefundStatus: async () => {
      throw new Error('Not implemented');
    },
    listRefunds: async () => [],
    createSettlement: async () => {
      throw new Error('Not implemented');
    },
    getSettlementById: async () => null,
    getSettlementByNumber: async () => null,
    getSettlementsByShopId: async () => [],
    updateSettlement: async () => {
      throw new Error('Not implemented');
    },
    updateSettlementStatus: async () => {
      throw new Error('Not implemented');
    },
    listSettlements: async () => [],
    getTransactionsByPaymentId: async (paymentId: string) =>
      prisma.paymentTransaction.findMany({ where: { paymentId } }),
    updateTransaction: async () => {
      throw new Error('Not implemented');
    },
    createWebhookEvent: async () => {
      throw new Error('Not implemented');
    },
    getWebhookEventById: async () => null,
    getWebhookEventByProviderEventId: async () => null,
    updateWebhookEvent: async () => {
      throw new Error('Not implemented');
    },
    listWebhookEvents: async () => [],
    getFinanceRecordById: async () => null,
    updateFinanceRecord: async () => {
      throw new Error('Not implemented');
    },
    getLedgerEntriesByFinanceRecordId: async () => [],
    getLedgerEntriesByReference: async () => [],
  };

  const paymentService = createPaymentService({
    gateway,
    repository: repository as any,
  });

  const result = await paymentService.verifyPayment(body);

  return okJson(result, context.requestId);
}

// ──────────────────────────────────────────────────────────────────────────────
// PAY-09 · Process refund
// ──────────────────────────────────────────────────────────────────────────────

async function processRefund(
  request: Request,
  context: RequestContext,
): Promise<Response> {
  const body = (await request.json()) as {
    paymentId: string;
    amount: string | number;
    reason: string;
    type?: RefundType;
  };

  const prisma = getPrisma();
  const payment = await prisma.payment.findUnique({
    where: { id: body.paymentId },
    include: { order: { select: { userId: true, shopId: true } } },
  });
  if (!payment) throw ApiError.notFound('Payment not found');

  // Check access: customer can refund their own orders, shop owner can refund their shop's orders, admin all
  if (
    context.userRole === 'customer' &&
    payment.order.userId !== context.userId
  ) {
    throw ApiError.forbidden('Payment not accessible');
  }
  if (context.userRole === 'shop_owner') {
    const shopId = await shopOwnerShopId(context);
    if (payment.order.shopId !== shopId)
      throw ApiError.forbidden('Payment not accessible');
  }

  const gateway = resolveGateway(context.env);
  const repository = {
    getPaymentById: async (id: string) =>
      prisma.payment.findUnique({ where: { id } }),
    updatePayment: async (id: string, data: any) =>
      prisma.payment.update({ where: { id }, data }),
    updatePaymentStatus: async (id: string, status: PaymentStatus) =>
      prisma.payment.update({ where: { id }, data: { status } }),
    createRefund: async (data: any) => prisma.refund.create({ data }),
    getRefundsByPaymentId: async (paymentId: string) =>
      prisma.refund.findMany({ where: { paymentId } }),
    updateRefund: async (id: string, data: any) =>
      prisma.refund.update({ where: { id }, data }),
    updateRefundStatus: async (id: string, status: RefundStatus) =>
      prisma.refund.update({ where: { id }, data: { status } }),
    createTransaction: async (data: any) =>
      prisma.paymentTransaction.create({ data }),
    createFinanceRecord: async () => {
      throw new Error('Not implemented');
    },
    createLedgerEntry: async () => {
      throw new Error('Not implemented');
    },
    // Add other required methods as stubs
    createPayment: async () => {
      throw new Error('Not implemented');
    },
    getPaymentByOrderId: async () => null,
    getPaymentByIdempotencyKey: async () => null,
    listPayments: async () => [],
    getRefundById: async () => null,
    getRefundsByOrderId: async () => [],
    listRefunds: async () => [],
    createSettlement: async () => {
      throw new Error('Not implemented');
    },
    getSettlementById: async () => null,
    getSettlementByNumber: async () => null,
    getSettlementsByShopId: async () => [],
    updateSettlement: async () => {
      throw new Error('Not implemented');
    },
    updateSettlementStatus: async () => {
      throw new Error('Not implemented');
    },
    listSettlements: async () => [],
    getTransactionsByPaymentId: async (paymentId: string) =>
      prisma.paymentTransaction.findMany({ where: { paymentId } }),
    updateTransaction: async () => {
      throw new Error('Not implemented');
    },
    createWebhookEvent: async () => {
      throw new Error('Not implemented');
    },
    getWebhookEventById: async () => null,
    getWebhookEventByProviderEventId: async () => null,
    updateWebhookEvent: async () => {
      throw new Error('Not implemented');
    },
    listWebhookEvents: async () => [],
    getFinanceRecordById: async () => null,
    updateFinanceRecord: async () => {
      throw new Error('Not implemented');
    },
    getLedgerEntriesByFinanceRecordId: async () => [],
    getLedgerEntriesByReference: async () => [],
  };

  const paymentService = createPaymentService({
    gateway,
    repository: repository as any,
  });

  const result = await paymentService.processRefund({
    paymentId: body.paymentId,
    amount: body.amount,
    reason: body.reason,
    type: body.type,
  });

  if (!result.success) {
    throw ApiError.badRequest(result.error || 'Refund processing failed');
  }

  return okJson(result, context.requestId);
}

// ──────────────────────────────────────────────────────────────────────────────
// PAY-10 · Create settlement (admin/shop owner only)
// ──────────────────────────────────────────────────────────────────────────────

async function createSettlement(
  request: Request,
  context: RequestContext,
): Promise<Response> {
  if (context.userRole !== 'admin' && context.userRole !== 'shop_owner') {
    throw ApiError.forbidden(
      'Settlement creation requires admin or shop owner access',
    );
  }

  const body = (await request.json()) as {
    shopId?: string;
    periodStart: string;
    periodEnd: string;
  };

  const shopId =
    body.shopId ||
    (context.userRole === 'shop_owner' ? await shopOwnerShopId(context) : null);
  if (!shopId) throw ApiError.badRequest('Shop ID required');

  const prisma = getPrisma();
  const gateway = resolveGateway(context.env);
  const repository = {
    listPayments: async (filters?: any) =>
      prisma.payment.findMany({
        where: {
          isActive: true,
          ...(filters?.orderId ? { orderId: filters.orderId } : {}),
          ...(filters?.status ? { status: filters.status } : {}),
        },
        include: { order: { select: { shopId: true } } },
        take: filters?.limit || 1000,
      }),
    createSettlement: async (data: any) => prisma.settlement.create({ data }),
    updateSettlementStatus: async (id: string, status: any) =>
      prisma.settlement.update({ where: { id }, data: { status } }),
    createFinanceRecord: async () => {
      throw new Error('Not implemented');
    },
    createLedgerEntry: async () => {
      throw new Error('Not implemented');
    },
    // Add other required methods as stubs
    createPayment: async () => {
      throw new Error('Not implemented');
    },
    getPaymentById: async () => null,
    getPaymentByOrderId: async () => null,
    getPaymentByIdempotencyKey: async () => null,
    updatePayment: async () => {
      throw new Error('Not implemented');
    },
    updatePaymentStatus: async () => {
      throw new Error('Not implemented');
    },
    createRefund: async () => {
      throw new Error('Not implemented');
    },
    getRefundById: async () => null,
    getRefundsByPaymentId: async () => [],
    getRefundsByOrderId: async () => [],
    updateRefund: async () => {
      throw new Error('Not implemented');
    },
    updateRefundStatus: async () => {
      throw new Error('Not implemented');
    },
    listRefunds: async () => [],
    getSettlementById: async () => null,
    getSettlementByNumber: async () => null,
    getSettlementsByShopId: async (shopId: string) =>
      prisma.settlement.findMany({ where: { shopId } }),
    updateSettlement: async () => {
      throw new Error('Not implemented');
    },
    listSettlements: async () => [],
    createTransaction: async () => {
      throw new Error('Not implemented');
    },
    getTransactionsByPaymentId: async () => [],
    updateTransaction: async () => {
      throw new Error('Not implemented');
    },
    createWebhookEvent: async () => {
      throw new Error('Not implemented');
    },
    getWebhookEventById: async () => null,
    getWebhookEventByProviderEventId: async () => null,
    updateWebhookEvent: async () => {
      throw new Error('Not implemented');
    },
    listWebhookEvents: async () => [],
    getFinanceRecordById: async () => null,
    updateFinanceRecord: async () => {
      throw new Error('Not implemented');
    },
    getLedgerEntriesByFinanceRecordId: async () => [],
    getLedgerEntriesByReference: async () => [],
  };

  const paymentService = createPaymentService({
    gateway,
    repository: repository as any,
  });

  const result = await paymentService.createSettlement({
    shopId,
    periodStart: new Date(body.periodStart),
    periodEnd: new Date(body.periodEnd),
  });

  if (!result.success) {
    throw ApiError.badRequest(result.error || 'Settlement creation failed');
  }

  return okJson(result, context.requestId);
}

register('POST', 'payments', createPayment);
register('POST', 'payments/verify', verifyPayment);
register('POST', 'payments/refund', processRefund);
register('POST', 'settlements', createSettlement);
