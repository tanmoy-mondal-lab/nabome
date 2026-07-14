import type { Env } from "../_lib/env";
import { getPrisma } from "../_lib/prisma";
import { success, badRequest, notFound, serverError } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleCategoryRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "list":
      return handleList(ctx.env!);
    case "detail":
      return handleDetail(params[0], ctx.env!);
    case "subcategories":
      return handleSubcategories(req, ctx.env!);
    case "subcategoryDetail":
      return handleSubcategoryDetail(params[0], ctx.env!);
    default:
      return badRequest("Unknown action");
  }
}

async function handleList(env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const categories = await prisma.categories.findMany({
      where: { isActive: true, parentId: null },
      include: {
        _count: { select: { products: true } },
        subcategories: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true, categoryId: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const flat = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parentId: null,
      imageUrl: cat.imageUrl,
      productCount: cat._count.products,
      subcategories: cat.subcategories,
    }));

    return success({ categories: flat });
  } catch (err) {
    return serverError(err);
  }
}

async function handleDetail(slug: string, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const category = await prisma.categories.findFirst({
      where: { slug, isActive: true },
      include: {
        parent: true,
        children: { where: { isActive: true } },
        subcategories: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        _count: { select: { products: true } },
      },
    });

    if (!category) return notFound("Category not found");

    return success({ category });
  } catch (err) {
    return serverError(err);
  }
}

async function handleSubcategories(req: Request, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const url = new URL(req.url);
    const categoryId = url.searchParams.get("categoryId");

    const where: Record<string, unknown> = { isActive: true };
    if (categoryId) where.categoryId = categoryId;

    const subcategories = await prisma.subcategories.findMany({
      where,
      select: { id: true, name: true, slug: true, categoryId: true },
      orderBy: [{ categoryId: "asc" as const }, { sortOrder: "asc" as const }],
    });

    return success({ subcategories });
  } catch (err) {
    return serverError(err);
  }
}

async function handleSubcategoryDetail(slug: string, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const subcategory = await prisma.subcategories.findFirst({
      where: { slug, isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        products: {
          where: { isActive: true },
          include: {
            variants: { where: { isActive: true } },
            images: { where: { isPrimary: true }, orderBy: { sortOrder: "asc" } },
            brand: { select: { id: true, name: true, slug: true } },
          },
          orderBy: { sortOrder: "asc" },
        },
        _count: { select: { products: true } },
      },
    });

    if (!subcategory) return notFound("Subcategory not found");

    return success({ subcategory });
  } catch (err) {
    return serverError(err);
  }
}
