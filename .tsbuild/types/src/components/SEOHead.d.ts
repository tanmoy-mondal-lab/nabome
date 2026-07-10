interface SEOMeta {
    title: string;
    description: string;
    canonicalUrl?: string;
    ogImage?: string;
    ogType?: "website" | "product" | "article";
    noindex?: boolean;
    nofollow?: boolean;
    locale?: string;
    publishedTime?: string;
    modifiedTime?: string;
    jsonLd?: Record<string, unknown>[];
}
export declare function SEOHead({ title, description, canonicalUrl, ogImage, ogType, noindex, nofollow, locale, publishedTime, modifiedTime, jsonLd, }: SEOMeta): import("react").JSX.Element;
export {};
