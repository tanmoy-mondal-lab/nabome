import type { Env } from "../_lib/env";
import { getPrisma } from "../_lib/prisma";
import { badRequest, unauthorized, serverError, created } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleReviewRequest(
  req: Request,
  ctx: RequestContext,
  _params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "create":
      return handleCreate(ctx, req, ctx.env!);
    default:
      return badRequest("Unknown action");
  }
}

async function handleCreate(ctx: RequestContext, req: Request, env: Env): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const { productId, orderId, rating, title, body: reviewBody, images } = body;

  if (!productId || !rating || typeof productId !== 'string' || typeof rating !== 'number') {
    return badRequest("Product ID and rating are required");
  }

  if (rating < 1 || rating > 5) {
    return badRequest("Rating must be between 1 and 5");
  }

  try {
    const prisma = getPrisma(env);
    // Check if product exists
    const product = await prisma.products.findUnique({
      where: { id: productId as string },
      select: { id: true },
    });
    if (!product) return badRequest("Product not found");

    // Check for duplicate review
    if (orderId && typeof orderId === 'string') {
      const existing = await prisma.reviews.findUnique({
        where: { productId_profileId_orderId: { productId: productId as string, profileId: ctx.userId, orderId } },
      });
      if (existing) {
        return badRequest("You have already reviewed this product for this order");
      }
    }

    const review = await prisma.reviews.create({
      data: {
        productId: productId as string,
        profileId: ctx.userId,
        orderId: orderId as string | null ?? null,
        rating: rating as number,
        title: title as string | null ?? null,
        body: reviewBody as string | null ?? null,
        images: images as string[] | undefined ?? [],
      },
    });

    return created(review);
  } catch (err) {
    return serverError(err);
  }
}
