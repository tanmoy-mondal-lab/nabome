import { prisma } from "../_lib/prisma";

const SITE_URL = "https://www.nabome.online";

function xml(urls: { loc: string; lastmod?: string; changefreq?: string; priority?: string }[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}
    ${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ""}
    ${u.priority ? `<priority>${u.priority}</priority>` : ""}
  </url>`).join("\n")}
</urlset>`;
}

export async function GET(): Promise<Response> {
  try {
    const [products, categories, pages, collections, lookbooks] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true, isDeleted: false },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.cmsPage.findMany({
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
    ]);

    const urls: { loc: string; lastmod?: string; changefreq?: string; priority?: string }[] = [
      { loc: SITE_URL + "/", changefreq: "weekly", priority: "1.0" },
      { loc: SITE_URL + "/products", changefreq: "daily", priority: "0.9" },
      ...products.map((p) => ({
        loc: `${SITE_URL}/products/${p.slug}`,
        lastmod: p.updatedAt.toISOString().split("T")[0],
        changefreq: "weekly" as const,
        priority: "0.8",
      })),
      ...categories.map((c) => ({
        loc: `${SITE_URL}/categories/${c.slug}`,
        lastmod: c.updatedAt.toISOString().split("T")[0],
        changefreq: "weekly" as const,
        priority: "0.7",
      })),
      ...collections.map((c) => ({
        loc: `${SITE_URL}/collections/${c.slug}`,
        lastmod: c.updatedAt.toISOString().split("T")[0],
        changefreq: "weekly" as const,
        priority: "0.7",
      })),
      ...pages.map((p) => ({
        loc: `${SITE_URL}/pages/${p.slug}`,
        lastmod: p.updatedAt.toISOString().split("T")[0],
        changefreq: "monthly" as const,
        priority: "0.6",
      })),
      ...lookbooks.map((l) => ({
        loc: `${SITE_URL}/lookbooks/${l.slug}`,
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
      { loc: SITE_URL + "/", changefreq: "weekly", priority: "1.0" },
    ]), {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }
}
