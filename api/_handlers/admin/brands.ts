import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../../src/lib/utils/format";
import { requireAdmin } from "../../_lib/auth";
import { logAction, extractRequestMeta } from "../../_lib/audit";

export async function handleAdminBrandRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "list": return handleList(ctx.env);
    case "create": return handleCreate(req, ctx);
    case "detail": return handleDetail(params[0], ctx.env);
    case "update": return handleUpdate(params[0], req, ctx);
    case "delete": return handleDelete(params[0], req, ctx);
    default: return badRequest("Unknown action");
  }
}

env: anyasync function handleList(ctx.env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const brands = await prisma.brand.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: "asc" as const },
    });
    return success({ brands });
  } catch (err) { return serverError(err); }
}

async function handleDetail(id: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) return notFound("Brand not found");
    return success({ brand });
  } catch (err) { return serverError(err); }
}

async function handleCreate(req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();
  const { name, description, logoUrl, websiteUrl, sortOrder } = body;
  if (!name) return badRequest("Brand name is required");
  const slug = slugify(name);
  const slugExists = await prisma.brand.findUnique({ where: { slug } });
  const finalSlug = slugExists ? `${slug}-${Date.now().toString(36)}` : slug;
  try {
    const prisma = getPrisma(env);
    const brand = await prisma.brand.create({
      data: { name, slug: finalSlug, description, logoUrl, websiteUrl, sortOrder: sortOrder ?? 0 },
    });
    logAction(ctx.userId,  ctx.userId, "admin.brands.create", {
      entity: "brand",
      entityId: brand.id,
      metadata: { name: brand.name, slug: brand.slug },
      ...extractRequestMeta(req),
    });
    return created(brand);
  } catch (err) { return serverError(err); }
}

async function handleUpdate(id: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();
  try {
    const prisma = getPrisma(env);
    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) return notFound("Brand not found");
    const data: Record<string, unknown> = {};
    const fields = ["name", "description", "logoUrl", "websiteUrl", "sortOrder", "isActive"];
    for (const f of fields) { if (body[f] !== undefined) data[f] = body[f]; }
    if (body.name) data.slug = slugify(body.name);
    const brand = await prisma.brand.update({ where: { id }, data: data as never });
    logAction(ctx.userId,  ctx.userId, "admin.brands.update", {
      entity: "brand",
      entityId: brand.id,
      metadata: { name: brand.name },
      ...extractRequestMeta(req),
    });
    return success(brand);
  } catch (err) { return serverError(err); }
}

async function handleDelete(id: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.brand.update({ where: { id }, data: { isActive: false } });
    logAction(ctx.userId,  ctx.userId, "admin.brands.delete", {
      entity: "brand",
      entityId: id,
      ...extractRequestMeta(req),
    });
    return success({ message: "Brand archived" });
  } catch (err) { return notFound("Brand not found"); }
}
