import { getPrisma } from "../_lib/prisma";
import { success, badRequest, serverError } from "../_lib/response";
import type { RequestContext } from "../_lib/types";
import type { Env } from "../_lib/env";

export async function handleSearchRequest(
  req: Request,
  ctx: RequestContext,
  _params: string[],
  action: string
): Promise<Response> {
  if (!ctx.env) return serverError("Environment not available");

  switch (action) {
    case "suggestions":
      return handleSuggestions(req, ctx.env);
    case "recent":
      return handleRecentSearches(ctx, ctx.env);
    case "trending":
      return handleTrendingSearches(ctx.env);
    case "save":
      return handleSaveSearch(req, ctx, ctx.env);
    case "clear":
      return handleClearRecentSearches(ctx, ctx.env);
    default:
      return badRequest("Unknown search action");
  }
}

async function handleSuggestions(req: Request, env: Env): Promise<Response> {
  const prisma = getPrisma(env);
  const url = new URL(req.url);
  const q = url.searchParams.get("q");

  if (!q || q.length < 2) {
    return success({ suggestions: [] });
  }

  const query = q.trim();
  const limit = parseInt(url.searchParams.get("limit") ?? "8");

  try {
    // Get product suggestions using pg_trgm
    const products = await prisma.$queryRaw<Array<{
      id: string;
      name: string;
      slug: string;
      base_price: string;
      sale_price: string | null;
      image_url: string | null;
      similarity: number;
    }>>`
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.base_price,
        p.sale_price,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url,
        (similarity(p.name, ${query}) * 10 + 
         COALESCE(similarity(p.short_description, ${query}), 0) * 5) as similarity
      FROM products p
      WHERE p.is_active = true
        AND (p.name % ${query} OR p.short_description % ${query})
      ORDER BY similarity DESC, p.sort_order ASC
      LIMIT ${limit}
    `;

    // Get category suggestions
    const categories = await prisma.$queryRaw<Array<{
      id: string;
      name: string;
      slug: string;
      image_url: string | null;
      similarity: number;
    }>>`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.image_url,
        (similarity(c.name, ${query}) * 10 + 
         COALESCE(similarity(c.description, ${query}), 0) * 5) as similarity
      FROM categories c
      WHERE c.is_active = true
        AND (c.name % ${query} OR c.description % ${query})
      ORDER BY similarity DESC, c.sort_order ASC
      LIMIT 5
    `;

    // Get brand suggestions
    const brands = await prisma.$queryRaw<Array<{
      id: string;
      name: string;
      slug: string;
      logo_url: string | null;
      similarity: number;
    }>>`
      SELECT 
        b.id,
        b.name,
        b.slug,
        b.logo_url,
        similarity(b.name, ${query}) * 10 as similarity
      FROM brands b
      WHERE b.is_active = true
        AND b.name % ${query}
      ORDER BY similarity DESC, b.sort_order ASC
      LIMIT 5
    `;

    const suggestions = {
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.sale_price ? Number(p.sale_price) : Number(p.base_price),
        image: p.image_url,
        type: "product" as const,
      })),
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image_url,
        type: "category" as const,
      })),
      brands: brands.map(b => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        image: b.logo_url,
        type: "brand" as const,
      })),
    };

    return success({ suggestions });
  } catch (_err) {
    return serverError(_err);
  }
}

async function handleRecentSearches(ctx: RequestContext, env: Env): Promise<Response> {
  const prisma = getPrisma(env);

  if (!ctx.userId) {
    return success({ recent: [] });
  }

  try {
    const recent = await prisma.searchHistory.findMany({
      where: { profileId: ctx.userId },
      orderBy: { searchedAt: "desc" },
      take: 10,
      select: {
        query: true,
        searchedAt: true,
      },
    });

    return success({ 
      recent: recent.map(r => ({
        query: r.query,
        searchedAt: r.searchedAt,
      }))
    });
  } catch (_err) {
    return serverError(_err);
  }
}

async function handleSaveSearch(req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  const prisma = getPrisma(env);
  const url = new URL(req.url);
  const q = url.searchParams.get("q");

  if (!q || q.length < 2) {
    return badRequest("Search query must be at least 2 characters");
  }

  if (!ctx.userId) {
    return success({ saved: false }); // Don't save for anonymous users
  }

  const query = q.trim();

  try {
    // Check if this search already exists in recent history
    const existing = await prisma.searchHistory.findFirst({
      where: {
        profileId: ctx.userId,
        query,
      },
    });

    if (existing) {
      // Update the timestamp
      await prisma.searchHistory.update({
        where: { id: existing.id },
        data: { searchedAt: new Date() },
      });
    } else {
      // Create new search history entry
      await prisma.searchHistory.create({
        data: {
          profileId: ctx.userId,
          query,
        },
      });

      // Keep only last 20 searches per user
      const allSearches = await prisma.searchHistory.findMany({
        where: { profileId: ctx.userId },
        orderBy: { searchedAt: "desc" },
      });

      if (allSearches.length > 20) {
        const toDelete = allSearches.slice(20);
        await prisma.searchHistory.deleteMany({
          where: {
            id: { in: toDelete.map(s => s.id) },
          },
        });
      }
    }

    // Also update trending searches
    await prisma.trendingSearch.upsert({
      where: { query },
      create: {
        query,
        searchCount: 1,
        lastSearchedAt: new Date(),
      },
      update: {
        searchCount: { increment: 1 },
        lastSearchedAt: new Date(),
      },
    });

    return success({ saved: true });
  } catch (_err) {
    return serverError(_err);
  }
}

async function handleClearRecentSearches(ctx: RequestContext, env: Env): Promise<Response> {
  const prisma = getPrisma(env);

  if (!ctx.userId) {
    return badRequest("Authentication required");
  }

  try {
    await prisma.searchHistory.deleteMany({
      where: { profileId: ctx.userId },
    });

    return success({ cleared: true });
  } catch (_err) {
    return serverError(_err);
  }
}

async function handleTrendingSearches(env: Env): Promise<Response> {
  const prisma = getPrisma(env);

  try {
    const trending = await prisma.trendingSearch.findMany({
      where: {
        lastSearchedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      orderBy: [
        { searchCount: "desc" },
        { lastSearchedAt: "desc" },
      ],
      take: 10,
    });

    return success({ 
      trending: trending.map(t => ({
        query: t.query,
        searchCount: t.searchCount,
        lastSearchedAt: t.lastSearchedAt,
      }))
    });
  } catch (_err) {
    return serverError(_err);
  }
}
