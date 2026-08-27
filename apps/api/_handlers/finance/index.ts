/**
 * Finance API handlers — FIN-01..FIN-12 (REST_API_SPECIFICATION §7.17).
 *
 * Binding: FINANCE_ENGINE_ARCHITECTURE.md, Blueprint B.4 — Finance records,
 * never processes money; balances derived from the append-only ledger;
 * settlement transitions enforced by the state machine (REJECTED→PENDING,
 * REVERSED from COMPLETED/PAID only); Admin-only for settlements/rules.
 */
import { z } from 'zod';

import {
  getEarningsSummary,
  createSettlement,
  approveSettlement,
  rejectSettlement,
  reverseSettlement,
  getSettlementDetail,
} from '../../_lib/finance/service.ts';
import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, createdJson } from '../../_lib/http/response.ts';
import { getPrisma } from '../../_lib/prisma.ts';
import { register } from '../register.ts';

// ──────────────────────────────────────────────────────────────────────────────
// FIN-01 · Earnings summary (computed from ledger — never cached)
// ──────────────────────────────────────────────────────────────────────────────

async function earningsSummary(
  request: Request,
  context: RequestContext,
): Promise<Response> {
  const shopId = await requireShopAccess(
    context,
    new URL(request.url).searchParams.get('shopId'),
  );
  const summary = await getEarningsSummary(context.env, shopId);
  return okJson(summary, context.requestId);
}

// ──────────────────────────────────────────────────────────────────────────────
// FIN-02 · Ledger (append-only; shop-scoped or admin)
// ──────────────────────────────────────────────────────────────────────────────

