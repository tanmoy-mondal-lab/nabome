import type { Product, ProductVariant } from "../types/product";

const SITE_URL = import.meta.env.VITE_SITE_URL || "https://www.nabome.online";
const SITE_NAME = "নবME — Premium Fashion";

// Validate SITE_URL to prevent console errors
if (typeof SITE_URL !== "string" || !SITE_URL.startsWith("http")) {
  if (import.meta.env.DEV) {
    console.warn("Invalid SITE_URL, using default");
  }
}

export function canonical(url: string): string {
  const clean = url.replace(/\/+$/, "");
  if (clean.startsWith("http")) return clean;
  return `${SITE_URL}${clean}`;
}

export function ogImageFallback(): string {
  return `${SITE_URL}/og-image.svg`;
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Discover নবME — where heritage craftsmanship meets contemporary elegance. Premium fashion for the discerning.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productSchema(
  product: Product,
  variant?: ProductVariant
): Record<string, unknown> {
  const images = product.images ?? [];
  const variants = product.variants ?? [];
  const offers = variants.map((v) => ({
    "@type": "Offer",
    sku: v.sku || undefined,
    price: Number(product.basePrice ?? 0) + Number(v.priceAdjustment ?? 0),
    priceCurrency: "INR",
    availability: v.stock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    url: `${SITE_URL}/products/${product.slug}`,
  }));

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description?.slice(0, 5000),
    sku: variant ? variant.sku : variants[0]?.sku || undefined,
    image: images.map((i) => i.url),
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand.name,
        }
      : undefined,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: Number(product.basePrice ?? 0),
      highPrice: variants.reduce(
        (max, v) =>
          Math.max(max, Number(product.basePrice ?? 0) + Number(v.priceAdjustment ?? 0)),
        0
      ),
      offerCount: offers.length,
      offers: offers.slice(0, 5),
    },
  };

  // Clean undefined values
  Object.keys(schema).forEach((k) => schema[k] === undefined && delete schema[k]);
  return schema;
}

export function collectionSchema(
  collection: Record<string, unknown>
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.name,
    description: (collection.description as string)?.slice(0, 5000),
    url: `${SITE_URL}/collections/${collection.slug}`,
    ...(collection.coverImageUrl
      ? { image: collection.coverImageUrl as string }
      : {}),
    ...(collection.numberOfItems
      ? { numberOfItems: collection.numberOfItems }
      : {}),
  };
}

export function breadcrumbSchema(
  items: { label: string; url?: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.url ? { item: `${SITE_URL}${item.url}` } : {}),
    })),
  };
}

export function organizationSchema(data: {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  contactPoint?: { telephone: string; contactType: string; email?: string };
}): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.name,
    url: data.url,
  };
  if (data.logo) schema.logo = data.logo;
  if (data.description) schema.description = data.description;
  if (data.sameAs?.length) schema.sameAs = data.sameAs;
  if (data.contactPoint) {
    schema.contactPoint = {
      "@type": "ContactPoint",
      telephone: data.contactPoint.telephone,
      contactType: data.contactPoint.contactType,
      ...(data.contactPoint.email ? { email: data.contactPoint.email } : {}),
    };
  }
  return schema;
}

export function articleSchema(data: {
  headline: string;
  description?: string;
  image?: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  url: string;
}): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.headline,
    description: data.description,
    url: data.url,
  };
  if (data.image) schema.image = data.image;
  if (data.author) schema.author = { "@type": "Organization", name: data.author };
  if (data.datePublished) schema.datePublished = data.datePublished;
  if (data.dateModified) schema.dateModified = data.dateModified;
  return schema;
}

export type ImgOptions = {
  width?: number;
  height?: number;
  quality?: number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
};

function stripDoubleExtension(url: string): string {
  // Fix double extensions like .jpeg.jpg, .png.png, .jpg.webp that break Cloudinary f_auto
  // Matches any image extension followed by another image extension at the end of the URL
  return url.replace(/\.(jpeg|jpg|png|gif|webp|avif|bmp|tiff|tif|svg)\.(jpg|jpeg|png|gif|webp|avif|bmp|tiff|tif|svg)(\?[^]*)?$/i,
    ".$1$3"
  );
}

const CLOUDINARY_CLOUD_NAME = "dmzbh87bi";

function isCloudinaryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com");
}

function toCloudinaryFetchUrl(url: string, transforms: string[]): string {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${transforms.join(",")}/${encodeURIComponent(url)}`;
}

export function img(url: string | undefined | null, options?: ImgOptions): string {
  if (!url) return "/placeholder.svg";

  const isUnsplash = url.includes("images.unsplash.com");

  if (!isCloudinaryUrl(url) && !isUnsplash) return url;

  try {
    const cleanUrl = isCloudinaryUrl(url) ? stripDoubleExtension(url) : url;

    const transforms: string[] = [];
    if (options?.width) transforms.push(`w_${options.width}`);
    if (options?.height) transforms.push(`h_${options.height}`);
    transforms.push(options?.quality ? `q_${options.quality}` : "q_auto:best");
    transforms.push(options?.format ? `f_${options.format}` : "f_auto");
    transforms.push("dpr_2.0");
    transforms.push("c_limit");

    if (isCloudinaryUrl(url)) {
      return cleanUrl.replace(
        `/image/upload/`,
        `/image/upload/${transforms.join(",")}/`
      );
    }

    return toCloudinaryFetchUrl(cleanUrl, transforms);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Image processing failed:", error);
    }
    return url;
  }
}

export function imgSet(
  url: string | undefined | null,
  widths: number[] = [320, 640, 960, 1280, 1920]
): { src: string; srcSet: string } | { src: string } {
  if (!url || (!isCloudinaryUrl(url) && !url.includes("images.unsplash.com"))) {
    return { src: url || "/placeholder.svg" };
  }
  try {
    const srcSet = widths
      .map((w) => `${img(url, { width: w, format: "webp" })} ${w}w`)
      .join(", ");
    return { src: img(url, { width: widths[1], format: "webp" }), srcSet };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Image srcSet generation failed:", error);
    }
    return { src: url || "/placeholder.svg" };
  }
}

export function metaDescription(description: string, maxLength: number = 160): string {
  if (!description) return "";
  return description.length > maxLength ? description.slice(0, maxLength - 1) + "…" : description;
}
