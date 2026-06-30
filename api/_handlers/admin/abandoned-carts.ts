import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth-middleware";

export async function handleAdminAbandonedCartRequest(req: Request, ctx: RequestContext, _params: string[], action: string): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
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
  const minAge = parseInt(url.searchParams.get("minAge") ?? "60");
  const cutoff = new Date(Date.now() - minAge * 60 * 1000);
  try {
    const prisma = getPrisma(env);
    const [items, total] = await Promise.all([
      prisma.cart.findMany({
        where: { updatedAt: { lte: cutoff }, items: { some: {} } },
        include: { profile: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } }, items: { include: { variant: { select: { id: true, sku: true, priceAdjustment: true, product: { select: { name: true } } } } } } },
        orderBy: { updatedAt: "desc" }, skip: (page - 1) * limit, take: limit,
      }),
      prisma.cart.count({ where: { updatedAt: { lte: cutoff }, items: { some: {} } } }),
    ]);
    return success({ carts: items, pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return serverError(err);
  }
}
