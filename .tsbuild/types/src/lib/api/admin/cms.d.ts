export interface CMSPage {
    id: string;
    title: string;
    slug: string;
    content: string;
    template?: string;
    isPublished: boolean;
    metaTitle?: string;
    metaDesc?: string;
    ogImage?: string;
    createdAt: string;
    updatedAt: string;
}
export interface HomepageSection {
    id: string;
    sectionType: string;
    title?: string;
    subtitle?: string;
    content?: string;
    styles?: Record<string, unknown>;
    sortOrder: number;
    isActive: boolean;
    visibility?: string;
    publishAt?: string;
    expireAt?: string;
}
export interface NavigationMenu {
    id: string;
    name: string;
    location: string;
    items: NavigationItem[];
    isActive: boolean;
}
export interface NavigationItem {
    id: string;
    label: string;
    url?: string;
    type?: string;
    sortOrder: number;
    children?: NavigationItem[];
}
export interface FooterSection {
    id: string;
    column: string;
    title: string;
    contentType: string;
    content?: string;
    sortOrder: number;
    isActive: boolean;
}
export interface Announcement {
    id: string;
    title: string;
    content: string;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    createdAt: string;
}
export declare const cmsApi: {
    getPages: () => Promise<{
        pages: CMSPage[];
    }>;
    getPage: (id: string) => Promise<{
        page: CMSPage;
    }>;
    createPage: (data: Partial<CMSPage>) => Promise<CMSPage>;
    updatePage: (id: string, data: Partial<CMSPage>) => Promise<CMSPage>;
    deletePage: (id: string) => Promise<{
        message: string;
    }>;
    getHomepageSections: () => Promise<{
        sections: HomepageSection[];
    }>;
    createHomeSection: (data: Partial<HomepageSection>) => Promise<HomepageSection>;
    updateHomeSection: (id: string, data: Partial<HomepageSection>) => Promise<HomepageSection>;
    deleteHomeSection: (id: string) => Promise<{
        message: string;
    }>;
    reorderHomeSections: (order: {
        id: string;
        sortOrder: number;
    }[]) => Promise<unknown>;
    getNavigationMenus: () => Promise<{
        menus: NavigationMenu[];
    }>;
    createNavigation: (data: Partial<NavigationMenu>) => Promise<NavigationMenu>;
    updateNavigation: (id: string, data: Partial<NavigationMenu>) => Promise<NavigationMenu>;
    deleteNavigation: (id: string) => Promise<{
        message: string;
    }>;
    getFooterSections: () => Promise<{
        sections: FooterSection[];
    }>;
    createFooterSection: (data: Partial<FooterSection>) => Promise<FooterSection>;
    updateFooterSection: (id: string, data: Partial<FooterSection>) => Promise<FooterSection>;
    deleteFooterSection: (id: string) => Promise<{
        message: string;
    }>;
    getAnnouncements: () => Promise<{
        announcements: Announcement[];
    }>;
    createAnnouncement: (data: Partial<Announcement>) => Promise<Announcement>;
    updateAnnouncement: (id: string, data: Partial<Announcement>) => Promise<Announcement>;
    deleteAnnouncement: (id: string) => Promise<{
        message: string;
    }>;
};
