import { prisma } from "../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleWishlistRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action?: string
): Promise<Response> {
  if (!ctx.userId) return new Response("Unauthorized", { status: 401 });

  switch (action) {
    case "add":
      return handleAdd(ctx.userId, req);
    case "remove":
      return handleRemove(ctx.userId, params[0]);
    default:
      return handleList(ctx.userId);
  }
}

async function handleList(userId: string): Promise<Response> {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { profileId: userId },
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                basePrice: true,
                compareAtPrice: true,
                currency: true,
              },
            },
            images: { take: 1, where: { isPrimary: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return success({ items });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdd(userId: string, req: Request): Promise<Response> {
  const body = await req.json();
  const { variantId } = body;

  if (!variantId) return badRequest("Variant ID is required");

  try {
    const existing = await prisma.wishlistItem.findUnique({
      where: { profileId_variantId: { profileId: userId, variantId } },
    });

    if (existing) {
      return success({ message: "Already in wishlist", item: existing });
    }

    const item = await prisma.wishlistItem.create({
      data: { profileId: userId, variantId },
      include: {
        variant: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, basePrice: true, compareAtPrice: true },
            },
            images: { take: 1, where: { isPrimary: true } },
          },
        },
      },
    });

    return created(item);
  } catch (err) {
    return serverError(err);
  }
}

async function handleRemove(userId: string, variantId: string): Promise<Response> {
  try {
    const item = await prisma.wishlistItem.findUnique({
      where: { profileId_variantId: { profileId: userId, variantId } },
    });

    if (!item) return notFound("Item not found in wishlist");

    await prisma.wishlistItem.delete({
      where: { profileId_variantId: { profileId: userId, variantId } },
    });

    return success({ message: "Removed from wishlist" });
  } catch (err) {
    return serverError(err);
  }
}
