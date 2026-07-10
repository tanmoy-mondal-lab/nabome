/**
 * Seed Constants
 * Centralized constants for seed data
 */

export const SEED_CONFIG = {
  siteName: 'NABOME',
  brandName: 'NABOME',
  tagline: 'Where heritage craftsmanship meets contemporary elegance',
  supportEmail: 'support@nabome.online',
  defaultCurrency: 'INR',
  defaultCountry: 'India',
  defaultLanguage: 'en',
  defaultTimezone: 'Asia/Kolkata',
};

export const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@nabome.online',
  firstName: 'NABOME',
  lastName: 'Administrator',
  phone: '+919876543210',
};

export const CUSTOMER_CREDENTIALS = {
  email: 'customer@example.com',
  firstName: 'Rahul',
  lastName: 'Sharma',
  phone: '+919876543211',
};

export const PRODUCT_SLUGS = {
  category: 'premium-kurtas',
  subcategory: 'embroidered-kurtas',
  brand: 'nabome-studio',
  collection: 'festive-collection',
  label: 'new-arrival',
  tag: 'handcrafted',
  sizeGuide: 'clothing-size-guide',
  product: 'royal-embroidered-kurta',
};

export const CMS_SLUGS = {
  homepage: 'homepage',
  hero: 'hero-slider',
  header: 'main-header',
  footer: 'main-footer',
  lookbook: 'festive-lookbook',
  faq: 'general-faq',
  pageTemplate: 'default-template',
  navigation: 'main-navigation',
  seo: 'default-seo',
};

export const MARKETING_SLUGS = {
  coupon: 'WELCOME10',
  newsletter: 'default-newsletter',
  notificationTemplate: 'order-placed',
  emailTemplate: 'order-confirmation',
};

export const SYSTEM_SLUGS = {
  currency: 'INR',
  country: 'IN',
  shippingZone: 'india-standard',
  tax: 'india-gst',
  paymentMethod: 'razorpay',
  analytics: 'default-analytics',
};
