import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";
import { logAction, extractRequestMeta } from "../../_lib/audit";
import { destroyCloudinaryAsset, destroyCloudinaryAssetIfReplaced, destroyCloudinaryAssets } from "../../_lib/cloudinary";
import { slugify } from "../../_lib/utils";
import { toNull } from "../../_lib/sanitize";

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  subcategory: { select: { id: true, name: true, slug: true } },
  collection: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
  sizeGuide: { select: { id: true, name: true } },
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: { include: { images: { orderBy: { sortOrder: "asc" as const } } } },
  attributes: true,
  productTags: { include: { tag: true } },
  productLabels: { include: { label: true } },
  _count: { select: { reviews: true, orderItems: true } },
};

export async function handleAdminProductRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "list": return handleList(req, ctx.env);
    case "create": return handleCreate(req, ctx);
    case "detail": return handleDetail(params[0], ctx.env);
    case "update": return handleUpdate(params[0], req, ctx);
    case "delete": return handleDelete(params[0], req, ctx);
    case "duplicate": return handleDuplicate(params[0], req, ctx);
    case "restore": return handleRestore(params[0], req, ctx);
    case "variants": return handleUpdateVariants(params[0], req, ctx.env);
    case "addImage": return handleAddImage(params[0], req, ctx.env);
    case "deleteImage": return handleDeleteImage(params[0], params[1], ctx.env);
    case "bulkStatus": return handleBulkStatus(req, ctx);
    case "bulkCategory": return handleBulkCategory(req, ctx.env);
    case "bulkDelete": return handleBulkDelete(req, ctx);
    case "permanentDelete": return handlePermanentDelete(params[0], req, ctx);
    case "bulkPermanentDelete": return handleBulkPermanentDelete(req, ctx);
    case "schedule": return handleSchedule(params[0], req, ctx.env);
    default: return badRequest("Unknown action");
  }
}

