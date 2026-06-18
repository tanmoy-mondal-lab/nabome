import { prisma } from "../_lib/prisma";
import { success, badRequest, serverError, created } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleReviewRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "create":
      return handleCreate(ctx, req);
    default:
      return badRequest("Unknown action");
  }
}

async function handleCreate(ctx: RequestContext, req: Request): Promise<Response> {
  if (!ctx.userId) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const { productId, orderId, rating, title, body: reviewBody, images } = body;

  if (!productId || !rating) {
    return badRequest("Product ID and rating are required");
  }

  if (rating < 1 || rating > 5) {
    return badRequest("Rating must be between 1 and 5");
  }

  try {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) return badRequest("Product not found");

    // Check for duplicate review
    if (orderId) {
      const existing = await prisma.review.findUnique({
        where: { productId_profileId_orderId: { productId, profileId: ctx.userId, orderId } },
      });
      if (existing) {
        return badRequest("You have already reviewed this product for this order");
      }
    }

    const review = await prisma.review.create({
      data: {
        productId,
        profileId: ctx.userId,
        orderId: orderId ?? null,
        rating,
        title: title ?? null,
        body: reviewBody ?? null,
        images: images ?? [],
      },
    });

    return created(review);
  } catch (err) {
    return serverError(err);
  }
}
