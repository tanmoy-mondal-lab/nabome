// ─────────────────────────────────────────────────────────────
// API INPUT VALIDATION — Zod-based request body validation
// ─────────────────────────────────────────────────────────────

import { z } from "zod";
import { badRequest } from "./response";
import { ErrorCode } from "./types";

export type ValidationSchema<T> = z.ZodType<T>;

/**
 * Parse and validate a JSON request body against a Zod schema.
 * Returns the parsed data on success, or a 400 Response on failure.
 */
export async function validateBody<T>(
  request: Request,
  schema: z.ZodType<T>,
  requestId?: string
): Promise<{ data: T } | { response: Response }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`
      );
      return {
        response: badRequest(
          `Validation failed: ${messages.join("; ")}`,
          { fields: result.error.issues.map(i => ({ field: i.path.join("."), message: i.message })) },
          requestId
        ),
      };
    }
    return { data: result.data };
  } catch {
    return { response: badRequest("Invalid JSON in request body", undefined, requestId) };
  }
}

/**
 * Common validators used across API handlers.
 */
export const emailSchema = z.string().email("Invalid email address");
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name too long");

export const addressSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  district: z.string().optional(),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(6, "Valid pincode is required").max(10),
  country: z.string().min(1, "Country is required").default("India"),
  phone: z.string().min(10, "Valid phone number required").max(15),
});

export const authRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema.optional(),
  phone: z.string().optional(),
});

export const authLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().min(10, "Review must be at least 10 characters").max(5000),
});

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: z.string().optional(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
  orderId: z.string().optional(),
});

export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["cod", "razorpay"]),
  notes: z.string().max(500).optional(),
});

// Product validation schemas
export const productCreateSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  slug: z.string().min(1, "Slug is required").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
  price: z.number().min(0, "Price must be positive"),
  compareAtPrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  sku: z.string().min(1).max(100).optional(),
  barcode: z.string().max(100).optional(),
  trackQuantity: z.boolean().default(true),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  images: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

// Category validation schemas
export const categoryCreateSchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

// Order validation schemas
export const orderUpdateSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]),
  trackingNumber: z.string().max(100).optional(),
  internalNotes: z.string().max(2000).optional(),
});

// Coupon validation schemas
export const couponCreateSchema = z.object({
  code: z.string().min(1, "Coupon code is required").max(50).toUpperCase(),
  description: z.string().max(500).optional(),
  discountType: z.enum(["percentage", "fixed", "free_shipping"]),
  discountValue: z.number().min(0, "Discount value must be positive"),
  minimumPurchase: z.number().min(0).default(0),
  maximumDiscount: z.number().min(0).optional(),
  usageLimit: z.number().min(1).optional(),
  usageLimitPerUser: z.number().min(1).default(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  applicableCategories: z.array(z.string()).optional(),
  applicableProducts: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

// Address validation schemas
export const addressCreateSchema = addressSchema.extend({
  isDefault: z.boolean().default(false),
  label: z.string().max(50).optional(),
});

// Review validation schemas (extended)
export const reviewUpdateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(200).optional(),
  body: z.string().min(10).max(5000).optional(),
  isVerified: z.boolean().optional(),
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["asc", "desc"]).optional(),
  sortBy: z.string().optional(),
});

// Search validation
export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(200),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const paymentVerifySchema = z.object({
  razorpayPaymentId: z.string().min(1, "Payment ID is required"),
  razorpayOrderId: z.string().min(1, "Razorpay order ID is required"),
  razorpaySignature: z.string().min(1, "Signature is required"),
  orderId: z.string().min(1, "Order ID is required"),
});

export const paymentFailedSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  razorpayOrderId: z.string().min(1, "Razorpay order ID is required"),
  errorCode: z.string().optional(),
  errorDescription: z.string().optional(),
});

export const paymentRetrySchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

export const refundSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  amount: z.number().positive().optional(),
  returnRequestId: z.string().optional(),
});

export const cartSyncSchema = z.object({
  items: z.array(z.object({
    variantId: z.string().min(1),
    quantity: z.number().int().min(1).max(20),
  })),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const verifyResetCodeSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().regex(/^\d{6}$/, "Code must be a 6-digit number"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().regex(/^\d{6}$/, "Code must be a 6-digit number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().regex(/^\d{6}$/, "Code must be a 6-digit number"),
});
