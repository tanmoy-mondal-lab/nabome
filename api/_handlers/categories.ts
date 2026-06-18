import { prisma } from "../_lib/prisma";
import { success, notFound, serverError } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleCategoryRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "list":
      return handleList();
    case "detail":
      return handleDetail(params[0]);
    default:
      return new Response("Unknown action", { status: 400 });
  }
}

async function handleList(): Promise<Response> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        children: true,
        subcategories: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: "asc" },
    });
    return success({ categories });
  } catch (err) {
    return serverError(err);
  }
}

async function handleDetail(slug: string): Promise<Response> {
  try {
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
