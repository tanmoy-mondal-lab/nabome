import { getPrisma } from "../api/_lib/prisma";
import type { Env } from "../api/_lib/env";

interface SeoPayload {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl: string;
  type: "website" | "product" | "article";
  siteName: string;
  locale: string;
  robots: "index, follow" | "noindex, nofollow";
}

const DEFAULT_SITE_URL = "https://www.nabome.online";
const DEFAULT_SITE_NAME = "নবME";
const DEFAULT_DESCRIPTION = "Premium fashion destination celebrating the intersection of traditional craftsmanship and contemporary design.";
const CACHE_TTL_MS = 10_000;
const MAX_CACHE_SIZE = 500;
const ASSET_EXTENSIONS = /\.(?:avif|css|gif|ico|jpe?g|js|json|map|png|svg|txt|webmanifest|webp|woff2?)$/i;
const cachedSeo = new Map<string, { expiresAt: number; payload: SeoPayload }>();

function pruneCache(): void {
  if (cachedSeo.size <= MAX_CACHE_SIZE) return;
  const now = Date.now();
  for (const [key, entry] of cachedSeo) {
    if (entry.expiresAt <= now) {
      cachedSeo.delete(key);
    }
  }
  if (cachedSeo.size > MAX_CACHE_SIZE) {
    const entries = [...cachedSeo.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt);
    const toDelete = entries.slice(0, cachedSeo.size - MAX_CACHE_SIZE);
    for (const [key] of toDelete) {
      cachedSeo.delete(key);
    }
  }
}

