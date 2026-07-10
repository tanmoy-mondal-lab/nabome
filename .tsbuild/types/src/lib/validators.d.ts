import { z } from "zod";
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    email: string;
    password: string;
    lastName?: string | undefined;
    phone?: string | undefined;
}, {
    firstName: string;
    email: string;
    password: string;
    lastName?: string | undefined;
    phone?: string | undefined;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
}, {
    password: string;
}>;
export declare const profileUpdateSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName?: string | undefined;
    phone?: string | undefined;
    avatarUrl?: string | undefined;
}, {
    firstName: string;
    lastName?: string | undefined;
    phone?: string | undefined;
    avatarUrl?: string | undefined;
}>;
export declare const addressSchema: z.ZodObject<{
    label: z.ZodDefault<z.ZodString>;
    fullName: z.ZodString;
    phone: z.ZodString;
    line1: z.ZodString;
    line2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    district: z.ZodOptional<z.ZodString>;
    state: z.ZodString;
    pincode: z.ZodString;
    country: z.ZodDefault<z.ZodString>;
    isDefault: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    phone: string;
    label: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault: boolean;
    line1: string;
    fullName: string;
    district?: string | undefined;
    line2?: string | undefined;
}, {
    phone: string;
    city: string;
    state: string;
    pincode: string;
    line1: string;
    fullName: string;
    label?: string | undefined;
    district?: string | undefined;
    country?: string | undefined;
    isDefault?: boolean | undefined;
    line2?: string | undefined;
}>;
export declare const productSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    shortDescription: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    subcategoryId: z.ZodOptional<z.ZodString>;
    collectionId: z.ZodOptional<z.ZodString>;
    basePrice: z.ZodNumber;
    compareAtPrice: z.ZodOptional<z.ZodNumber>;
    costPrice: z.ZodOptional<z.ZodNumber>;
    material: z.ZodOptional<z.ZodString>;
    careInstructions: z.ZodOptional<z.ZodString>;
    sizeChartUrl: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    isFeatured: z.ZodDefault<z.ZodBoolean>;
    isNew: z.ZodDefault<z.ZodBoolean>;
    gender: z.ZodEnum<["men", "women", "unisex"]>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
    metaTitle: z.ZodOptional<z.ZodString>;
    metaDesc: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    gender: "men" | "women" | "unisex";
    basePrice: number;
    isActive: boolean;
    isFeatured: boolean;
    isNew: boolean;
    sortOrder: number;
    compareAtPrice?: number | undefined;
    categoryId?: string | undefined;
    description?: string | undefined;
    subcategoryId?: string | undefined;
    collectionId?: string | undefined;
    shortDescription?: string | undefined;
    material?: string | undefined;
    careInstructions?: string | undefined;
    costPrice?: number | undefined;
    metaTitle?: string | undefined;
    metaDesc?: string | undefined;
    sizeChartUrl?: string | undefined;
}, {
    name: string;
    gender: "men" | "women" | "unisex";
    basePrice: number;
    compareAtPrice?: number | undefined;
    categoryId?: string | undefined;
    description?: string | undefined;
    subcategoryId?: string | undefined;
    collectionId?: string | undefined;
    isActive?: boolean | undefined;
    shortDescription?: string | undefined;
    material?: string | undefined;
    careInstructions?: string | undefined;
    costPrice?: number | undefined;
    isFeatured?: boolean | undefined;
    isNew?: boolean | undefined;
    sortOrder?: number | undefined;
    metaTitle?: string | undefined;
    metaDesc?: string | undefined;
    sizeChartUrl?: string | undefined;
}>;
export declare const productVariantSchema: z.ZodObject<{
    sku: z.ZodString;
    size: z.ZodString;
    color: z.ZodString;
    colorHex: z.ZodOptional<z.ZodString>;
    priceAdjustment: z.ZodDefault<z.ZodNumber>;
    stock: z.ZodDefault<z.ZodNumber>;
    weight: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    sku: string;
    size: string;
    color: string;
    isActive: boolean;
    priceAdjustment: number;
    stock: number;
    colorHex?: string | undefined;
    weight?: number | undefined;
}, {
    sku: string;
    size: string;
    color: string;
    colorHex?: string | undefined;
    weight?: number | undefined;
    isActive?: boolean | undefined;
    priceAdjustment?: number | undefined;
    stock?: number | undefined;
}>;
export declare const categorySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
    parentId: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    metaTitle: z.ZodOptional<z.ZodString>;
    metaDesc: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    sortOrder: number;
    description?: string | undefined;
    metaTitle?: string | undefined;
    metaDesc?: string | undefined;
    parentId?: string | undefined;
    imageUrl?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    isActive?: boolean | undefined;
    sortOrder?: number | undefined;
    metaTitle?: string | undefined;
    metaDesc?: string | undefined;
    parentId?: string | undefined;
    imageUrl?: string | undefined;
}>;
export declare const subcategorySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodString;
    sortOrder: z.ZodDefault<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    categoryId: string;
    isActive: boolean;
    sortOrder: number;
    description?: string | undefined;
    imageUrl?: string | undefined;
}, {
    name: string;
    categoryId: string;
    description?: string | undefined;
    isActive?: boolean | undefined;
    sortOrder?: number | undefined;
    imageUrl?: string | undefined;
}>;
export declare const collectionSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    heroImageUrl: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    isFeatured: z.ZodDefault<z.ZodBoolean>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
    metaTitle: z.ZodOptional<z.ZodString>;
    metaDesc: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    isFeatured: boolean;
    sortOrder: number;
    description?: string | undefined;
    metaTitle?: string | undefined;
    metaDesc?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    heroImageUrl?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    isActive?: boolean | undefined;
    isFeatured?: boolean | undefined;
    sortOrder?: number | undefined;
    metaTitle?: string | undefined;
    metaDesc?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    heroImageUrl?: string | undefined;
}>;
export declare const couponSchema: z.ZodObject<{
    code: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    discountType: z.ZodEnum<["percentage", "fixed"]>;
    discountValue: z.ZodNumber;
    minOrderValue: z.ZodOptional<z.ZodNumber>;
    maxDiscount: z.ZodOptional<z.ZodNumber>;
    usageLimit: z.ZodOptional<z.ZodNumber>;
    perUserLimit: z.ZodDefault<z.ZodNumber>;
    applicableGender: z.ZodOptional<z.ZodEnum<["men", "women", "unisex"]>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    startDate: z.ZodString;
    endDate: z.ZodString;
}, "strip", z.ZodTypeAny, {
    discountType: "fixed" | "percentage";
    code: string;
    isActive: boolean;
    startDate: string;
    endDate: string;
    discountValue: number;
    perUserLimit: number;
    description?: string | undefined;
    minOrderValue?: number | undefined;
    maxDiscount?: number | undefined;
    usageLimit?: number | undefined;
    applicableGender?: "men" | "women" | "unisex" | undefined;
}, {
    discountType: "fixed" | "percentage";
    code: string;
    startDate: string;
    endDate: string;
    discountValue: number;
    description?: string | undefined;
    isActive?: boolean | undefined;
    minOrderValue?: number | undefined;
    maxDiscount?: number | undefined;
    usageLimit?: number | undefined;
    perUserLimit?: number | undefined;
    applicableGender?: "men" | "women" | "unisex" | undefined;
}>;
export declare const staticPageSchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodOptional<z.ZodAny>;
    template: z.ZodDefault<z.ZodString>;
    isPublished: z.ZodDefault<z.ZodBoolean>;
    metaTitle: z.ZodOptional<z.ZodString>;
    metaDesc: z.ZodOptional<z.ZodString>;
    ogImage: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    template: string;
    isPublished: boolean;
    content?: any;
    metaTitle?: string | undefined;
    metaDesc?: string | undefined;
    ogImage?: string | undefined;
}, {
    title: string;
    content?: any;
    template?: string | undefined;
    metaTitle?: string | undefined;
    metaDesc?: string | undefined;
    isPublished?: boolean | undefined;
    ogImage?: string | undefined;
}>;
export declare const homepageSectionSchema: z.ZodObject<{
    sectionType: z.ZodEnum<["hero_slider", "featured_collections", "new_arrivals", "categories_grid", "brand_story", "newsletter", "testimonials", "instagram_feed", "banner_promo", "product_grid", "custom_html"]>;
    title: z.ZodOptional<z.ZodString>;
    subtitle: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodAny>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    visibility: z.ZodDefault<z.ZodEnum<["all", "logged_in", "logged_out"]>>;
}, "strip", z.ZodTypeAny, {
    visibility: "all" | "logged_in" | "logged_out";
    isActive: boolean;
    sortOrder: number;
    sectionType: "brand_story" | "product_grid" | "newsletter" | "testimonials" | "hero_slider" | "featured_collections" | "new_arrivals" | "categories_grid" | "instagram_feed" | "banner_promo" | "custom_html";
    title?: string | undefined;
    content?: any;
    subtitle?: string | undefined;
}, {
    sectionType: "brand_story" | "product_grid" | "newsletter" | "testimonials" | "hero_slider" | "featured_collections" | "new_arrivals" | "categories_grid" | "instagram_feed" | "banner_promo" | "custom_html";
    visibility?: "all" | "logged_in" | "logged_out" | undefined;
    title?: string | undefined;
    content?: any;
    isActive?: boolean | undefined;
    sortOrder?: number | undefined;
    subtitle?: string | undefined;
}>;
export declare const navigationMenuSchema: z.ZodObject<{
    name: z.ZodString;
    location: z.ZodEnum<["header", "footer", "mobile", "sidebar"]>;
    items: z.ZodAny;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    location: "header" | "footer" | "mobile" | "sidebar";
    items?: any;
}, {
    name: string;
    location: "header" | "footer" | "mobile" | "sidebar";
    items?: any;
    isActive?: boolean | undefined;
}>;
export declare const checkoutSchema: z.ZodObject<{
    shippingAddressId: z.ZodString;
    billingAddressId: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    couponCode: z.ZodOptional<z.ZodString>;
    giftMessage: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    shippingAddressId: string;
    couponCode?: string | undefined;
    notes?: string | undefined;
    giftMessage?: string | undefined;
    billingAddressId?: string | undefined;
}, {
    email: string;
    shippingAddressId: string;
    couponCode?: string | undefined;
    notes?: string | undefined;
    giftMessage?: string | undefined;
    billingAddressId?: string | undefined;
}>;
export declare const reviewSchema: z.ZodObject<{
    productId: z.ZodString;
    orderId: z.ZodOptional<z.ZodString>;
    rating: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
    images: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    productId: string;
    images: string[];
    rating: number;
    body?: string | undefined;
    title?: string | undefined;
    orderId?: string | undefined;
}, {
    productId: string;
    rating: number;
    body?: string | undefined;
    title?: string | undefined;
    images?: string[] | undefined;
    orderId?: string | undefined;
}>;
export declare const contactSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
    message: string;
    phone?: string | undefined;
    subject?: string | undefined;
}, {
    email: string;
    name: string;
    message: string;
    phone?: string | undefined;
    subject?: string | undefined;
}>;
export declare const newsletterSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const lookbookSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    coverImageUrl: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    coverImageUrl: string;
    isActive: boolean;
    sortOrder: number;
    description?: string | undefined;
}, {
    name: string;
    coverImageUrl: string;
    description?: string | undefined;
    isActive?: boolean | undefined;
    sortOrder?: number | undefined;
}>;
export declare const lookbookItemSchema: z.ZodObject<{
    imageUrl: z.ZodString;
    productId: z.ZodOptional<z.ZodString>;
    hotspotX: z.ZodOptional<z.ZodNumber>;
    hotspotY: z.ZodOptional<z.ZodNumber>;
    caption: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    sortOrder: number;
    imageUrl: string;
    productId?: string | undefined;
    caption?: string | undefined;
    hotspotX?: number | undefined;
    hotspotY?: number | undefined;
}, {
    imageUrl: string;
    productId?: string | undefined;
    caption?: string | undefined;
    sortOrder?: number | undefined;
    hotspotX?: number | undefined;
    hotspotY?: number | undefined;
}>;
export declare const siteSettingsSchema: z.ZodObject<{
    siteName: z.ZodString;
    tagline: z.ZodOptional<z.ZodString>;
    logoUrl: z.ZodOptional<z.ZodString>;
    faviconUrl: z.ZodOptional<z.ZodString>;
    ogImageUrl: z.ZodOptional<z.ZodString>;
    currency: z.ZodDefault<z.ZodString>;
    taxRate: z.ZodDefault<z.ZodNumber>;
    freeShippingThreshold: z.ZodOptional<z.ZodNumber>;
    shippingInfo: z.ZodOptional<z.ZodAny>;
    returnPolicy: z.ZodOptional<z.ZodAny>;
    aboutUs: z.ZodOptional<z.ZodAny>;
    contactEmail: z.ZodOptional<z.ZodString>;
    contactPhone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    googleAnalyticsId: z.ZodOptional<z.ZodString>;
    facebookPixelId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    siteName: string;
    taxRate: number;
    address?: string | undefined;
    facebookPixelId?: string | undefined;
    tagline?: string | undefined;
    logoUrl?: string | undefined;
    faviconUrl?: string | undefined;
    contactEmail?: string | undefined;
    contactPhone?: string | undefined;
    freeShippingThreshold?: number | undefined;
    ogImageUrl?: string | undefined;
    shippingInfo?: any;
    returnPolicy?: any;
    aboutUs?: any;
    googleAnalyticsId?: string | undefined;
}, {
    siteName: string;
    currency?: string | undefined;
    address?: string | undefined;
    facebookPixelId?: string | undefined;
    tagline?: string | undefined;
    logoUrl?: string | undefined;
    faviconUrl?: string | undefined;
    contactEmail?: string | undefined;
    contactPhone?: string | undefined;
    taxRate?: number | undefined;
    freeShippingThreshold?: number | undefined;
    ogImageUrl?: string | undefined;
    shippingInfo?: any;
    returnPolicy?: any;
    aboutUs?: any;
    googleAnalyticsId?: string | undefined;
}>;
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
