const SITE_URL = import.meta.env.VITE_SITE_URL || "https://www.nabome.online";
const SITE_NAME = "নবME — Premium Fashion";

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
  product: Record<string, unknown>,
  variant?: Record<string, unknown>
): Record<string, unknown> {
  const images = (product.images as { url: string }[]) ?? [];
  const variants = (product.variants as Record<string, unknown>[]) ?? [];
  const offers = variants.map((v) => ({
    "@type": "Offer",
    sku: (v.sku as string) || undefined,
    price: Number(product.basePrice ?? 0) + Number((v.priceAdjustment as number) ?? 0),
    priceCurrency: "INR",
    availability: (v.stock as number) > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    url: `${SITE_URL}/products/${product.slug}`,
  }));

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: (product.description as string)?.slice(0, 5000),
    sku: variant ? (variant.sku as string) : (variants[0]?.sku as string) || undefined,
    image: images.map((i) => i.url),
    brand: product.brand
      ? {
          "@type": "Brand",
          name: (product.brand as Record<string, unknown>).name,
        }
      : undefined,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: Number(product.basePrice ?? 0),
      highPrice: variants.reduce(
        (max, v) =>
          Math.max(max, Number(product.basePrice ?? 0) + Number((v.priceAdjustment as number) ?? 0)),
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

export type ImgOptions = {
  width?: number;
  height?: number;
  quality?: number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
};

export function img(url: string | undefined | null, options?: ImgOptions): string {
  if (!url) return "/placeholder.svg";
  // Only apply transforms to Cloudinary URLs
  if (!url.includes("res.cloudinary.com")) return url;

  const transforms: string[] = [];
  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);
  if (options?.quality) transforms.push(`q_${options.quality}`);
  transforms.push(options?.format ? `f_${options.format}` : "f_auto");
  transforms.push("q_auto");

  return url.replace(
    `/image/upload/`,
    `/image/upload/${transforms.join(",")}/`
  );
}

export function imgSet(
  url: string | undefined | null,
  widths: number[] = [320, 640, 960, 1280]
): { src: string; srcSet: string } | { src: string } {
  if (!url || !url.includes("res.cloudinary.com")) {
    return { src: url || "/placeholder.svg" };
  }
  const srcSet = widths
    .map((w) => `${img(url, { width: w })} ${w}w`)
    .join(", ");
  return { src: img(url, { width: widths[1] }), srcSet };
}
