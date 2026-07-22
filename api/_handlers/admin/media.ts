import type { Env } from "../../_lib/env";
import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth-middleware";
import { cleanSecret } from "../../_lib/secrets";
import {
  permanentDeleteWithTransaction,
  softDeleteWithCacheInvalidation,
  restoreWithCacheInvalidation,
} from "../../_lib/media/transaction.service";
import type { CloudinaryConfig } from "../../_lib/media/types";
import { normalizeEntityTypeForDb } from "../../_lib/media/entity-type";
import { getAssetReferences } from "../../_lib/media/usage.service";
import { sanitizeFolderPath } from "../../_lib/media/validation";
import { logger } from "../../_lib/logger";


export async function handleAdminMediaRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  const userId = ctx.userId || 'system';
  switch (action) {
    case "list":
      return handleList(req, ctx.env!);
    case "create":
      return handleCreate(req, ctx.env!);
    case "update":
      return handleUpdate(params[0], req, ctx.env!);
    case "delete":
      return handleDelete(params[0], req, ctx.env!, userId);
    case "usage":
      return handleUsage(params[0], ctx.env!);
    case "restore":
      return handleRestore(params[0], req, ctx.env!, userId);
    case "permanent-delete":
      return handlePermanentDelete(params[0], req, ctx.env!, userId);
    default:
      return badRequest("Unknown action");
  }
}

const MAX_PAGE_LIMIT = 200;

