import { getPrisma } from "../_lib/prisma";
import { success, badRequest, notFound, unauthorized, serverError, created } from "../_lib/response";
import { requireAdmin } from "../_lib/auth-middleware";
import type { RequestContext } from "../_lib/types";
import { sendEmailNotification } from "../_lib/email";

export async function createNotification(
  profileId: string,
  type: string,
  title: string,
  body?: string,
  orderId?: string,
  channel: string = "in_app",
  env?: any
): Promise<void> {
  try {
    const prisma = getPrisma(env);
    const notification = await prisma.notification.create({
      data: {
        profileId,
        type: type as never,
        title,
        body: body ?? null,
        orderId: orderId ?? null,
        channel: channel as never,
        sentAt: new Date(),
      },
    });

    if (channel === "email") {
      const recipient = await prisma.profile.findUnique({
        where: { id: profileId },
        select: { email: true, firstName: true },
      });
      if (recipient?.email) {
        await sendEmailNotification("notification", {
          email: recipient.email,
          firstName: recipient.firstName,
          title,
          body: body ?? title,
          link: orderId ? `/account/orders/${orderId}` : undefined,
          siteUrl: env?.SITE_URL || env?.VITE_SITE_URL,
        }, env);
      }
    }
  } catch (err) {
    console.error("[Notification] Failed to create notification:", err);
  }
}

export async function handleNotificationRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action?: string
): Promise<Response> {
  const method = req.method;

  // Defense-in-depth: verify admin role for admin actions
  const adminActions = ["adminList", "adminTemplates", "adminUpdateTemplate", "adminSend"];
  if (action && adminActions.includes(action)) {
    const adminGuard = requireAdmin(ctx);
    if (adminGuard) return adminGuard;
  }

  // Customer routes (require auth)
  if (!action || action === "list") {
    if (method === "GET" && !params.length) return handleList(ctx, req, ctx.env);
  }
  if (action === "read") {
    if (method === "PUT") return handleMarkRead(ctx, params[0], ctx.env);
  }
  if (action === "readAll") {
    if (method === "PUT") return handleMarkAllRead(ctx, ctx.env);
  }
  if (action === "unreadCount") {
    if (method === "GET") return handleUnreadCount(ctx, ctx.env);
  }

  // Admin routes
  if (action === "adminList") {
    if (method === "GET") return handleAdminList(ctx, req, ctx.env);
  }
  if (action === "adminTemplates") {
    if (method === "GET") return handleListTemplates(ctx, ctx.env);
  }
  if (action === "adminUpdateTemplate") {
    if (method === "PUT") return handleUpdateTemplate(ctx, params[0], req, ctx.env);
  }
  if (action === "adminSend") {
    if (method === "POST") return handleAdminSend(ctx, req, ctx.env);
  }

  return notFound();
}

async function handleList(ctx: RequestContext, req: Request, env: any): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "20");
  const isRead = url.searchParams.get("isRead");

  const where: Record<string, unknown> = { profileId: ctx.userId };
  if (isRead === "true") where.isRead = true;
  if (isRead === "false") where.isRead = false;

  const skip = (page - 1) * limit;

  try {
    const prisma = getPrisma(env);
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: where as never,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: where as never }),
    ]);

    return success({
      notifications,
      pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleMarkRead(ctx: RequestContext, notificationId: string, env: any): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  try {
    const prisma = getPrisma(env);
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, profileId: ctx.userId },
    });
    if (!notification) return notFound("Notification not found");

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });

    return success({ notification: updated });
  } catch (err) {
    return serverError(err);
  }
}

async function handleMarkAllRead(ctx: RequestContext, env: any): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  try {
    const prisma = getPrisma(env);
    await prisma.notification.updateMany({
      where: { profileId: ctx.userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return success({ message: "All notifications marked as read" });
  } catch (err) {
    return serverError(err);
  }
}

async function handleUnreadCount(ctx: RequestContext, env: any): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  try {
    const prisma = getPrisma(env);
    const count = await prisma.notification.count({
      where: { profileId: ctx.userId, isRead: false },
    });

    return success({ count });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminList(ctx: RequestContext, req: Request, env: any): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "25");
  const isRead = url.searchParams.get("isRead");
  const type = url.searchParams.get("type");
  const channel = url.searchParams.get("channel");

  const where: Record<string, unknown> = {};
  if (isRead === "true") where.isRead = true;
  if (isRead === "false") where.isRead = false;
  if (type) where.type = type;
  if (channel) where.channel = channel;

  const skip = (page - 1) * limit;

  try {
    const prisma = getPrisma(env);
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: where as never,
        include: {
          profile: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: where as never }),
    ]);

    return success({
      notifications,
      pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleListTemplates(ctx: RequestContext, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const templates = await prisma.notificationTemplate.findMany({
      orderBy: { event: "asc" },
    });
    return success({ templates });
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateTemplate(ctx: RequestContext, templateId: string, req: Request, env: any): Promise<Response> {
  const body = await req.json();
  const allowedFields = ["subject", "emailBody", "smsBody", "inAppBody", "isActive"];
  const updateData: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return badRequest("No valid fields to update");
  }

  try {
    const prisma = getPrisma(env);
    const existing = await prisma.notificationTemplate.findUnique({ where: { id: templateId } });
    if (!existing) return notFound("Template not found");

    const updated = await prisma.notificationTemplate.update({
      where: { id: templateId },
      data: updateData as never,
    });

    return success({ template: updated });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminSend(ctx: RequestContext, req: Request, env: any): Promise<Response> {
  const body = await req.json();
  const { profileId, type, title, body: messageBody, orderId, channel } = body;

  if (!profileId || !type || !title) {
    return badRequest("profileId, type, and title are required");
  }

  try {
    const prisma = getPrisma(env);
    const profile = await prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) return notFound("Profile not found");

    await createNotification(profileId, type, title, messageBody ?? null, orderId ?? null, channel ?? "in_app", env);

    return created({ message: "Notification sent" });
  } catch (err) {
    return serverError(err);
  }
}
