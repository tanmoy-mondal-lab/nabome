import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth-middleware";

export async function handleAdminCampaignRequest(req: Request, ctx: RequestContext, params: string[], action: string): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;
  switch (action) {
    case "list": return handleList(req, ctx.env);
    case "create": return handleCreate(req, ctx.env);
    case "detail": return handleDetail(params[0], ctx.env);
    case "update": return handleUpdate(params[0], req, ctx.env);
    case "delete": return handleDelete(params[0], ctx.env);
    default: return badRequest("Unknown action");
  }
}

async function handleList(req: Request, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "25");
    const type = url.searchParams.get("type");
    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    const [items, total] = await Promise.all([
      prisma.campaign.findMany({ where: where as never, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.campaign.count({ where: where as never }),
    ]);
    return success({ campaigns: items, pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) { return serverError(err); }
}

async function handleCreate(req: Request, env: any): Promise<Response> {
  const body = await req.json();
  if (!body.name || !body.type || !body.startDate) return badRequest("Name, type, and startDate are required");
  if (body.endDate && new Date(body.endDate) < new Date(body.startDate)) return badRequest("End date must be after start date");
  try {
    const prisma = getPrisma(env);
    const item = await prisma.campaign.create({ data: { name: body.name, description: body.description ?? null, type: body.type, startDate: new Date(body.startDate), endDate: body.endDate ? new Date(body.endDate) : null, isActive: body.isActive ?? true, metadata: body.metadata ?? null } });
    return created(item);
  } catch (err) { return serverError(err); }
}

async function handleDetail(id: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const item = await prisma.campaign.findUnique({ where: { id } });
    if (!item) return notFound("Campaign not found");
    return success({ campaign: item });
  } catch (err) { return serverError(err); }
}

async function handleUpdate(id: string, req: Request, env: any): Promise<Response> {
  const prisma = getPrisma(env);
  const body = await req.json();
  const existing = await prisma.campaign.findUnique({ where: { id } });
  if (!existing) return notFound("Campaign not found");
  const data: Record<string, unknown> = {};
  ["name", "description", "type", "isActive", "metadata"].forEach((f) => { if (body[f] !== undefined) data[f] = body[f]; });
  if (body.startDate) data.startDate = new Date(body.startDate);
  if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;
  try {
    const updated = await prisma.campaign.update({ where: { id }, data: data as never });
    return success(updated);
  } catch (err) { return serverError(err); }
}

async function handleDelete(id: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.campaign.delete({ where: { id } });
    return success({ message: "Campaign deleted" });
  } catch {
    return notFound("Campaign not found");
  }
}
