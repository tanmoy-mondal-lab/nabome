/**
 * Homepage Types — CMS-driven section configuration (HOMEPAGE_BUILDER_ARCHITECTMD §4)
 * All homepage sections are configured via CMS. No hardcoded sections.
 */

import type { z } from '@nabome/validation';

// ============================================================================
// SECTION TYPE DEFINITIONS
// ============================================================================

/**
 * All supported homepage section types
 * Each section must be registered in the Section Registry
 */
export type HomepageSectionType =
  | 'hero-banner'
  | 'hero-carousel'
  | 'promotional-banner'
  | 'announcement-strip'
  | 'categories-grid'
  | 'featured-categories'
  | 'featured-collections'
  | 'featured-products'
  | 'new-arrivals'
  | 'trending-products'
  | 'best-sellers'
  | 'flash-deals'
  | 'personalized-recommendations'
  | 'recently-viewed'
  | 'continue-shopping'
  | 'brand-showcase'
  | 'testimonials'
  | 'statistics'
  | 'newsletter'
  | 'blog-preview'
  | 'faq-preview'
  | 'custom-html'
  | 'rich-text'
  | 'image-gallery'
  | 'video-section'
  | 'spacer'
  | 'divider';

// ============================================================================
// BASE SECTION CONFIGURATION
// ============================================================================

/**
 * Base configuration shared by all sections
 */
export interface BaseSectionConfig {
  /** Unique section identifier */
  id: string;
  /** Section type - determines which component renders */
  type: HomepageSectionType;
  /** Display order on the page */
  order: number;
  /** Whether section is visible */
  visible: boolean;
  /** Section-specific configuration */
  config: SectionConfigMap[HomepageSectionType];
  /** Visibility rules (optional) */
  visibility?: VisibilityRules;
  /** Scheduling rules (optional) */
  schedule?: ScheduleRules;
  /** Lazy loading configuration */
  lazy?: LazyConfig;
}

/**
 * Visibility rules for conditional rendering
 */
export interface VisibilityRules {
  /** User segments that can see this section */
  userSegments?: string[];
  /** Device types where this section appears */
  devices?: ('mobile' | 'tablet' | 'desktop' | 'wide')[];
  /** Custom conditions */
  conditions?: Record<string, unknown>;
}

/**
 * Schedule rules for time-based visibility
 */
export interface ScheduleRules {
  /** Start date/time (ISO string) */
  start?: string;
  /** End date/time (ISO string) */
  end?: string;
  /** Timezone */
  timezone?: string;
}

/**
 * Lazy loading configuration
 */
export interface LazyConfig {
  /** Enable lazy loading */
  enabled: boolean;
  /** Distance from viewport (in pixels) before loading */
  rootMargin?: string;
  /** Threshold (0-1) */
  threshold?: number;
}

// ============================================================================
// SECTION-SPECIFIC CONFIGURATIONS
// ============================================================================

/**
 * Hero Banner configuration
 */
export interface HeroBannerConfig {
  /** Background image URL */
  backgroundImage: string;
  /** Background video URL (optional) */
  backgroundVideo?: string;
  /** Overlay color and opacity */
  overlay?: {
    color: string;
    opacity: number;
  };
  /** Main heading */
  heading: string;
  /** Subheading or description */
  subheading?: string;
  /** Primary CTA button */
  primaryCTA?: CTAConfig;
  /** Secondary CTA button */
  secondaryCTA?: CTAConfig;
  /** Alignment */
  alignment?: 'left' | 'center' | 'right';
  /** Height variant */
  height?: 'small' | 'medium' | 'large' | 'full';
}

/**
 * Hero Carousel configuration
 */
export interface HeroCarouselConfig {
  /** Array of slides */
  slides: HeroBannerConfig[];
  /** Auto-play interval (ms) */
  autoplayInterval?: number;
  /** Show navigation dots */
  showDots?: boolean;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Transition type */
  transition?: 'fade' | 'slide';
}

/**
 * Promotional Banner configuration
 */
