import { z } from "zod";
export type ValidationSchema<T> = z.ZodType<T>;
/**
 * Parse and validate a JSON request body against a Zod schema.
 * Returns the parsed data on success, or a 400 Response on failure.
 */
export declare function validateBody<T>(request: Request, schema: z.ZodType<T>, requestId?: string): Promise<{
    data: T;
} | {
    response: Response;
}>;
/**
 * Common validators used across API handlers.
 */
export declare const emailSchema: z.ZodString;
export declare const passwordSchema: z.ZodString;
export declare const nameSchema: z.ZodString;
export declare const addressSchema: z.ZodObject<{
    line1: z.ZodString;
    line2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    district: z.ZodOptional<z.ZodString>;
    state: z.ZodString;
    pincode: z.ZodString;
    country: z.ZodDefault<z.ZodString>;
    phone: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phone: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    line2?: string | undefined;
    district?: string | undefined;
}, {
    phone: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
    line2?: string | undefined;
    district?: string | undefined;
    country?: string | undefined;
}>;
export declare const authRegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    password: string;
    lastName?: string | undefined;
    phone?: string | undefined;
}, {
    email: string;
    firstName: string;
    password: string;
    lastName?: string | undefined;
    phone?: string | undefined;
}>;
export declare const authLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const reviewSchema: z.ZodObject<{
    productId: z.ZodString;
    rating: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    body: z.ZodString;
}, "strip", z.ZodTypeAny, {
    body: string;
    productId: string;
    rating: number;
    title?: string | undefined;
}, {
    body: string;
    productId: string;
    rating: number;
    title?: string | undefined;
}>;
export declare const contactSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    subject: z.ZodString;
    message: z.ZodString;
    orderId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    message: string;
    subject: string;
    phone?: string | undefined;
    orderId?: string | undefined;
}, {
    name: string;
    email: string;
    message: string;
    subject: string;
    phone?: string | undefined;
    orderId?: string | undefined;
}>;
export declare const checkoutSchema: z.ZodObject<{
    shippingAddress: z.ZodObject<{
        line1: z.ZodString;
        line2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        district: z.ZodOptional<z.ZodString>;
        state: z.ZodString;
        pincode: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
        phone: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        phone: string;
        line1: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
        line2?: string | undefined;
        district?: string | undefined;
    }, {
        phone: string;
        line1: string;
        city: string;
        state: string;
        pincode: string;
        line2?: string | undefined;
        district?: string | undefined;
        country?: string | undefined;
    }>;
    billingAddress: z.ZodOptional<z.ZodObject<{
        line1: z.ZodString;
        line2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        district: z.ZodOptional<z.ZodString>;
        state: z.ZodString;
        pincode: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
        phone: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        phone: string;
        line1: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
        line2?: string | undefined;
        district?: string | undefined;
    }, {
        phone: string;
        line1: string;
        city: string;
        state: string;
        pincode: string;
        line2?: string | undefined;
        district?: string | undefined;
        country?: string | undefined;
    }>>;
    couponCode: z.ZodOptional<z.ZodString>;
    paymentMethod: z.ZodEnum<["cod", "razorpay"]>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    paymentMethod: "cod" | "razorpay";
    shippingAddress: {
        phone: string;
        line1: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
        line2?: string | undefined;
        district?: string | undefined;
    };
    couponCode?: string | undefined;
    notes?: string | undefined;
    billingAddress?: {
        phone: string;
        line1: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
        line2?: string | undefined;
        district?: string | undefined;
    } | undefined;
}, {
    paymentMethod: "cod" | "razorpay";
    shippingAddress: {
        phone: string;
        line1: string;
        city: string;
        state: string;
        pincode: string;
        line2?: string | undefined;
        district?: string | undefined;
        country?: string | undefined;
    };
    couponCode?: string | undefined;
    notes?: string | undefined;
    billingAddress?: {
        phone: string;
        line1: string;
        city: string;
        state: string;
        pincode: string;
        line2?: string | undefined;
        district?: string | undefined;
        country?: string | undefined;
    } | undefined;
}>;
export declare const productCreateSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodString;
    price: z.ZodNumber;
    compareAtPrice: z.ZodOptional<z.ZodNumber>;
    costPrice: z.ZodOptional<z.ZodNumber>;
    sku: z.ZodOptional<z.ZodString>;
    barcode: z.ZodOptional<z.ZodString>;
    trackQuantity: z.ZodDefault<z.ZodBoolean>;
    categoryId: z.ZodString;
    brandId: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["draft", "active", "archived"]>>;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "draft" | "active" | "archived";
    name: string;
    description: string;
    slug: string;
    categoryId: string;
    price: number;
    trackQuantity: boolean;
    images?: string[] | undefined;
    brandId?: string | undefined;
    compareAtPrice?: number | undefined;
    costPrice?: number | undefined;
    sku?: string | undefined;
    tags?: string[] | undefined;
    barcode?: string | undefined;
}, {
    name: string;
    description: string;
    slug: string;
    categoryId: string;
    price: number;
    status?: "draft" | "active" | "archived" | undefined;
    images?: string[] | undefined;
    brandId?: string | undefined;
    compareAtPrice?: number | undefined;
    costPrice?: number | undefined;
    sku?: string | undefined;
    tags?: string[] | undefined;
    barcode?: string | undefined;
    trackQuantity?: boolean | undefined;
}>;
export declare const productUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
    compareAtPrice: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    costPrice: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    sku: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    barcode: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    trackQuantity: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    categoryId: z.ZodOptional<z.ZodString>;
    brandId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["draft", "active", "archived"]>>>;
    images: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    tags: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    status?: "draft" | "active" | "archived" | undefined;
    name?: string | undefined;
    images?: string[] | undefined;
    description?: string | undefined;
    slug?: string | undefined;
    categoryId?: string | undefined;
    brandId?: string | undefined;
    compareAtPrice?: number | undefined;
    costPrice?: number | undefined;
    sku?: string | undefined;
    tags?: string[] | undefined;
    price?: number | undefined;
    barcode?: string | undefined;
    trackQuantity?: boolean | undefined;
}, {
    status?: "draft" | "active" | "archived" | undefined;
    name?: string | undefined;
    images?: string[] | undefined;
    description?: string | undefined;
    slug?: string | undefined;
    categoryId?: string | undefined;
    brandId?: string | undefined;
    compareAtPrice?: number | undefined;
    costPrice?: number | undefined;
    sku?: string | undefined;
    tags?: string[] | undefined;
    price?: number | undefined;
    barcode?: string | undefined;
    trackQuantity?: boolean | undefined;
}>;
export declare const categoryCreateSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    image: z.ZodOptional<z.ZodString>;
    parentId: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    slug: string;
    sortOrder: number;
    description?: string | undefined;
    parentId?: string | undefined;
    image?: string | undefined;
}, {
    name: string;
    slug: string;
    isActive?: boolean | undefined;
    description?: string | undefined;
    parentId?: string | undefined;
    sortOrder?: number | undefined;
    image?: string | undefined;
}>;
export declare const orderUpdateSchema: z.ZodObject<{
    status: z.ZodEnum<["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]>;
    trackingNumber: z.ZodOptional<z.ZodString>;
    internalNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
    internalNotes?: string | undefined;
    trackingNumber?: string | undefined;
}, {
    status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
    internalNotes?: string | undefined;
    trackingNumber?: string | undefined;
}>;
export declare const couponCreateSchema: z.ZodObject<{
    code: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    discountType: z.ZodEnum<["percentage", "fixed", "free_shipping"]>;
    discountValue: z.ZodNumber;
    minimumPurchase: z.ZodDefault<z.ZodNumber>;
    maximumDiscount: z.ZodOptional<z.ZodNumber>;
    usageLimit: z.ZodOptional<z.ZodNumber>;
    usageLimitPerUser: z.ZodDefault<z.ZodNumber>;
    startDate: z.ZodString;
    endDate: z.ZodString;
    applicableCategories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    applicableProducts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive: boolean;
    code: string;
    startDate: string;
    endDate: string;
    discountType: "fixed" | "percentage" | "free_shipping";
    discountValue: number;
    minimumPurchase: number;
    usageLimitPerUser: number;
    description?: string | undefined;
    usageLimit?: number | undefined;
    maximumDiscount?: number | undefined;
    applicableCategories?: string[] | undefined;
    applicableProducts?: string[] | undefined;
}, {
    code: string;
    startDate: string;
    endDate: string;
    discountType: "fixed" | "percentage" | "free_shipping";
    discountValue: number;
    isActive?: boolean | undefined;
    description?: string | undefined;
    usageLimit?: number | undefined;
    minimumPurchase?: number | undefined;
    maximumDiscount?: number | undefined;
    usageLimitPerUser?: number | undefined;
    applicableCategories?: string[] | undefined;
    applicableProducts?: string[] | undefined;
}>;
export declare const addressCreateSchema: z.ZodObject<{
    line1: z.ZodString;
    line2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    district: z.ZodOptional<z.ZodString>;
    state: z.ZodString;
    pincode: z.ZodString;
    country: z.ZodDefault<z.ZodString>;
    phone: z.ZodString;
} & {
    isDefault: z.ZodDefault<z.ZodBoolean>;
    label: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    phone: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault: boolean;
    label?: string | undefined;
    line2?: string | undefined;
    district?: string | undefined;
}, {
    phone: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
    label?: string | undefined;
    line2?: string | undefined;
    district?: string | undefined;
    country?: string | undefined;
    isDefault?: boolean | undefined;
}>;
export declare const reviewUpdateSchema: z.ZodObject<{
    rating: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
    isVerified: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    body?: string | undefined;
    title?: string | undefined;
    rating?: number | undefined;
    isVerified?: boolean | undefined;
}, {
    body?: string | undefined;
    title?: string | undefined;
    rating?: number | undefined;
    isVerified?: boolean | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sort: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
    sortBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort?: "asc" | "desc" | undefined;
    sortBy?: string | undefined;
}, {
    page?: number | undefined;
    sort?: "asc" | "desc" | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
}>;
export declare const searchSchema: z.ZodObject<{
    query: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    minPrice: z.ZodOptional<z.ZodNumber>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
    inStock: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    query: string;
    page: number;
    limit: number;
    category?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    inStock?: boolean | undefined;
}, {
    query: string;
    page?: number | undefined;
    category?: string | undefined;
    limit?: number | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    inStock?: boolean | undefined;
}>;
export declare const paymentVerifySchema: z.ZodObject<{
    razorpayPaymentId: z.ZodString;
    razorpayOrderId: z.ZodString;
    razorpaySignature: z.ZodString;
    orderId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}, {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}>;
export declare const paymentFailedSchema: z.ZodObject<{
    orderId: z.ZodString;
    razorpayOrderId: z.ZodString;
    errorCode: z.ZodOptional<z.ZodString>;
    errorDescription: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    razorpayOrderId: string;
    errorCode?: string | undefined;
    errorDescription?: string | undefined;
}, {
    orderId: string;
    razorpayOrderId: string;
    errorCode?: string | undefined;
    errorDescription?: string | undefined;
}>;
export declare const paymentRetrySchema: z.ZodObject<{
    orderId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    orderId: string;
}, {
    orderId: string;
}>;
export declare const refundSchema: z.ZodObject<{
    orderId: z.ZodString;
    amount: z.ZodOptional<z.ZodNumber>;
    returnRequestId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    returnRequestId?: string | undefined;
    amount?: number | undefined;
}, {
    orderId: string;
    returnRequestId?: string | undefined;
    amount?: number | undefined;
}>;
export declare const cartSyncSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        variantId: z.ZodString;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        variantId: string;
        quantity: number;
    }, {
        variantId: string;
        quantity: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        variantId: string;
        quantity: number;
    }[];
}, {
    items: {
        variantId: string;
        quantity: number;
    }[];
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const verifyResetCodeSchema: z.ZodObject<{
    email: z.ZodString;
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    code: string;
}, {
    email: string;
    code: string;
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    email: z.ZodString;
    code: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    code: string;
    password: string;
}, {
    email: string;
    code: string;
    password: string;
}>;
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export declare const verifyEmailSchema: z.ZodObject<{
    email: z.ZodString;
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    code: string;
}, {
    email: string;
    code: string;
}>;
