import { prisma } from "../../_lib/prisma";
import { success, badRequest, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";

export async function handleAdminWishlistRequest(req: Request, _ctx: RequestContext, _params: string[], action: string): Promise<Response> {
  const adminGuard = requireAdmin(_ctx);
  if (adminGuard) return adminGuard;
  switch (action) {
    case "list": return handleList(req);
    default: return badRequest("Unknown action");
  }
}

async function handleList(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "25");
  const profileId = url.searchParams.get("profileId");
  const where: Record<string, unknown> = {};
  if (profileId) where.profileId = profileId;
  const [items, total] = await Promise.all([
    prisma.wishlistItem.findMany({
      where: where as never,
      include: { profile: { select: { id: true, firstName: true, lastName: true, email: true } }, variant: { select: { id: true, sku: true, price: true, product: { select: { name: true, slug: true } } } } },
      orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
    }),
    prisma.wishlistItem.count({ where: where as never }),
  ]);
  return success({ wishlistItems: items, pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) } });
}
