export interface SiteSettings {
    siteName: string;
    siteUrl: string;
    logo?: string;
    favicon?: string;
    metaTitle?: string;
    metaDescription?: string;
    contactEmail?: string;
    contactPhone?: string;
    socialLinks?: SocialLink[];
    currency?: string;
    timezone?: string;
}
export interface SocialLink {
    id: string;
    platform: string;
    url: string;
    label?: string;
    icon?: string;
    isActive: boolean;
    sortOrder: number;
}
export declare const settingsApi: {
    getSettings: () => Promise<{
        settings: SiteSettings;
    }>;
    updateSettings: (data: Partial<SiteSettings>) => Promise<{
        settings: SiteSettings;
    }>;
    getSocialLinks: () => Promise<{
        links: SocialLink[];
    }>;
    createSocialLink: (data: Partial<SocialLink>) => Promise<SocialLink>;
    updateSocialLink: (id: string, data: Partial<SocialLink>) => Promise<SocialLink>;
    deleteSocialLink: (id: string) => Promise<{
        message: string;
    }>;
};