async function handleList(req: Request, env: any): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "25");
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  try {
    const prisma = getPrisma(env);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: where as never,
        include: {
          category: { select: { name: true } },
          subcategory: { select: { name: true } },
          collection: { select: { name: true } },
          brand: { select: { name: true, logoUrl: true } },
          images: { take: 1, where: { isPrimary: true } },
          variants: { select: { stock: true, sku: true } },
          _count: { select: { orderItems: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where: where as never }),
    ]);

    return success({
      products,
      pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreate(req: Request, ctx: RequestContext): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const prisma = getPrisma(ctx.env);
  const bodyData = body as Record<string, unknown>;
  const { description, shortDescription, categoryId, subcategoryId, collectionId, brandId, sizeGuideId, currency, scheduledPublishAt, scheduledArchiveAt, metaTitle, metaDesc } = bodyData;
  const name = bodyData.name as string;
  const basePriceNum = Number(bodyData.basePrice);
  const salePriceNum = bodyData.salePrice != null ? Number(bodyData.salePrice) : null;
  const compareAtPriceNum = bodyData.compareAtPrice != null ? Number(bodyData.compareAtPrice) : null;
  const costPriceNum = bodyData.costPrice != null ? Number(bodyData.costPrice) : null;
  const discountPercentNum = bodyData.discountPercent != null ? Number(bodyData.discountPercent) : null;
  const sortOrderNum = bodyData.sortOrder != null ? Number(bodyData.sortOrder) : 0;
  const material = bodyData.material as string | undefined;
  const careInstructions = bodyData.careInstructions as string | undefined;
  const sizeChartUrl = bodyData.sizeChartUrl as string | undefined;
  const sizeChartPublicId = bodyData.sizeChartPublicId as string | undefined;
  const isActive = bodyData.isActive as boolean | undefined;
  const isFeatured = bodyData.isFeatured as boolean | undefined;
  const isNew = bodyData.isNew as boolean | undefined;
  const gender = bodyData.gender as string | undefined;

  if (!name || basePriceNum === 0 || isNaN(basePriceNum)) {
    return badRequest("Name and base price are required");
  }

  // Generate unique slug
  let slug = slugify(name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: toNull(description),
        shortDescription: toNull(shortDescription),
        categoryId: toNull(categoryId),
        subcategoryId: toNull(subcategoryId),
        collectionId: toNull(collectionId),
        brandId: toNull(brandId),
        sizeGuideId: toNull(sizeGuideId),
        basePrice: basePriceNum,
        salePrice: salePriceNum,
        compareAtPrice: compareAtPriceNum,
        costPrice: costPriceNum,
        discountPercent: discountPercentNum,
        material: toNull(material),
        careInstructions: toNull(careInstructions),
        sizeChartUrl: toNull(sizeChartUrl),
        sizeChartPublicId: toNull(sizeChartPublicId),
        currency: (currency as string) || "INR",
        scheduledPublishAt: scheduledPublishAt ? new Date(scheduledPublishAt as string) : null,
        scheduledArchiveAt: scheduledArchiveAt ? new Date(scheduledArchiveAt as string) : null,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        isNew: isNew ?? false,
        gender: (gender as "men" | "women" | "unisex" | undefined) ?? "unisex",
        sortOrder: sortOrderNum,
        metaTitle: toNull(metaTitle),
        metaDesc: toNull(metaDesc),
        publishedAt: isActive ? new Date() : null,
      },
      include: { images: true, variants: true },
    });

    logAction(ctx.userId, "admin.product.create", {
      entity: "product",
      entityId: product.id,
      metadata: { name: product.name, slug: product.slug },
      ...extractRequestMeta(req),
    });

    return created(product);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDetail(productId: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: productInclude,
    });
    if (!product) return notFound("Product not found");
    return success({ product });
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdate(productId: string, req: Request, ctx: RequestContext): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const prisma = getPrisma(ctx.env);
  try {
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) return notFound("Product not found");

    const data: Record<string, unknown> = {};
    const updatableFields = [
      "name", "description", "shortDescription", "categoryId", "subcategoryId", "collectionId",
      "brandId", "sizeGuideId", "basePrice", "salePrice", "compareAtPrice", "costPrice", "discountPercent",
      "material", "careInstructions", "sizeChartUrl", "sizeChartPublicId", "currency",
      "isActive", "isFeatured", "isNew", "gender", "sortOrder", "metaTitle", "metaDesc",
      "scheduledPublishAt", "scheduledArchiveAt",
    ];

    const optionalStringFields = [
      "categoryId", "subcategoryId", "collectionId", "brandId", "sizeGuideId",
      "sizeChartUrl", "sizeChartPublicId", "material", "careInstructions", "metaTitle", "metaDesc",
      "scheduledPublishAt", "scheduledArchiveAt",
    ];

    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        data[field] = optionalStringFields.includes(field) ? toNull(body[field]) : body[field];
      }
    }

    if (body.slug && body.slug !== existing.slug) {
      let slug = slugify(body.slug as string);
      const slugExists = await prisma.product.findFirst({
        where: { slug, id: { not: productId } },
      });
      if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;
      data.slug = slug;
    } else if (body.name && body.name !== existing.name) {
      let slug = slugify(body.name as string);
      const slugExists = await prisma.product.findFirst({
        where: { slug, id: { not: productId } },
      });
      if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;
      data.slug = slug;
    }

    if (body.isActive && !existing.publishedAt) {
      data.publishedAt = new Date();
    }
    if (body.sizeChartPublicId !== undefined) {
      data.sizeChartPublicId = await destroyCloudinaryAssetIfReplaced(existing.sizeChartPublicId, body.sizeChartPublicId, ctx.env);
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: data as never,
      include: productInclude,
    });

    logAction(ctx.userId, "admin.product.update", {
      entity: "product",
      entityId: productId,
      metadata: { name: product.name },
      ...extractRequestMeta(req),
    });

    return success(product);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDelete(productId: string, req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const prisma = getPrisma(ctx.env);
    const images = await prisma.productImage.findMany({ where: { productId }, select: { publicId: true } });
    const publicIds = images.map((i) => i.publicId).filter(Boolean) as string[];
    await destroyCloudinaryAssets(publicIds);
    const variants = await prisma.productVariant.findMany({ where: { productId }, select: { videoPublicId: true } });
    const videoIds = variants.map((v) => v.videoPublicId).filter(Boolean) as string[];
    await destroyCloudinaryAssets(videoIds, ctx.env, "video");
    await prisma.productImage.deleteMany({ where: { productId } });
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });
    logAction(ctx.userId, "admin.product.delete", {
      entity: "product",
      entityId: productId,
      metadata: {},
      ...extractRequestMeta(req),
    });

    return success({ message: "Product deactivated" });
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateVariants(productId: string, req: Request, env: any): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const { variants } = body;

  if (!Array.isArray(variants)) {
    return badRequest("Variants array is required");
  }

  const prisma = getPrisma(env);
  try {
    const existingVariants = await prisma.productVariant.findMany({
      where: { productId },
      select: { id: true, videoPublicId: true },
    });
    const existingVideoById = new Map(existingVariants.map((variant) => [variant.id, variant.videoPublicId]));
    const incomingIds = new Set(
      variants
        .map((variant) => variant.id)
        .filter((id) => id && !String(id).startsWith("new-"))
        .map((id) => String(id))
    );
    const removedVariantIds = existingVariants
      .map((variant) => variant.id)
      .filter((id) => !incomingIds.has(id));

    // Clean up old videos that are being replaced on update.
    const replacementVideoIds = variants
      .map((variant) => {
        if (!variant.id || String(variant.id).startsWith("new-")) return null;
        const existingVideo = existingVideoById.get(String(variant.id));
        const incomingVideo = (variant as { videoPublicId?: string }).videoPublicId ?? null;
        return existingVideo && existingVideo !== incomingVideo ? existingVideo : null;
      })
      .filter(Boolean) as string[];

    const removedVideoIds = removedVariantIds
      .map((id) => existingVideoById.get(id))
      .filter(Boolean) as string[];

    const videoIdsToClean = [...new Set([...replacementVideoIds, ...removedVideoIds])];
    if (videoIdsToClean.length > 0) {
      await destroyCloudinaryAssets(videoIdsToClean, env, "video");
    }

    if (removedVariantIds.length > 0) {
      const removedImages = await prisma.productImage.findMany({
        where: { productId, variantId: { in: removedVariantIds } },
        select: { publicId: true },
      });
      const removedImageIds = removedImages.map((img) => img.publicId).filter(Boolean) as string[];
      if (removedImageIds.length > 0) {
        await destroyCloudinaryAssets(removedImageIds, env);
      }

      await prisma.productImage.deleteMany({
        where: { productId, variantId: { in: removedVariantIds } },
      });
      await prisma.productVariant.deleteMany({
        where: { productId, id: { in: removedVariantIds } },
      });
    }

    const variantData = (v: typeof variants[0]) => ({
      sku: v.sku,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex ?? null,
      priceAdjustment: v.priceAdjustment ?? 0,
      stock: v.stock ?? 0,
      weight: v.weight ?? null,
      videoUrl: v.videoUrl ?? null,
      videoPublicId: v.videoPublicId ?? null,
      isActive: v.isActive ?? true,
    });

    const savedVariants = variants.length > 0
      ? await prisma.$transaction(
          variants.map((variant) => {
            const payload = variantData(variant);
            if (variant.id && !String(variant.id).startsWith("new-")) {
              return prisma.productVariant.update({
                where: { id: String(variant.id) },
                data: payload,
              });
            }
            return prisma.productVariant.create({
              data: {
                productId,
                ...payload,
              },
            });
          })
        )
      : [];

    return success({ variants: savedVariants });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAddImage(productId: string, req: Request, env: any): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const { url, publicId, altText, variantId, sortOrder, isPrimary } = body;

  if (!url) return badRequest("Image URL is required");

  const prisma = getPrisma(env);
  try {
    if (isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const image = await prisma.productImage.create({
      data: {
        productId,
        url: url as string,
        publicId: (publicId as string) ?? null,
        altText: (altText as string) ?? null,
        variantId: toNull(variantId),
        sortOrder: (sortOrder as number) ?? 0,
        isPrimary: (isPrimary as boolean) ?? false,
      },
    });

    return created(image);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeleteImage(productId: string, imageId: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const image = await prisma.productImage.findFirst({ where: { id: imageId, productId } });
    if (!image) return notFound("Image not found");
    if (image.publicId) await destroyCloudinaryAsset(image.publicId);
    await prisma.productImage.delete({ where: { id: imageId } });
    return success({ message: "Image deleted" });
  } catch (err) {
    return serverError(err);
  }
}

// ─── Duplicate ───

async function handleDuplicate(productId: string, req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const prisma = getPrisma(ctx.env);
    const source = await prisma.product.findUnique({
      where: { id: productId },
      include: { attributes: true, variants: true, productTags: true, productLabels: true },
    });
    if (!source) return notFound("Product not found");

    const suffix = `-copy-${Date.now().toString(36)}`;
    const product = await prisma.product.create({
      data: {
        name: `${source.name} (Copy)`,
        slug: `${source.slug}${suffix}`,
        description: source.description,
        shortDescription: source.shortDescription,
        categoryId: source.categoryId,
        subcategoryId: source.subcategoryId,
        collectionId: source.collectionId,
        brandId: source.brandId,
        basePrice: source.basePrice,
        compareAtPrice: source.compareAtPrice,
        costPrice: source.costPrice,
        salePrice: source.salePrice,
        currency: source.currency,
        material: source.material,
        careInstructions: source.careInstructions,
        gender: source.gender,
        metaTitle: source.metaTitle ? `${source.metaTitle} (Copy)` : null,
        metaDesc: source.metaDesc,
        isActive: false,
        isFeatured: false,
        isNew: false,
        sortOrder: 0,
      },
    });

    // Duplicate variants using createMany (batch operation)
    if (source.variants.length > 0) {
      const timestamp = Date.now().toString(36).toUpperCase();
      await prisma.productVariant.createMany({
        data: source.variants.map((v) => ({
          productId: product.id,
          sku: `${v.sku}-CP${timestamp}`,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          priceAdjustment: v.priceAdjustment,
          stock: 0,
          weight: v.weight,
          isActive: true,
        })),
      });
    }

    // Duplicate attributes
    if (source.attributes.length > 0) {
      await prisma.productAttribute.createMany({
        data: source.attributes.map((a) => ({ productId: product.id, name: a.name, value: a.value })),
      });
    }

    logAction(ctx.userId, "admin.product.duplicate", {
      entity: "product",
      entityId: product.id,
      metadata: { sourceId: productId, name: product.name },
      ...extractRequestMeta(req),
    });

    return success({ product, message: "Product duplicated as draft" });
  } catch (err) { return serverError(err); }
}

// ─── Restore (reactivate) ───

async function handleRestore(productId: string, req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const prisma = getPrisma(ctx.env);
    const product = await prisma.product.update({
      where: { id: productId },
      data: { isActive: true, publishedAt: new Date() },
    });
    logAction(ctx.userId, "admin.product.restore", {
      entity: "product",
      entityId: productId,
      metadata: { name: product.name },
      ...extractRequestMeta(req),
    });

    return success(product);
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2025") return notFound("Product not found");
    return serverError(err);
  }
}

