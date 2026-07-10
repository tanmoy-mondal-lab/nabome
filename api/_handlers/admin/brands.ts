import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../_lib/utils";
import { requireAdmin } from "../../_lib/auth-middleware";
import { logAction, extractRequestMeta } from "../../_lib/audit";
import { deleteMedia } from "../../_lib/media-service";
import { toNull } from "../../_lib/sanitize";

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
    case "create": return handleCreate(req, ctx, ctx.env);
    case "detail": return handleDetail(params[0], ctx.env);
    case "update": return handleUpdate(params[0], req, ctx, ctx.env);
    case "delete": return handleDelete(params[0], req, ctx, ctx.env);
    default: return badRequest("Unknown action");
  }
}

async function handleList(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const brands = await prisma.brands.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: "asc" as const },
    });
    return success({ brands });
  } catch (err) { return serverError(err); }
}

async function handleDetail(id: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const brand = await prisma.brands.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) return notFound("Brand not found");
    return success({ brand });
  } catch (err) { return serverError(err); }
}

async function handleCreate(req: Request, ctx: RequestContext, env: any): Promise<Response> {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const { name, description, logoUrl, logoPublicId, websiteUrl, sortOrder } = body;
  if (!name) return badRequest("Brand name is required");
  const prisma = getPrisma(env);
  const slug = slugify(name);
  const slugExists = await prisma.brands.findUnique({ where: { slug } });
  const finalSlug = slugExists ? `${slug}-${Date.now().toString(36)}` : slug;
  try {
    const brand = await prisma.brands.create({
      data: { name, slug: finalSlug, description, logoUrl, logoPublicId, websiteUrl, sortOrder: sortOrder ?? 0 },
    });
    logAction(ctx.userId, "admin.brands.create", {
      entity: "brand",
      entityId: brand.id,
      metadata: { name: brand.name, slug: brand.slug },
      ...extractRequestMeta(req),
    });
    return created(brand);
  } catch (err) { return serverError(err); }
}

async function handleUpdate(id: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  try {
    const prisma = getPrisma(env);
    const existing = await prisma.brands.findUnique({ where: { id } });
    if (!existing) return notFound("Brand not found");
    const data: Record<string, unknown> = {};
    const fields = ["name", "description", "logoUrl", "websiteUrl", "sortOrder", "isActive"];
    for (const f of fields) { if (body[f] !== undefined) data[f] = body[f]; }
    if (body.logoUrl !== undefined) data.logoUrl = toNull(body.logoUrl);
    // Handle logo media replacement using MediaService
    if (body.logoPublicId !== undefined && existing.logoPublicId !== body.logoPublicId) {
      if (existing.logoPublicId) {
        // Find the media asset record for the old logo
        const oldMediaAsset = await prisma.media_assets.findFirst({
          where: { publicId: existing.logoPublicId, entityType: "brands", entityId: id },
        });
        if (oldMediaAsset) {
          await deleteMedia(oldMediaAsset.id, env);
        }
      }
      data.logoPublicId = body.logoPublicId;
    }
    if (body.name) {
      const newSlug = slugify(body.name);
      const slugExists = await prisma.brands.findFirst({
        where: { slug: newSlug, id: { not: id } },
      });
      data.slug = slugExists ? `${newSlug}-${Date.now().toString(36)}` : newSlug;
    }
    const brand = await prisma.brands.update({ where: { id }, data: data as never });
    logAction(ctx.userId, "admin.brands.update", {
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
    const existing = await prisma.brands.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return notFound("Brand not found");
    await prisma.brands.update({ where: { id }, data: { isActive: false } });
    logAction(ctx.userId, "admin.brands.delete", {
      entity: "brand",
      entityId: id,
      ...extractRequestMeta(req),
    });
    return success({ message: "Brand archived" });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2025") return notFound("Brand not found");
    return serverError(err);
  }
}
