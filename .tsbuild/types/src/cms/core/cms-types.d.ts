export type ContentStatus = "draft" | "published" | "scheduled" | "archived";
export type ContentType = "page" | "landing_page" | "homepage" | "collection" | "lookbook" | "campaign" | "brand_story" | "policy";
export type SectionType = "hero_banner" | "video_banner" | "text_block" | "image_block" | "product_grid" | "product_carousel" | "collection_grid" | "collection_carousel" | "category_grid" | "brand_story" | "testimonial" | "faq" | "newsletter" | "contact" | "rich_text" | "shop_the_look" | "promotional_banner" | "announcement_bar" | "countdown_timer" | "custom_cta";
export interface SectionDefinition {
    type: SectionType;
    name: string;
    description: string;
    icon: string;
    category: "hero" | "content" | "products" | "collections" | "promotional" | "interactive";
    defaultConfig: Record<string, unknown>;
    fields: SectionField[];
    supportsBackground: boolean;
    supportsAnimation: boolean;
    maxInstances?: number;
}
export interface SectionField {
    key: string;
    label: string;
    type: "text" | "textarea" | "rich_text" | "image" | "video" | "select" | "multiselect" | "number" | "boolean" | "color" | "link" | "repeater" | "products" | "collections" | "categories";
    required?: boolean;
    defaultValue?: unknown;
    placeholder?: string;
    options?: {
        label: string;
        value: string;
    }[];
    fields?: SectionField[];
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
    };
    condition?: {
        field: string;
        value: unknown;
    };
}
export interface PageSection {
    id: string;
    type: SectionType;
    pageId: string;
    sortOrder: number;
    config: Record<string, unknown>;
    styles?: Record<string, unknown>;
    visibility?: SectionVisibility;
    createdAt: string;
    updatedAt: string;
}
export interface SectionVisibility {
    isVisible?: boolean;
    schedule?: {
        startDate?: string;
        endDate?: string;
    };
    devices?: ("desktop" | "tablet" | "mobile")[];
    conditions?: {
        field: string;
        operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains";
        value: unknown;
    }[];
}
export interface ContentPage {
    id: string;
    title: string;
    slug: string;
    type: ContentType;
    status: ContentStatus;
    template?: string;
    sections: PageSection[];
    seo: PageSEO;
    schedule?: PublishSchedule;
    locale?: string;
    createdAt: string;
    updatedAt: string;
    version: number;
}
export interface PageSEO {
    metaTitle: string;
    metaDescription: string;
    metaImage: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    canonicalUrl: string;
    robots: string;
    structuredData: string;
}
export interface PublishSchedule {
    publishAt?: string;
    unpublishAt?: string;
    timezone: string;
}
export interface Lookbook {
    id: string;
    title: string;
    slug: string;
    description: string;
    story: string;
    season: string;
    year: number;
    featuredImage: string;
    layout: "grid" | "masonry" | "carousel" | "editorial";
    status: ContentStatus;
    tags: string[];
    items: LookbookItem[];
    seo: PageSEO;
    createdAt: string;
    updatedAt: string;
}
export interface LookbookItem {
    id: string;
    type: "image" | "video" | "product" | "text" | "shop_the_look";
    title: string;
    description: string;
    mediaUrl: string;
    productId?: string;
    position: number;
    aspectRatio: number;
    linkUrl?: string;
    linkText?: string;
    outfit?: ShopTheLook;
}
export interface ShopTheLook {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    imagePublicId?: string;
    products: ShopTheLookProduct[];
    tags: string[];
    status: ContentStatus;
    createdAt: string;
    updatedAt: string;
}
export interface ShopTheLookProduct {
    productId: string;
    productName: string;
    productImage: string;
    productPrice: number;
    position: {
        x: number;
        y: number;
    };
    hotspotSize: number;
}
export interface Theme {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    isSystem: boolean;
    previewImage: string;
    branding: ThemeBranding;
    design: ThemeDesign;
    layout: ThemeLayout;
    header: ThemeHeaderConfig;
    footer: ThemeFooterConfig;
    customCSS: string;
    createdAt: string;
    updatedAt: string;
}
export interface ThemeBranding {
    logo: string;
    logoLight: string;
    logoDark: string;
    logoMobile: string;
    favicon: string;
    brandName: string;
    brandDescription: string;
    brandTagline: string;
}
export interface ThemeDesign {
    colors: ThemeColors;
    typography: ThemeTypography;
    buttons: ThemeButtonStyle;
    borderRadius: ThemeBorderRadius;
    shadows: ThemeShadows;
    cards: ThemeCardStyles;
}
export interface ThemeColors {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    accent: string;
    accentLight: string;
    accentDark: string;
    background: string;
    backgroundSecondary: string;
    surface: string;
    text: string;
    textSecondary: string;
    textInverse: string;
    success: string;
    warning: string;
    error: string;
    info: string;
}
export interface ThemeTypography {
    displayFont: string;
    headingFont: string;
    bodyFont: string;
    monoFont: string;
    baseSize: string;
    scaleRatio: string;
    h1Size: string;
    h2Size: string;
    h3Size: string;
    h4Size: string;
    bodySize: string;
    smallSize: string;
    fontWeightLight: number;
    fontWeightNormal: number;
    fontWeightMedium: number;
    fontWeightBold: number;
    lineHeightTight: string;
    lineHeightNormal: string;
    lineHeightRelaxed: string;
    letterSpacing: string;
}
export interface ThemeButtonStyle {
    primaryBg: string;
    primaryText: string;
    primaryBorder: string;
    primaryRadius: string;
    primaryPadding: string;
    primaryFontWeight: number;
    primaryHoverBg: string;
    primaryHoverText: string;
    secondaryBg: string;
    secondaryText: string;
    secondaryBorder: string;
    secondaryRadius: string;
    secondaryPadding: string;
    secondaryFontWeight: number;
    secondaryHoverBg: string;
    secondaryHoverText: string;
    outlineBg: string;
    outlineText: string;
    outlineBorder: string;
    outlineRadius: string;
    outlinePadding: string;
    outlineFontWeight: number;
    outlineHoverBg: string;
    outlineHoverText: string;
}
export interface ThemeBorderRadius {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
}
export interface ThemeShadows {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    inner: string;
}
export interface ThemeCardStyles {
    productBg: string;
    productRadius: string;
    productShadow: string;
    productHoverShadow: string;
    productHoverTransform: string;
    productImageRatio: string;
    collectionBg: string;
    collectionRadius: string;
    collectionShadow: string;
    collectionOverlay: string;
}
export interface ThemeLayout {
    containerWidth: string;
    maxWidth: string;
    contentGutter: string;
    headerStyle: "standard" | "fixed" | "sticky" | "glass" | "transparent";
    footerStyle: "standard" | "minimal" | "expanded" | "compact";
    sidebarWidth: string;
    productCardLayout: "standard" | "minimal" | "editorial" | "expanded";
}
export interface ThemeHeaderConfig {
    style: "standard" | "mega" | "minimal" | "centered";
    sticky: boolean;
    transparent: boolean;
    announcementBar: boolean;
    searchBar: boolean;
    cartIcon: boolean;
    wishlistIcon: boolean;
    accountIcon: boolean;
    menuLocation: "left" | "center" | "right";
    menuStyle: "standard" | "mega" | "dropdown" | "accordion";
    maxNavItems?: number;
}
export interface ThemeFooterConfig {
    style: "standard" | "minimal" | "expanded" | "compact";
    columns: number;
    showNewsletter: boolean;
    showSocialLinks: boolean;
    showContact: boolean;
    showPolicyLinks: boolean;
    paymentIcons: boolean;
}
export interface NavigationMenu {
    id: string;
    name: string;
    location: "header" | "footer" | "mobile" | "sidebar";
    items: NavigationItem[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export type MenuItemType = "link" | "dropdown" | "mega_menu" | "promotional" | "divider";
export interface NavigationItem {
    id: string;
    type: MenuItemType;
    label: string;
    url?: string;
    target?: "_self" | "_blank";
    icon?: string;
    badge?: string;
    badgeColor?: string;
    link?: string;
    image?: string;
    imagePublicId?: string;
    description?: string;
    children?: NavigationItem[];
    megaMenuColumns?: MegaMenuColumn[];
    promotionalContent?: PromotionalMenuContent;
    isVisible: boolean;
    isHighlighted: boolean;
}
export interface MegaMenuColumn {
    id: string;
    title: string;
    items: {
        label: string;
        url?: string;
        description?: string;
        image?: string;
    }[];
}
export interface PromotionalMenuContent {
    title: string;
    description: string;
    image: string;
    imagePublicId?: string;
    linkUrl: string;
    linkText: string;
}
export interface MediaAsset {
    id: string;
    assetId: string;
    entityType: string;
    entityId: string;
    url: string;
    secureUrl?: string;
    publicId?: string;
    resourceType?: string;
    originalFilename?: string;
    displayName?: string;
    mimeType: string;
    fileSize?: number;
    altText: string;
    folder: string;
    tags: string[];
    width: number | null;
    height: number | null;
    sortOrder: number;
    isPrimary: boolean;
    type: string;
    format?: string;
    createdAt: string;
}
export interface MediaFolder {
    id: string;
    name: string;
    parentId: string | null;
    path: string;
    assetCount: number;
    children?: MediaFolder[];
}
export interface SiteSettings {
    general: {
        siteName: string;
        siteDescription: string;
        siteUrl: string;
        language: string;
        timezone: string;
        currency: string;
    };
    contact: {
        email: string;
        phone: string;
        whatsapp: string;
        address: string;
        mapUrl: string;
    };
    social: {
        facebook: string;
        instagram: string;
        twitter: string;
        pinterest: string;
        youtube: string;
        linkedin: string;
    };
    business: {
        businessName: string;
        gstin: string;
        pan: string;
        returnsPolicy: string;
        shippingPolicy: string;
        privacyPolicy: string;
        termsConditions: string;
    };
    support: {
        supportEmail: string;
        supportPhone: string;
        supportHours: string;
        faqUrl: string;
    };
    notifications: {
        orderConfirmation: boolean;
        shippingUpdate: boolean;
        promotional: boolean;
        abandonedCart: boolean;
        emailFrequency: "immediate" | "daily" | "weekly";
    };
}
export declare const SECTION_DEFINITIONS: SectionDefinition[];
