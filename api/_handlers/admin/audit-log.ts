import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";

export async function handleAdminAuditLogRequest(req: Request, ctx: RequestContext, _params: string[], action: string): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;
  switch (action) {
    case "list": return handleList(req, ctx.env);
    default: return badRequest("Unknown action");
  }
}

async function handleList(req: Request, env: any): Promise<Response> {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1") || 1);
  const limit = Math.max(1, parseInt(url.searchParams.get("limit") ?? "25") || 25);
  const action = url.searchParams.get("action");
  const entity = url.searchParams.get("entity");
  const profileId = url.searchParams.get("profileId");
  const where: Record<string, unknown> = {};
  if (action) where.action = { contains: action, mode: "insensitive" };
  if (entity) where.entity = entity;
  if (profileId) where.profileId = profileId;
  try {
    const prisma = getPrisma(env);
    const [items, total] = await Promise.all([
      prisma.userActionLog.findMany({
        where: where as never,
        include: { profile: { select: { id: true, firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
      }),
      prisma.userActionLog.count({ where: where as never }),
    ]);
    return success({ logs: items, pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return serverError(err);
  }
}
