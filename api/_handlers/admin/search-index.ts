import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth-middleware";

type SearchableDoc = {
  id: string;
  objectID?: string;
  type: "product" | "page" | "category" | "collection" | "lookbook";
  title: string;
  slug: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  tags?: string[];
  price?: number;
  url: string;
  updatedAt: string;
  score?: number;
};

// In-memory search index (for demo/dev — replace with Algolia/Meilisearch in production)
let memoryIndex: SearchableDoc[] = [];
let lastIndexed: string | null = null;

export async function handleAdminSearchIndexRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "status":
      return handleStatus(ctx.env);
    case "build":
      return handleBuild(ctx.env);
    case "search":
      return handleSearch(req, ctx.env);
    default:
      return badRequest("Unknown action");
  }
}

async function handleStatus(env: any): Promise<Response> {
  return success({
    indexed: memoryIndex.length > 0,
    count: memoryIndex.length,
    lastIndexed,
    engine: "memory",
  });
}

async function handleBuild(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const [products, pages, categories, collections, lookbooks] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          productTags: { include: { tag: true } },
          _count: { select: { variants: true } },
        },
      }),
      prisma.staticPage.findMany({
        where: { isPublished: true },
      }),
      prisma.category.findMany({ where: { isActive: true } }),
      prisma.collection.findMany({ where: { isActive: true } }),
      prisma.lookbook.findMany({ where: { isActive: true } }),
    ]);

    const docs: SearchableDoc[] = [
      ...products.map((p) => ({
        id: p.id,
        type: "product" as const,
        title: p.name,
        slug: p.slug,
        description: p.shortDescription ?? p.description ?? undefined,
        content: p.description ?? undefined,
        imageUrl: p.images[0]?.url ?? undefined,
        tags: p.productTags.map((t) => t.tag.name),
        price: Number(p.basePrice),
        url: `/products/${p.slug}`,
        updatedAt: p.updatedAt.toISOString(),
      })),
      ...pages.map((p) => ({
        id: p.id,
        type: "page" as const,
        title: p.title,
        slug: p.slug,
        description: p.metaDesc ?? undefined,
        url: `/${p.slug}`,
        updatedAt: p.updatedAt.toISOString(),
      })),
      ...categories.map((c) => ({
        id: c.id,
        type: "category" as const,
        title: c.name,
        slug: c.slug,
        description: c.description ?? undefined,
        imageUrl: c.imageUrl ?? undefined,
        url: `/products?category=${encodeURIComponent(c.slug)}`,
        updatedAt: c.updatedAt.toISOString(),
      })),
      ...collections.map((c) => ({
        id: c.id,
        type: "collection" as const,
        title: c.name,
        slug: c.slug,
        description: c.description ?? undefined,
        imageUrl: c.heroImageUrl ?? undefined,
        url: `/collections/${c.slug}`,
        updatedAt: c.updatedAt.toISOString(),
      })),
      ...lookbooks.map((l) => ({
        id: l.id,
        type: "lookbook" as const,
        title: l.name,
        slug: l.slug,
        description: l.description ?? undefined,
        imageUrl: l.coverImageUrl ?? undefined,
        url: `/lookbooks/${l.slug}`,
        updatedAt: l.updatedAt.toISOString(),
      })),
    ];

    docs.forEach((d, i) => { d.objectID = `${d.type}_${d.id}_${i}`; });

    memoryIndex = docs;
    lastIndexed = new Date().toISOString();

    return success({ indexed: docs.length, types: { products: products.length, pages: pages.length, categories: categories.length, collections: collections.length, lookbooks: lookbooks.length } });
  } catch (err) {
    return serverError(err);
  }
}

function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function scoreDoc(doc: SearchableDoc, queryTokens: string[]): number {
  const title = doc.title.toLowerCase();
  const desc = (doc.description ?? "").toLowerCase();
  const content = (doc.content ?? "").toLowerCase();
  const tagText = (doc.tags ?? []).join(" ").toLowerCase();

  let score = 0;
  for (const token of queryTokens) {
    if (title.includes(token)) score += 10;
    if (desc.includes(token)) score += 5;
    if (content.includes(token)) score += 3;
    if (tagText.includes(token)) score += 7;
    if (doc.type === "product" && token === "product") score += 2;
  }
  const typeBoost: Record<string, number> = { product: 1.0, page: 0.8, category: 0.9, collection: 0.9, lookbook: 0.7 };
  score *= typeBoost[doc.type] ?? 0.5;
  return score;
}

async function handleSearch(req: Request, env: any): Promise<Response> {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const type = url.searchParams.get("type");
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "20");

  if (!q.trim()) return success({ results: [], total: 0, page, limit });

  if (memoryIndex.length === 0) {
    await handleBuild(env);
  }

  const queryTokens = tokenize(q);
  let results = memoryIndex
    .map((doc) => ({ ...doc, score: scoreDoc(doc, queryTokens) }))
    .filter((doc) => doc.score! > 0);

  if (type) results = results.filter((doc) => doc.type === type);

  results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const total = results.length;
  const start = (page - 1) * limit;
  const paged = results.slice(start, start + limit).map(({ score, ...doc }) => doc);

  return success({ results: paged, total, page, limit, query: q });
}
