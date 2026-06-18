import { prisma } from "../_lib/prisma";
import { success, notFound, serverError } from "../_lib/response";
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
      return new Response("Unknown action", { status: 400 });
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
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            compareAtPrice: true,
            gender: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!collection) return notFound("Collection not found");

    return success({ collection });
  } catch (err) {
    return serverError(err);
  }
}
