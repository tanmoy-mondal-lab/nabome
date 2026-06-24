import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";

export async function handleAdminLoginAttemptRequest(req: Request, _ctx: RequestContext, _params: string[], action: string): Promise<Response> {
  const adminGuard = requireAdmin(_ctx);
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
  const email = url.searchParams.get("email");
  const successFilter = url.searchParams.get("success");
  const where: Record<string, unknown> = {};
  if (email) where.email = { contains: email, mode: "insensitive" };
  if (successFilter === "true") where.success = true;
  if (successFilter === "false") where.success = false;
  try {
    const prisma = getPrisma(env);
    const [items, total] = await Promise.all([
      prisma.loginAttempt.findMany({
        where: where as never,
        include: { profile: { select: { id: true, firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
      }),
      prisma.loginAttempt.count({ where: where as never }),
    ]);
    return success({ loginAttempts: items, pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) } });
  } catch (e) {
    return serverError(e instanceof Error ? e : new Error(String(e)));
  }
}
