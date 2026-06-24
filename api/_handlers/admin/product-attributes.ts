import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";

export async function handleAdminProductAttributeRequest(req: Request, ctx: RequestContext, params: string[], action: string): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;
  switch (action) {
    case "list": return handleList(req, ctx.env);
    case "create": return handleCreate(req, ctx.env);
    case "update": return handleUpdate(params[0], req, ctx.env);
    case "delete": return handleDelete(params[0], ctx.env);
    default: return badRequest("Unknown action");
  }
}

async function handleList(req: Request, env: any): Promise<Response> {
  const url = new URL(req.url);
  const productId = url.searchParams.get("productId");
  const where: Record<string, unknown> = {};
  if (productId) where.productId = productId;
  const items = await prisma.productAttribute.findMany({ where: where as never, orderBy: { name: "asc" } });
  return success({ attributes: items });
}

async function handleCreate(req: Request, env: any): Promise<Response> {
  const body = await req.json();
  if (!body.productId || !body.name || !body.value) return badRequest("productId, name, and value are required");
  try {
    const prisma = getPrisma(env);
    const item = await prisma.productAttribute.create({ data: { productId: body.productId, name: body.name, value: body.value } });
    return created(item);
  } catch (err) { return serverError(err); }
}

async function handleUpdate(id: string, req: Request, env: any): Promise<Response> {
  const body = await req.json();
  const existing = await prisma.productAttribute.findUnique({ where: { id } });
  if (!existing) return notFound("Attribute not found");
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.value !== undefined) data.value = body.value;
  try {
    const prisma = getPrisma(env);
    const updated = await prisma.productAttribute.update({ where: { id }, data: data as never });
    return success(updated);
  } catch (err) { return serverError(err); }
}

async function handleDelete(id: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.productAttribute.delete({ where: { id } });
    return success({ message: "Attribute deleted" });
  } catch {
    return notFound("Attribute not found");
  }
}
