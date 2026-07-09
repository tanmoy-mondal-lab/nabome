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
export declare class SEOManager {
    generateMetadata(metadata: SEOMetadata): Record<string, string>;
    generateStructuredData(type: string, data: Record<string, any>): string;
    generateProductStructuredData(product: {
        name: string;
        description: string;
        image: string;
        price: number;
        currency: string;
        availability: string;
        brand?: string;
        sku?: string;
        reviews?: Array<{
            rating: number;
            author: string;
            date: string;
        }>;
    }): string;
    generateOrganizationStructuredData(organization: {
        name: string;
        url: string;
        logo?: string;
        description?: string;
        contactPoint?: {
            telephone?: string;
            email?: string;
        };
    }): string;
    generateBreadcrumbStructuredData(items: Array<{
        name: string;
        url: string;
    }>): string;
    generateWebSiteStructuredData(site: {
        name: string;
        url: string;
        description?: string;
        potentialActions?: Array<{
            target: string;
            queryInput: string;
        }>;
    }): string;
    generateSitemapEntry(url: string, lastModified?: Date, changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never", priority?: number): string;
    generateRobotsTxt(disallow?: string[], allow?: string[], sitemap?: string): string;
    analyzeSEOScore(metadata: SEOMetadata): {
        score: number;
        issues: string[];
        suggestions: string[];
    };
}
export declare const seoManager: SEOManager;