// ─── Bulk Status ───

async function handleBulkStatus(req: Request, ctx: RequestContext): Promise<Response> {
  const body = await req.json();
  const { ids, status } = body;
  if (!Array.isArray(ids) || ids.length === 0) return badRequest("ids array required");
  if (typeof status !== "boolean") return badRequest("status boolean required");
  try {
    const prisma = getPrisma(ctx.env);
    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { isActive: status, publishedAt: status ? new Date() : undefined },
    });
    logAction(ctx.userId, "admin.product.bulk_status", {
      entity: "product",
      entityId: ids.join(","),
      metadata: { count: ids.length, status },
      ...extractRequestMeta(req),
    });

    return success({ updated: result.count });
  } catch (err) { return serverError(err); }
}

// ─── Bulk Category ───

async function handleBulkCategory(req: Request, env: any): Promise<Response> {
  const body = await req.json();
  const { ids, categoryId, subcategoryId, collectionId } = body;
  if (!Array.isArray(ids) || ids.length === 0) return badRequest("ids array required");
  try {
    const prisma = getPrisma(env);
    const data: Record<string, unknown> = {};
    if (categoryId !== undefined) data.categoryId = toNull(categoryId);
    if (subcategoryId !== undefined) data.subcategoryId = toNull(subcategoryId);
    if (collectionId !== undefined) data.collectionId = toNull(collectionId);
    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: data as never,
    });
    return success({ updated: result.count });
  } catch (err) { return serverError(err); }
}