async function handleList(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const limit = Math.min(MAX_PAGE_LIMIT, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50")));
  const type = url.searchParams.get("type");
  const entityType = url.searchParams.get("entityType");
  const entityId = url.searchParams.get("entityId");
  const folder = url.searchParams.get("folder");
  const search = url.searchParams.get("search");
  const trash = url.searchParams.get("trash") === "true";

  const where: Record<string, unknown> = {};
  if (type) where.mediaType = type;
  if (entityType && entityType !== "all") where.entityType = normalizeEntityTypeForDb(entityType);
  if (entityId) where.entityId = entityId;
  if (folder) where.folder = { contains: folder };
  if (trash) {
    where.deletedAt = { not: null };
  } else {
    where.deletedAt = null;
  }
  if (search) {
    where.OR = [
      { altText: { contains: search, mode: "insensitive" } },
      { displayName: { contains: search, mode: "insensitive" } },
      { originalFilename: { contains: search, mode: "insensitive" } },
      { folder: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  try {
    const prisma = getPrisma(env);
    if (!prisma) {
      return serverError(new Error("Database connection failed"));
    }

    const [assets, total] = await Promise.all([
      prisma.media_assets.findMany({
        where: where as never,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.media_assets.count({ where: where as never }),
    ]);

    const folders = await prisma.media_assets.groupBy({
      by: ["entityType"],
      _count: true,
    });

    return success({
      success: true,
      message: "Media assets retrieved successfully",
      data: {
        assets,
        folders: folders
          .filter((f) => f.entityType)
          .map((f) => ({ name: f.entityType, count: f._count })),
        pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    logger.error("Media list error", { error: err });
    return serverError(err);
  }
}

async function handleCreate(req: Request, env: Env): Promise<Response> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const {
    url, publicId, altText, width, height, fileSize, mimeType,
    type, tags, folder, assetId, entityType, entityId,
    secureUrl, resourceType, originalFilename, displayName, sortOrder, isPrimary,
  } = body;

  if (!altText || typeof altText !== "string" || altText.trim().length === 0) {
    return badRequest("Alt text is required for accessibility and SEO. Please provide a descriptive alt text for this image.");
  }

  if (!url) return badRequest("URL is required");
  try {
    new URL(url as string);
  } catch {
    return badRequest("Invalid URL format");
  }

  try {
    const prisma = getPrisma(env);
    const asset = await prisma.media_assets.create({
      data: {
        assetId: assetId ?? crypto.randomUUID(),
        entityType: normalizeEntityTypeForDb(entityType),
        entityId: entityId ?? crypto.randomUUID(),
        url,
        secureUrl: secureUrl ?? url,
        publicId: publicId ?? null,
        resourceType: resourceType ?? "image",
        folder: folder ?? null,
        mimeType: mimeType ?? null,
        width: width ?? null,
        height: height ?? null,
        fileSize: fileSize ?? null,
        originalFilename: originalFilename ?? null,
        displayName: displayName ?? altText ?? null,
        altText: altText ?? null,
        mediaType: type ?? "image",
        sortOrder: sortOrder ?? 0,
        isPrimary: isPrimary ?? false,
        tags: tags ?? [],
      },
    });
    return created({
      success: true,
      message: "Media asset created successfully",
      media: asset,
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleDelete(assetId: string, req: Request, env: Env, userId?: string): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const performedBy = userId || 'system';
    
    // Check if asset exists
    const asset = await prisma.media_assets.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      return notFound("Asset not found");
    }

    // Check if already soft deleted
    if (asset.deletedAt) {
      return badRequest("Asset is already in trash. Use permanent-delete to remove permanently.");
    }

    // Check usage before soft delete — direct function call avoids Response parsing fragility
    const references = await getAssetReferences(prisma, asset.publicId);
    
    if (references.length > 0) {
      return badRequest("Cannot delete asset: it is currently in use");
    }

    // Soft delete with cache invalidation
    const result = await softDeleteWithCacheInvalidation(prisma, {
      assetId,
      performedBy,
      reason: "Moved to trash",
      req,
    });

    if (!result.success) {
      return serverError(result.error);
    }

    return success({
      success: true,
      message: "Media asset moved to trash successfully",
    });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2025") return notFound("Asset not found");
    return serverError(err);
  }
}

async function handleUpdate(assetId: string, req: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const { altText, displayName, folder, tags, sortOrder, isPrimary } = body;

  try {
    const prisma = getPrisma(env);
    const data: Record<string, unknown> = {};
    if (altText !== undefined) data.altText = altText;
    if (displayName !== undefined) data.displayName = displayName;
    if (folder !== undefined) data.folder = sanitizeFolderPath(String(folder));
    if (tags !== undefined) data.tags = tags;
    if (sortOrder !== undefined) data.sortOrder = sortOrder;
    if (isPrimary !== undefined) data.isPrimary = isPrimary;

    const asset = await prisma.media_assets.update({
      where: { id: assetId },
      data: data as never,
    });
    return success({
      success: true,
      message: "Media asset updated successfully",
      media: asset,
    });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2025") return notFound("Asset not found");
    return serverError(err);
  }
}

async function handleUsage(assetId: string, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const asset = await prisma.media_assets.findUnique({
      where: { id: assetId },
      select: { publicId: true, assetId: true },
    });

    if (!asset) {
      return notFound("Asset not found");
    }

    const references: Array<{ type: string; id: string; name: string }> = [];
    const publicId = asset.publicId;

    // Check categories
    const categories = await prisma.categories.findMany({
      where: { imagePublicId: publicId },
      select: { id: true, name: true },
    });
    categories.forEach(cat => references.push({ type: "Category", id: cat.id, name: cat.name }));

    // Check subcategories
    const subcategories = await prisma.subcategories.findMany({
      where: { imagePublicId: publicId },
      select: { id: true, name: true },
    });
    subcategories.forEach(sub => references.push({ type: "Subcategory", id: sub.id, name: sub.name }));

    // Check collections
    const collections = await prisma.collections.findMany({
      where: { heroImagePublicId: publicId },
      select: { id: true, name: true },
    });
    collections.forEach(col => references.push({ type: "Collection", id: col.id, name: col.name }));

    // Check brands
    const brands = await prisma.brands.findMany({
      where: { logoPublicId: publicId },
      select: { id: true, name: true },
    });
    brands.forEach(brand => references.push({ type: "Brand", id: brand.id, name: brand.name }));

    // Check size guides
    const sizeGuides = await prisma.size_guides.findMany({
      where: { imagePublicId: publicId },
      select: { id: true, name: true },
    });
    sizeGuides.forEach(sg => references.push({ type: "Size Guide", id: sg.id, name: sg.name }));

    // Check products
    const products = await prisma.products.findMany({
      where: { sizeChartPublicId: publicId },
      select: { id: true, name: true },
    });
    products.forEach(prod => references.push({ type: "Product", id: prod.id, name: prod.name }));

    // Check product variants
    const variants = await prisma.product_variants.findMany({
      where: { videoPublicId: publicId },
      select: { id: true, productId: true },
    });
    const variantProductIds = [...new Set(variants.map(v => v.productId))];
    if (variantProductIds.length > 0) {
      const variantProducts = await prisma.products.findMany({
        where: { id: { in: variantProductIds } },
        select: { id: true, name: true },
      });
      const productMap = new Map(variantProducts.map(p => [p.id, p.name]));
      for (const variant of variants) {
        const productName = productMap.get(variant.productId);
        if (productName) {
          references.push({ type: "Product Variant", id: variant.id, name: productName });
        }
      }
    }

    // Check product images
    const productImages = await prisma.product_images.findMany({
      where: { publicId: publicId },
      select: { id: true, productId: true },
    });
    if (productImages.length > 0) {
      const imgProductIds = [...new Set(productImages.map(i => i.productId))];
      const imgProducts = await prisma.products.findMany({
        where: { id: { in: imgProductIds } },
        select: { id: true, name: true },
      });
      const imgProductMap = new Map(imgProducts.map(p => [p.id, p.name]));
      for (const img of productImages) {
        const productName = imgProductMap.get(img.productId);
        if (productName) {
          references.push({ type: "Product Image", id: img.id, name: productName });
        }
      }
    }

    // Check lookbooks
    const lookbooks = await prisma.lookbooks.findMany({
      where: { coverImagePublicId: publicId },
      select: { id: true, name: true },
    });
    lookbooks.forEach(lb => references.push({ type: "Lookbook", id: lb.id, name: lb.name }));

    // Check lookbook items
    const lookbookItems = await prisma.lookbook_items.findMany({
      where: { imagePublicId: publicId },
      select: { id: true, lookbookId: true },
    });
    if (lookbookItems.length > 0) {
      const itemLookbookIds = [...new Set(lookbookItems.map(i => i.lookbookId))];
      const itemLookbooks = await prisma.lookbooks.findMany({
        where: { id: { in: itemLookbookIds } },
        select: { id: true, name: true },
      });
      const lookbookMap = new Map(itemLookbooks.map(l => [l.id, l.name]));
      for (const item of lookbookItems) {
        const lookbookName = lookbookMap.get(item.lookbookId);
        if (lookbookName) {
          references.push({ type: "Lookbook Item", id: item.id, name: lookbookName });
        }
      }
    }

    // Check site settings
    const siteSettings = await prisma.site_settings.findFirst({
      select: { id: true, siteName: true, logoPublicId: true, faviconPublicId: true, ogImagePublicId: true },
    });
    if (siteSettings) {
      if (siteSettings.logoPublicId === publicId) {
        references.push({ type: "Site Settings", id: siteSettings.id, name: "Logo" });
      }
      if (siteSettings.faviconPublicId === publicId) {
        references.push({ type: "Site Settings", id: siteSettings.id, name: "Favicon" });
      }
      if (siteSettings.ogImagePublicId === publicId) {
        references.push({ type: "Site Settings", id: siteSettings.id, name: "OG Image" });
      }
    }

    return success({
      success: true,
      data: {
        used: references.length > 0,
        total: references.length,
        references,
      },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleRestore(assetId: string, req: Request, env: Env, userId?: string): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    
    const performedBy = userId || 'system';

    // Restore with cache invalidation
    const result = await restoreWithCacheInvalidation(prisma, {
      assetId,
      performedBy,
      req,
    });

    if (!result.success) {
      return serverError(result.error);
    }

    return success({
      success: true,
      message: "Media asset restored successfully",
    });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2025") return notFound("Asset not found");
    return serverError(err);
  }
}

async function handlePermanentDelete(assetId: string, req: Request, env: Env, userId?: string): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const { force } = body;
  if (!force) {
    return badRequest("Force delete requires explicit confirmation");
  }

  try {
    const prisma = getPrisma(env);
    const performedBy = userId || 'system';
    
    // Get asset details
    const asset = await prisma.media_assets.findUnique({
      where: { id: assetId },
      select: {
        id: true,
        assetId: true,
        publicId: true,
        resourceType: true,
      },
    });

    if (!asset) {
      return notFound("Asset not found");
    }

    // Build Cloudinary config
    const config: CloudinaryConfig = {
      cloudName: cleanSecret(env.CLOUDINARY_CLOUD_NAME),
      apiKey: cleanSecret(env.CLOUDINARY_API_KEY),
      apiSecret: cleanSecret(env.CLOUDINARY_API_SECRET),
    };

    // Permanent delete with transaction safety
    const result = await permanentDeleteWithTransaction(prisma, config, {
      assetId,
      publicId: asset.publicId || '',
      resourceType: asset.resourceType || 'image',
      performedBy,
      reason: 'Permanent delete',
      req,
    });

    if (!result.success) {
      return serverError(result.error);
    }

    return success({
      success: true,
      message: "Media asset permanently deleted",
      data: { assetId },
    });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2025") return notFound("Asset not found");
    return serverError(err);
  }
}
