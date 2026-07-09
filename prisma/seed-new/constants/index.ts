/**
 * Seed constants configuration
 * Centralized configuration for all seed operations
 */

// Entity counts
export const SEED_COUNTS = {
  // Users
  ADMINS: 2,
  SELLERS: 10,
  CUSTOMERS: 50,
  
  // Products
  BRANDS: 15,
  CATEGORIES: 12,
  COLLECTIONS: 8,
  PRODUCTS: 100,
  PRODUCT_VARIANTS: 5, // per product
  PRODUCT_IMAGES: 4, // per product
  PRODUCT_TAGS: 3, // per product
  PRODUCT_LABELS: 2, // per product
  
  // Inventory
  INVENTORY_MOVEMENTS: 10, // per product
  INVENTORY_ALERTS: 5,
  
  // Media
  MEDIA_ASSETS: 200,
  MAX_IMAGES_PER_ENTITY: 10,
  MAX_VIDEOS_PER_ENTITY: 3,
  
  // Homepage
  HOMEPAGE_SECTIONS: 8,
  HERO_SLIDES: 5,
  NAVIGATION_ITEMS: 15,
  FOOTER_SECTIONS: 4,
  
  // CMS
  STATIC_PAGES: 10,
  FAQ_ITEMS: 20,
  ANNOUNCEMENTS: 5,
  BLOG_POSTS: 15,
  LOOKBOOKS: 5,
  
  // Orders
  ORDERS: 100,
  ORDER_ITEMS: 3, // per order
  COUPONS: 20,
  CARTS: 30,
  WISHLISTS: 25,
  RETURNS: 15,
  PAYMENTS: 100,
  SHIPMENTS: 100,
  
  // Reviews
  REVIEWS: 150,
  
  // Support
  SUPPORT_TICKETS: 20,
  SUPPORT_REPLIES: 3, // per ticket
  
  // Analytics
  ANALYTICS_EVENTS: 1000,
  
  // Verification
  VERIFICATION_ATTEMPTS: 50,
} as const;

// Limits and constraints
export const SEED_LIMITS = {
  MAX_PRODUCT_PRICE: 100000,
  MIN_PRODUCT_PRICE: 500,
  MAX_ORDER_VALUE: 50000,
  MIN_ORDER_VALUE: 1000,
  MAX_DISCOUNT_PERCENTAGE: 50,
  MIN_DISCOUNT_PERCENTAGE: 5,
  MAX_SHIPPING_DAYS: 14,
  MIN_SHIPPING_DAYS: 2,
  MAX_REVIEW_RATING: 5,
  MIN_REVIEW_RATING: 1,
  MAX_IMAGES_PER_PRODUCT: 10,
  MAX_VIDEOS_PER_PRODUCT: 3,
  MAX_TAGS_PER_PRODUCT: 5,
  MAX_LABELS_PER_PRODUCT: 3,
  MAX_VARIANTS_PER_PRODUCT: 20,
} as const;

// Default values
export const SEED_DEFAULTS = {
  // User defaults
  DEFAULT_PASSWORD: 'Password123!',
  DEFAULT_COUNTRY: 'IN',
  DEFAULT_CURRENCY: 'INR',
  DEFAULT_LANGUAGE: 'en',
  
  // Product defaults
  DEFAULT_PRODUCT_STATUS: 'active',
  DEFAULT_PRODUCT_GENDER: 'unisex',
  DEFAULT_MATERIAL: 'Cotton',
  DEFAULT_CARE_INSTRUCTIONS: 'Machine wash cold, tumble dry low',
  
  // Order defaults
  DEFAULT_ORDER_STATUS: 'pending',
  DEFAULT_PAYMENT_STATUS: 'pending',
  DEFAULT_SHIPPING_STATUS: 'pending',
  
  // Media defaults
  DEFAULT_IMAGE_QUALITY: 90,
  DEFAULT_IMAGE_FORMAT: 'webp',
  DEFAULT_VIDEO_FORMAT: 'mp4',
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  SUPPORTED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
  
  // Date ranges
  SEED_START_DATE: new Date('2024-01-01'),
  SEED_END_DATE: new Date('2026-12-31'),
  
  // Pagination
  BATCH_SIZE: 100,
  CONCURRENCY_LIMIT: 10,
} as const;

// Supported file types for media
export const SUPPORTED_FILE_TYPES = {
  IMAGES: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'],
  VIDEOS: ['mp4', 'webm', 'mov', 'avi'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
} as const;

// Homepage section types
export const HOMEPAGE_SECTION_TYPES = [
  'hero_slider',
  'featured_collections',
  'new_arrivals',
  'trending_products',
  'brand_story',
  'newsletter_signup',
  'instagram_feed',
  'featured_categories',
] as const;

// Product attributes
export const PRODUCT_ATTRIBUTES = {
  SIZES: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'],
  COLORS: [
    'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink',
    'Purple', 'Orange', 'Brown', 'Gray', 'Beige', 'Navy', 'Cream',
  ],
  MATERIALS: [
    'Cotton', 'Silk', 'Linen', 'Wool', 'Denim', 'Polyester',
    'Cashmere', 'Velvet', 'Leather', 'Satin', 'Chiffon',
  ],
  CARE_INSTRUCTIONS: [
    'Machine wash cold',
    'Hand wash only',
    'Dry clean only',
    'Machine wash warm',
    'Spot clean',
  ],
} as const;

// Order statuses
export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;

// Payment methods
export const PAYMENT_METHODS = [
  'credit_card',
  'debit_card',
  'upi',
  'net_banking',
  'wallet',
  'cod',
] as const;

// Shipping carriers
export const SHIPPING_CARRIERS = [
  'fedex',
  'dhl',
  'ups',
  'bluedart',
  'delhivery',
] as const;

// Review ratings distribution
export const RATING_DISTRIBUTION = {
  5: 0.4, // 40% of reviews are 5-star
  4: 0.3, // 30% of reviews are 4-star
  3: 0.15, // 15% of reviews are 3-star
  2: 0.1, // 10% of reviews are 2-star
  1: 0.05, // 5% of reviews are 1-star
} as const;
