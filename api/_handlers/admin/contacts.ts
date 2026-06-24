import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";

export async function handleAdminContactRequest(
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
    case "markRead":
      return handleMarkRead(params[0], ctx.env);
    case "delete":
      return handleDelete(params[0], ctx.env);
    case "subscribers":
      return handleSubscribers(req, ctx.env);
    case "deleteSubscriber":
      return handleDeleteSubscriber(params[0], ctx.env);
    default:
      return badRequest("Unknown action");
  }
}

async function handleList(req: Request, env: any): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "25");
  const unread = url.searchParams.get("unread");

  const where: Record<string, unknown> = {};
  if (unread === "true") where.isRead = false;

  const skip = (page - 1) * limit;

  try {
    const prisma = getPrisma(env);
    const [submissions, total, unreadCount] = await Promise.all([
      prisma.contactSubmission.findMany({
        where: where as never,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.contactSubmission.count({ where: where as never }),
      prisma.contactSubmission.count({ where: { isRead: false } }),
    ]);

    return success({
      submissions,
      unreadCount,
      pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleMarkRead(submissionId: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const submission = await prisma.contactSubmission.update({
      where: { id: submissionId },
      data: { isRead: true },
    });
    return success(submission);
  } catch (err) {
    return notFound("Submission not found");
  }
}

async function handleDelete(submissionId: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.contactSubmission.delete({ where: { id: submissionId } });
    return success({ message: "Submission deleted" });
  } catch (err) {
    return notFound("Submission not found");
  }
}

async function handleSubscribers(req: Request, env: any): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "25");

  const skip = (page - 1) * limit;

  try {
    const prisma = getPrisma(env);
    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.newsletterSubscriber.count(),
    ]);

    return success({
      subscribers,
      pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeleteSubscriber(subscriberId: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.newsletterSubscriber.delete({ where: { id: subscriberId } });
    return success({ message: "Subscriber removed" });
  } catch (err) {
    return notFound("Subscriber not found");
  }
}
