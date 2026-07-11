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
  jsonLd?: Record<string, unknown>[];
  prevUrl?: string;
  nextUrl?: string;
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
  // Only process requests that explicitly accept HTML
  return accept.includes("text/html") && !accept.includes("application/javascript");
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

function generateWebsiteSchema(siteUrl: string, siteName: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: "Discover নবME — where heritage craftsmanship meets contemporary elegance. Premium fashion for the discerning.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

function generateOrganizationSchema(siteUrl: string, siteName: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/favicon.svg`,
    description: "Premium fashion destination celebrating the intersection of traditional craftsmanship and contemporary design.",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@nabome.online",
    },
  };
}

function generateProductSchema(product: any, siteUrl: string): Record<string, unknown> {
  const images = product.images || [];
  const variants = product.variants || [];
  const offers = variants.map((v: any) => ({
    "@type": "Offer",
    sku: v.sku || undefined,
    price: Number(product.basePrice || 0) + Number(v.priceAdjustment || 0),
    priceCurrency: "INR",
    availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    url: `${siteUrl}/products/${product.slug}`,
  }));

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description?.slice(0, 5000),
    sku: variants[0]?.sku || undefined,
    image: images.map((i: any) => i.url),
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: Number(product.basePrice || 0),
      highPrice: variants.reduce((max: number, v: any) => Math.max(max, Number(product.basePrice || 0) + Number(v.priceAdjustment || 0)), 0),
      offerCount: offers.length,
      offers: offers.slice(0, 5),
    },
  };

  Object.keys(schema).forEach((k) => schema[k] === undefined && delete schema[k]);
  return schema;
}

function generateBreadcrumbSchema(items: { label: string; url?: string }[], siteUrl: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.url ? { item: `${siteUrl}${item.url}` } : {}),
    })),
  };
}

function generateCollectionSchema(collection: any, numberOfItems: number, siteUrl: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.name,
    description: collection.description?.slice(0, 5000),
    url: `${siteUrl}/collections/${collection.slug}`,
    ...(collection.imageUrl || collection.heroImageUrl ? { image: collection.imageUrl || collection.heroImageUrl } : {}),
    ...(numberOfItems > 0 ? { numberOfItems } : {}),
  };
}

function generateArticleSchema(article: any, siteUrl: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.name || article.title,
    description: article.description?.slice(0, 5000),
    url: `${siteUrl}/lookbooks/${article.slug}`,
    image: article.coverImageUrl || article.imageUrl,
    author: { "@type": "Organization", name: "নবME" },
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
  };
}

function generateFAQSchema(faqs: { question: string; answer: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

function injectMeta(html: string, payload: SeoPayload): string {
  // Remove existing meta tags that we're about to inject to prevent duplicates
  const metaPatterns = [
    /<meta name="description"[^>]*>/gi,
    /<link rel="canonical"[^>]*>/gi,
    /<meta name="robots"[^>]*>/gi,
    /<meta property="og:title"[^>]*>/gi,
    /<meta property="og:description"[^>]*>/gi,
    /<meta property="og:type"[^>]*>/gi,
    /<meta property="og:url"[^>]*>/gi,
    /<meta property="og:site_name"[^>]*>/gi,
    /<meta property="og:locale"[^>]*>/gi,
    /<meta property="og:image"[^>]*>/gi,
    /<meta name="twitter:card"[^>]*>/gi,
    /<meta name="twitter:title"[^>]*>/gi,
    /<meta name="twitter:description"[^>]*>/gi,
    /<meta name="twitter:image"[^>]*>/gi,
    /<link rel="prev"[^>]*>/gi,
    /<link rel="next"[^>]*>/gi,
    /<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi,
  ];

  let cleanedHtml = html;
  for (const pattern of metaPatterns) {
    cleanedHtml = cleanedHtml.replace(pattern, "");
  }

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
    ...(payload.prevUrl ? [`<link rel="prev" href="${escapeHtml(payload.prevUrl)}" />`] : []),
    ...(payload.nextUrl ? [`<link rel="next" href="${escapeHtml(payload.nextUrl)}" />`] : []),
    ...(payload.jsonLd?.map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`) || []),
  ].join("\n    ");

  const withTitle = cleanedHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(payload.title)}</title>`);

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
  const cacheKey = url.pathname + url.search;
  const cached = cachedSeo.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.payload;

  // Handle pagination
  const page = parseInt(url.searchParams.get("page") || "1");
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page + 1;

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
    canonicalUrl: `${canonicalBase}${pathname === "/" ? "" : pathname}${page > 1 ? `?page=${page}` : ""}`,
    imageUrl: fallbackImage,
    type: "website",
    siteName,
    locale: text(preferences.locale, "en_IN"),
    robots: noindexPath(pathname) ? "noindex, nofollow" : "index, follow",
    jsonLd: [generateWebsiteSchema(canonicalBase, siteName), generateOrganizationSchema(canonicalBase, siteName)],
  };

  // Only add pagination for paginated listing pages
  const paginatedPaths = ["/products", "/categories", "/collections", "/lookbooks"];
  if (paginatedPaths.some(p => pathname === p || pathname.startsWith(`${p}/`)) && page > 0) {
    payload.prevUrl = prevPage ? `${canonicalBase}${pathname === "/" ? "" : pathname}?page=${prevPage}` : undefined;
    payload.nextUrl = `${canonicalBase}${pathname === "/" ? "" : pathname}?page=${nextPage}`;
  }

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
          slug: true,
          basePrice: true,
          images: {
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
            select: { url: true },
          },
          brand: {
            select: { name: true },
          },
          category: {
            select: { name: true, slug: true },
          },
          variants: {
            select: { sku: true, priceAdjustment: true, stock: true },
            take: 10,
          },
        },
      });
      if (product) {
        payload.title = text(product.metaTitle, `${product.name} — ${siteName}`);
        payload.description = truncate(text(product.metaDesc, text(product.shortDescription, stripHtml(text(product.description, globalDescription)))), 160);
        payload.imageUrl = absoluteUrl(product.images[0]?.url ?? fallbackImage, canonicalBase);
        payload.type = "product";
        payload.jsonLd = [
          generateWebsiteSchema(canonicalBase, siteName),
          generateOrganizationSchema(canonicalBase, siteName),
          generateProductSchema(product, canonicalBase),
          generateBreadcrumbSchema([
            { label: "Home", url: "/" },
            ...(product.category ? [{ label: product.category.name, url: `/products?category=${product.category.slug}` }] : []),
            { label: product.name },
          ], canonicalBase),
        ];
      }
    } else if (parts[0] === "categories" && parts[1]) {
      const category = await prisma.categories.findFirst({
        where: { slug: parts[1], isActive: true },
        select: { name: true, description: true, metaTitle: true, metaDesc: true, imageUrl: true, slug: true },
      });
      if (category) {
        payload.title = text(category.metaTitle, `${category.name} — ${siteName}`);
        payload.description = truncate(text(category.metaDesc, text(category.description, globalDescription)), 160);
        payload.imageUrl = absoluteUrl(text(category.imageUrl, fallbackImage), canonicalBase);
        payload.jsonLd = [
          generateWebsiteSchema(canonicalBase, siteName),
          generateOrganizationSchema(canonicalBase, siteName),
          generateCollectionSchema(category, 0, canonicalBase),
          generateBreadcrumbSchema([
            { label: "Home", url: "/" },
            { label: category.name, url: `/categories/${category.slug}` },
          ], canonicalBase),
        ];
      }
    } else if (parts[0] === "collections" && parts[1]) {
      const collection = await prisma.collections.findFirst({
        where: { slug: parts[1], isActive: true },
        select: { name: true, description: true, metaTitle: true, metaDesc: true, heroImageUrl: true, slug: true },
      });
      if (collection) {
        payload.title = text(collection.metaTitle, `${collection.name} — ${siteName}`);
        payload.description = truncate(text(collection.metaDesc, text(collection.description, globalDescription)), 160);
        payload.imageUrl = absoluteUrl(text(collection.heroImageUrl, fallbackImage), canonicalBase);
        payload.jsonLd = [
          generateWebsiteSchema(canonicalBase, siteName),
          generateOrganizationSchema(canonicalBase, siteName),
          generateCollectionSchema(collection, 0, canonicalBase),
          generateBreadcrumbSchema([
            { label: "Home", url: "/" },
            { label: "Collections", url: "/collections" },
            { label: collection.name, url: `/collections/${collection.slug}` },
          ], canonicalBase),
        ];
      }
    } else if (parts[0] === "lookbooks" && parts[1]) {
      const lookbook = await prisma.lookbooks.findFirst({
        where: { slug: parts[1], isActive: true },
        select: { name: true, description: true, metaTitle: true, metaDesc: true, coverImageUrl: true, slug: true, createdAt: true, updatedAt: true },
      });
      if (lookbook) {
        payload.title = text(lookbook.metaTitle, `${lookbook.name} — ${siteName}`);
        payload.description = truncate(text(lookbook.metaDesc, text(lookbook.description, globalDescription)), 160);
        payload.imageUrl = absoluteUrl(text(lookbook.coverImageUrl, fallbackImage), canonicalBase);
        payload.type = "article";
        payload.jsonLd = [
          generateWebsiteSchema(canonicalBase, siteName),
          generateOrganizationSchema(canonicalBase, siteName),
          generateArticleSchema(lookbook, canonicalBase),
          generateBreadcrumbSchema([
            { label: "Home", url: "/" },
            { label: "Lookbooks", url: "/lookbooks" },
            { label: lookbook.name, url: `/lookbooks/${lookbook.slug}` },
          ], canonicalBase),
        ];
      }
    } else if (parts.length === 1 && !["products", "categories", "collections", "lookbooks", "search", "faq"].includes(parts[0])) {
      const page = await prisma.static_pages.findFirst({
        where: { slug: parts[0], isPublished: true },
        select: { title: true, metaTitle: true, metaDesc: true, ogImage: true, slug: true },
      });
      if (page) {
        payload.title = text(page.metaTitle, `${page.title} — ${siteName}`);
        payload.description = truncate(text(page.metaDesc, globalDescription), 160);
        payload.imageUrl = absoluteUrl(text(page.ogImage, fallbackImage), canonicalBase);
        payload.type = "article";
        payload.jsonLd = [
          generateWebsiteSchema(canonicalBase, siteName),
          generateOrganizationSchema(canonicalBase, siteName),
          generateArticleSchema({ name: page.title, description: page.metaDesc, slug: page.slug, imageUrl: page.ogImage }, canonicalBase),
          generateBreadcrumbSchema([
            { label: "Home", url: "/" },
            { label: page.title, url: `/${page.slug}` },
          ], canonicalBase),
        ];
      }
    } else if (pathname === "/products") {
      payload.title = `Shop Products — ${siteName}`;
      payload.description = "Browse premium fashion products, new arrivals, and curated essentials.";
    } else if (pathname === "/categories") {
      payload.title = `Categories — ${siteName}`;
      payload.description = "Browse fashion categories including kurtas, sarees, lehengas, and more at নবME.";
    } else if (pathname === "/collections") {
      payload.title = `Collections — ${siteName}`;
      payload.description = "Explore curated fashion collections from নবME.";
    } else if (pathname === "/lookbooks") {
      payload.title = `Lookbooks — ${siteName}`;
      payload.description = "Browse editorial lookbooks and styling stories from নবME.";
      payload.type = "article";
    } else if (pathname === "/search") {
      const searchQuery = url.searchParams.get("q");
      if (searchQuery) {
        payload.title = `Search Results for "${searchQuery}" — ${siteName}`;
        payload.description = `Search results for "${searchQuery}" on নবME — premium fashion.`;
      } else {
        payload.title = `Search — ${siteName}`;
        payload.description = "Search products, collections, and editorial content from নবME.";
      }
    } else if (pathname === "/") {
      // Homepage specific metadata
      payload.title = text(seo.homepageTitle, `${siteName} — Premium Fashion Marketplace`);
      payload.description = text(seo.homepageDescription, "Discover নবME — where heritage craftsmanship meets contemporary elegance. Premium fashion destination celebrating traditional artistry and modern design.");
      payload.imageUrl = absoluteUrl(text(seo.homepageImage, text(settings?.ogImageUrl, "/og-image.svg")), canonicalBase);
      payload.jsonLd = [
        generateWebsiteSchema(canonicalBase, siteName),
        generateOrganizationSchema(canonicalBase, siteName),
      ];
    } else if (pathname === "/faq") {
      payload.title = `FAQ — ${siteName}`;
      payload.description = "Frequently asked questions about orders, shipping, returns, and payments at নবME.";
      payload.type = "article";
      payload.jsonLd = [
        generateWebsiteSchema(canonicalBase, siteName),
        generateOrganizationSchema(canonicalBase, siteName),
        generateFAQSchema([
          { question: "What are your shipping options?", answer: "We offer free shipping on orders above ₹500. Standard delivery takes 5-7 business days." },
          { question: "What is your return policy?", answer: "We accept returns within 30 days of delivery. Items must be unworn with original tags attached." },
          { question: "How do I track my order?", answer: "You can track your order using the tracking number sent to your email after dispatch." },
          { question: "What payment methods do you accept?", answer: "We accept all major credit cards, debit cards, UPI, and net banking." },
        ]),
      ];
    }
  }

  cachedSeo.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, payload });
  pruneCache();
  return payload;
}

export const onRequest = async (context: { request: Request; next: () => Promise<Response>; env: Env }) => {
  const url = new URL(context.request.url);
  
  // Canonical URL redirects
  const pathname = url.pathname;
  const searchParams = url.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : "";
  
  // Remove trailing slashes (except for root)
  const canonicalPathname = pathname !== "/" ? pathname.replace(/\/+$/, "") : pathname;
  
  // Redirect to canonical URL if needed
  if (canonicalPathname !== pathname) {
    const canonicalUrl = `${url.origin}${canonicalPathname}${queryString}`;
    return Response.redirect(canonicalUrl, 301);
  }
  
  // Force lowercase for paths (except for dynamic segments that might be case-sensitive)
  // For now, we'll skip this as slugs might be case-sensitive
  
  let response = await context.next();
  
  // Additional safeguard: check request path to ensure we only process HTML pages
  if (ASSET_EXTENSIONS.test(url.pathname)) return response;
  if (url.pathname.startsWith("/api/")) return response;
  if (url.pathname === "/robots.txt" || url.pathname === "/sitemap.xml") return response;
  
  if (!isHtmlRequest(context.request)) return response;

  // SPA fallback: current Cloudflare Pages / wrangler versions flag the
  // `/* /index.html 200` rule as an infinite loop and drop it, so deep-link
  // navigations and page refreshes would otherwise return 404. Serve index.html
  // for unmatched HTML routes so client-side routing can take over.
  if (response.status === 404) {
    const indexRequest = new Request(new URL("/index.html", url.origin), {
      headers: context.request.headers,
    });
    const indexResponse = await context.next(indexRequest);
    if (indexResponse.ok) {
      response = new Response(indexResponse.body, {
        status: 200,
        statusText: "OK",
        headers: indexResponse.headers,
      });
    }
  }
  
  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.text();
  try {
    const payload = await getSeoPayload(context.request, context.env as unknown as Env);
    const responseHeaders = new Headers(response.headers);
    
    // We are rewriting the body, so drop headers that describe the original
    // (now stale) encoding/length. Leaving content-encoding causes the browser
    // to fail decoding the uncompressed body (ERR_CONTENT_DECODING_FAILED).
    responseHeaders.delete("content-length");
    responseHeaders.delete("content-encoding");
    
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
    fallbackHeaders.delete("content-encoding");
    // Add cache-control even on error to reduce server load
    fallbackHeaders.set("cache-control", "public, max-age=300, s-maxage=600, stale-while-revalidate=1200");
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: fallbackHeaders,
    });
  }
};