// ─── Bulk Delete ───

async function handleBulkDelete(req: Request, ctx: RequestContext): Promise<Response> {
  const body = await req.json();
  const { ids } = body;
  if (!Array.isArray(ids) || ids.length === 0) return badRequest("ids array required");
  try {
    const prisma = getPrisma(ctx.env);
    const result = await prisma.product.updateMany({
      where: { id: { in: ids }, isActive: true },
      data: { isActive: false },
    });
    logAction(ctx.userId, "admin.product.bulk_delete", {
      entity: "product",
      entityId: ids.join(","),
      metadata: { count: ids.length },
      ...extractRequestMeta(req),
    });

    return success({ archived: result.count });
  } catch (err) { return serverError(err); }
}

// ─── Permanent Delete (soft-deleted products only) ───

async function handlePermanentDelete(productId: string, req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const prisma = getPrisma(ctx.env);
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, isActive: true, _count: { select: { orderItems: true } } },
    });
    if (!product) return notFound("Product not found");

    if (product._count.orderItems > 0) {
      return badRequest(`Cannot permanently delete "${product.name}" — it has ${product._count.orderItems} order(s). Remove it from orders first or contact support.`);
    }

    // Gather all Cloudinary public IDs (images + variant videos)
    const images = await prisma.productImage.findMany({ where: { productId }, select: { publicId: true } });
    const allPublicIds = images.map((i) => i.publicId).filter(Boolean) as string[];
    if (allPublicIds.length > 0) {
      await destroyCloudinaryAssets(allPublicIds);
    }
    const variants = await prisma.productVariant.findMany({ where: { productId }, select: { videoPublicId: true } });
    const videoIds = variants.map((v) => v.videoPublicId).filter(Boolean) as string[];
    if (videoIds.length > 0) {
      await destroyCloudinaryAssets(videoIds, ctx.env, "video");
    }

    // Delete from DB (cascades handle variants, images, tags, labels, etc.)
    await prisma.product.delete({ where: { id: productId } });

    logAction(ctx.userId, "admin.product.permanent_delete", {
      entity: "product",
      entityId: productId,
      metadata: { name: product.name },
      ...extractRequestMeta(req),
    });

    return success({ message: `"${product.name}" permanently deleted` });
  } catch (err) {
    return serverError(err);
  }
}

