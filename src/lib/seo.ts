export const siteUrl = "https://www.nabome.online";
export const siteName = "নবME";
export const siteNameEn = "NABOME";
export const defaultLocale = "en_IN";
export const twitterSite = "@nabome_online";
export const defaultImage = `${siteUrl}/images/logo/logo.webp`;

export type SEOMetadata = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "product" | "article";
  keywords?: string;
  locale?: string;
  noindex?: boolean;
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function generateProductMetadata(
  name: string,
  description: string,
  slug: string,
  image?: string,
  category?: string
): SEOMetadata {
  return {
    title: `${name} | নবME`,
    description: description.slice(0, 160),
    path: `/product/${slug}`,
    image: image || defaultImage,
    type: "product",
    keywords: `${siteNameEn}, ${name}, ${category || "streetwear"}, Bengali fashion`,
  };
}

export function generateCategoryMetadata(
  name: string,
  description: string,
  slug: string
): SEOMetadata {
  return {
    title: `${name} Collection | নবME`,
    description: description.slice(0, 160),
    path: `/category?type=${slug}`,
    type: "website",
    keywords: `${siteNameEn}, ${name}, Bengali ${name.toLowerCase()}, streetwear`,
  };
}

export function generateShopMetadata(
  shopName: string,
  description: string,
  slug: string
): SEOMetadata {
  return {
    title: `${shopName} | নবME Vendor Shop`,
    description: description.slice(0, 160),
    path: `/shop/${slug}`,
    type: "website",
    keywords: `${shopName}, ${siteNameEn} vendor, Bengali fashion`,
  };
}

export function generateHomeMetadata(): SEOMetadata {
  return {
    title: `${siteName} | Premium Bengali Streetwear & Fashion Brand`,
    description: `${siteName} is a premium Bengali streetwear and lifestyle brand blending heritage, culture, and modern fashion. Discover unique apparel designed to build your story.`,
    path: "/",
    type: "website",
    keywords: `${siteNameEn}, Bengali fashion, Bengali streetwear, Bengali clothing brand, premium t shirts, fashion brand India`,
  };
}

export function generateSearchMetadata(query: string): SEOMetadata {
  return {
    title: `${query} - Search Results | নবME`,
    description: `Search results for "${query}" on ${siteName}. Discover premium Bengali streetwear and fashion.`,
    path: `/search?q=${encodeURIComponent(query)}`,
    type: "website",
    noindex: true,
  };
}

export function generateBreadcrumbStructuredData(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
    })),
  };
}
