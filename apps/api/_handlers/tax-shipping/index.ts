import { z } from 'zod';

import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { getPrisma } from '../../_lib/prisma.ts';
import { hasShopAccess } from '../../_lib/shop/staff-service.ts';
import { register } from '../register.ts';

const zoneSchema = z.object({
  name: z.string().min(1).max(120),
  countryCode: z.string().length(2),
  stateCode: z.string().max(10).optional().nullable(),
  priority: z.number().int().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});
const taxRuleSchema = z.object({
  name: z.string().min(1),
  rate: z.number().min(0).max(100),
  taxZoneId: z.string().uuid().optional().nullable(),
  priority: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
const shipRateSchema = z.object({
  name: z.string().min(1),
  baseRate: z.number().min(0),
  freeAboveAmount: z.number().min(0).optional().nullable(),
  shippingZoneId: z.string().uuid().optional().nullable(),
  priority: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

async function requireShopManager(userId: string, shopId: string | undefined) {
  if (!shopId) throw ApiError.validation('shopId required');
  const prisma: any = getPrisma();
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (!shop) throw ApiError.notFound('Shop not found');
  if (shop.ownerId === userId) return;
  const m = await prisma.shopMember.findFirst({
    where: { shopId, userId, status: 'active' },
  });
  if (!m || m.role !== 'manager')
    throw ApiError.forbidden('Manager access required');
  if (!(await hasShopAccess(userId, shopId)))
    throw ApiError.forbidden('Shop access denied');
}

export async function handleListTaxZones(
  req: Request,
  ctx: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = ctx.userId;
    if (!userId) return errorJson(ApiError.unauthorized('Auth'), ctx.requestId);
    const shopId = params.shopId;
    if (!shopId)
      return errorJson(ApiError.validation('shopId required'), ctx.requestId);
    if (!(await hasShopAccess(userId, shopId)))
      return errorJson(ApiError.forbidden('Denied'), ctx.requestId);
    const zones = await (getPrisma() as any).taxZone.findMany({
      where: { shopId },
    });
    return okJson({ zones }, ctx.requestId);
  } catch (e) {
    return errorJson(
      e instanceof ApiError ? e : ApiError.internal((e as Error).message),
      ctx.requestId,
    );
  }
}
export async function handleCreateTaxZone(
  req: Request,
  ctx: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = ctx.userId;
    if (!userId) return errorJson(ApiError.unauthorized('Auth'), ctx.requestId);
    const shopId = params.shopId;
    await requireShopManager(userId, shopId);
    const body = zoneSchema.parse(await req.json());
    const zone = await (getPrisma() as any).taxZone.create({
      data: { shopId, ...body, countryCode: body.countryCode.toUpperCase() },
    });
    return okJson({ zone }, ctx.requestId);
  } catch (e) {
    return errorJson(
      e instanceof ApiError ? e : ApiError.validation((e as Error).message),
      ctx.requestId,
    );
  }
}
export async function handleUpdateTaxZone(
  req: Request,
  ctx: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = ctx.userId;
    if (!userId) return errorJson(ApiError.unauthorized('Auth'), ctx.requestId);
    const { shopId, id } = params;
    await requireShopManager(userId, shopId);
    const body = zoneSchema.partial().parse(await req.json());
    const ex = await (getPrisma() as any).taxZone.findFirst({
      where: { id, shopId },
    });
    if (!ex)
      return errorJson(ApiError.notFound('Zone not found'), ctx.requestId);
    const zone = await (getPrisma() as any).taxZone.update({
      where: { id },
      data: body,
    });
    return okJson({ zone }, ctx.requestId);
  } catch (e) {
    return errorJson(
      e instanceof ApiError ? e : ApiError.validation((e as Error).message),
      ctx.requestId,
    );
  }
}
export async function handleDeleteTaxZone(
  req: Request,
  ctx: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = ctx.userId;
    if (!userId) return errorJson(ApiError.unauthorized('Auth'), ctx.requestId);
    const { shopId, id } = params;
    await requireShopManager(userId, shopId);
    const ex = await (getPrisma() as any).taxZone.findFirst({
      where: { id, shopId },
    });
    if (!ex) return errorJson(ApiError.notFound('Zone'), ctx.requestId);
    await (getPrisma() as any).taxZone.delete({ where: { id } });
    return okJson({ success: true }, ctx.requestId);
  } catch (e) {
    return errorJson(
      e instanceof ApiError ? e : ApiError.internal((e as Error).message),
      ctx.requestId,
    );
  }
}
export async function handleListTaxRules(
  req: Request,
  ctx: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = ctx.userId;
    if (!userId) return errorJson(ApiError.unauthorized('Auth'), ctx.requestId);
    const shopId = params.shopId;
    if (!(await hasShopAccess(userId, shopId)))
      return errorJson(ApiError.forbidden('Denied'), ctx.requestId);
    const rules = await (getPrisma() as any).taxRule.findMany({
      where: { taxZone: { shopId } },
    });
    return okJson({ rules }, ctx.requestId);
  } catch (e) {
    return errorJson(ApiError.internal((e as Error).message), ctx.requestId);
  }
}
export async function handleCreateTaxRule(
  req: Request,
  ctx: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = ctx.userId;
    if (!userId) return errorJson(ApiError.unauthorized('Auth'), ctx.requestId);
    const shopId = params.shopId;
    await requireShopManager(userId, shopId);
    const body = taxRuleSchema.parse(await req.json());
    if (body.taxZoneId) {
      const z = await (getPrisma() as any).taxZone.findFirst({
        where: { id: body.taxZoneId, shopId },
      });
      if (!z)
        return errorJson(ApiError.validation('Invalid zone'), ctx.requestId);
    }
    const rule = await (getPrisma() as any).taxRule.create({
      data: body as any,
    });
    return okJson({ rule }, ctx.requestId);
  } catch (e) {
    return errorJson(
      e instanceof ApiError ? e : ApiError.validation((e as Error).message),
      ctx.requestId,
    );
  }
}
export async function handleListShippingZones(
  req: Request,
  ctx: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = ctx.userId;
    if (!userId) return errorJson(ApiError.unauthorized('Auth'), ctx.requestId);
    const shopId = params.shopId;
    if (!shopId)
      return errorJson(ApiError.validation('shopId required'), ctx.requestId);
    if (!(await hasShopAccess(userId, shopId)))
      return errorJson(ApiError.forbidden('Denied'), ctx.requestId);
    const zones = await (getPrisma() as any).shippingZone.findMany({
      where: { shopId },
    });
    return okJson({ zones }, ctx.requestId);
  } catch (e) {
    return errorJson(ApiError.internal((e as Error).message), ctx.requestId);
  }
}
export async function handleCreateShippingZone(
  req: Request,
  ctx: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = ctx.userId;
    if (!userId) return errorJson(ApiError.unauthorized('Auth'), ctx.requestId);
    const shopId = params.shopId;
    await requireShopManager(userId, shopId);
    const body = zoneSchema.parse(await req.json());
    const zone = await (getPrisma() as any).shippingZone.create({
      data: { shopId, ...body, countryCode: body.countryCode.toUpperCase() },
    });
    return okJson({ zone }, ctx.requestId);
  } catch (e) {
    return errorJson(
      e instanceof ApiError ? e : ApiError.validation((e as Error).message),
      ctx.requestId,
    );
  }
}
export async function handleUpdateShippingZone(
  req: Request,
  ctx: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = ctx.userId;
    if (!userId) return errorJson(ApiError.unauthorized('Auth'), ctx.requestId);
    const { shopId, id } = params;
    await requireShopManager(userId, shopId);
    const body = zoneSchema.partial().parse(await req.json());
    const ex = await (getPrisma() as any).shippingZone.findFirst({
      where: { id, shopId },
    });
    if (!ex) return errorJson(ApiError.notFound('Zone'), ctx.requestId);
    const zone = await (getPrisma() as any).shippingZone.update({
      where: { id },
      data: body,
    });
    return okJson({ zone }, ctx.requestId);
  } catch (e) {
    return errorJson(
      e instanceof ApiError ? e : ApiError.validation((e as Error).message),
      ctx.requestId,
    );
  }
}
export async function handleDeleteShippingZone(
  req: Request,
  ctx: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = ctx.userId;
    if (!userId) return errorJson(ApiError.unauthorized('Auth'), ctx.requestId);
    const { shopId, id } = params;
    await requireShopManager(userId, shopId);
    const ex = await (getPrisma() as any).shippingZone.findFirst({
      where: { id, shopId },
    });
    if (!ex) return errorJson(ApiError.notFound('Zone'), ctx.requestId);
    await (getPrisma() as any).shippingZone.delete({ where: { id } });
    return okJson({ success: true }, ctx.requestId);
  } catch (e) {
    return errorJson(
      e instanceof ApiError ? e : ApiError.internal((e as Error).message),
      ctx.requestId,
    );
  }
}
export async function handleListShippingRates(
  req: Request,
  ctx: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = ctx.userId;
    if (!userId) return errorJson(ApiError.unauthorized('Auth'), ctx.requestId);
    const shopId = params.shopId;
    if (!(await hasShopAccess(userId, shopId)))
      return errorJson(ApiError.forbidden('Denied'), ctx.requestId);
    const rates = await (getPrisma() as any).shippingRate.findMany({
      where: { shippingZone: { shopId } },
    });
    return okJson({ rates }, ctx.requestId);
  } catch (e) {
    return errorJson(ApiError.internal((e as Error).message), ctx.requestId);
  }
}
export async function handleCreateShippingRate(
  req: Request,
  ctx: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = ctx.userId;
    if (!userId) return errorJson(ApiError.unauthorized('Auth'), ctx.requestId);
    const shopId = params.shopId;
    await requireShopManager(userId, shopId);
    const body = shipRateSchema.parse(await req.json());
    if (body.shippingZoneId) {
      const z = await (getPrisma() as any).shippingZone.findFirst({
        where: { id: body.shippingZoneId, shopId },
      });
      if (!z)
        return errorJson(ApiError.validation('Invalid zone'), ctx.requestId);
    }
    const rate = await (getPrisma() as any).shippingRate.create({
      data: body as any,
    });
    return okJson({ rate }, ctx.requestId);
  } catch (e) {
    return errorJson(
      e instanceof ApiError ? e : ApiError.validation((e as Error).message),
      ctx.requestId,
    );
  }
}
register('GET', 'shops/:shopId/tax-zones', handleListTaxZones);
register('POST', 'shops/:shopId/tax-zones', handleCreateTaxZone);
register('PUT', 'shops/:shopId/tax-zones/:id', handleUpdateTaxZone);
register('DELETE', 'shops/:shopId/tax-zones/:id', handleDeleteTaxZone);
register('GET', 'shops/:shopId/tax-rules', handleListTaxRules);
register('POST', 'shops/:shopId/tax-rules', handleCreateTaxRule);
register('GET', 'shops/:shopId/shipping-zones', handleListShippingZones);
register('POST', 'shops/:shopId/shipping-zones', handleCreateShippingZone);
register('PUT', 'shops/:shopId/shipping-zones/:id', handleUpdateShippingZone);
register(
  'DELETE',
  'shops/:shopId/shipping-zones/:id',
  handleDeleteShippingZone,
);
register('GET', 'shops/:shopId/shipping-rates', handleListShippingRates);
register('POST', 'shops/:shopId/shipping-rates', handleCreateShippingRate);
