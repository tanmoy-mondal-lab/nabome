import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth-middleware";
import { logAction, extractRequestMeta } from "../../_lib/audit";

export async function handleAdminMarketingRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "announcements":
      return handleAnnouncementsList(ctx.env);
    case "createAnnouncement":
      return handleCreateAnnouncement(req, ctx);
    case "updateAnnouncement":
      return handleUpdateAnnouncement(params[0], req, ctx);
    case "deleteAnnouncement":
      return handleDeleteAnnouncement(params[0], req, ctx);
    default:
      return badRequest("Unknown action");
  }
}

async function handleAnnouncementsList(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const announcements = await prisma.announcementBar.findMany({
      orderBy: { createdAt: "desc" },
    });
    return success({ announcements });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreateAnnouncement(req: Request, ctx: RequestContext): Promise<Response> {
  const body = await req.json();
  const { text, linkUrl, linkText, bgColor, textColor, position, isActive, startDate, endDate } = body;

  if (!text) return badRequest("Announcement text is required");

  const validPositions = ["top", "bottom"];
  if (position && !validPositions.includes(position)) {
    return badRequest(`Position must be one of: ${validPositions.join(", ")}`);
  }

  try {
    const prisma = getPrisma(ctx.env);
    const announcement = await prisma.announcementBar.create({
      data: {
        text,
        linkUrl: linkUrl ?? null,
        linkText: linkText ?? null,
        bgColor: bgColor ?? null,
        textColor: textColor ?? null,
        position: position ?? "top",
        isActive: isActive ?? true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    logAction(ctx.userId, "admin.announcements.create", {
      entity: "announcement",
      entityId: announcement.id,
      metadata: { text: announcement.text },
      ...extractRequestMeta(req),
    });
    return created(announcement);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateAnnouncement(announcementId: string, req: Request, ctx: RequestContext): Promise<Response> {
  const body = await req.json();

  if (body.position) {
    const validPositions = ["top", "bottom"];
    if (!validPositions.includes(body.position)) {
      return badRequest(`Position must be one of: ${validPositions.join(", ")}`);
    }
  }

  try {
    const prisma = getPrisma(ctx.env);
    const data: Record<string, unknown> = {};
    const fields = ["text", "linkUrl", "linkText", "bgColor", "textColor", "position", "isActive"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;

    const announcement = await prisma.announcementBar.update({
      where: { id: announcementId },
      data: data as never,
    });
    logAction(ctx.userId, "admin.announcements.update", {
      entity: "announcement",
      entityId: announcementId,
      ...extractRequestMeta(req),
    });
    return success(announcement);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeleteAnnouncement(announcementId: string, req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const prisma = getPrisma(ctx.env);
    const existing = await prisma.announcementBar.findUnique({ where: { id: announcementId } });
    if (!existing) return notFound("Announcement not found");
    await prisma.announcementBar.delete({ where: { id: announcementId } });
    logAction(ctx.userId, "admin.announcements.delete", {
      entity: "announcement",
      entityId: announcementId,
      ...extractRequestMeta(req),
    });
    return success({ message: "Announcement deleted" });
  } catch (err) {
    return serverError(err);
  }
}
