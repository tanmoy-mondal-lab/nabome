import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";

export async function handleAdminSessionRequest(req: Request, _ctx: RequestContext, params: string[], action: string): Promise<Response> {
  const adminGuard = requireAdmin(_ctx);
  if (adminGuard) return adminGuard;
  switch (action) {
    case "list": return handleList(req, ctx.env);
    case "revoke": return handleRevoke(params[0], ctx.env);
    default: return badRequest("Unknown action");
  }
}

async function handleList(req: Request, env: any): Promise<Response> {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1") || 1);
  const limit = Math.max(1, parseInt(url.searchParams.get("limit") ?? "25") || 25);
  const profileId = url.searchParams.get("profileId");
  const isActive = url.searchParams.get("isActive");
  const where: Record<string, unknown> = {};
  if (profileId) where.profileId = profileId;
  if (isActive === "true") where.isActive = true;
  if (isActive === "false") where.isActive = false;
  const [items, total] = await Promise.all([
    prisma.authSession.findMany({
      where: where as never,
      include: { profile: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { lastActiveAt: "desc" }, skip: (page - 1) * limit, take: limit,
    }),
    prisma.authSession.count({ where: where as never }),
  ]);
  return success({ sessions: items, pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) } });
}

async function handleRevoke(sessionId: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const session = await prisma.authSession.findUnique({ where: { id: sessionId } });
    if (!session) return notFound("Session not found");
    await prisma.authSession.update({ where: { id: sessionId }, data: { isActive: false, revokedAt: new Date() } });
    return success({ message: "Session revoked" });
  } catch { return serverError(new Error("Failed to revoke session")); }
}