async function handleBulkPermanentDelete(req: Request, ctx: RequestContext): Promise<Response> {
  const body = await req.json();
  const { ids } = body;
  if (!Array.isArray(ids) || ids.length === 0) return badRequest("ids array required");

  try {
    const prisma = getPrisma(ctx.env);
    // Check for order items across all products
    const orderItemCount = await prisma.orderItem.count({
      where: { productId: { in: ids } },
    });
    if (orderItemCount > 0) {
      return badRequest(`${orderItemCount} product(s) have existing orders and cannot be permanently deleted. Remove them from orders first.`);
    }

    // Gather all Cloudinary public IDs (images + variant videos)
    const images = await prisma.productImage.findMany({ where: { productId: { in: ids } }, select: { publicId: true } });
    const allPublicIds = images.map((i) => i.publicId).filter(Boolean) as string[];
    if (allPublicIds.length > 0) {
      await destroyCloudinaryAssets(allPublicIds);
    }
    const variants = await prisma.productVariant.findMany({ where: { productId: { in: ids } }, select: { videoPublicId: true } });
    const videoIds = variants.map((v) => v.videoPublicId).filter(Boolean) as string[];
    if (videoIds.length > 0) {
      await destroyCloudinaryAssets(videoIds, ctx.env, "video");
    }

    const result = await prisma.product.deleteMany({ where: { id: { in: ids } } });

    logAction(ctx.userId, "admin.product.bulk_permanent_delete", {
      entity: "product",
      entityId: ids.join(","),
      metadata: { count: result.count },
      ...extractRequestMeta(req),
    });

    return success({ deleted: result.count });
  } catch (err) {
    return serverError(err);
  }
}

// ─── Schedule Publish/Archive ───

async function handleSchedule(productId: string, req: Request, env: any): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const { publishAt, archiveAt } = body;
  const prisma = getPrisma(env);
  try {
    const data: Record<string, unknown> = {};
    if (publishAt) data.scheduledPublishAt = new Date(publishAt as string);
    if (archiveAt) data.scheduledArchiveAt = new Date(archiveAt as string);
    const product = await prisma.product.update({
      where: { id: productId },
      data: data as never,
    });
    return success(product);
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2025") return notFound("Product not found");
    return serverError(err);
  }
}
