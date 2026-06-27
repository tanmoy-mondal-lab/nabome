import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";
import { logAction, extractRequestMeta } from "../../_lib/audit";
import { destroyCloudinaryAssetIfReplaced, destroyCloudinaryDiff } from "../../_lib/cloudinary";
import { toNull } from "../../_lib/sanitize";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

async function cleanupThemeMedia(existingTheme: unknown, nextTheme: unknown, env: any): Promise<unknown> {
  await destroyCloudinaryDiff(existingTheme, nextTheme, env);
  return nextTheme;
}

async function cleanupSeoMedia(existingSeo: unknown, nextSeo: unknown, env: any): Promise<unknown> {
  await destroyCloudinaryDiff(existingSeo, nextSeo, env);
  return nextSeo;
}

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
      return handleUpdate(req, ctx, ctx.env);
    case "socialLinks":
      return handleSocialLinksList(ctx.env);
    case "createSocialLink":
      return handleCreateSocialLink(req, ctx, ctx.env);
    case "updateSocialLink":
      return handleUpdateSocialLink(params[0], req, ctx, ctx.env);
    case "deleteSocialLink":
      return handleDeleteSocialLink(params[0], req, ctx, ctx.env);
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
      "siteName", "tagline", "logoUrl", "currency", "taxRate", "freeShippingThreshold",
      "shippingInfo", "returnPolicy", "aboutUs",
      "contactEmail", "contactPhone", "address",
      "googleAnalyticsId", "facebookPixelId",
      "preferences",
    ];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = field === "siteName" || field === "currency" ? body[field] : body[field] ?? null;
    }

    // Validate numeric fields
    if (data.taxRate !== undefined) {
      const rate = Number(data.taxRate);
      if (isNaN(rate) || rate < 0 || rate > 100) return badRequest("Tax rate must be between 0 and 100");
      data.taxRate = rate;
    }
    if (data.freeShippingThreshold !== undefined) {
      const threshold = Number(data.freeShippingThreshold);
      if (isNaN(threshold) || threshold < 0) return badRequest("Free shipping threshold must be a positive number");
      data.freeShippingThreshold = threshold;
    }

    if (body.logoUrl !== undefined) data.logoUrl = toNull(body.logoUrl);
    if (body.logoPublicId !== undefined) {
      data.logoPublicId = await destroyCloudinaryAssetIfReplaced(existing?.logoPublicId, body.logoPublicId, env);
    }
    if (body.faviconUrl !== undefined) data.faviconUrl = toNull(body.faviconUrl);
    if (body.faviconPublicId !== undefined) {
      data.faviconPublicId = await destroyCloudinaryAssetIfReplaced(existing?.faviconPublicId, body.faviconPublicId, env);
    }
    if (body.ogImageUrl !== undefined) data.ogImageUrl = toNull(body.ogImageUrl);
    if (body.ogImagePublicId !== undefined) {
      data.ogImagePublicId = await destroyCloudinaryAssetIfReplaced(existing?.ogImagePublicId, body.ogImagePublicId, env);
    }
    if (body.seo !== undefined) {
      data.seo = await cleanupSeoMedia(existing?.seo, body.seo, env);
    }
    if (body.theme !== undefined) {
      data.theme = await cleanupThemeMedia(existing?.theme, body.theme, env);
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

    logAction(ctx.userId, "admin.settings.update", {
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

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return badRequest("Invalid URL format");
  }

  const validPlatforms = ["instagram", "facebook", "twitter", "youtube", "linkedin", "pinterest", "tiktok", "whatsapp", "other"];
  if (!validPlatforms.includes(platform)) {
    return badRequest(`Invalid platform. Must be one of: ${validPlatforms.join(", ")}`);
  }

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
    logAction(ctx.userId, "admin.social_links.create", {
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
    logAction(ctx.userId, "admin.social_links.update", {
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
    logAction(ctx.userId, "admin.social_links.delete", {
      entity: "socialMediaLink",
      entityId: linkId,
      ...extractRequestMeta(req),
    });
    return success({ message: "Social link deleted" });
  } catch (err) {
    return notFound("Link not found");
  }
}
