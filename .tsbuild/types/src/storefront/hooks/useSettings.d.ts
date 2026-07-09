import type { Theme } from "../../cms/core/cms-types";
export interface SiteSettings {
    siteName: string;
    tagline?: string;
    logoUrl?: string;
    faviconUrl?: string;
    ogImageUrl?: string;
    currency: string;
    taxRate: number;
    freeShippingThreshold?: number;
    shippingInfo?: Record<string, unknown>;
    returnPolicy?: Record<string, unknown>;
    aboutUs?: Record<string, unknown>;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    theme?: Theme;
    seo?: Record<string, unknown>;
    preferences?: Record<string, unknown>;
    socialLinks?: Array<{
        platform: string;
        url: string;
        label?: string;
    }>;
}
export declare function useSettings(): import("@tanstack/react-query").UseQueryResult<NoInfer<SiteSettings>, Error>;
