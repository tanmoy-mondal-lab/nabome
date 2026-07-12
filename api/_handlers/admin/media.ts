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


export async function handleAdminMediaRequest(
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
    case "create":
      return handleCreate(req, ctx.env);
    case "update":
      return handleUpdate(params[0], req, ctx.env);
    case "delete":
      return handleDelete(params[0], req, ctx.env);
    case "usage":
      return handleUsage(params[0], ctx.env);
    case "restore":
      return handleRestore(params[0], req, ctx.env);
    case "permanent-delete":
      return handlePermanentDelete(params[0], req, ctx.env);
    default:
      return badRequest("Unknown action");
  }
}

const MAX_PAGE_LIMIT = 200;

async function handleList(req: Request, env: any): Promise<Response> {
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
  if (entityType) where.entityType = entityType;
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
    console.error("Media list error:", err);
    if (err instanceof Error) {
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
    }
    return serverError(err);
  }
}

async function handleCreate(req: Request, env: any): Promise<Response> {
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
        entityType: entityType ?? "cms",
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

async function handleDelete(assetId: string, req: Request, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    
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

    // Check usage before soft delete
    const usageResponse = await handleUsage(assetId, env);
    const usageData = await usageResponse.json();
    
    if (usageData.data?.used === true) {
      return success({
        success: false,
        message: "Cannot delete asset: it is currently in use",
        data: {
          assetId,
          references: usageData.data.references,
          total: usageData.data.total,
        },
      }, 400);
    }

    // Get admin ID from context (simplified - in real implementation, get from auth)
    const performedBy = req.headers.get('x-admin-id') || 'system';

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

async function handleUpdate(assetId: string, req: Request, env: any): Promise<Response> {
  let body: any;
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
    if (folder !== undefined) data.folder = folder;
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

async function handleUsage(assetId: string, env: any): Promise<Response> {
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
      select: { id: true },
    });
    for (const variant of variants) {
      const product = await prisma.products.findUnique({
        where: { id: variant.id },
        select: { name: true },
      });
      if (product) {
        references.push({ type: "Product Variant", id: variant.id, name: product.name });
      }
    }

    // Check product images
    const productImages = await prisma.product_images.findMany({
      where: { publicId: publicId },
      select: { id: true, productId: true },
    });
    for (const img of productImages) {
      const product = await prisma.products.findUnique({
        where: { id: img.productId },
        select: { name: true },
      });
      if (product) {
        references.push({ type: "Product Image", id: img.id, name: product.name });
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
    for (const item of lookbookItems) {
      const lookbook = await prisma.lookbooks.findUnique({
        where: { id: item.lookbookId },
        select: { name: true },
      });
      if (lookbook) {
        references.push({ type: "Lookbook Item", id: item.id, name: lookbook.name });
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

async function handleRestore(assetId: string, req: Request, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    
    // Get admin ID from context
    const performedBy = req.headers.get('x-admin-id') || 'system';

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

async function handlePermanentDelete(assetId: string, req: Request, env: any): Promise<Response> {
  let body: any;
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

    // Get admin ID from context
    const performedBy = req.headers.get('x-admin-id') || 'system';

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
