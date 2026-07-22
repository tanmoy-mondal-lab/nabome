import type { Env } from "../../_lib/env";
import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth-middleware";
import { logAction, extractRequestMeta } from "../../_lib/audit";
import { deleteMedia } from "../../_lib/media-service";
import { toNull } from "../../_lib/sanitize";

async function cleanupThemeMedia(existingTheme: unknown, nextTheme: unknown, env: Env): Promise<unknown> {
  // Extract public IDs from existing theme and delete using MediaService
  const existingPublicIds = extractPublicIds(existingTheme);
  const nextPublicIds = extractPublicIds(nextTheme);
  const toDelete = existingPublicIds.filter(id => !nextPublicIds.includes(id));
  
  if (toDelete.length > 0) {
    const prisma = getPrisma(env);
    const mediaAssets = await prisma.media_assets.findMany({
      where: { publicId: { in: toDelete }, entityType: "settings" },
      select: { id: true },
    });
    await Promise.allSettled(
      mediaAssets.map(asset => deleteMedia(asset.id, env))
    );
  }
  return nextTheme;
}

async function cleanupSeoMedia(existingSeo: unknown, nextSeo: unknown, env: Env): Promise<unknown> {
  // Extract public IDs from existing SEO and delete using MediaService
  const existingPublicIds = extractPublicIds(existingSeo);
  const nextPublicIds = extractPublicIds(nextSeo);
  const toDelete = existingPublicIds.filter(id => !nextPublicIds.includes(id));
  
  if (toDelete.length > 0) {
    const prisma = getPrisma(env);
    const mediaAssets = await prisma.media_assets.findMany({
      where: { publicId: { in: toDelete }, entityType: "settings" },
      select: { id: true },
    });
    await Promise.allSettled(
      mediaAssets.map(asset => deleteMedia(asset.id, env))
    );
  }
  return nextSeo;
}

function extractPublicIds(content: unknown): string[] {
  const ids: string[] = [];
  
  function traverse(obj: unknown): void {
    if (!obj || typeof obj !== 'object') return;
    
    if (Array.isArray(obj)) {
      obj.forEach(traverse);
      return;
    }
    
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (key.toLowerCase().includes('publicid') && typeof value === 'string') {
        ids.push(value);
      } else {
        traverse(value);
      }
    }
  }
  
  traverse(content);
  return ids;
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
      return handleGet(ctx.env!);
    case "update":
      return handleUpdate(req, ctx, ctx.env!);
    case "socialLinks":
      return handleSocialLinksList(ctx.env!);
    case "createSocialLink":
      return handleCreateSocialLink(req, ctx, ctx.env!);
    case "updateSocialLink":
      return handleUpdateSocialLink(params[0], req, ctx, ctx.env!);
    case "deleteSocialLink":
      return handleDeleteSocialLink(params[0], req, ctx, ctx.env!);
    default:
      return badRequest("Unknown action");
  }
}

async function handleGet(env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const settings = await prisma.site_settings.findFirst();
    return success({ settings });
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdate(req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  const body = await req.json();

  try {
    const prisma = getPrisma(env);
    const existing = await prisma.site_settings.findFirst();

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
    // Handle logo media replacement using MediaService
    if (body.logoPublicId !== undefined && existing?.logoPublicId !== body.logoPublicId) {
      if (existing?.logoPublicId) {
        const oldMediaAsset = await prisma.media_assets.findFirst({
          where: { publicId: existing.logoPublicId, entityType: "settings" },
          select: { id: true },
        });
        if (oldMediaAsset) {
          await deleteMedia(oldMediaAsset.id, env);
        }
      }
      data.logoPublicId = body.logoPublicId;
    }
    if (body.faviconUrl !== undefined) data.faviconUrl = toNull(body.faviconUrl);
    // Handle favicon media replacement using MediaService
    if (body.faviconPublicId !== undefined && existing?.faviconPublicId !== body.faviconPublicId) {
      if (existing?.faviconPublicId) {
        const oldMediaAsset = await prisma.media_assets.findFirst({
          where: { publicId: existing.faviconPublicId, entityType: "settings" },
          select: { id: true },
        });
        if (oldMediaAsset) {
          await deleteMedia(oldMediaAsset.id, env);
        }
      }
      data.faviconPublicId = body.faviconPublicId;
    }
    if (body.ogImageUrl !== undefined) data.ogImageUrl = toNull(body.ogImageUrl);
    // Handle OG image media replacement using MediaService
    if (body.ogImagePublicId !== undefined && existing?.ogImagePublicId !== body.ogImagePublicId) {
      if (existing?.ogImagePublicId) {
        const oldMediaAsset = await prisma.media_assets.findFirst({
          where: { publicId: existing.ogImagePublicId, entityType: "settings" },
          select: { id: true },
        });
        if (oldMediaAsset) {
          await deleteMedia(oldMediaAsset.id, env);
        }
      }
      data.ogImagePublicId = body.ogImagePublicId;
    }
    if (body.seo !== undefined) {
      data.seo = await cleanupSeoMedia(existing?.seo, body.seo, env);
    }
    if (body.theme !== undefined) {
      data.theme = await cleanupThemeMedia(existing?.theme, body.theme, env);
    }

    let settings;
    if (existing) {
      settings = await prisma.site_settings.update({
        where: { id: existing.id },
        data: data as never,
      });
    } else {
      const createData = { siteName: body.siteName ?? "নবME", ...data } as never;
      settings = await prisma.site_settings.create({ data: createData });
    }

    void logAction(ctx.userId, "admin.settings.update", {
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

async function handleSocialLinksList(env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const links = await prisma.social_media_links.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return success({ links });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreateSocialLink(req: Request, ctx: RequestContext, env: Env): Promise<Response> {
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
    const link = await prisma.social_media_links.create({
      data: {
        platform,
        url,
        label: label ?? null,
        icon: icon ?? null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });
    void logAction(ctx.userId, "admin.social_links.create", {
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

async function handleUpdateSocialLink(linkId: string, req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  const body = await req.json();

  try {
    const prisma = getPrisma(env);
    const data: Record<string, unknown> = {};
    const fields = ["platform", "url", "label", "icon", "isActive", "sortOrder"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    const link = await prisma.social_media_links.update({
      where: { id: linkId },
      data: data as never,
    });
    void logAction(ctx.userId, "admin.social_links.update", {
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

async function handleDeleteSocialLink(linkId: string, req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.social_media_links.delete({ where: { id: linkId } });
    void logAction(ctx.userId, "admin.social_links.delete", {
      entity: "socialMediaLink",
      entityId: linkId,
      ...extractRequestMeta(req),
    });
    return success({ message: "Social link deleted" });
  } catch {
    return notFound("Link not found");
  }
}
