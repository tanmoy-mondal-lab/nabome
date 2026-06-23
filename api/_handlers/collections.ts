import { prisma } from "../_lib/prisma";
import { success, badRequest, notFound, serverError } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleCollectionRequest(
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
      return badRequest("Unknown action");
  }
}

async function handleList(): Promise<Response> {
  try {
    const collections = await prisma.collection.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: new Date() } }] },
          { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
        ],
      },
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: "asc" },
    });
    return success({ collections });
  } catch (err) {
    return serverError(err);
  }
}

async function handleDetail(slug: string): Promise<Response> {
  try {
    const collection = await prisma.collection.findFirst({
      where: { slug, isActive: true },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!collection) return notFound("Collection not found");

    // Fetch products separately to avoid deep nesting that breaks Neon adapter
    const products = await prisma.product.findMany({
      where: { collectionId: collection.id, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        basePrice: true,
        salePrice: true,
        compareAtPrice: true,
        gender: true,
        isNew: true,
        isFeatured: true,
        material: true,
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        variants: {
          where: { isActive: true },
          select: { id: true, size: true, color: true, colorHex: true, stock: true, reservedStock: true, priceAdjustment: true },
        },
        productLabels: {
          select: {
            label: { select: { name: true, slug: true, color: true } },
          },
        },
        _count: { select: { reviews: true } },
      },
      orderBy: { sortOrder: "asc" },
    });

    return success({ collection: { ...collection, products } });
  } catch (err) {
    return serverError(err);
  }
}