export interface PromotionalBannerConfig {
  /** Background color */
  backgroundColor: string;
  /** Text content */
  content: string;
  /** CTA button */
  cta?: CTAConfig;
  /** Dismissible by user */
  dismissible?: boolean;
}

/**
 * Announcement Strip configuration
 */
export interface AnnouncementStripConfig {
  /** Announcement text */
  text: string;
  /** Background color */
  backgroundColor?: string;
  /** Text color */
  textColor?: string;
  /** Link URL */
  link?: string;
}

/**
 * Categories Grid configuration
 */
export interface CategoriesGridConfig {
  /** Category items */
  categories: CategoryItem[];
  /** Grid columns per breakpoint */
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  /** Show category count */
  showCount?: boolean;
}

/**
 * Featured Categories configuration
 */
export interface FeaturedCategoriesConfig {
  /** Featured category items */
  categories: CategoryItem[];
  /** Layout variant */
  layout?: 'grid' | 'carousel' | 'list';
  /** Maximum items to show */
  maxItems?: number;
}

/**
 * Featured Collections configuration
 */
export interface FeaturedCollectionsConfig {
  /** Collection items */
  collections: CollectionItem[];
  /** Layout variant */
  layout?: 'grid' | 'carousel';
  /** Grid columns per breakpoint */
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

/**
 * Product Section configuration (shared by multiple product sections)
 */
export interface ProductSectionConfig {
  /** Product items */
  products: ProductItem[];
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** CTA button */
  cta?: CTAConfig;
  /** Layout variant */
  layout?: 'grid' | 'carousel' | 'list';
  /** Grid columns per breakpoint */
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  /** Maximum items to show */
  maxItems?: number;
}

/**
 * Brand Showcase configuration
 */
export interface BrandShowcaseConfig {
  /** Brand items */
  brands: BrandItem[];
  /** Layout variant */
  layout?: 'grid' | 'carousel';
  /** Show brand logo only */
  logoOnly?: boolean;
}

/**
 * Testimonials configuration
 */
export interface TestimonialsConfig {
  /** Testimonial items */
  testimonials: TestimonialItem[];
  /** Layout variant */
  layout?: 'grid' | 'carousel';
  /** Auto-play interval for carousel */
  autoplayInterval?: number;
}

/**
 * Statistics configuration
 */
export interface StatisticsConfig {
  /** Stat items */
  statistics: StatItem[];
  /** Layout variant */
  layout?: 'grid' | 'row';
}

/**
 * Newsletter configuration
 */
export interface NewsletterConfig {
  /** Heading */
  heading: string;
  /** Description */
  description?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Submit button text */
  submitText?: string;
  /** Success message */
  successMessage?: string;
}

/**
 * Blog Preview configuration
 */
export interface BlogPreviewConfig {
  /** Blog post items */
  posts: BlogPostItem[];
  /** Section title */
  title?: string;
  /** Maximum items to show */
  maxItems?: number;
  /** Layout variant */
  layout?: 'grid' | 'list';
}

/**
 * FAQ Preview configuration
 */
export interface FAQPreviewConfig {
  /** FAQ items */
  faqs: FAQItem[];
  /** Section title */
  title?: string;
  /** Maximum items to show */
  maxItems?: number;
}

/**
 * Custom HTML Block configuration
 */
export interface CustomHTMLConfig {
  /** HTML content */
  html: string;
  /** Custom CSS (optional) */
  css?: string;
}

/**
 * Rich Text Block configuration
 */
export interface RichTextConfig {
  /** Rich text content (JSON format) */
  content: Record<string, unknown>;
}

/**
 * Image Gallery configuration
 */
export interface ImageGalleryConfig {
  /** Image items */
  images: ImageItem[];
  /** Layout variant */
  layout?: 'grid' | 'masonry' | 'carousel';
  /** Grid columns per breakpoint */
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

/**
 * Video Section configuration
 */
export interface VideoSectionConfig {
  /** Video URL */
  videoUrl: string;
  /** Thumbnail image */
  thumbnail?: string;
  /** Autoplay */
  autoplay?: boolean;
  /** Muted */
  muted?: boolean;
  /** Loop */
  loop?: boolean;
  /** Caption text */
  caption?: string;
}

/**
 * Spacer configuration
 */
export interface SpacerConfig {
  /** Height in pixels */
  height: number;
}

/**
 * Divider configuration
 */
export interface DividerConfig {
  /** Style variant */
  style?: 'solid' | 'dashed' | 'dotted';
  /** Thickness in pixels */
  thickness?: number;
  /** Color */
  color?: string;
}

// ============================================================================
// ITEM TYPES
// ============================================================================

/**
 * Category item
 */
export interface CategoryItem {
  /** Category ID */
  id: string;
  /** Category name */
  name: string;
  /** Category slug */
  slug: string;
  /** Category image URL */
  image: string;
  /** Product count */
  count?: number;
}

/**
 * Collection item
 */
export interface CollectionItem {
  /** Collection ID */
  id: string;
  /** Collection name */
  name: string;
  /** Collection slug */
  slug: string;
  /** Collection image URL */
  image: string;
  /** Product count */
  count?: number;
}

/**
 * Product item
 */
export interface ProductItem {
  /** Product ID */
  id: string;
  /** Product name */
  name: string;
  /** Product slug */
  slug: string;
  /** Product image URL */
  image: string;
  /** Price */
  price: number;
  /** Compare at price (original price) */
  compareAtPrice?: number;
  /** Badge text (e.g., "New", "Sale") */
  badge?: string;
  /** Rating (0-5) */
  rating?: number;
  /** Review count */
  reviewCount?: number;
}

/**
 * Brand item
 */
export interface BrandItem {
  /** Brand ID */
  id: string;
  /** Brand name */
  name: string;
  /** Brand slug */
  slug: string;
  /** Brand logo URL */
  logo: string;
}

/**
 * Testimonial item
 */
export interface TestimonialItem {
  /** Customer name */
  name: string;
  /** Customer avatar URL */
  avatar?: string;
  /** Testimonial text */
  text: string;
  /** Rating (0-5) */
  rating?: number;
  /** Product name (optional) */
  product?: string;
}

/**
 * Stat item
 */
export interface StatItem {
  /** Label */
  label: string;
  /** Value */
  value: string | number;
  /** Description */
  description?: string;
}

/**
 * Blog post item
 */
export interface BlogPostItem {
  /** Post ID */
  id: string;
  /** Post title */
  title: string;
  /** Post slug */
  slug: string;
  /** Excerpt */
  excerpt?: string;
  /** Featured image URL */
  image?: string;
  /** Published date */
  publishedAt?: string;
  /** Author name */
  author?: string;
}

/**
 * FAQ item
 */
export interface FAQItem {
  /** Question */
  question: string;
  /** Answer */
  answer: string;
}

/**
 * Image item
 */
export interface ImageItem {
  /** Image URL */
  url: string;
  /** Alt text */
  alt: string;
  /** Caption */
  caption?: string;
  /** Width */
  width?: number;
  /** Height */
  height?: number;
}

/**
 * CTA button configuration
 */
export interface CTAConfig {
  /** Button text */
  text: string;
  /** Button URL */
  url: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Open in new tab */
  openInNewTab?: boolean;
}

// ============================================================================
// SECTION CONFIGURATION MAP
// ============================================================================

/**
 * Maps section types to their specific configuration
 */
export type SectionConfigMap = {
  'hero-banner': HeroBannerConfig;
  'hero-carousel': HeroCarouselConfig;
  'promotional-banner': PromotionalBannerConfig;
  'announcement-strip': AnnouncementStripConfig;
  'categories-grid': CategoriesGridConfig;
  'featured-categories': FeaturedCategoriesConfig;
  'featured-collections': FeaturedCollectionsConfig;
  'featured-products': ProductSectionConfig;
  'new-arrivals': ProductSectionConfig;
  'trending-products': ProductSectionConfig;
  'best-sellers': ProductSectionConfig;
  'flash-deals': ProductSectionConfig;
  'personalized-recommendations': ProductSectionConfig;
  'recently-viewed': ProductSectionConfig;
  'continue-shopping': ProductSectionConfig;
  'brand-showcase': BrandShowcaseConfig;
  testimonials: TestimonialsConfig;
  statistics: StatisticsConfig;
  newsletter: NewsletterConfig;
  'blog-preview': BlogPreviewConfig;
  'faq-preview': FAQPreviewConfig;
  'custom-html': CustomHTMLConfig;
  'rich-text': RichTextConfig;
  'image-gallery': ImageGalleryConfig;
  'video-section': VideoSectionConfig;
  spacer: SpacerConfig;
  divider: DividerConfig;
};

// ============================================================================
// HOMEPAGE CONFIGURATION
// ============================================================================

/**
 * Complete homepage configuration from CMS
 */
export interface HomepageConfig {
  /** Homepage ID */
  id: string;
  /** Homepage title */
  title: string;
  /** SEO metadata */
  seo?: SEOMetadata;
  /** Array of sections in display order */
  sections: BaseSectionConfig[];
  /** Version number for cache invalidation */
  version: string;
  /** Published timestamp */
  publishedAt: string;
  /** Updated timestamp */
  updatedAt: string;
}

/**
 * SEO metadata
 */
export interface SEOMetadata {
  /** Page title */
  title?: string;
  /** Meta description */
  description?: string;
  /** Keywords */
  keywords?: string[];
  /** Open Graph image */
  ogImage?: string;
  /** Canonical URL */
  canonicalUrl?: string;
  /** No index flag */
  noIndex?: boolean;
}

// ============================================================================
// SECTION REGISTRY TYPES
// ============================================================================

/**
 * Section component definition
 */
export interface SectionComponent<TConfig = unknown> {
  /** React component */
  component: React.ComponentType<SectionProps<TConfig>>;
  /** Configuration schema for validation */
  schema?: z.ZodSchema<TConfig>;
  /** Default configuration */
  defaultConfig?: Partial<TConfig>;
}

/**
 * Props passed to all section components
 */
export interface SectionProps<TConfig = unknown> {
  /** Section ID */
  id: string;
  /** Section-specific configuration */
  config: TConfig;
  /** Section index (for analytics) */
  index: number;
  /** Whether section is in preview mode */
  preview?: boolean;
}

/**
 * Section registry entry
 */
export interface SectionRegistryEntry {
  /** Section type */
  type: HomepageSectionType;
  /** Section component definition */
  component: SectionComponent;
  /** Display name for admin UI */
  displayName: string;
  /** Description for admin UI */
  description?: string;
  /** Icon for admin UI */
  icon?: string;
}

// ============================================================================
// RENDERING STATE TYPES
// ============================================================================

/**
 * Homepage rendering state
 */
export interface HomepageState {
  /** Current configuration */
  config: HomepageConfig | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Last fetched timestamp */
  lastFetched: number | null;
}

/**
 * Section rendering state
 */
export interface SectionState {
  /** Section ID */
  id: string;
  /** Is visible */
  visible: boolean;
  /** Is loaded */
  loaded: boolean;
  /** Is in viewport */
  inViewport: boolean;
}

// ============================================================================
// ANALYTICS EVENT TYPES
// ============================================================================

/**
 * Homepage analytics events
 */
export type HomepageAnalyticsEvent =
  | { type: 'homepage_view'; pageId: string }
  | { type: 'hero_click'; sectionId: string; ctaIndex: number }
  | { type: 'cta_click'; sectionId: string; ctaText: string }
  | { type: 'banner_click'; sectionId: string }
  | { type: 'product_click'; sectionId: string; productId: string }
  | { type: 'scroll_depth'; sectionId: string; depth: number }
  | { type: 'newsletter_signup'; sectionId: string }
  | { type: 'section_visible'; sectionId: string };
