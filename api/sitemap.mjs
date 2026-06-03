// Vercel serverless function — generates dynamic XML sitemap
// Queries Neon for products, categories, vendors

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.NEON_DATABASE_URL;
const SITE_URL = process.env.VITE_SITE_URL || "https://nabome.online";

const STATIC_ROUTES = [
  { loc: "/", priority: "1.0", changefreq: "daily" },
  { loc: "/category", priority: "0.9", changefreq: "daily" },
  { loc: "/cart", priority: "0.4", changefreq: "monthly" },
  { loc: "/about", priority: "0.6", changefreq: "monthly" },
  { loc: "/contact", priority: "0.6", changefreq: "monthly" },
  { loc: "/order-tracking", priority: "0.5", changefreq: "weekly" },
  { loc: "/faq", priority: "0.5", changefreq: "monthly" },
  { loc: "/login", priority: "0.3", changefreq: "monthly" },
  { loc: "/register", priority: "0.3", changefreq: "monthly" },
  { loc: "/vendor-register", priority: "0.4", changefreq: "monthly" },
  { loc: "/shipping-policy", priority: "0.4", changefreq: "yearly" },
  { loc: "/return-policy", priority: "0.4", changefreq: "yearly" },
  { loc: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { loc: "/terms", priority: "0.3", changefreq: "yearly" },
  { loc: "/support", priority: "0.4", changefreq: "monthly" },
  { loc: "/search", priority: "0.5", changefreq: "weekly" },
];

function xmlUrl({ loc, priority, changefreq, lastmod }) {
  return `  <url>
    <loc>${SITE_URL}${loc}</loc>
    <priority>${priority}</priority>
    <changefreq>${changefreq}</changefreq>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
  </url>`;
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");

  const urls = [...STATIC_ROUTES.map((r) => xmlUrl(r))];

  if (!DATABASE_URL) {
    return res.status(503).json({ error: "Neon database not configured. Set NEON_DATABASE_URL in your server environment." });
  }

  const sql = neon(DATABASE_URL);
  try {
      const products = await sql`SELECT slug, updated_at FROM products WHERE status = 'published' ORDER BY updated_at DESC`;
      for (const p of products) {
        const lastmod = p.updated_at ? new Date(p.updated_at).toISOString().split("T")[0] : "";
        urls.push(xmlUrl({ loc: `/product/${p.slug}`, priority: "0.8", changefreq: "weekly", lastmod }));
      }
    } catch { /* skip products */ }

    try {
      const categories = await sql`SELECT slug FROM categories WHERE is_active = true ORDER BY sort_order`;
      for (const c of categories) {
        urls.push(xmlUrl({ loc: `/category?cat=${c.slug}`, priority: "0.7", changefreq: "weekly" }));
      }
    } catch { /* skip categories */ }

    try {
      const vendors = await sql`SELECT shop_slug, updated_at FROM vendors WHERE approval_status = 'approved' ORDER BY updated_at DESC`;
      for (const v of vendors) {
        const lastmod = v.updated_at ? new Date(v.updated_at).toISOString().split("T")[0] : "";
        urls.push(xmlUrl({ loc: `/shop/${v.shop_slug}`, priority: "0.6", changefreq: "weekly", lastmod }));
      }
    } catch { /* skip vendors */ }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return res.status(200).send(xml);
}

