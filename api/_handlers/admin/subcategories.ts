import type { Env } from "../../_lib/env";
import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../_lib/utils";
import { requireAdmin } from "../../_lib/auth-middleware";
import { toNull } from "../../_lib/sanitize";
import { deleteMedia } from "../../_lib/media-service";

export async function handleAdminSubcategoryRequest(
  req: Request, ctx: RequestContext, params: string[], action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "list": return handleList(ctx.env!);
    case "create": return handleCreate(req, ctx.env!);
    case "update": return handleUpdate(params[0], req, ctx.env!);
    case "delete": return handleDelete(params[0], ctx.env!);
    default: return badRequest("Unknown action");
  }
}

async function handleList(env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const subcategories = await prisma.subcategories.findMany({
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
      orderBy: [{ categoryId: "asc" as const }, { sortOrder: "asc" as const }],
    });
    return success({ subcategories });
  } catch (err) { return serverError(err); }
}

async function handleCreate(req: Request, env: Env): Promise<Response> {
  const body = await req.json();
  const { name, categoryId, description, imageUrl, imagePublicId, sortOrder } = body as { name?: string; categoryId?: string; description?: string; imageUrl?: string; imagePublicId?: string; sortOrder?: number };
  if (!name || !categoryId) return badRequest("Name and categoryId are required");
  const slug = slugify(name);
  const prisma = getPrisma(env);
  const slugExists = await prisma.subcategories.findUnique({ where: { slug } });
  const finalSlug = slugExists ? `${slug}-${Date.now().toString(36)}` : slug;
  try {
    const sub = await prisma.subcategories.create({
      data: { name, slug: finalSlug, categoryId: (toNull(categoryId) ?? categoryId) as string, description: description ?? null, imageUrl: imageUrl ?? null, imagePublicId: imagePublicId ?? null, sortOrder: sortOrder ?? 0 },
    });
    return created(sub);
  } catch (err) { return serverError(err); }
}

async function handleUpdate(id: string, req: Request, env: Env): Promise<Response> {
  const body = await req.json();
  try {
    const prisma = getPrisma(env);
    const existing = await prisma.subcategories.findUnique({ where: { id } });
    if (!existing) return notFound("Subcategory not found");
    const data: Record<string, unknown> = {};
    const fields = ["name", "categoryId", "description", "imageUrl", "sortOrder", "isActive"];
    for (const f of fields) { if (body[f] !== undefined) data[f] = f === "categoryId" ? toNull(body[f]) : body[f]; }
    if (body.imageUrl !== undefined) data.imageUrl = toNull(body.imageUrl);
    // Handle image media replacement using MediaService
    if (body.imagePublicId !== undefined && existing.imagePublicId !== body.imagePublicId) {
      if (existing.imagePublicId) {
        const oldMediaAsset = await prisma.media_assets.findFirst({
          where: { publicId: existing.imagePublicId, entityType: "categories", entityId: id },
        });
        if (oldMediaAsset) {
          await deleteMedia(oldMediaAsset.id, env);
        }
      }
      data.imagePublicId = body.imagePublicId;
    }
    if (body.name) {
      const newSlug = slugify(body.name);
      const slugExists = await prisma.subcategories.findFirst({
        where: { slug: newSlug, id: { not: id } },
      });
      data.slug = slugExists ? `${newSlug}-${Date.now().toString(36)}` : newSlug;
    }
    const sub = await prisma.subcategories.update({ where: { id }, data: data as never });
    return success(sub);
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2025") return notFound("Subcategory not found");
    return serverError(err);
  }
}

async function handleDelete(id: string, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.subcategories.update({ where: { id }, data: { isActive: false } });
    return success({ message: "Subcategory archived" });
  } catch (err) { return notFound("Subcategory not found"); }
}
