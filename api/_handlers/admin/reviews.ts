import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth-middleware";
import { logAction, extractRequestMeta } from "../../_lib/audit";

export async function handleAdminReviewRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "list":
      return handleList(req, ctx.env);
    case "approve":
      return handleApprove(params[0], req, ctx);
    case "delete":
      return handleDelete(params[0], req, ctx);
    default:
      return badRequest("Unknown action");
  }
}

async function handleList(req: Request, env: any): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "25");
  const status = url.searchParams.get("status"); // "pending" | "approved"

  const where: Record<string, unknown> = {};
  if (status === "pending") where.isApproved = false;
  if (status === "approved") where.isApproved = true;

  const skip = (page - 1) * limit;

  try {
    const prisma = getPrisma(env);
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: where as never,
        include: {
          product: { select: { id: true, name: true, slug: true } },
          profile: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: where as never }),
    ]);

    return success({
      reviews,
      pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleApprove(reviewId: string, req: Request, ctx: RequestContext): Promise<Response> {
  const body = await req.json();
  const { approved } = body;

  try {
    const prisma = getPrisma(ctx.env);
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) return notFound("Review not found");

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: approved ?? true },
      include: {
        product: { select: { name: true } },
        profile: { select: { firstName: true } },
      },
    });

    logAction(ctx.userId, approved ? "admin.reviews.approve" : "admin.reviews.unapprove", {
      entity: "review",
      entityId: reviewId,
      metadata: { rating: updated.rating },
      ...extractRequestMeta(req),
    });

    return success(updated);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDelete(reviewId: string, req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const prisma = getPrisma(ctx.env);
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) return notFound("Review not found");
    await prisma.review.delete({ where: { id: reviewId } });
    logAction(ctx.userId, "admin.reviews.delete", {
      entity: "review",
      entityId: reviewId,
      ...extractRequestMeta(req),
    });
    return success({ message: "Review deleted" });
  } catch (err) {
    return serverError(err);
  }
}
