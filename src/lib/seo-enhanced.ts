// ─────────────────────────────────────────────────────────────
// ENHANCED SEO UTILITIES
// ─────────────────────────────────────────────────────────────
// Advanced SEO utilities for optimization and metadata management
// ─────────────────────────────────────────────────────────────

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: Record<string, any>;
}

export class SEOManager {
  generateMetadata(metadata: SEOMetadata): Record<string, string> {
    const meta: Record<string, string> = {};

    // Basic meta tags
    meta.title = metadata.title;
    meta.description = metadata.description;

    if (metadata.keywords && metadata.keywords.length > 0) {
      meta.keywords = metadata.keywords.join(", ");
    }

    // Open Graph tags
    if (metadata.ogTitle) meta["og:title"] = metadata.ogTitle;
    if (metadata.ogDescription) meta["og:description"] = metadata.ogDescription;
    if (metadata.ogImage) meta["og:image"] = metadata.ogImage;

    // Twitter Card tags
    if (metadata.twitterCard) meta["twitter:card"] = metadata.twitterCard;

    // Robots directives
    if (metadata.noindex || metadata.nofollow) {
      const robotsDirectives: string[] = [];
      if (metadata.noindex) robotsDirectives.push("noindex");
      if (metadata.nofollow) robotsDirectives.push("nofollow");
      meta.robots = robotsDirectives.join(", ");
    }

    // Canonical URL
    if (metadata.canonical) meta.canonical = metadata.canonical;

    return meta;
  }

  generateStructuredData(type: string, data: Record<string, any>): string {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": type,
      ...data,
    };

    return JSON.stringify(structuredData);
  }

  generateProductStructuredData(product: {
    name: string;
    description: string;
    image: string;
    price: number;
    currency: string;
    availability: string;
    brand?: string;
    sku?: string;
    reviews?: Array<{ rating: number; author: string; date: string }>;
  }): string {
    const data: Record<string, any> = {
      name: product.name,
      description: product.description,
      image: product.image,
      offers: {
        price: product.price,
        priceCurrency: product.currency,
        availability: product.availability,
      },
    };

    if (product.brand) data.brand = { "@type": "Brand", name: product.brand };
    if (product.sku) data.sku = product.sku;
    if (product.reviews && product.reviews.length > 0) {
      data.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length,
        reviewCount: product.reviews.length,
      };
    }

    return this.generateStructuredData("Product", data);
  }

  generateOrganizationStructuredData(organization: {
    name: string;
    url: string;
    logo?: string;
    description?: string;
    contactPoint?: {
      telephone?: string;
      email?: string;
    };
  }): string {
    const data: Record<string, any> = {
      name: organization.name,
      url: organization.url,
    };

    if (organization.logo) data.logo = organization.logo;
    if (organization.description) data.description = organization.description;
    if (organization.contactPoint) {
      data.contactPoint = {
        "@type": "ContactPoint",
        ...organization.contactPoint,
        contactType: "customer service",
      };
    }

    return this.generateStructuredData("Organization", data);
  }

  generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>): string {
    const itemListElement = items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    }));

    return this.generateStructuredData("BreadcrumbList", { itemListElement });
  }

  generateWebSiteStructuredData(site: {
    name: string;
    url: string;
    description?: string;
    potentialActions?: Array<{
      target: string;
      queryInput: string;
    }>;
  }): string {
    const data: Record<string, any> = {
      name: site.name,
      url: site.url,
    };

    if (site.description) data.description = site.description;
    if (site.potentialActions && site.potentialActions.length > 0) {
      data.potentialAction = site.potentialActions.map((action) => ({
        "@type": "SearchAction",
        target: action.target,
        "query-input": action.queryInput,
      }));
    }

    return this.generateStructuredData("WebSite", data);
  }

  generateSitemapEntry(url: string, lastModified?: Date, changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never", priority?: number): string {
    let entry = `  <url>\n    <loc>${url}</loc>`;
    
    if (lastModified) {
      entry += `\n    <lastmod>${lastModified.toISOString()}</lastmod>`;
    }
    
    if (changeFrequency) {
      entry += `\n    <changefreq>${changeFrequency}</changefreq>`;
    }
    
    if (priority !== undefined) {
      entry += `\n    <priority>${priority.toFixed(1)}</priority>`;
    }
    
    entry += "\n  </url>";
    
    return entry;
  }

  generateRobotsTxt(disallow: string[] = [], allow: string[] = [], sitemap?: string): string {
    let robots = "User-agent: *\n";
    
    for (const path of allow) {
      robots += `Allow: ${path}\n`;
    }
    
    for (const path of disallow) {
      robots += `Disallow: ${path}\n`;
    }
    
    if (sitemap) {
      robots += `\nSitemap: ${sitemap}\n`;
    }
    
    robots += "\nCrawl-delay: 1";
    
    return robots;
  }

  analyzeSEOScore(metadata: SEOMetadata): {
    score: number;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Title check
    if (!metadata.title) {
      issues.push("Missing page title");
      score -= 20;
    } else if (metadata.title.length < 30) {
      suggestions.push("Title is too short (recommended: 30-60 characters)");
      score -= 5;
    } else if (metadata.title.length > 60) {
      suggestions.push("Title is too long (recommended: 30-60 characters)");
      score -= 5;
    }

    // Description check
    if (!metadata.description) {
      issues.push("Missing meta description");
      score -= 20;
    } else if (metadata.description.length < 120) {
      suggestions.push("Description is too short (recommended: 120-160 characters)");
      score -= 5;
    } else if (metadata.description.length > 160) {
      suggestions.push("Description is too long (recommended: 120-160 characters)");
      score -= 5;
    }

    // Open Graph check
    if (!metadata.ogImage) {
      suggestions.push("Missing Open Graph image");
      score -= 10;
    }

    // Canonical URL check
    if (!metadata.canonical) {
      suggestions.push("Missing canonical URL");
      score -= 10;
    }

    // Structured data check
    if (!metadata.structuredData) {
      suggestions.push("Missing structured data");
      score -= 10;
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }
}

export const seoManager = new SEOManager();
