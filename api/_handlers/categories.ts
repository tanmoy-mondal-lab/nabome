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
      return handleList(ctx.env);
    case "detail":
      return handleDetail(params[0], ctx.env);
    case "subcategories":
      return handleSubcategories(req, ctx.env);
    default:
      return badRequest("Unknown action");
  }
}

async function handleList(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const categories = await prisma.category.findMany({
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

async function handleDetail(slug: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const category = await prisma.category.findFirst({
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

async function handleSubcategories(req: Request, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const url = new URL(req.url);
    const categoryId = url.searchParams.get("categoryId");

    const where: Record<string, unknown> = { isActive: true };
    if (categoryId) where.categoryId = categoryId;

    const subcategories = await prisma.subcategory.findMany({
      where,
      select: { id: true, name: true, slug: true, categoryId: true },
      orderBy: [{ categoryId: "asc" as const }, { sortOrder: "asc" as const }],
    });

    return success({ subcategories });
  } catch (err) {
    return serverError(err);
  }
}
