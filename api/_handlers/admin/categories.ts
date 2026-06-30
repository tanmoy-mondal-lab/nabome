import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../_lib/utils";
import { logAction, extractRequestMeta } from "../../_lib/audit";
import { requireAdmin } from "../../_lib/auth-middleware";
import { destroyCloudinaryAsset, destroyCloudinaryAssetIfReplaced } from "../../_lib/cloudinary";
import { toNull } from "../../_lib/sanitize";

export async function handleAdminCategoryRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "list":
      return handleList(ctx.env);
    case "create":
      return handleCreate(req, ctx, ctx.env);
    case "update":
      return handleUpdate(params[0], req, ctx, ctx.env);
    case "delete":
      return handleDelete(params[0], req, ctx, ctx.env);
    default:
      return badRequest("Unknown action");
  }
}

async function handleList(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const categories = await prisma.category.findMany({
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true, slug: true } },
        subcategories: { orderBy: { sortOrder: "asc" } },
        _count: { select: { products: true, children: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return success({ categories });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreate(req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();
  const { name, description, imageUrl, imagePublicId, parentId, sortOrder, isActive, metaTitle, metaDesc } = body;

  if (!name) return badRequest("Category name is required");

  const prisma = getPrisma(env);
  const slug = slugify(name);
  const slugExists = await prisma.category.findUnique({ where: { slug } });
  const finalSlug = slugExists ? `${slug}-${Date.now().toString(36)}` : slug;

  try {
    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description: description ?? null,
        imageUrl: imageUrl ?? null,
        imagePublicId: imagePublicId ?? null,
        parentId: parentId || null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
        metaTitle: metaTitle ?? null,
        metaDesc: metaDesc ?? null,
      },
      include: { _count: { select: { products: true, children: true } }, parent: { select: { id: true, name: true } } },
    });

    // Also create subcategory if parentId is provided and no subcategory table entry needed
    // The subcategory model exists for finer-grained categorization

    logAction(ctx.userId, "admin.category.create", {
      entity: "category",
      entityId: category.id,
      metadata: { name: category.name, slug: category.slug },
      ...extractRequestMeta(req),
    });

    return created(category);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdate(categoryId: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();

  try {
    const prisma = getPrisma(env);
    const existing = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!existing) return notFound("Category not found");

    const data: Record<string, unknown> = {};
    const fields = ["name", "description", "imageUrl", "sortOrder", "isActive", "metaTitle", "metaDesc"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = field === "imageUrl" ? toNull(body[field]) : body[field];
    }
    if (body.parentId !== undefined) data.parentId = body.parentId || null;
    if (body.imagePublicId !== undefined) {
      data.imagePublicId = await destroyCloudinaryAssetIfReplaced(existing.imagePublicId, body.imagePublicId, env);
    }

    if (body.name && body.name !== existing.name) {
      const newSlug = slugify(body.name);
      const slugExists = await prisma.category.findFirst({
        where: { slug: newSlug, id: { not: categoryId } },
      });
      data.slug = slugExists ? `${newSlug}-${Date.now().toString(36)}` : newSlug;
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: data as never,
      include: { _count: { select: { products: true, children: true } }, parent: { select: { id: true, name: true } } },
    });

    logAction(ctx.userId, "admin.category.update", {
      entity: "category",
      entityId: categoryId,
      metadata: { name: category.name },
      ...extractRequestMeta(req),
    });

    return success(category);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDelete(categoryId: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) return notFound("Category not found");

    const productCount = await prisma.product.count({ where: { categoryId } });
    if (productCount > 0) {
      return badRequest(`Cannot delete category: ${productCount} products are assigned to it. Move them first.`);
    }

    const subCount = await prisma.category.count({ where: { parentId: categoryId } });
    if (subCount > 0) {
      return badRequest(`Cannot delete category: ${subCount} subcategories are assigned to it. Remove them first.`);
    }

    if (category.imagePublicId) {
      await destroyCloudinaryAsset(category.imagePublicId, env);
    }

    await prisma.category.delete({ where: { id: categoryId } });

    logAction(ctx.userId, "admin.category.delete", {
      entity: "category",
      entityId: categoryId,
      metadata: {},
      ...extractRequestMeta(req),
    });

    return success({ message: "Category deleted" });
  } catch (err) {
    return serverError(err);
  }
}
