import { prisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";
import { logAction, extractRequestMeta } from "../../_lib/audit";
import { destroyCloudinaryAsset, destroyCloudinaryAssets } from "../../_lib/cloudinary";
import { slugify } from "../../../src/lib/utils/format";
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
    case "list": return handleList(req);
    case "create": return handleCreate(req, ctx);
    case "detail": return handleDetail(params[0]);
    case "update": return handleUpdate(params[0], req, ctx);
    case "delete": return handleDelete(params[0], req, ctx);
    case "duplicate": return handleDuplicate(params[0], req, ctx);
    case "restore": return handleRestore(params[0], req, ctx);
    case "variants": return handleUpdateVariants(params[0], req);
    case "addImage": return handleAddImage(params[0], req);
    case "deleteImage": return handleDeleteImage(params[0], params[1]);
    case "bulkStatus": return handleBulkStatus(req, ctx);
    case "bulkCategory": return handleBulkCategory(req);
    case "bulkDelete": return handleBulkDelete(req, ctx);
    case "permanentDelete": return handlePermanentDelete(params[0], req, ctx);
    case "bulkPermanentDelete": return handleBulkPermanentDelete(req, ctx);
    case "schedule": return handleSchedule(params[0], req);
    default: return badRequest("Unknown action");
  }
}

