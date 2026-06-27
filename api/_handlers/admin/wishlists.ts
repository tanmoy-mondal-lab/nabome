import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";

export async function handleAdminWishlistRequest(req: Request, ctx: RequestContext, _params: string[], action: string): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;
  switch (action) {
    case "list": return handleList(req, ctx.env);
    default: return badRequest("Unknown action");
  }
}

async function handleList(req: Request, env: any): Promise<Response> {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "25") || 25));
  const search = url.searchParams.get("search");

  try {
    const prisma = getPrisma(env);
    // Get all wishlist items grouped by product with counts
    const allItems = await prisma.wishlistItem.findMany({
      select: {
        variantId: true,
        variant: {
          select: {
            id: true,
            sku: true,
            size: true,
            color: true,
            priceAdjustment: true,
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                basePrice: true,
                gender: true,
                images: { select: { url: true }, take: 1 },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Aggregate by product
    const productMap = new Map<string, {
      productId: string;
      name: string;
      slug: string;
      basePrice: number;
      gender: string;
      imageUrl: string | null;
      wishlistCount: number;
      variantCount: number;
      variants: { sku: string; size: string; color: string }[];
    }>();

    for (const item of allItems) {
      const p = item.variant.product;
      const existing = productMap.get(p.id);
      if (existing) {
        existing.wishlistCount++;
        existing.variantCount++;
        existing.variants.push({ sku: item.variant.sku, size: item.variant.size, color: item.variant.color });
      } else {
        productMap.set(p.id, {
          productId: p.id,
          name: p.name,
          slug: p.slug,
          basePrice: Number(p.basePrice),
          gender: p.gender,
          imageUrl: p.images?.[0]?.url ?? null,
          wishlistCount: 1,
          variantCount: 1,
          variants: [{ sku: item.variant.sku, size: item.variant.size, color: item.variant.color }],
        });
      }
    }

    let products = Array.from(productMap.values());

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
      );
    }

    // Sort by wishlist count descending
    products.sort((a, b) => b.wishlistCount - a.wishlistCount);

    const total = products.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginated = products.slice(skip, skip + limit);

    return success({
      products: paginated,
      pagination: { total, page, pageSize: limit, totalPages },
    });
  } catch (err) {
    return serverError(err);
  }
}
