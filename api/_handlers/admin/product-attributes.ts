import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth-middleware";

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
  try {
    const prisma = getPrisma(env);
    const items = await prisma.productAttribute.findMany({ where: where as never, orderBy: { name: "asc" } });
    return success({ attributes: items });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreate(req: Request, env: any): Promise<Response> {
  const body = await req.json();
  if (!body.productId || !body.name?.trim() || !body.value?.trim()) return badRequest("productId, name, and value are required");
  try {
    const prisma = getPrisma(env);
    // Validate product exists
    const product = await prisma.product.findUnique({ where: { id: body.productId }, select: { id: true } });
    if (!product) return notFound("Product not found");
    const item = await prisma.productAttribute.create({
      data: {
        productId: body.productId,
        name: body.name.trim().slice(0, 100),
        value: body.value.trim().slice(0, 200),
      },
    });
    return created(item);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdate(id: string, req: Request, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const body = await req.json();
    const existing = await prisma.productAttribute.findUnique({ where: { id } });
    if (!existing) return notFound("Attribute not found");
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = String(body.name).trim().slice(0, 100);
    if (body.value !== undefined) data.value = String(body.value).trim().slice(0, 200);
    if (Object.keys(data).length === 0) return badRequest("No fields to update");
    const updated = await prisma.productAttribute.update({ where: { id }, data: data as never });
    return success(updated);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDelete(id: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const existing = await prisma.productAttribute.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return notFound("Attribute not found");
    await prisma.productAttribute.delete({ where: { id } });
    return success({ message: "Attribute deleted" });
  } catch (err) {
    return serverError(err);
  }
}
