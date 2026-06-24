import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";
import { logAction, extractRequestMeta } from "../../_lib/audit";

export async function handleAdminSettingsRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "get":
      return handleGet(ctx.env);
    case "update":
      return handleUpdate(req, ctx);
    case "socialLinks":
      return handleSocialLinksList(ctx.env);
    case "createSocialLink":
      return handleCreateSocialLink(req, ctx);
    case "updateSocialLink":
      return handleUpdateSocialLink(params[0], req, ctx);
    case "deleteSocialLink":
      return handleDeleteSocialLink(params[0], req, ctx);
    default:
      return badRequest("Unknown action");
  }
}

async function handleGet(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const settings = await prisma.siteSetting.findFirst();
    return success({ settings });
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdate(req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();

  try {
    const prisma = getPrisma(env);
    const existing = await prisma.siteSetting.findFirst();

    const data: Record<string, unknown> = {};
    const fields = [
      "siteName", "tagline", "logoUrl", "faviconUrl", "ogImageUrl",
      "currency", "taxRate", "freeShippingThreshold",
      "shippingInfo", "returnPolicy", "aboutUs",
      "contactEmail", "contactPhone", "address",
      "googleAnalyticsId", "facebookPixelId",
      "seo", "preferences",
      "theme",
    ];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    let settings;
    if (existing) {
      settings = await prisma.siteSetting.update({
        where: { id: existing.id },
        data: data as never,
      });
    } else {
      const createData = { siteName: body.siteName ?? "নবME", ...data } as never;
      settings = await prisma.siteSetting.create({ data: createData });
    }

    logAction(ctx.userId,  ctx.userId, "admin.settings.update", {
      entity: "siteSetting",
      entityId: settings.id,
      metadata: { siteName: settings.siteName },
      ...extractRequestMeta(req),
    });
    return success(settings);
  } catch (err) {
    return serverError(err);
  }
}

async function handleSocialLinksList(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const links = await prisma.socialMediaLink.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return success({ links });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreateSocialLink(req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();
  const { platform, url, label, icon, isActive, sortOrder } = body;

  if (!platform || !url) return badRequest("Platform and URL are required");

  try {
    const prisma = getPrisma(env);
    const link = await prisma.socialMediaLink.create({
      data: {
        platform,
        url,
        label: label ?? null,
        icon: icon ?? null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });
    logAction(ctx.userId,  ctx.userId, "admin.social_links.create", {
      entity: "socialMediaLink",
      entityId: link.id,
      metadata: { platform: link.platform, url: link.url },
      ...extractRequestMeta(req),
    });
    return created(link);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateSocialLink(linkId: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();

  try {
    const prisma = getPrisma(env);
    const data: Record<string, unknown> = {};
    const fields = ["platform", "url", "label", "icon", "isActive", "sortOrder"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    const link = await prisma.socialMediaLink.update({
      where: { id: linkId },
      data: data as never,
    });
    logAction(ctx.userId,  ctx.userId, "admin.social_links.update", {
      entity: "socialMediaLink",
      entityId: link.id,
      metadata: { platform: link.platform },
      ...extractRequestMeta(req),
    });
    return success(link);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeleteSocialLink(linkId: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.socialMediaLink.delete({ where: { id: linkId } });
    logAction(ctx.userId,  ctx.userId, "admin.social_links.delete", {
      entity: "socialMediaLink",
      entityId: linkId,
      ...extractRequestMeta(req),
    });
    return success({ message: "Social link deleted" });
  } catch (err) {
    return notFound("Link not found");
  }
}
