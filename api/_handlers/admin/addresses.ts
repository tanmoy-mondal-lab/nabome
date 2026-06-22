import { prisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";

export async function handleAdminAddressRequest(req: Request, _ctx: RequestContext, _params: string[], action: string): Promise<Response> {
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
  const search = url.searchParams.get("search");
  const where: Record<string, unknown> = {};
  if (profileId) where.profileId = profileId;
  if (search) where.OR = [{ fullName: { contains: search, mode: "insensitive" } }, { city: { contains: search, mode: "insensitive" } }, { pincode: { contains: search } }];
  const [items, total] = await Promise.all([
    prisma.address.findMany({
      where: where as never,
      include: { profile: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
    }),
    prisma.address.count({ where: where as never }),
  ]);
  return success({ addresses: items, pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) } });
}
