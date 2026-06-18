// ─────────────────────────────────────────────────────────────
// API INPUT VALIDATION — Zod-based request body validation
// ─────────────────────────────────────────────────────────────

import { z } from "zod";
import { badRequest } from "./response";

export type ValidationSchema<T> = z.ZodType<T>;

/**
 * Parse and validate a JSON request body against a Zod schema.
 * Returns the parsed data on success, or a 400 Response on failure.
 */
export async function validateBody<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<{ data: T } | { response: Response }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`
      );
      return {
        response: badRequest(`Validation failed: ${messages.join("; ")}`),
      };
    }
    return { data: result.data };
  } catch {
    return { response: badRequest("Invalid JSON in request body") };
  }
}

/**
 * Common validators used across API handlers.
 */
export const emailSchema = z.string().email("Invalid email address");
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long");
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name too long");

export const addressSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
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
