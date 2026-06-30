import { getPrisma } from "./_lib/prisma";
import type { Env } from "./_lib/env";
import type { Product, Category, Collection, Lookbook, StaticPage } from "@prisma/client";

const DEFAULT_SITE_URL = "https://www.nabome.online";

function siteUrl(env?: Env): string {
  return (env?.SITE_URL || env?.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function xml(urls: { loc: string; lastmod?: string; changefreq?: string; priority?: string }[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map((u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    ${u.lastmod ? `<lastmod>${escapeXml(u.lastmod)}</lastmod>` : ""}
    ${u.changefreq ? `<changefreq>${escapeXml(u.changefreq)}</changefreq>` : ""}
    ${u.priority ? `<priority>${escapeXml(u.priority)}</priority>` : ""}
  </url>`).join("\n")}
</urlset>`;
}

export async function GET(_req: Request, opts?: { env?: Env }): Promise<Response> {
  const baseUrl = siteUrl(opts?.env);
  try {
    const prisma = getPrisma(opts?.env);
    const [products, categories, collections, lookbooks, pages] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.collection.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.lookbook.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.staticPage.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const appRoutes = [
      { path: "/search", changefreq: "weekly" as const, priority: "0.4" },
      { path: "/collections", changefreq: "weekly" as const, priority: "0.6" },
      { path: "/lookbooks", changefreq: "weekly" as const, priority: "0.6" },
      { path: "/faq", changefreq: "monthly" as const, priority: "0.5" },
    ];
    const appRouteSlugs = new Set(appRoutes.map((route) => route.path.replace(/^\//, "")));
    const routedPages = pages.filter((p: Pick<StaticPage, "slug" | "updatedAt">) => !appRouteSlugs.has(p.slug));

    const urls: { loc: string; lastmod?: string; changefreq?: string; priority?: string }[] = [
      { loc: baseUrl + "/", changefreq: "weekly", priority: "1.0" },
      { loc: baseUrl + "/products", changefreq: "daily", priority: "0.9" },
      ...appRoutes.map((route) => ({
        loc: `${baseUrl}${route.path}`,
        changefreq: route.changefreq,
        priority: route.priority,
      })),
      ...routedPages.map((p: Pick<StaticPage, "slug" | "updatedAt">) => ({
        loc: `${baseUrl}/${p.slug}`,
        lastmod: p.updatedAt.toISOString().split("T")[0],
        changefreq: "monthly" as const,
        priority: "0.5",
      })),
      ...products.map((p: Pick<Product, "slug" | "updatedAt">) => ({
        loc: `${baseUrl}/products/${p.slug}`,
        lastmod: p.updatedAt.toISOString().split("T")[0],
        changefreq: "weekly" as const,
        priority: "0.8",
      })),
      ...categories.map((c: Pick<Category, "slug" | "updatedAt">) => ({
        loc: `${baseUrl}/products?category=${encodeURIComponent(c.slug)}`,
        lastmod: c.updatedAt.toISOString().split("T")[0],
        changefreq: "weekly" as const,
        priority: "0.7",
      })),
      ...collections.map((c: Pick<Collection, "slug" | "updatedAt">) => ({
        loc: `${baseUrl}/collections/${c.slug}`,
        lastmod: c.updatedAt.toISOString().split("T")[0],
        changefreq: "weekly" as const,
        priority: "0.7",
      })),
      ...lookbooks.map((l: Pick<Lookbook, "slug" | "updatedAt">) => ({
        loc: `${baseUrl}/lookbooks/${l.slug}`,
        lastmod: l.updatedAt.toISOString().split("T")[0],
        changefreq: "weekly" as const,
        priority: "0.7",
      })),
    ];

    return new Response(xml(urls), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("[SITEMAP] Error:", err);
    return new Response(xml([
      { loc: baseUrl + "/", changefreq: "weekly", priority: "1.0" },
    ]), {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }
}
