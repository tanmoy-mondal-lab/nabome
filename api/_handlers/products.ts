import { getPrisma } from "../_lib/prisma";
import { success, badRequest, notFound, serverError } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  subcategory: { select: { id: true, name: true, slug: true } },
  collection: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: { where: { isActive: true }, include: { images: { orderBy: { sortOrder: "asc" as const } } } },
  attributes: true,
  productTags: { include: { tag: true } },
  productLabels: { include: { label: true } },
  _count: { select: { reviews: true } },
};

const productListSelect = {
  id: true,
  name: true,
  slug: true,
  shortDescription: true,
  basePrice: true,
  salePrice: true,
  compareAtPrice: true,
  currency: true,
  gender: true,
  isNew: true,
  isFeatured: true,
  material: true,
  createdAt: true,
  category: { select: { id: true, name: true, slug: true } },
  collection: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
  images: {
    where: { isPrimary: true },
    take: 1,
    orderBy: { sortOrder: "asc" as const },
  },
  variants: {
    where: { isActive: true },
    select: { id: true, size: true, color: true, colorHex: true, stock: true, reservedStock: true, priceAdjustment: true },
  },
  productLabels: {
    include: { label: { select: { name: true, slug: true, color: true } } },
  },
  _count: { select: { reviews: true } },
};

export async function handleProductRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "list":
      return handleList(req, ctx.env);
    case "featured":
      return handleFeatured(ctx.env);
    case "newArrivals":
      return handleNewArrivals(ctx.env);
    case "search":
      return handleSearch(req, ctx.env);
    case "detail":
      return handleDetail(params[0], ctx.env);
    case "variants":
      return handleVariants(params[0], ctx.env);
    case "reviews":
      return handleProductReviews(params[0], ctx.env);
    default:
      return badRequest("Unknown product action");
  }
}

async function handleList(req: Request, env: any): Promise<Response> {
  const prisma = getPrisma(env);
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "12");
  const category = url.searchParams.get("category");
  const subcategory = url.searchParams.get("subcategory");
  const collection = url.searchParams.get("collection");
  const gender = url.searchParams.get("gender");
  const minPrice = url.searchParams.get("minPrice");
  const maxPrice = url.searchParams.get("maxPrice");
  const sort = url.searchParams.get("sort") ?? "newest";
  const tag = url.searchParams.get("tag");
  const size = url.searchParams.get("size");
  const color = url.searchParams.get("color");
  const material = url.searchParams.get("material");
  const brand = url.searchParams.get("brand");
  const label = url.searchParams.get("label");
  const availability = url.searchParams.get("availability");

  const where: Record<string, unknown> = { isActive: true };

  if (category) where.category = { slug: category };
  if (subcategory) where.subcategory = { slug: subcategory };
  if (collection) where.collection = { slug: collection };
  if (gender) where.gender = gender;
  if (minPrice || maxPrice) {
    where.basePrice = {};
    if (minPrice) (where.basePrice as Record<string, unknown>).gte = parseFloat(minPrice);
    if (maxPrice) (where.basePrice as Record<string, unknown>).lte = parseFloat(maxPrice);
  }
  if (tag) {
    where.productTags = { some: { tag: { slug: tag } } };
  }
  if (size || color) {
    where.variants = {
      some: {
        isActive: true,
        ...(size ? { size } : {}),
        ...(color ? { color: { contains: color, mode: "insensitive" } } : {}),
      },
    };
  }
  if (material) {
    where.material = { contains: material, mode: "insensitive" };
  }
  if (brand) {
    where.brand = { slug: brand };
  }
  if (label) {
    where.productLabels = { some: { label: { slug: label } } };
  }
  if (availability === "in_stock") {
    where.variants = {
      ...((where.variants as Record<string, unknown>) ?? {}),
      some: {
        ...(((where.variants as Record<string, unknown>)?.some as Record<string, unknown>) ?? {}),
        stock: { gt: 0 },
      },
    };
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  switch (sort) {
    case "price_asc":
      orderBy = { basePrice: "asc" };
      break;
    case "price_desc":
      orderBy = { basePrice: "desc" };
      break;
    case "name_asc":
      orderBy = { name: "asc" };
      break;
    case "name_desc":
      orderBy = { name: "desc" };
      break;
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
  }

  const skip = (page - 1) * limit;

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: where as never,
        select: productListSelect,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where: where as never }),
    ]);

    return success({
      products,
      pagination: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleFeatured(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      select: productListSelect,
      orderBy: { sortOrder: "asc" as const },
      take: 8,
    });
    return success({ products });
  } catch (err) {
    return serverError(err);
  }
}

