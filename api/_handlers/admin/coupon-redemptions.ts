import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";

export async function handleAdminCouponRedemptionRequest(req: Request, _ctx: RequestContext, _params: string[], action: string): Promise<Response> {
  const adminGuard = requireAdmin(_ctx);
  if (adminGuard) return adminGuard;
  switch (action) {
    case "list": return handleList(req, ctx.env);
    default: return badRequest("Unknown action");
  }
}

async function handleList(req: Request, env: any): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "25");
  const couponId = url.searchParams.get("couponId");
  const profileId = url.searchParams.get("profileId");
  const search = url.searchParams.get("search");
  const where: Record<string, unknown> = {};
  if (couponId) where.couponId = couponId;
  if (profileId) where.profileId = profileId;
  if (search) {
    where.OR = [
      { coupon: { code: { contains: search, mode: "insensitive" } } },
      { profile: { email: { contains: search, mode: "insensitive" } } },
    ];
  }
  const [items, total] = await Promise.all([
    prisma.couponRedemption.findMany({
      where: where as never,
      include: { coupon: { select: { code: true } }, order: { select: { orderNumber: true, total: true } }, profile: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
    }),
    prisma.couponRedemption.count({ where: where as never }),
  ]);
  return success({ redemptions: items, pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) } });
}
