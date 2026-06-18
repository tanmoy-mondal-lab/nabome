import { z } from "zod";

// ─── Auth ───

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().max(100).optional(),
  phone: z.string().regex(/^\+?[\d\s-]{10,15}$/, "Invalid phone number").optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// ─── Profile ───

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  phone: z.string().regex(/^\+?[\d\s-]{10,15}$/, "Invalid phone number").optional(),
  avatarUrl: z.string().url().optional(),
});

// ─── Address ───

export const addressSchema = z.object({
  label: z.string().max(50).default("Home"),
  fullName: z.string().min(1, "Full name is required").max(200),
  phone: z.string().regex(/^\+?[\d\s-]{10,15}$/, "Invalid phone number"),
  line1: z.string().min(1, "Address line 1 is required").max(500),
  line2: z.string().max(500).optional(),
  city: z.string().min(1, "City is required").max(200),
  state: z.string().min(1, "State is required").max(200),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
  country: z.string().default("India"),
  isDefault: z.boolean().default(false),
});

// ─── Product (Admin) ───

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(300),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  categoryId: z.string().uuid().optional(),
  subcategoryId: z.string().uuid().optional(),
  collectionId: z.string().uuid().optional(),
  basePrice: z.number().positive("Base price must be positive"),
  compareAtPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  material: z.string().max(200).optional(),
  careInstructions: z.string().optional(),
  sizeChartUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  gender: z.enum(["men", "women", "unisex"]),
  sortOrder: z.number().int().default(0),
  metaTitle: z.string().max(200).optional(),
  metaDesc: z.string().optional(),
});

export const productVariantSchema = z.object({
  sku: z.string().min(1, "SKU is required").max(100),
  size: z.string().min(1).max(50),
  color: z.string().min(1).max(100),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional(),
  priceAdjustment: z.number().default(0),
  stock: z.number().int().min(0).default(0),
  weight: z.number().positive().optional(),
  isActive: z.boolean().default(true),
});

// ─── Category (Admin) ───

export const categorySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  parentId: z.string().uuid().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  metaTitle: z.string().max(200).optional(),
  metaDesc: z.string().optional(),
});

export const subcategorySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  categoryId: z.string().uuid(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

// ─── Collection (Admin) ───

export const collectionSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  heroImageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortOrder: z.number().int().default(0),
  metaTitle: z.string().max(200).optional(),
  metaDesc: z.string().optional(),
});

// ─── Coupon (Admin) ───

export const couponSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive("Discount value must be positive"),
  minOrderValue: z.number().positive().optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().default(1),
  applicableGender: z.enum(["men", "women", "unisex"]).optional(),
  isActive: z.boolean().default(true),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

// ─── CMS ───

export const staticPageSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.any().optional(),
  template: z.string().default("default"),
  isPublished: z.boolean().default(false),
  metaTitle: z.string().max(200).optional(),
  metaDesc: z.string().optional(),
  ogImage: z.string().url().optional(),
});

export const homepageSectionSchema = z.object({
  sectionType: z.enum([
    "hero_slider",
    "featured_collections",
    "new_arrivals",
    "categories_grid",
    "brand_story",
    "newsletter",
    "testimonials",
    "instagram_feed",
    "banner_promo",
    "product_grid",
    "custom_html",
  ]),
  title: z.string().max(200).optional(),
  subtitle: z.string().max(500).optional(),
  content: z.any().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  visibility: z.enum(["all", "logged_in", "logged_out"]).default("all"),
});

export const navigationMenuSchema = z.object({
  name: z.string().min(1).max(200),
  location: z.enum(["header", "footer", "mobile", "sidebar"]),
  items: z.any(),
  isActive: z.boolean().default(true),
});

// ─── Checkout ───

export const checkoutSchema = z.object({
  shippingAddressId: z.string().uuid("Shipping address is required"),
  billingAddressId: z.string().uuid().optional(),
  email: z.string().email(),
  couponCode: z.string().max(50).optional(),
  giftMessage: z.string().max(1000).optional(),
  notes: z.string().max(1000).optional(),
});

// ─── Review ───

export const reviewSchema = z.object({
  productId: z.string().uuid(),
  orderId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().max(5000).optional(),
  images: z.array(z.string().url()).max(5).default([]),
});

// ─── Contact ───

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(/^\+?[\d\s-]{10,15}$/, "Invalid phone").optional(),
  subject: z.string().max(500).optional(),
  message: z.string().min(1, "Message is required").max(5000),
});

export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// ─── Lookbook (Admin) ───

export const lookbookSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  coverImageUrl: z.string().url(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const lookbookItemSchema = z.object({
  imageUrl: z.string().url(),
  productId: z.string().uuid().optional(),
  hotspotX: z.number().min(0).max(1).optional(),
  hotspotY: z.number().min(0).max(1).optional(),
  caption: z.string().max(500).optional(),
  sortOrder: z.number().int().default(0),
});

// ─── Site Settings ───

export const siteSettingsSchema = z.object({
  siteName: z.string().min(1).max(200),
  tagline: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
  faviconUrl: z.string().url().optional(),
  ogImageUrl: z.string().url().optional(),
  currency: z.string().length(3).default("INR"),
  taxRate: z.number().min(0).max(100).default(0),
  freeShippingThreshold: z.number().positive().optional(),
  shippingInfo: z.any().optional(),
  returnPolicy: z.any().optional(),
  aboutUs: z.any().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  facebookPixelId: z.string().optional(),
});

// ─── Types ───

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CollectionInput = z.infer<typeof collectionSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type StaticPageInput = z.infer<typeof staticPageSchema>;
export type HomepageSectionInput = z.infer<typeof homepageSectionSchema>;
export type NavigationMenuInput = z.infer<typeof navigationMenuSchema>;
export type LookbookInput = z.infer<typeof lookbookSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