async function handleNewArrivals(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const products = await prisma.product.findMany({
      where: { isActive: true, isNew: true },
      select: productListSelect,
      orderBy: { createdAt: "desc" as const },
      take: 8,
    });
    return success({ products });
  } catch (err) {
    return serverError(err);
  }
}

async function handleSearch(req: Request, env: any): Promise<Response> {
  const prisma = getPrisma(env);
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "12");

  if (!q || q.length < 2) {
    return badRequest("Search query must be at least 2 characters");
  }

  const skip = (page - 1) * limit;

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { shortDescription: { contains: q, mode: "insensitive" } },
            { material: { contains: q, mode: "insensitive" } },
            { brand: { name: { contains: q, mode: "insensitive" } } },
            { variants: { some: { sku: { contains: q, mode: "insensitive" } } } },
            { productTags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
          ],
        },
        select: productListSelect,
        orderBy: { createdAt: "desc" as const },
        skip,
        take: limit,
      }),
      prisma.product.count({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { shortDescription: { contains: q, mode: "insensitive" } },
            { material: { contains: q, mode: "insensitive" } },
            { brand: { name: { contains: q, mode: "insensitive" } } },
            { variants: { some: { sku: { contains: q, mode: "insensitive" } } } },
            { productTags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
          ],
        },
      }),
    ]);

    return success({
      products,
      query: q,
      pagination: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleDetail(slug: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const product = await prisma.product.findFirst({
      where: { slug, isActive: true },
      include: productInclude,
    });

    if (!product) return notFound("Product not found");

    // Fetch related products separately to avoid self-referential M2M complexity
    const relatedRecords = await prisma.relatedProduct.findMany({
      where: { sourceId: product.id },
      include: {
        target: {
          select: {
            id: true, name: true, slug: true, basePrice: true, salePrice: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });
    const relatedProducts = relatedRecords.map((r) => r.target);

    return success({ product: { ...product, relatedProducts } });
  } catch (err) {
    return serverError(err);
  }
}

async function handleVariants(slug: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const product = await prisma.product.findFirst({
      where: { slug, isActive: true },
      select: { id: true },
    });

    if (!product) return notFound("Product not found");

    const variants = await prisma.productVariant.findMany({
      where: { productId: product.id, isActive: true },
      select: {
        id: true, size: true, color: true, colorHex: true,
        stock: true, reservedStock: true, priceAdjustment: true,
        images: { orderBy: { sortOrder: "asc" as const } },
      },
      orderBy: [{ color: "asc" as const }, { size: "asc" as const }],
    });

    return success({ variants });
  } catch (err) {
    return serverError(err);
  }
}

async function handleProductReviews(slug: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const product = await prisma.product.findFirst({
      where: { slug, isActive: true },
      select: { id: true },
    });

    if (!product) return notFound("Product not found");

    const reviews = await prisma.review.findMany({
      where: { productId: product.id, isApproved: true },
      include: {
        profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" as const },
    });

    // Calculate rating distribution
    const distribution: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) distribution[String(r.rating)]++;
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return success({
      reviews,
      stats: {
        total: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10,
        distribution,
      },
    });
  } catch (err) {
    return serverError(err);
  }
}
