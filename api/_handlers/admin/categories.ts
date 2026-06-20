import { prisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../../src/lib/utils/format";
import { logAction, extractRequestMeta } from "../../_lib/audit";
import { requireAdmin } from "../../_lib/auth";

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
      return handleList();
    case "create":
      return handleCreate(req, ctx);
    case "update":
      return handleUpdate(params[0], req, ctx);
    case "delete":
      return handleDelete(params[0], req, ctx);
    default:
      return badRequest("Unknown action");
  }
}

async function handleList(): Promise<Response> {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true, slug: true } },
        subcategories: { orderBy: { sortOrder: "asc" } },
        _count: { select: { products: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return success({ categories });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreate(req: Request, ctx: RequestContext): Promise<Response> {
  const body = await req.json();
  const { name, description, imageUrl, parentId, sortOrder, isActive, metaTitle, metaDesc } = body;

  if (!name) return badRequest("Category name is required");

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
        parentId: parentId ?? null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
        metaTitle: metaTitle ?? null,
        metaDesc: metaDesc ?? null,
      },
      include: { _count: { select: { products: true } } },
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

async function handleUpdate(categoryId: string, req: Request, ctx: RequestContext): Promise<Response> {
  const body = await req.json();

  try {
    const existing = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!existing) return notFound("Category not found");

    const data: Record<string, unknown> = {};
    const fields = ["name", "description", "imageUrl", "sortOrder", "isActive", "metaTitle", "metaDesc"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    if (body.parentId !== undefined) data.parentId = body.parentId || null;

    if (body.name && body.name !== existing.name) {
      data.slug = slugify(body.name);
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: data as never,
      include: { _count: { select: { products: true } } },
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

async function handleDelete(categoryId: string, req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const productCount = await prisma.product.count({ where: { categoryId } });
    if (productCount > 0) {
      return badRequest(`Cannot delete category: ${productCount} products are assigned to it. Move them first.`);
    }

    await prisma.category.update({
      where: { id: categoryId },
      data: { isActive: false },
    });
    logAction(ctx.userId, "admin.category.delete", {
      entity: "category",
      entityId: categoryId,
      metadata: {},
      ...extractRequestMeta(req),
    });

    return success({ message: "Category deactivated" });
  } catch (err) {
    return serverError(err);
  }
}