function isHtmlRequest(request: Request): boolean {
  const url = new URL(request.url);
  if (request.method !== "GET") return false;
  if (url.pathname.startsWith("/api/")) return false;
  if (url.pathname === "/robots.txt" || url.pathname === "/sitemap.xml") return false;
  if (ASSET_EXTENSIONS.test(url.pathname)) return false;
  const accept = request.headers.get("Accept") ?? "";
  return !accept || accept.includes("text/html") || accept.includes("*/*");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  const cleaned = value.trim();
  return cleaned || fallback;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(value: string, length: number): string {
  if (value.length <= length) return value;
  return `${value.slice(0, length - 1).trim()}…`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absoluteUrl(value: string, baseUrl: string): string {
  if (!value) return `${baseUrl}/og-image.svg`;
  let clean = value;
  // Fix double extensions like .jpeg.jpg that break Cloudinary f_auto
  if (clean.includes("res.cloudinary.com")) {
    clean = clean.replace(/\.(jpeg|jpg|png|gif|webp|avif|bmp|tiff|tif|svg)\.(jpg|jpeg|png|gif|webp|avif|bmp|tiff|tif|svg)(\?[^]*)?$/i, ".$1$3");
  }
  if (/^https?:\/\//i.test(clean)) return clean;
  return `${baseUrl}${clean.startsWith("/") ? clean : `/${clean}`}`;
}

function noindexPath(pathname: string): boolean {
  return [
    "/admin",
    "/auth",
    "/account",
    "/cart",
    "/checkout",
    "/orders",
    "/returns",
    "/support",
    "/wishlist",
  ].some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function injectMeta(html: string, payload: SeoPayload): string {
  const tags = [
    `<meta name="description" content="${escapeHtml(payload.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(payload.canonicalUrl)}" />`,
    `<meta name="robots" content="${payload.robots}" />`,
    `<meta property="og:title" content="${escapeHtml(payload.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(payload.description)}" />`,
    `<meta property="og:type" content="${payload.type}" />`,
    `<meta property="og:url" content="${escapeHtml(payload.canonicalUrl)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(payload.siteName)}" />`,
    `<meta property="og:locale" content="${escapeHtml(payload.locale)}" />`,
    `<meta property="og:image" content="${escapeHtml(payload.imageUrl)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(payload.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(payload.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(payload.imageUrl)}" />`,
  ].join("\n    ");

  const withTitle = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(payload.title)}</title>`);

  // Find the first </head> that is NOT inside a <script> tag
  const headClose = "</head>";
  let searchFrom = 0;
  let headCloseIndex = -1;
  while (searchFrom < withTitle.length) {
    const idx = withTitle.indexOf(headClose, searchFrom);
    if (idx === -1) break;
    // Check if there's an unclosed <script> before this </head>
    const before = withTitle.slice(0, idx);
    const lastOpenScript = before.lastIndexOf("<script");
    const lastCloseScript = before.lastIndexOf("</script>");
    if (lastOpenScript === -1 || lastCloseScript > lastOpenScript) {
      headCloseIndex = idx;
      break;
    }
    searchFrom = idx + headClose.length;
  }

  if (headCloseIndex === -1) return withTitle;
  return withTitle.slice(0, headCloseIndex) + `    ${tags}\n  ` + headClose + withTitle.slice(headCloseIndex + headClose.length);
}

async function getSeoPayload(request: Request, env: Env): Promise<SeoPayload> {
  const url = new URL(request.url);
  const cacheKey = url.pathname;
  const cached = cachedSeo.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.payload;

  const prisma = getPrisma(env);
  const settings = await prisma.site_settings.findFirst({
    select: {
      siteName: true,
      ogImageUrl: true,
      seo: true,
      preferences: true,
    },
  });
  const seo = asRecord(settings?.seo);
  const preferences = asRecord(settings?.preferences);
  const canonicalBase = text(seo.canonicalUrl, text(env.SITE_URL, text(env.VITE_SITE_URL, DEFAULT_SITE_URL))).replace(/\/+$/, "");
  const siteName = text(settings?.siteName, DEFAULT_SITE_NAME);
  const fallbackImage = absoluteUrl(text(seo.ogImage, text(settings?.ogImageUrl, "/og-image.svg")), canonicalBase);
  const globalTitle = text(seo.globalMetaTitle, `${siteName} — Premium Fashion`);
  const globalDescription = text(seo.globalMetaDescription, DEFAULT_DESCRIPTION);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  const payload: SeoPayload = {
    title: globalTitle,
    description: globalDescription,
    canonicalUrl: `${canonicalBase}${pathname === "/" ? "" : pathname}`,
    imageUrl: fallbackImage,
    type: "website",
    siteName,
    locale: text(preferences.locale, "en_IN"),
    robots: noindexPath(pathname) ? "noindex, nofollow" : "index, follow",
  };

  if (payload.robots === "index, follow") {
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "products" && parts[1]) {
      const product = await prisma.products.findFirst({
        where: { slug: parts[1], isActive: true },
        select: {
          name: true,
          description: true,
          shortDescription: true,
          metaTitle: true,
          metaDesc: true,
          images: {
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
            select: { url: true },
          },
        },
      });
      if (product) {
        payload.title = text(product.metaTitle, `${product.name} — ${siteName}`);
        payload.description = truncate(text(product.metaDesc, text(product.shortDescription, stripHtml(text(product.description, globalDescription)))), 160);
        payload.imageUrl = absoluteUrl(product.images[0]?.url ?? fallbackImage, canonicalBase);
        payload.type = "product";
      }
    } else if (parts[0] === "collections" && parts[1]) {
      const collection = await prisma.collections.findFirst({
        where: { slug: parts[1], isActive: true },
        select: { name: true, description: true, metaTitle: true, metaDesc: true, heroImageUrl: true },
      });
      if (collection) {
        payload.title = text(collection.metaTitle, `${collection.name} — ${siteName}`);
        payload.description = truncate(text(collection.metaDesc, text(collection.description, globalDescription)), 160);
        payload.imageUrl = absoluteUrl(text(collection.heroImageUrl, fallbackImage), canonicalBase);
      }
    } else if (parts[0] === "lookbooks" && parts[1]) {
      const lookbook = await prisma.lookbooks.findFirst({
        where: { slug: parts[1], isActive: true },
        select: { name: true, description: true, metaTitle: true, metaDesc: true, coverImageUrl: true },
      });
      if (lookbook) {
        payload.title = text(lookbook.metaTitle, `${lookbook.name} — ${siteName}`);
        payload.description = truncate(text(lookbook.metaDesc, text(lookbook.description, globalDescription)), 160);
        payload.imageUrl = absoluteUrl(text(lookbook.coverImageUrl, fallbackImage), canonicalBase);
        payload.type = "article";
      }
    } else if (parts.length === 1 && !["products", "collections", "lookbooks", "search"].includes(parts[0])) {
      const page = await prisma.static_pages.findFirst({
        where: { slug: parts[0], isPublished: true },
        select: { title: true, metaTitle: true, metaDesc: true, ogImage: true },
      });
      if (page) {
        payload.title = text(page.metaTitle, `${page.title} — ${siteName}`);
        payload.description = truncate(text(page.metaDesc, globalDescription), 160);
        payload.imageUrl = absoluteUrl(text(page.ogImage, fallbackImage), canonicalBase);
        payload.type = "article";
      }
    } else if (pathname === "/products") {
      payload.title = `Shop Products — ${siteName}`;
      payload.description = "Browse premium fashion products, new arrivals, and curated essentials.";
    } else if (pathname === "/collections") {
      payload.title = `Collections — ${siteName}`;
      payload.description = "Explore curated fashion collections from নবME.";
    } else if (pathname === "/lookbooks") {
      payload.title = `Lookbooks — ${siteName}`;
      payload.description = "Browse editorial lookbooks and styling stories from নবME.";
      payload.type = "article";
    } else if (pathname === "/search") {
      payload.title = `Search — ${siteName}`;
      payload.description = "Search products, collections, and editorial content from নবME.";
    }
  }

  cachedSeo.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, payload });
  pruneCache();
  return payload;
}

export const onRequest = async (context: { request: Request; next: () => Promise<Response>; env: Env }) => {
  const response = await context.next();
  if (!isHtmlRequest(context.request)) return response;
  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.text();
  try {
    const payload = await getSeoPayload(context.request, context.env as unknown as Env);
    const responseHeaders = new Headers(response.headers);
    
    // Preserve compression headers for better performance
    // Only delete content-length since we're modifying the body
    responseHeaders.delete("content-length");
    
    // Add cache-control headers to reduce server load
    const url = new URL(context.request.url);
    const cacheMaxAge = noindexPath(url.pathname) ? 300 : 3600; // 5 min for noindex, 1 hour for indexable
    responseHeaders.set("cache-control", `public, max-age=${cacheMaxAge}, s-maxage=${cacheMaxAge * 2}, stale-while-revalidate=${cacheMaxAge * 4}`);
    
    return new Response(injectMeta(html, payload), {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const fallbackHeaders = new Headers(response.headers);
    fallbackHeaders.delete("content-length");
    // Add cache-control even on error to reduce server load
    fallbackHeaders.set("cache-control", "public, max-age=300, s-maxage=600, stale-while-revalidate=1200");
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: fallbackHeaders,
    });
  }
};