async function handleList(req: Request): Promise<Response> {
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
  const { name, description, shortDescription, categoryId, subcategoryId, collectionId, brandId, sizeGuideId, basePrice, salePrice, compareAtPrice, costPrice, discountPercent, material, careInstructions, sizeChartUrl, currency, scheduledPublishAt, scheduledArchiveAt, isActive, isFeatured, isNew, gender, sortOrder, metaTitle, metaDesc } = body as Record<string, unknown>;

  if (!name || basePrice === undefined) {
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
        basePrice,
        salePrice: toNull(salePrice),
        compareAtPrice: toNull(compareAtPrice),
        costPrice: toNull(costPrice),
        discountPercent: toNull(discountPercent),
        material: toNull(material),
        careInstructions: toNull(careInstructions),
        sizeChartUrl: toNull(sizeChartUrl),
        currency: (currency as string) || "INR",
        scheduledPublishAt: scheduledPublishAt ? new Date(scheduledPublishAt as string) : null,
        scheduledArchiveAt: scheduledArchiveAt ? new Date(scheduledArchiveAt as string) : null,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        isNew: isNew ?? false,
        gender: gender ?? "unisex",
        sortOrder: sortOrder ?? 0,
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

async function handleDetail(productId: string): Promise<Response> {
  try {
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

  try {
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) return notFound("Product not found");

    const data: Record<string, unknown> = {};
    const updatableFields = [
      "name", "description", "shortDescription", "categoryId", "subcategoryId", "collectionId",
      "brandId", "sizeGuideId", "basePrice", "salePrice", "compareAtPrice", "costPrice", "discountPercent",
      "material", "careInstructions", "sizeChartUrl", "currency",
      "isActive", "isFeatured", "isNew", "gender", "sortOrder", "metaTitle", "metaDesc",
      "scheduledPublishAt", "scheduledArchiveAt",
    ];

    const optionalStringFields = [
      "categoryId", "subcategoryId", "collectionId", "brandId", "sizeGuideId",
      "sizeChartUrl", "material", "careInstructions", "metaTitle", "metaDesc",
      "scheduledPublishAt", "scheduledArchiveAt",
    ];

    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        data[field] = optionalStringFields.includes(field) ? toNull(body[field]) : body[field];
      }
    }

    if (body.slug && body.slug !== existing.slug) {
      let slug = slugify(body.slug);
      const slugExists = await prisma.product.findFirst({
        where: { slug, id: { not: productId } },
      });
      if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;
      data.slug = slug;
    } else if (body.name && body.name !== existing.name) {
      let slug = slugify(body.name);
      const slugExists = await prisma.product.findFirst({
        where: { slug, id: { not: productId } },
      });
      if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;
      data.slug = slug;
    }

    if (body.isActive && !existing.publishedAt) {
      data.publishedAt = new Date();
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
    const images = await prisma.productImage.findMany({ where: { productId }, select: { publicId: true } });
    const publicIds = images.map((i) => i.publicId).filter(Boolean) as string[];
    await destroyCloudinaryAssets(publicIds);
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

async function handleUpdateVariants(productId: string, req: Request): Promise<Response> {
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

  try {
    // Separate existing variants (updates) from new variants (creates)
    const toUpdate = variants.filter(v => v.id && !String(v.id).startsWith("new-"));
    const toCreate = variants.filter(v => !v.id || String(v.id).startsWith("new-"));

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

    // Execute updates and creates in parallel
    const [updatedResults, createdResults] = await Promise.all([
      toUpdate.length > 0
        ? Promise.all(
            toUpdate.map(v =>
              prisma.productVariant.update({
                where: { id: v.id!, productId },
                data: variantData(v),
              })
            )
          )
        : Promise.resolve([]),
      toCreate.length > 0
        ? prisma.productVariant.createMany({
            data: toCreate.map(v => ({
              productId,
              ...variantData(v),
            })),
          }).then(() =>
            // fetch created variants since createMany doesn't return them
            prisma.productVariant.findMany({
              where: { productId, sku: { in: toCreate.map(v => v.sku) } },
            })
          )
        : Promise.resolve([]),
    ]);

    return success({ variants: [...updatedResults, ...createdResults] });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAddImage(productId: string, req: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const { url, publicId, altText, variantId, sortOrder, isPrimary } = body;

  if (!url) return badRequest("Image URL is required");

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
        url,
        publicId: publicId ?? null,
        altText: altText ?? null,
        variantId: toNull(variantId),
        sortOrder: sortOrder ?? 0,
        isPrimary: isPrimary ?? false,
      },
    });

    return created(image);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeleteImage(productId: string, imageId: string): Promise<Response> {
  try {
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

async function handleBulkCategory(req: Request): Promise<Response> {
  const body = await req.json();
  const { ids, categoryId, subcategoryId, collectionId } = body;
  if (!Array.isArray(ids) || ids.length === 0) return badRequest("ids array required");
  try {
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
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, isActive: true, _count: { select: { orderItems: true } } },
    });
    if (!product) return notFound("Product not found");

    if (product._count.orderItems > 0) {
      return badRequest(`Cannot permanently delete "${product.name}" — it has ${product._count.orderItems} order(s). Remove it from orders first or contact support.`);
    }

    // Gather all Cloudinary public IDs (product images + variant images)
    const [productImages, variantImages] = await Promise.all([
      prisma.productImage.findMany({ where: { productId }, select: { publicId: true } }),
      prisma.productVariantImage.findMany({
        where: { variant: { productId } },
        select: { publicId: true },
      }),
    ]);
    const allPublicIds = [...productImages, ...variantImages]
      .map((i) => i.publicId)
      .filter(Boolean) as string[];
    if (allPublicIds.length > 0) {
      await destroyCloudinaryAssets(allPublicIds);
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
    // Check for order items across all products
    const orderItemCount = await prisma.orderItem.count({
      where: { productId: { in: ids } },
    });
    if (orderItemCount > 0) {
      return badRequest(`${orderItemCount} product(s) have existing orders and cannot be permanently deleted. Remove them from orders first.`);
    }

    // Gather all Cloudinary public IDs
    const [productImages, variantImages] = await Promise.all([
      prisma.productImage.findMany({ where: { productId: { in: ids } }, select: { publicId: true } }),
      prisma.productVariantImage.findMany({
        where: { variant: { productId: { in: ids } } },
        select: { publicId: true },
      }),
    ]);
    const allPublicIds = [...productImages, ...variantImages]
      .map((i) => i.publicId)
      .filter(Boolean) as string[];
    if (allPublicIds.length > 0) {
      await destroyCloudinaryAssets(allPublicIds);
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

async function handleSchedule(productId: string, req: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const { publishAt, archiveAt } = body;
  try {
    const data: Record<string, unknown> = {};
    if (publishAt) data.scheduledPublishAt = new Date(publishAt);
    if (archiveAt) data.scheduledArchiveAt = new Date(archiveAt);
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
