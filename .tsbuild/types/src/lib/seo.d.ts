import type { Product, ProductVariant } from "../types/product";
export declare function canonical(url: string): string;
export declare function ogImageFallback(): string;
export declare function websiteSchema(): {
    "@context": string;
    "@type": string;
    name: string;
    url: any;
    description: string;
    potentialAction: {
        "@type": string;
        target: {
            "@type": string;
            urlTemplate: string;
        };
        "query-input": string;
    };
};
export declare function productSchema(product: Product, variant?: ProductVariant): Record<string, unknown>;
export declare function collectionSchema(collection: Record<string, unknown>): Record<string, unknown>;
export declare function breadcrumbSchema(items: {
    label: string;
    url?: string;
}[]): Record<string, unknown>;
export declare function organizationSchema(data: {
    name: string;
    url: string;
    logo?: string;
    description?: string;
    sameAs?: string[];
    contactPoint?: {
        telephone: string;
        contactType: string;
        email?: string;
    };
}): Record<string, unknown>;
export declare function articleSchema(data: {
    headline: string;
    description?: string;
    image?: string;
    author?: string;
    datePublished?: string;
    dateModified?: string;
    url: string;
}): Record<string, unknown>;
export type ImgOptions = {
    width?: number;
    height?: number;
    quality?: number;
    format?: "auto" | "webp" | "avif" | "jpg" | "png";
};
export declare function img(url: string | undefined | null, options?: ImgOptions): string;
export declare function imgSet(url: string | undefined | null, widths?: number[]): {
    src: string;
    srcSet: string;
} | {
    src: string;
};
export declare function metaDescription(description: string, maxLength?: number): string;
