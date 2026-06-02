import { siteUrl, siteNameEn } from "./seo";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: siteNameEn,
    url: siteUrl,
    logo: `${siteUrl}/images/logo/logo.webp`,
    description: "Premium Bengali streetwear and lifestyle brand blending heritage, culture, and modern fashion.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kolkata",
      addressRegion: "West Bengal",
      addressCountry: "IN",
    },
    telephone: "+91 9163854706",
    sameAs: [
      "https://instagram.com/nabome.online",
      "https://www.facebook.com/share/1DbpYKWoZ1/",
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteNameEn,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productSchema(product: {
  name: string;
  description: string;
  image: string;
  sku?: string;
  price: number;
  currency?: string;
  availability?: string;
  brand?: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  offers?: {
    price: number;
    priceCurrency: string;
    availability: string;
    url: string;
  };
}) {
  const currency = product.currency || "INR";
  const availability = product.availability || "https://schema.org/InStock";
  const brand = product.brand || siteNameEn;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description.slice(0, 500),
    image: product.image,
    sku: product.sku || undefined,
    brand: { "@type": "Brand", name: brand },
    ...(product.aggregateRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.aggregateRating.ratingValue,
            reviewCount: product.aggregateRating.reviewCount,
          },
        }
      : {}),
    offers: product.offers || {
      "@type": "Offer",
      price: product.price,
      priceCurrency: currency,
      availability,
      url: product.sku ? `${siteUrl}/product/${product.sku}` : siteUrl,
    },
  };
}

export function reviewSchema(review: {
  id: string;
  author: string;
  rating: number;
  body: string;
  datePublished: string;
  productName: string;
  productSku?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
    },
    author: { "@type": "Person", name: review.author },
    datePublished: review.datePublished,
    reviewBody: review.body.slice(0, 500),
    itemReviewed: {
      "@type": "Product",
      name: review.productName,
      ...(review.productSku ? { sku: review.productSku } : {}),
    },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: { label: string; href?: string }[]) {
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

export function collectionSchema(collection: {
  name: string;
  description: string;
  products: { name: string; url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.name,
    description: collection.description,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: collection.products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.name,
        url: `${siteUrl}${p.url}`,
      })),
    },
  };
}
