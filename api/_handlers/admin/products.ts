import { prisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../../src/lib/utils/format";
import { logAction, extractRequestMeta } from "../../_lib/audit";
import { requireAdmin } from "../../_lib/auth";

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  subcategory: { select: { id: true, name: true, slug: true } },
  collection: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
  sizeGuide: { select: { id: true, name: true } },
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: { include: { inventoryAlerts: { where: { isResolved: false }, take: 1 } } },
  attributes: true,
  productTags: { include: { tag: true } },
  productLabels: { include: { label: true } },
  relatedTo: { include: { target: { select: { id: true, name: true, slug: true, basePrice: true, salePrice: true, images: { where: { isPrimary: true }, take: 1, select: { url: true } } } } } },
  relatedFrom: { include: { source: { select: { id: true, name: true, slug: true, basePrice: true, salePrice: true, images: { where: { isPrimary: true }, take: 1, select: { url: true } } } } } },
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
    case "create": return handleCreate(req);
    case "detail": return handleDetail(params[0]);
    case "update": return handleUpdate(params[0], req);
    case "delete": return handleDelete(params[0], req);
    case "duplicate": return handleDuplicate(params[0], req);
    case "restore": return handleRestore(params[0], req);
    case "variants": return handleUpdateVariants(params[0], req);
    case "addImage": return handleAddImage(params[0], req);
    case "deleteImage": return handleDeleteImage(params[0], params[1]);
    case "bulkStatus": return handleBulkStatus(req);
    case "bulkCategory": return handleBulkCategory(req);
    case "bulkDelete": return handleBulkDelete(req);
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

async function handleCreate(req: Request): Promise<Response> {
  const body = await req.json();
  const { name, description, shortDescription, categoryId, subcategoryId, collectionId, basePrice, compareAtPrice, costPrice, material, careInstructions, isActive, isFeatured, isNew, gender, sortOrder, metaTitle, metaDesc } = body;

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
        description: description ?? null,
        shortDescription: shortDescription ?? null,
        categoryId: categoryId ?? null,
        subcategoryId: subcategoryId ?? null,
        collectionId: collectionId ?? null,
        basePrice,
        compareAtPrice: compareAtPrice ?? null,
        costPrice: costPrice ?? null,
        material: material ?? null,
        careInstructions: careInstructions ?? null,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        isNew: isNew ?? false,
        gender: gender ?? "unisex",
        sortOrder: sortOrder ?? 0,
        metaTitle: metaTitle ?? null,
        metaDesc: metaDesc ?? null,
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

async function handleUpdate(productId: string, req: Request): Promise<Response> {
  const body = await req.json();

  try {
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) return notFound("Product not found");

    const data: Record<string, unknown> = {};
    const updatableFields = [
      "name", "description", "shortDescription", "categoryId", "subcategoryId", "collectionId",
      "basePrice", "compareAtPrice", "costPrice", "material", "careInstructions", "sizeChartUrl",
      "isActive", "isFeatured", "isNew", "gender", "sortOrder", "metaTitle", "metaDesc",
    ];

    for (const field of updatableFields) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    if (body.name && body.name !== existing.name) {
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

async function handleDelete(productId: string, req: Request): Promise<Response> {
  try {
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
  const body = await req.json();
  const { variants } = body;

  if (!Array.isArray(variants)) {
    return badRequest("Variants array is required");
  }

  try {
    const results = [];
    for (const v of variants) {
      if (v.id) {
        const updated = await prisma.productVariant.update({
          where: { id: v.id, productId },
          data: {
            sku: v.sku,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex ?? null,
            priceAdjustment: v.priceAdjustment ?? 0,
            stock: v.stock ?? 0,
            weight: v.weight ?? null,
            isActive: v.isActive ?? true,
          },
        });
        results.push(updated);
      } else {
        const created2 = await prisma.productVariant.create({
          data: {
            productId,
            sku: v.sku,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex ?? null,
            priceAdjustment: v.priceAdjustment ?? 0,
            stock: v.stock ?? 0,
            weight: v.weight ?? null,
            isActive: true,
          },
        });
        results.push(created2);
      }
    }

    return success({ variants: results });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAddImage(productId: string, req: Request): Promise<Response> {
  const body = await req.json();
  const { url, altText, variantId, sortOrder, isPrimary } = body;

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
        altText: altText ?? null,
        variantId: variantId ?? null,
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
    await prisma.productImage.delete({
      where: { id: imageId, productId },
    });
    return success({ message: "Image deleted" });
  } catch (err) {
    return notFound("Image not found");
  }
}

// ─── Duplicate ───

async function handleDuplicate(productId: string, req: Request): Promise<Response> {
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

    // Duplicate variants
    for (const v of source.variants) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: `${v.sku}-CP${Date.now().toString(36).toUpperCase()}`,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          priceAdjustment: v.priceAdjustment,
          stock: 0,
          weight: v.weight,
          isActive: true,
        },
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

async function handleRestore(productId: string, req: Request): Promise<Response> {
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
  } catch (err) { return notFound("Product not found"); }
}

// ─── Bulk Status ───

async function handleBulkStatus(req: Request): Promise<Response> {
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
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (subcategoryId !== undefined) data.subcategoryId = subcategoryId;
    if (collectionId !== undefined) data.collectionId = collectionId;
    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: data as never,
    });
    return success({ updated: result.count });
  } catch (err) { return serverError(err); }
}

// ─── Bulk Delete ───

async function handleBulkDelete(req: Request): Promise<Response> {
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

// ─── Schedule Publish/Archive ───

async function handleSchedule(productId: string, req: Request): Promise<Response> {
  const body = await req.json();
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
  } catch (err) { return notFound("Product not found"); }
}