async function ledgerList(
  request: Request,
  context: RequestContext,
): Promise<Response> {
  const prisma = getPrisma();
  const url = new URL(request.url);
  const shopId = await requireShopAccess(
    context,
    url.searchParams.get('shopId'),
  );
  const type = url.searchParams.get('type');
  const orderId = url.searchParams.get('orderId');
  const dateFrom = url.searchParams.get('dateFrom');
  const dateTo = url.searchParams.get('dateTo');
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const pageSize = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get('pageSize') ?? 50)),
  );

  const where: Record<string, unknown> = {
    financeRecord: {
      ...(orderId ? { orderId } : {}),
      ...(type ? { type } : {}),
      ...(dateFrom || dateTo
        ? {
            postedAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            },
          }
        : {}),
    },
  };
  if (context.userRole !== 'admin') {
    where.financeRecord = {
      ...(where.financeRecord as Record<string, unknown>),
      order: { shopId },
    };
  }

  const [items, total] = await Promise.all([
    prisma.ledgerEntry.findMany({
      where: where as never,
      include: {
        financeRecord: {
          select: {
            recordNumber: true,
            type: true,
            orderId: true,
            postedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.ledgerEntry.count({ where: where as never }),
  ]);

  return okJson(
    {
      items: items.map((e) => ({
        entryId: e.id,
        account: e.account,
        side: e.side,
        amount: e.amount.toString(),
        recordNumber: e.financeRecord.recordNumber,
        type: e.financeRecord.type,
        orderId: e.financeRecord.orderId,
        postedAt: e.financeRecord.postedAt,
        createdAt: e.createdAt,
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
// FIN-03 · Settlement list
// ──────────────────────────────────────────────────────────────────────────────

async function settlementList(
  request: Request,
  context: RequestContext,
): Promise<Response> {
  const prisma = getPrisma();
  const url = new URL(request.url);
  const shopId = await requireShopAccess(
    context,
    url.searchParams.get('shopId'),
  );
  const status = url.searchParams.get('status');
  const periodFrom = url.searchParams.get('periodFrom');
  const periodTo = url.searchParams.get('periodTo');
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const pageSize = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get('pageSize') ?? 20)),
  );

  const where: Record<string, unknown> = {
    ...(status ? { status } : {}),
    ...(periodFrom || periodTo
      ? {
          periodStart: {
            ...(periodFrom ? { gte: new Date(periodFrom) } : {}),
            ...(periodTo ? { lte: new Date(periodTo) } : {}),
          },
        }
      : {}),
  };
  if (context.userRole !== 'admin') where.shopId = shopId;

  const [items, total] = await Promise.all([
    prisma.settlement.findMany({
      where: where as never,
      orderBy: { periodStart: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.settlement.count({ where: where as never }),
  ]);

  return okJson(
    {
      items: items.map((s) => ({
        settlementId: s.id,
        settlementNumber: s.settlementNumber,
        status: s.status,
        periodStart: s.periodStart,
        periodEnd: s.periodEnd,
        grossAmount: s.grossAmount.toString(),
        commissionAmount: s.commissionAmount.toString(),
        refundAdjustment: s.refundAdjustment.toString(),
        netAmount: s.netAmount.toString(),
        payoutMethod: s.payoutMethod,
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
// FIN-04 · Settlement detail (masked payout destination)
// ──────────────────────────────────────────────────────────────────────────────

async function settlementDetail(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  await requireShopAccess(
    context,
    new URL(request.url).searchParams.get('shopId'),
  );
  const detail = await getSettlementDetail(params.id ?? '');
  return okJson(detail, context.requestId);
}

// ──────────────────────────────────────────────────────────────────────────────
// FIN-05 · Create settlement (Admin only; idempotent per period)
// ──────────────────────────────────────────────────────────────────────────────

const createSettlementSchema = z.object({
  shopId: z.string().uuid(),
  periodStart: z.string().datetime().optional(),
  periodEnd: z.string().datetime().optional(),
});

async function createSettlementHandler(
  request: Request,
  context: RequestContext,
): Promise<Response> {
  requireAdmin(context);
  const body = createSettlementSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success)
    throw ApiError.validation(
      'Invalid settlement payload',
      undefined,
      body.error.flatten() as unknown as Record<string, unknown>,
    );

  const result = await createSettlement(context.env, {
    shopId: body.data.shopId,
    periodStart: body.data.periodStart
      ? new Date(body.data.periodStart)
      : undefined,
    periodEnd: body.data.periodEnd ? new Date(body.data.periodEnd) : undefined,
    actorId: context.userId ?? '',
  });
  return createdJson(result, context.requestId);
}

// ──────────────────────────────────────────────────────────────────────────────
// FIN-06..08 · Approve / reject / reverse (Admin only)
// ──────────────────────────────────────────────────────────────────────────────

const actionSchema = z.object({
  reason: z.string().min(1).optional(),
  approvalRef: z.string().min(1).optional(),
  payoutMethod: z.enum(['digital', 'manual']).optional(),
});

async function approveHandler(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  requireAdmin(context);
  const body = actionSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) throw ApiError.validation('Invalid approval payload');
  const result = await approveSettlement(
    context.env,
    params.id ?? '',
    context.userId ?? '',
    body.data.reason,
    body.data.payoutMethod ?? 'digital',
  );
  return okJson(result, context.requestId);
}

async function rejectHandler(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  requireAdmin(context);
  const body = actionSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) throw ApiError.validation('Invalid rejection payload');
  const result = await rejectSettlement(
    context.env,
    params.id ?? '',
    body.data.reason ?? 'Rejected by admin',
  );
  return okJson(result, context.requestId);
}

async function reverseHandler(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  requireAdmin(context);
  const body = actionSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) throw ApiError.validation('Invalid reversal payload');
  const result = await reverseSettlement(
    context.env,
    params.id ?? '',
    body.data.reason ?? 'Reversed by admin',
    body.data.approvalRef,
  );
  return okJson(result, context.requestId);
}

// ──────────────────────────────────────────────────────────────────────────────
// FIN-09..11 · Commission rules (Admin; snapshot discipline — future orders only)
// ──────────────────────────────────────────────────────────────────────────────

async function commissionRules(
  _request: Request,
  context: RequestContext,
): Promise<Response> {
  requireAdmin(context);
  const prisma = getPrisma();
  const rules = await prisma.commissionRate.findMany({
    where: { isActive: true },
    orderBy: [{ scope: 'asc' }, { effectiveFrom: 'desc' }],
  });
  return okJson(
    {
      rules: rules.map((r) => ({
        id: r.id,
        scope: r.scope,
        shopId: r.shopId,
        categoryId: r.categoryId,
        rate: r.rate.toString(),
        effectiveFrom: r.effectiveFrom,
        effectiveTo: r.effectiveTo,
        isActive: r.isActive,
      })),
    },
    context.requestId,
  );
}

const commissionRuleSchema = z.object({
  scope: z.enum(['platform', 'shop', 'category']),
  scopeId: z.string().uuid().optional(),
  rate: z.number().min(0).max(50),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
});

async function createCommissionRule(
  request: Request,
  context: RequestContext,
): Promise<Response> {
  requireAdmin(context);
  const body = commissionRuleSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    throw new ApiError({
      code: 'COMMISSION_INVALID',
      message: 'Commission rate out of range (0–50)',
      details: body.error.flatten() as unknown as Record<string, unknown>,
    });
  }
  const prisma = getPrisma();
  const data: Record<string, unknown> = {
    scope: body.data.scope,
    rate: body.data.rate,
    effectiveFrom: body.data.effectiveFrom
      ? new Date(body.data.effectiveFrom)
      : new Date(),
    ...(body.data.effectiveTo
      ? { effectiveTo: new Date(body.data.effectiveTo) }
      : {}),
  };
  if (body.data.scope === 'shop') {
    if (!body.data.scopeId)
      throw ApiError.validation('shopId required for shop scope');
    data.shopId = body.data.scopeId;
  }
  if (body.data.scope === 'category') {
    if (!body.data.scopeId)
      throw ApiError.validation('categoryId required for category scope');
    data.categoryId = body.data.scopeId;
  }

  const rule = await prisma.commissionRate.create({ data: data as never });
  return createdJson(
    { id: rule.id, scope: rule.scope, rate: rule.rate.toString() },
    context.requestId,
  );
}

const updateCommissionRuleSchema = z.object({
  rate: z.number().min(0).max(50).optional(),
  effectiveTo: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
});

async function updateCommissionRule(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  requireAdmin(context);
  const body = updateCommissionRuleSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    throw new ApiError({
      code: 'COMMISSION_INVALID',
      message: 'Commission rate out of range (0–50)',
      details: body.error.flatten() as unknown as Record<string, unknown>,
    });
  }
  const prisma = getPrisma();
  const existing = await prisma.commissionRate.findUnique({
    where: { id: params.id ?? '' },
  });
  if (!existing) throw ApiError.notFound('Commission rule not found');

  const rule = await prisma.commissionRate.update({
    where: { id: existing.id },
    data: {
      ...(body.data.rate !== undefined ? { rate: body.data.rate } : {}),
      ...(body.data.effectiveTo !== undefined
        ? {
            effectiveTo: body.data.effectiveTo
              ? new Date(body.data.effectiveTo)
              : null,
          }
        : {}),
      ...(body.data.isActive !== undefined
        ? { isActive: body.data.isActive }
        : {}),
    } as never,
  });
  return okJson(
    {
      id: rule.id,
      scope: rule.scope,
      rate: rule.rate.toString(),
      isActive: rule.isActive,
    },
    context.requestId,
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// FIN-12 · Finance records (S/A)
// ──────────────────────────────────────────────────────────────────────────────

async function financeRecords(
  request: Request,
  context: RequestContext,
): Promise<Response> {
  const prisma = getPrisma();
  const url = new URL(request.url);
  const shopId = await requireShopAccess(
    context,
    url.searchParams.get('shopId'),
  );
  const type = url.searchParams.get('type');
  const orderId = url.searchParams.get('orderId');
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const pageSize = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get('pageSize') ?? 50)),
  );

  const where: Record<string, unknown> = {
    ...(type ? { type } : {}),
    ...(orderId ? { orderId } : {}),
  };
  if (context.userRole !== 'admin') where.order = { shopId };

  const [items, total] = await Promise.all([
    prisma.financeRecord.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.financeRecord.count({ where: where as never }),
  ]);

  return okJson(
    {
      items: items.map((r) => ({
        recordNumber: r.recordNumber,
        type: r.type,
        amount: r.amount.toString(),
        status: r.status,
        orderId: r.orderId,
        referenceType: r.referenceType,
        referenceId: r.referenceId,
        postedAt: r.postedAt,
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
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Shop-scoped access: shop owner's own shop; admin passes ?shopId=. */
async function requireShopAccess(
  context: RequestContext,
  shopIdParam: string | null = null,
): Promise<string> {
  if (context.userRole === 'admin') {
    if (!shopIdParam)
      throw ApiError.validation(
        'shopId query parameter required for admin access',
      );
    return shopIdParam;
  }
  if (context.userRole !== 'shop_owner')
    throw ApiError.forbidden('Finance access requires shop owner or admin');
  if (!context.userId) throw ApiError.unauthorized();
  const prisma = getPrisma();
  const shop = await prisma.shop.findFirst({
    where: { ownerId: context.userId },
    select: { id: true },
  });
  if (!shop) throw ApiError.notFound('Shop not found');
  return shop.id;
}

function requireAdmin(context: RequestContext): void {
  if (context.userRole !== 'admin') throw ApiError.forbidden('Admin only');
}

register('GET', 'finance/earnings', earningsSummary);
register('GET', 'finance/ledger', ledgerList);
register('GET', 'finance/settlements', settlementList);
register('GET', 'finance/settlements/{id}', settlementDetail);
register('POST', 'finance/settlements', createSettlementHandler);
register('POST', 'finance/settlements/{id}/approve', approveHandler);
register('POST', 'finance/settlements/{id}/reject', rejectHandler);
register('POST', 'finance/settlements/{id}/reverse', reverseHandler);
register('GET', 'finance/commission-rules', commissionRules);
register('POST', 'finance/commission-rules', createCommissionRule);
register('PATCH', 'finance/commission-rules/{id}', updateCommissionRule);
register('GET', 'finance/records', financeRecords);
