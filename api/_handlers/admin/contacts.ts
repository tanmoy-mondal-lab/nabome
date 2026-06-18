import { prisma } from "../../_lib/prisma";
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
      return handleList(req);
    case "markRead":
      return handleMarkRead(params[0]);
    case "delete":
      return handleDelete(params[0]);
    case "subscribers":
      return handleSubscribers(req);
    case "deleteSubscriber":
      return handleDeleteSubscriber(params[0]);
    default:
      return badRequest("Unknown action");
  }
}

async function handleList(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "25");
  const unread = url.searchParams.get("unread");

  const where: Record<string, unknown> = {};
  if (unread === "true") where.isRead = false;

  const skip = (page - 1) * limit;

  try {
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

async function handleMarkRead(submissionId: string): Promise<Response> {
  try {
    const submission = await prisma.contactSubmission.update({
      where: { id: submissionId },
      data: { isRead: true },
    });
    return success(submission);
  } catch (err) {
    return notFound("Submission not found");
  }
}

async function handleDelete(submissionId: string): Promise<Response> {
  try {
    await prisma.contactSubmission.delete({ where: { id: submissionId } });
    return success({ message: "Submission deleted" });
  } catch (err) {
    return notFound("Submission not found");
  }
}

async function handleSubscribers(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "25");

  const skip = (page - 1) * limit;

  try {
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

async function handleDeleteSubscriber(subscriberId: string): Promise<Response> {
  try {
    await prisma.newsletterSubscriber.delete({ where: { id: subscriberId } });
    return success({ message: "Subscriber removed" });
  } catch (err) {
    return notFound("Subscriber not found");
  }
}
