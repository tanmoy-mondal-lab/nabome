import { getPrisma } from "../_lib/prisma";
import { success, serverError, notFound } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleTagRequest(
  _req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "list": return handleList(ctx.env);
    case "detail": return handleDetail(params[0], ctx.env);
    case "products": return handleProducts(params[0], ctx.env);
    default: return serverError("Unknown action");
  }
}

async function handleList(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const tags = await prisma.productTag.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });
    return success({ tags });
  } catch (err) { return serverError(err); }
}

async function handleDetail(slug: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const tag = await prisma.productTag.findUnique({
      where: { slug },
      include: {
        _count: { select: { products: true } },
      },
    });
    if (!tag) return notFound("Tag not found");
    return success({ tag });
  } catch (err) { return serverError(err); }
}

async function handleProducts(slug: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const tag = await prisma.productTag.findUnique({ where: { slug } });
    if (!tag) return notFound("Tag not found");

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        productTags: { some: { tagId: tag.id } },
      },
      include: {
        variants: { where: { isActive: true } },
        images: { where: { isPrimary: true } },
        brand: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { sortOrder: "asc" },
    });
    return success({ products });
  } catch (err) { return serverError(err); }
}
