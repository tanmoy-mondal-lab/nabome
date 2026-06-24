import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";

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
      return handleCreateAnnouncement(req, ctx.env);
    case "updateAnnouncement":
      return handleUpdateAnnouncement(params[0], req, ctx.env);
    case "deleteAnnouncement":
      return handleDeleteAnnouncement(params[0], ctx.env);
    default:
      return badRequest("Unknown action");
  }
}

env: anyasync function handleAnnouncementsList(ctx.env): Promise<Response> {
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

async function handleCreateAnnouncement(req: Request, env: any): Promise<Response> {
  const body = await req.json();
  const { text, linkUrl, linkText, bgColor, textColor, position, isActive, startDate, endDate } = body;

  if (!text) return badRequest("Announcement text is required");

  try {
    const prisma = getPrisma(env);
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
    return created(announcement);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateAnnouncement(announcementId: string, req: Request, env: any): Promise<Response> {
  const body = await req.json();

  try {
    const prisma = getPrisma(env);
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
    return success(announcement);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeleteAnnouncement(announcementId: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.announcementBar.delete({ where: { id: announcementId } });
    return success({ message: "Announcement deleted" });
  } catch (err) {
    return notFound("Announcement not found");
  }
}
