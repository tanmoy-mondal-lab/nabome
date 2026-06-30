// ─── Content Types ───

export type ContentStatus = "draft" | "published" | "scheduled" | "archived";

export type ContentType =
  | "page"
  | "landing_page"
  | "homepage"
  | "collection"
  | "lookbook"
  | "campaign"
  | "brand_story"
  | "policy";

// ─── Sections ───

export type SectionType =
  | "hero_banner"
  | "video_banner"
  | "text_block"
  | "image_block"
  | "product_grid"
  | "product_carousel"
  | "collection_grid"
  | "collection_carousel"
  | "category_grid"
  | "brand_story"
  | "testimonial"
  | "faq"
  | "newsletter"
  | "contact"
  | "rich_text"
  | "shop_the_look"
  | "promotional_banner"
  | "announcement_bar"
  | "countdown_timer"
  | "custom_cta";

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
  options?: { label: string; value: string }[];
  fields?: SectionField[];
  validation?: { min?: number; max?: number; pattern?: string };
  condition?: { field: string; value: unknown };
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

// ─── Content Pages ───

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

// ─── Lookbook ───

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

// ─── Shop The Look ───

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

// ─── Theme ───

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

// ─── Header / Navigation ───

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
  items: { label: string; url?: string; description?: string; image?: string }[];
}

export interface PromotionalMenuContent {
  title: string;
  description: string;
  image: string;
  imagePublicId?: string;
  linkUrl: string;
  linkText: string;
}

// ─── Media ───

export interface MediaAsset {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  url: string;
  thumbnailUrl: string;
  altText: string;
  caption: string;
  description: string;
  folder: string;
  tags: string[];
  width: number;
  height: number;
  duration: number;
  usageCount: number;
  createdAt: string;
  uploadedBy: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  assetCount: number;
  children?: MediaFolder[];
}

// ─── Dynamic Settings ───

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

// ─── Component Registry ───

export const SECTION_DEFINITIONS: SectionDefinition[] = [
  {
    type: "hero_banner",
    name: "Hero Banner",
    description: "Full-width hero banner with headline, subtitle, and CTA",
    icon: "📺",
    category: "hero",
    supportsBackground: true,
    supportsAnimation: true,
    defaultConfig: {
      heading: "",
      subheading: "",
      ctaText: "Shop Now",
      ctaUrl: "/shop",
      backgroundImage: "",
      overlayOpacity: 0.3,
      textAlign: "center",
      textColor: "#ffffff",
      height: "large",
    },
    fields: [
      { key: "heading", label: "Heading", type: "text", required: true },
      { key: "subheading", label: "Subheading", type: "text" },
      { key: "ctaText", label: "CTA Text", type: "text", placeholder: "Shop Now" },
      { key: "ctaUrl", label: "CTA URL", type: "text", placeholder: "/shop" },
      { key: "backgroundImage", label: "Background Image", type: "image", required: true },
      { key: "overlayOpacity", label: "Overlay Opacity", type: "number", defaultValue: 0.3, validation: { min: 0, max: 1 } },
      { key: "textAlign", label: "Text Alignment", type: "select", options: [{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }] },
      { key: "height", label: "Height", type: "select", options: [{ label: "Small", value: "small" }, { label: "Medium", value: "medium" }, { label: "Large", value: "large" }, { label: "Full Screen", value: "fullscreen" }] },
    ],
  },
  {
    type: "video_banner",
    name: "Video Banner",
    description: "Full-width video banner with autoplay and overlay content",
    icon: "🎬",
    category: "hero",
    supportsBackground: false,
    supportsAnimation: true,
    defaultConfig: { heading: "", subheading: "", videoUrl: "", posterImage: "", ctaText: "", ctaUrl: "", autoplay: true, loop: true, muted: true },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Subheading", type: "text" },
      { key: "videoUrl", label: "Video URL", type: "video", required: true },
      { key: "posterImage", label: "Poster Image", type: "image" },
      { key: "ctaText", label: "CTA Text", type: "text" },
      { key: "ctaUrl", label: "CTA URL", type: "text" },
      { key: "autoplay", label: "Autoplay", type: "boolean", defaultValue: true },
      { key: "loop", label: "Loop", type: "boolean", defaultValue: true },
    ],
  },
  {
    type: "product_grid",
    name: "Product Grid",
    description: "Display products in a responsive grid layout",
    icon: "📦",
    category: "products",
    supportsBackground: true,
    supportsAnimation: false,
    defaultConfig: { title: "", collection: "", limit: 8, columns: 4, showViewAll: true, viewAllUrl: "/shop" },
    fields: [
      { key: "title", label: "Section Title", type: "text" },
      { key: "collection", label: "Collection", type: "collections" },
      { key: "limit", label: "Max Products", type: "number", defaultValue: 8, validation: { min: 1, max: 50 } },
      { key: "columns", label: "Columns", type: "select", options: [{ label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }, { label: "5", value: "5" }, { label: "6", value: "6" }] },
      { key: "showViewAll", label: "Show View All Link", type: "boolean", defaultValue: true },
    ],
  },
  {
    type: "product_carousel",
    name: "Product Carousel",
    description: "Horizontal scrolling product carousel",
    icon: "🎠",
    category: "products",
    supportsBackground: true,
    supportsAnimation: true,
    defaultConfig: { title: "", collection: "", limit: 12, autoplay: true, showArrows: true },
    fields: [
      { key: "title", label: "Section Title", type: "text" },
      { key: "collection", label: "Collection", type: "collections" },
      { key: "limit", label: "Max Products", type: "number", defaultValue: 12, validation: { min: 1, max: 50 } },
      { key: "autoplay", label: "Autoplay", type: "boolean", defaultValue: true },
      { key: "showArrows", label: "Show Arrows", type: "boolean", defaultValue: true },
    ],
  },
  {
    type: "text_block",
    name: "Text Block",
    description: "Simple text block with formatting options",
    icon: "📝",
    category: "content",
    supportsBackground: true,
    supportsAnimation: false,
    defaultConfig: { heading: "", content: "", alignment: "left", maxWidth: "800px" },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "content", label: "Content", type: "rich_text", required: true },
      { key: "alignment", label: "Text Alignment", type: "select", options: [{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }] },
      { key: "maxWidth", label: "Max Width", type: "text", placeholder: "800px" },
    ],
  },
  {
    type: "image_block",
    name: "Image Block",
    description: "Single image with optional caption and link",
    icon: "🖼️",
    category: "content",
    supportsBackground: false,
    supportsAnimation: true,
    defaultConfig: { image: "", altText: "", caption: "", linkUrl: "", aspectRatio: "auto", fullWidth: false },
    fields: [
      { key: "image", label: "Image", type: "image", required: true },
      { key: "altText", label: "Alt Text", type: "text" },
      { key: "caption", label: "Caption", type: "text" },
      { key: "linkUrl", label: "Link URL", type: "text" },
      { key: "aspectRatio", label: "Aspect Ratio", type: "select", options: [{ label: "Auto", value: "auto" }, { label: "1:1", value: "1/1" }, { label: "4:3", value: "4/3" }, { label: "16:9", value: "16/9" }, { label: "3:2", value: "3/2" }] },
    ],
  },
  {
    type: "collection_grid",
    name: "Collection Grid",
    description: "Display collections in a grid layout",
    icon: "🗂️",
    category: "collections",
    supportsBackground: true,
    supportsAnimation: false,
    defaultConfig: { title: "", collections: [], columns: 3, showViewAll: true },
    fields: [
      { key: "title", label: "Section Title", type: "text" },
      { key: "collections", label: "Collections", type: "collections" },
      { key: "columns", label: "Columns", type: "select", options: [{ label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }] },
    ],
  },
  {
    type: "collection_carousel",
    name: "Collection Carousel",
    description: "Horizontal scrolling collection carousel",
    icon: "🎪",
    category: "collections",
    supportsBackground: true,
    supportsAnimation: true,
    defaultConfig: { title: "", collections: [], autoplay: true },
    fields: [
      { key: "title", label: "Section Title", type: "text" },
      { key: "collections", label: "Collections", type: "collections" },
    ],
  },
  {
    type: "category_grid",
    name: "Category Grid",
    description: "Display categories in a grid with images",
    icon: "📂",
    category: "collections",
    supportsBackground: true,
    supportsAnimation: false,
    defaultConfig: { title: "", categories: [], columns: 4, showProductCount: true },
    fields: [
      { key: "title", label: "Section Title", type: "text" },
      { key: "categories", label: "Categories", type: "categories" },
      { key: "columns", label: "Columns", type: "select", options: [{ label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }, { label: "5", value: "5" }] },
    ],
  },
  {
    type: "brand_story",
    name: "Brand Story Section",
    description: "Showcase brand story, mission, and values",
    icon: "📖",
    category: "content",
    supportsBackground: true,
    supportsAnimation: true,
    defaultConfig: { heading: "", body: "", image: "", imagePosition: "left", values: [], ctaText: "", ctaUrl: "" },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "body", label: "Body", type: "rich_text" },
      { key: "image", label: "Image", type: "image" },
      { key: "imagePosition", label: "Image Position", type: "select", options: [{ label: "Left", value: "left" }, { label: "Right", value: "right" }] },
      { key: "ctaText", label: "CTA Text", type: "text" },
      { key: "ctaUrl", label: "CTA URL", type: "text" },
    ],
  },
  {
    type: "testimonial",
    name: "Testimonial Section",
    description: "Display customer testimonials and reviews",
    icon: "💬",
    category: "content",
    supportsBackground: true,
    supportsAnimation: true,
    defaultConfig: { title: "", testimonials: [{ name: "", role: "", content: "", avatar: "", rating: 5 }], layout: "grid", autoplay: false },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "testimonials", label: "Testimonials", type: "repeater", fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "role", label: "Role/Title", type: "text" },
        { key: "content", label: "Content", type: "textarea", required: true },
        { key: "avatar", label: "Avatar", type: "image" },
        { key: "rating", label: "Rating", type: "number", defaultValue: 5, validation: { min: 1, max: 5 } },
      ]},
      { key: "layout", label: "Layout", type: "select", options: [{ label: "Grid", value: "grid" }, { label: "Carousel", value: "carousel" }, { label: "Single", value: "single" }] },
    ],
  },
  {
    type: "faq",
    name: "FAQ Section",
    description: "Frequently asked questions accordion",
    icon: "❓",
    category: "content",
    supportsBackground: true,
    supportsAnimation: false,
    defaultConfig: { title: "", faqs: [{ question: "", answer: "" }] },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "faqs", label: "FAQs", type: "repeater", required: true, fields: [
        { key: "question", label: "Question", type: "text", required: true },
        { key: "answer", label: "Answer", type: "rich_text", required: true },
      ]},
    ],
  },
  {
    type: "newsletter",
    name: "Newsletter Signup",
    description: "Email newsletter subscription form",
    icon: "📧",
    category: "interactive",
    supportsBackground: true,
    supportsAnimation: false,
    defaultConfig: { heading: "Join Our Newsletter", subheading: "Get updates on new arrivals and exclusive offers", placeholder: "Enter your email", buttonText: "Subscribe", socialLinks: false },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Subheading", type: "text" },
      { key: "placeholder", label: "Input Placeholder", type: "text" },
      { key: "buttonText", label: "Button Text", type: "text", defaultValue: "Subscribe" },
      { key: "socialLinks", label: "Show Social Links", type: "boolean", defaultValue: false },
    ],
  },
  {
    type: "contact",
    name: "Contact Section",
    description: "Contact form and information section",
    icon: "📞",
    category: "interactive",
    supportsBackground: true,
    supportsAnimation: false,
    defaultConfig: { heading: "Get In Touch", email: "", phone: "", address: "", mapEmbed: "", formEnabled: true },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "address", label: "Address", type: "text" },
      { key: "mapEmbed", label: "Google Maps Embed URL", type: "text" },
      { key: "formEnabled", label: "Enable Contact Form", type: "boolean", defaultValue: true },
    ],
  },
  {
    type: "rich_text",
    name: "Rich Text Section",
    description: "Full rich text editor for custom content",
    icon: "📄",
    category: "content",
    supportsBackground: true,
    supportsAnimation: false,
    defaultConfig: { content: "", heading: "", showTableOfContents: false },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "content", label: "Content", type: "rich_text", required: true },
      { key: "showTableOfContents", label: "Show Table of Contents", type: "boolean", defaultValue: false },
    ],
  },
  {
    type: "shop_the_look",
    name: "Shop The Look",
    description: "Interactive look with shoppable product hotspots",
    icon: "👗",
    category: "products",
    supportsBackground: false,
    supportsAnimation: true,
    defaultConfig: { title: "", lookImage: "", products: [] },
    fields: [
      { key: "title", label: "Section Title", type: "text" },
      { key: "lookImage", label: "Look Image", type: "image", required: true },
      { key: "products", label: "Products", type: "repeater", fields: [
        { key: "productId", label: "Product", type: "products" },
        { key: "positionX", label: "Position X (%)", type: "number", validation: { min: 0, max: 100 } },
        { key: "positionY", label: "Position Y (%)", type: "number", validation: { min: 0, max: 100 } },
      ]},
    ],
  },
  {
    type: "promotional_banner",
    name: "Promotional Banner",
    description: "Marketing banner with discount/offer messaging",
    icon: "🏷️",
    category: "promotional",
    supportsBackground: true,
    supportsAnimation: true,
    defaultConfig: { heading: "", subheading: "", discount: "", ctaText: "", ctaUrl: "", backgroundImage: "", badge: "", badgeColor: "#ff0000" },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Subheading", type: "text" },
      { key: "discount", label: "Discount Text", type: "text", placeholder: "UP TO 50% OFF" },
      { key: "ctaText", label: "CTA Text", type: "text" },
      { key: "ctaUrl", label: "CTA URL", type: "text" },
      { key: "backgroundImage", label: "Background Image", type: "image" },
      { key: "badge", label: "Badge Text", type: "text" },
      { key: "badgeColor", label: "Badge Color", type: "color" },
    ],
  },
  {
    type: "announcement_bar",
    name: "Announcement Bar",
    description: "Top announcement bar with scrolling or static message",
    icon: "📢",
    category: "promotional",
    supportsBackground: true,
    supportsAnimation: true,
    defaultConfig: { message: "", linkText: "", linkUrl: "", backgroundColor: "#000000", textColor: "#ffffff", dismissible: true, autoplay: true, slides: [] },
    fields: [
      { key: "message", label: "Message", type: "text", required: true },
      { key: "linkText", label: "Link Text", type: "text" },
      { key: "linkUrl", label: "Link URL", type: "text" },
      { key: "backgroundColor", label: "Background Color", type: "color" },
      { key: "textColor", label: "Text Color", type: "color" },
      { key: "dismissible", label: "Dismissible", type: "boolean", defaultValue: true },
    ],
  },
  {
    type: "countdown_timer",
    name: "Countdown Timer",
    description: "Countdown timer for flash sales and promotions",
    icon: "⏱️",
    category: "promotional",
    supportsBackground: true,
    supportsAnimation: true,
    defaultConfig: { title: "", endDate: "", endTime: "", message: "", expiredMessage: "", backgroundColor: "#000000", textColor: "#ffffff" },
    fields: [
      { key: "title", label: "Title", type: "text", placeholder: "Sale Ends In" },
      { key: "endDate", label: "End Date", type: "text", required: true, placeholder: "2025-12-31" },
      { key: "endTime", label: "End Time", type: "text", placeholder: "23:59" },
      { key: "message", label: "Active Message", type: "text" },
      { key: "expiredMessage", label: "Expired Message", type: "text" },
    ],
  },
  {
    type: "custom_cta",
    name: "Custom CTA Section",
    description: "Custom call-to-action section with background",
    icon: "🎯",
    category: "promotional",
    supportsBackground: true,
    supportsAnimation: true,
    defaultConfig: { heading: "", body: "", ctaText: "", ctaUrl: "", ctaStyle: "primary", backgroundImage: "", overlay: true },
    fields: [
      { key: "heading", label: "Heading", type: "text", required: true },
      { key: "body", label: "Body Text", type: "textarea" },
      { key: "ctaText", label: "CTA Button Text", type: "text", required: true },
      { key: "ctaUrl", label: "CTA URL", type: "text", required: true },
      { key: "ctaStyle", label: "Button Style", type: "select", options: [{ label: "Primary", value: "primary" }, { label: "Secondary", value: "secondary" }, { label: "Outline", value: "outline" }] },
      { key: "backgroundImage", label: "Background Image", type: "image" },
      { key: "overlay", label: "Show Overlay", type: "boolean", defaultValue: true },
    ],
  },
];
