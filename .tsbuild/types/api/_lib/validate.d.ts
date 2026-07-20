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
 * Parse and validate URL query parameters against a Zod schema.
 * Returns the parsed data on success, or a 400 Response on failure.
 */
export declare function validateQuery<T>(url: URL, schema: z.ZodType<T>, requestId?: string): {
    data: T;
} | {
    response: Response;
};
/**
 * Validate path parameters against a Zod schema.
 * Returns the parsed data on success, or a 400 Response on failure.
 */
export declare function validateParams<T>(params: Record<string, string>, schema: z.ZodType<T>, requestId?: string): {
    data: T;
} | {
    response: Response;
};
/**
 * Common validators used across API handlers.
 */
export declare const emailSchema: z.ZodString;
export declare const passwordSchema: z.ZodString;
export declare const nameSchema: z.ZodString;
export declare const addressSchema: z.ZodObject<{
    fullName: z.ZodString;
    phone: z.ZodString;
    line1: z.ZodString;
    line2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    district: z.ZodOptional<z.ZodString>;
    state: z.ZodString;
    pincode: z.ZodString;
    country: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    phone: string;
    fullName: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    line2?: string | undefined;
    district?: string | undefined;
}, {
    phone: string;
    fullName: string;
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
    rememberMe: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    rememberMe: boolean;
}, {
    email: string;
    password: string;
    rememberMe?: boolean | undefined;
}>;
export declare const reviewSchema: z.ZodObject<{
    productId: z.ZodString;
    rating: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    body: z.ZodString;
}, "strip", z.ZodTypeAny, {
    body: string;
    rating: number;
    productId: string;
    title?: string | undefined;
}, {
    body: string;
    rating: number;
    productId: string;
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
    subject: string;
    message: string;
    phone?: string | undefined;
    orderId?: string | undefined;
}, {
    name: string;
    email: string;
    subject: string;
    message: string;
    phone?: string | undefined;
    orderId?: string | undefined;
}>;
export declare const checkoutSchema: z.ZodObject<{
    shippingAddress: z.ZodObject<{
        fullName: z.ZodString;
        phone: z.ZodString;
        line1: z.ZodString;
        line2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        district: z.ZodOptional<z.ZodString>;
        state: z.ZodString;
        pincode: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        phone: string;
        fullName: string;
        line1: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
        line2?: string | undefined;
        district?: string | undefined;
    }, {
        phone: string;
        fullName: string;
        line1: string;
        city: string;
        state: string;
        pincode: string;
        line2?: string | undefined;
        district?: string | undefined;
        country?: string | undefined;
    }>;
    billingAddress: z.ZodOptional<z.ZodObject<{
        fullName: z.ZodString;
        phone: z.ZodString;
        line1: z.ZodString;
        line2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        district: z.ZodOptional<z.ZodString>;
        state: z.ZodString;
        pincode: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        phone: string;
        fullName: string;
        line1: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
        line2?: string | undefined;
        district?: string | undefined;
    }, {
        phone: string;
        fullName: string;
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
    shippingAddress: {
        phone: string;
        fullName: string;
        line1: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
        line2?: string | undefined;
        district?: string | undefined;
    };
    paymentMethod: "cod" | "razorpay";
    couponCode?: string | undefined;
    notes?: string | undefined;
    billingAddress?: {
        phone: string;
        fullName: string;
        line1: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
        line2?: string | undefined;
        district?: string | undefined;
    } | undefined;
}, {
    shippingAddress: {
        phone: string;
        fullName: string;
        line1: string;
        city: string;
        state: string;
        pincode: string;
        line2?: string | undefined;
        district?: string | undefined;
        country?: string | undefined;
    };
    paymentMethod: "cod" | "razorpay";
    couponCode?: string | undefined;
    notes?: string | undefined;
    billingAddress?: {
        phone: string;
        fullName: string;
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
    status: "active" | "draft" | "archived";
    name: string;
    price: number;
    description: string;
    slug: string;
    categoryId: string;
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
    price: number;
    description: string;
    slug: string;
    categoryId: string;
    status?: "active" | "draft" | "archived" | undefined;
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
    status?: "active" | "draft" | "archived" | undefined;
    name?: string | undefined;
    price?: number | undefined;
    images?: string[] | undefined;
    description?: string | undefined;
    slug?: string | undefined;
    categoryId?: string | undefined;
    brandId?: string | undefined;
    compareAtPrice?: number | undefined;
    costPrice?: number | undefined;
    sku?: string | undefined;
    tags?: string[] | undefined;
    barcode?: string | undefined;
    trackQuantity?: boolean | undefined;
}, {
    status?: "active" | "draft" | "archived" | undefined;
    name?: string | undefined;
    price?: number | undefined;
    images?: string[] | undefined;
    description?: string | undefined;
    slug?: string | undefined;
    categoryId?: string | undefined;
    brandId?: string | undefined;
    compareAtPrice?: number | undefined;
    costPrice?: number | undefined;
    sku?: string | undefined;
    tags?: string[] | undefined;
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
    image?: string | undefined;
    description?: string | undefined;
    parentId?: string | undefined;
}, {
    name: string;
    slug: string;
    isActive?: boolean | undefined;
    image?: string | undefined;
    description?: string | undefined;
    sortOrder?: number | undefined;
    parentId?: string | undefined;
}>;
export declare const orderUpdateSchema: z.ZodObject<{
    status: z.ZodEnum<["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]>;
    trackingNumber: z.ZodOptional<z.ZodString>;
    internalNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "processing" | "confirmed" | "shipped" | "delivered" | "cancelled" | "refunded";
    trackingNumber?: string | undefined;
    internalNotes?: string | undefined;
}, {
    status: "pending" | "processing" | "confirmed" | "shipped" | "delivered" | "cancelled" | "refunded";
    trackingNumber?: string | undefined;
    internalNotes?: string | undefined;
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
    discountType: "fixed" | "percentage" | "free_shipping";
    discountValue: number;
    startDate: string;
    endDate: string;
    minimumPurchase: number;
    usageLimitPerUser: number;
    description?: string | undefined;
    usageLimit?: number | undefined;
    maximumDiscount?: number | undefined;
    applicableCategories?: string[] | undefined;
    applicableProducts?: string[] | undefined;
}, {
    code: string;
    discountType: "fixed" | "percentage" | "free_shipping";
    discountValue: number;
    startDate: string;
    endDate: string;
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
    fullName: z.ZodString;
    phone: z.ZodString;
    line1: z.ZodString;
    line2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    district: z.ZodOptional<z.ZodString>;
    state: z.ZodString;
    pincode: z.ZodString;
    country: z.ZodDefault<z.ZodString>;
} & {
    isDefault: z.ZodDefault<z.ZodBoolean>;
    label: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    phone: string;
    fullName: string;
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
    fullName: string;
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
    limit: number;
    page: number;
    sort?: "desc" | "asc" | undefined;
    sortBy?: string | undefined;
}, {
    sort?: "desc" | "asc" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
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
    limit: number;
    page: number;
    category?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    inStock?: boolean | undefined;
}, {
    query: string;
    limit?: number | undefined;
    page?: number | undefined;
    category?: string | undefined;
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
    amount?: number | undefined;
    returnRequestId?: string | undefined;
}, {
    orderId: string;
    amount?: number | undefined;
    returnRequestId?: string | undefined;
}>;
export declare const cartSyncSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        variantId: z.ZodString;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        variantId: string;
    }, {
        quantity: number;
        variantId: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        quantity: number;
        variantId: string;
    }[];
}, {
    items: {
        quantity: number;
        variantId: string;
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
    password: string;
    code: string;
}, {
    email: string;
    password: string;
    code: string;
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
export declare const resendVerificationSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    preferences: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    avatarUrl?: string | null | undefined;
    preferences?: Record<string, unknown> | undefined;
}, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    avatarUrl?: string | null | undefined;
    preferences?: Record<string, unknown> | undefined;
}>;
export declare const emailChangeSchema: z.ZodObject<{
    newEmail: z.ZodString;
}, "strip", z.ZodTypeAny, {
    newEmail: string;
}, {
    newEmail: string;
}>;
export declare const cmsPageCreateSchema: z.ZodObject<{
    title: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    template: z.ZodDefault<z.ZodString>;
    isPublished: z.ZodDefault<z.ZodBoolean>;
    metaTitle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metaDesc: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ogImage: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    template: string;
    isPublished: boolean;
    slug?: string | undefined;
    metaTitle?: string | null | undefined;
    metaDesc?: string | null | undefined;
    content?: Record<string, unknown> | undefined;
    ogImage?: string | null | undefined;
}, {
    title: string;
    slug?: string | undefined;
    metaTitle?: string | null | undefined;
    metaDesc?: string | null | undefined;
    content?: Record<string, unknown> | undefined;
    template?: string | undefined;
    isPublished?: boolean | undefined;
    ogImage?: string | null | undefined;
}>;
export declare const cmsPageUpdateSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    content: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    template: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    isPublished: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    metaTitle: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    metaDesc: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    ogImage: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    slug?: string | undefined;
    metaTitle?: string | null | undefined;
    metaDesc?: string | null | undefined;
    content?: Record<string, unknown> | undefined;
    template?: string | undefined;
    isPublished?: boolean | undefined;
    ogImage?: string | null | undefined;
}, {
    title?: string | undefined;
    slug?: string | undefined;
    metaTitle?: string | null | undefined;
    metaDesc?: string | null | undefined;
    content?: Record<string, unknown> | undefined;
    template?: string | undefined;
    isPublished?: boolean | undefined;
    ogImage?: string | null | undefined;
}>;
export declare const cmsHomeSectionSchema: z.ZodObject<{
    type: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive: boolean;
    type: string;
    sortOrder: number;
    title?: string | undefined;
    content?: Record<string, unknown> | undefined;
}, {
    type: string;
    isActive?: boolean | undefined;
    title?: string | undefined;
    sortOrder?: number | undefined;
    content?: Record<string, unknown> | undefined;
}>;
export declare const cmsHomeSectionUpdateSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    content: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    sortOrder: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    type?: string | undefined;
    title?: string | undefined;
    sortOrder?: number | undefined;
    content?: Record<string, unknown> | undefined;
}, {
    isActive?: boolean | undefined;
    type?: string | undefined;
    title?: string | undefined;
    sortOrder?: number | undefined;
    content?: Record<string, unknown> | undefined;
}>;
export declare const cmsNavigationSchema: z.ZodObject<{
    name: z.ZodString;
    location: z.ZodEnum<["header", "footer", "mobile", "sidebar"]>;
    items: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    items: Record<string, unknown>[];
    location: "header" | "footer" | "mobile" | "sidebar";
}, {
    name: string;
    items: Record<string, unknown>[];
    location: "header" | "footer" | "mobile" | "sidebar";
    isActive?: boolean | undefined;
}>;
export declare const cmsNavigationUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodEnum<["header", "footer", "mobile", "sidebar"]>>;
    items: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    items?: Record<string, unknown>[] | undefined;
    location?: "header" | "footer" | "mobile" | "sidebar" | undefined;
}, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    items?: Record<string, unknown>[] | undefined;
    location?: "header" | "footer" | "mobile" | "sidebar" | undefined;
}>;
export declare const cmsFooterSchema: z.ZodObject<{
    column: z.ZodDefault<z.ZodNumber>;
    title: z.ZodString;
    contentType: z.ZodDefault<z.ZodString>;
    content: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive: boolean;
    title: string;
    sortOrder: number;
    column: number;
    contentType: string;
    content?: Record<string, unknown> | undefined;
}, {
    title: string;
    isActive?: boolean | undefined;
    sortOrder?: number | undefined;
    content?: Record<string, unknown> | undefined;
    column?: number | undefined;
    contentType?: string | undefined;
}>;
export declare const cmsFooterUpdateSchema: z.ZodObject<{
    column: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    title: z.ZodOptional<z.ZodString>;
    contentType: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    content: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    sortOrder: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    title?: string | undefined;
    sortOrder?: number | undefined;
    content?: Record<string, unknown> | undefined;
    column?: number | undefined;
    contentType?: string | undefined;
}, {
    isActive?: boolean | undefined;
    title?: string | undefined;
    sortOrder?: number | undefined;
    content?: Record<string, unknown> | undefined;
    column?: number | undefined;
    contentType?: string | undefined;
}>;
export declare const cmsReorderSchema: z.ZodObject<{
    order: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sortOrder: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        sortOrder: number;
    }, {
        id: string;
        sortOrder: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    order: {
        id: string;
        sortOrder: number;
    }[];
}, {
    order: {
        id: string;
        sortOrder: number;
    }[];
}>;
export declare const settingsUpdateSchema: z.ZodObject<{
    siteName: z.ZodOptional<z.ZodString>;
    tagline: z.ZodOptional<z.ZodString>;
    logoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    logoPublicId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    faviconUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    faviconPublicId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ogImageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ogImagePublicId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    currency: z.ZodDefault<z.ZodString>;
    taxRate: z.ZodOptional<z.ZodNumber>;
    freeShippingThreshold: z.ZodOptional<z.ZodNumber>;
    shippingInfo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    returnPolicy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    aboutUs: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    contactEmail: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    contactPhone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    address: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    googleAnalyticsId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    facebookPixelId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    preferences: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    seo: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    preferences?: Record<string, unknown> | undefined;
    logoUrl?: string | null | undefined;
    logoPublicId?: string | null | undefined;
    siteName?: string | undefined;
    tagline?: string | undefined;
    faviconUrl?: string | null | undefined;
    faviconPublicId?: string | null | undefined;
    ogImageUrl?: string | null | undefined;
    ogImagePublicId?: string | null | undefined;
    taxRate?: number | undefined;
    freeShippingThreshold?: number | undefined;
    shippingInfo?: string | null | undefined;
    returnPolicy?: string | null | undefined;
    aboutUs?: string | null | undefined;
    contactEmail?: string | null | undefined;
    contactPhone?: string | null | undefined;
    address?: string | null | undefined;
    googleAnalyticsId?: string | null | undefined;
    facebookPixelId?: string | null | undefined;
    theme?: Record<string, unknown> | undefined;
    seo?: Record<string, unknown> | undefined;
}, {
    preferences?: Record<string, unknown> | undefined;
    currency?: string | undefined;
    logoUrl?: string | null | undefined;
    logoPublicId?: string | null | undefined;
    siteName?: string | undefined;
    tagline?: string | undefined;
    faviconUrl?: string | null | undefined;
    faviconPublicId?: string | null | undefined;
    ogImageUrl?: string | null | undefined;
    ogImagePublicId?: string | null | undefined;
    taxRate?: number | undefined;
    freeShippingThreshold?: number | undefined;
    shippingInfo?: string | null | undefined;
    returnPolicy?: string | null | undefined;
    aboutUs?: string | null | undefined;
    contactEmail?: string | null | undefined;
    contactPhone?: string | null | undefined;
    address?: string | null | undefined;
    googleAnalyticsId?: string | null | undefined;
    facebookPixelId?: string | null | undefined;
    theme?: Record<string, unknown> | undefined;
    seo?: Record<string, unknown> | undefined;
}>;
export declare const socialLinkCreateSchema: z.ZodObject<{
    platform: z.ZodEnum<["instagram", "facebook", "twitter", "youtube", "linkedin", "pinterest", "tiktok", "whatsapp", "other"]>;
    url: z.ZodString;
    label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    icon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    isActive: boolean;
    url: string;
    sortOrder: number;
    platform: "other" | "instagram" | "facebook" | "twitter" | "youtube" | "linkedin" | "pinterest" | "tiktok" | "whatsapp";
    label?: string | null | undefined;
    icon?: string | null | undefined;
}, {
    url: string;
    platform: "other" | "instagram" | "facebook" | "twitter" | "youtube" | "linkedin" | "pinterest" | "tiktok" | "whatsapp";
    isActive?: boolean | undefined;
    label?: string | null | undefined;
    sortOrder?: number | undefined;
    icon?: string | null | undefined;
}>;
export declare const socialLinkUpdateSchema: z.ZodObject<{
    platform: z.ZodOptional<z.ZodEnum<["instagram", "facebook", "twitter", "youtube", "linkedin", "pinterest", "tiktok", "whatsapp", "other"]>>;
    url: z.ZodOptional<z.ZodString>;
    label: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    icon: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    sortOrder: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    url?: string | undefined;
    label?: string | null | undefined;
    sortOrder?: number | undefined;
    platform?: "other" | "instagram" | "facebook" | "twitter" | "youtube" | "linkedin" | "pinterest" | "tiktok" | "whatsapp" | undefined;
    icon?: string | null | undefined;
}, {
    isActive?: boolean | undefined;
    url?: string | undefined;
    label?: string | null | undefined;
    sortOrder?: number | undefined;
    platform?: "other" | "instagram" | "facebook" | "twitter" | "youtube" | "linkedin" | "pinterest" | "tiktok" | "whatsapp" | undefined;
    icon?: string | null | undefined;
}>;
export declare const templateCreateSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    category: z.ZodDefault<z.ZodString>;
    thumbnail: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    thumbnailPublicId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sections: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    category: string;
    sections: Record<string, unknown>;
    metadata?: Record<string, unknown> | undefined;
    description?: string | null | undefined;
    thumbnail?: string | null | undefined;
    thumbnailPublicId?: string | null | undefined;
}, {
    name: string;
    sections: Record<string, unknown>;
    metadata?: Record<string, unknown> | undefined;
    description?: string | null | undefined;
    category?: string | undefined;
    thumbnail?: string | null | undefined;
    thumbnailPublicId?: string | null | undefined;
}>;
export declare const templateUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    category: z.ZodOptional<z.ZodString>;
    thumbnail: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    thumbnailPublicId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sections: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    metadata?: Record<string, unknown> | undefined;
    description?: string | null | undefined;
    category?: string | undefined;
    thumbnail?: string | null | undefined;
    thumbnailPublicId?: string | null | undefined;
    sections?: Record<string, unknown> | undefined;
}, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    metadata?: Record<string, unknown> | undefined;
    description?: string | null | undefined;
    category?: string | undefined;
    thumbnail?: string | null | undefined;
    thumbnailPublicId?: string | null | undefined;
    sections?: Record<string, unknown> | undefined;
}>;
export declare const templateApplySchema: z.ZodObject<{
    pageId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    pageId: string;
}, {
    pageId: string;
}>;
export declare const relatedProductCreateSchema: z.ZodObject<{
    sourceId: z.ZodString;
    targetId: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["related", "upsell", "cross_sell"]>>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "related" | "upsell" | "cross_sell";
    sortOrder: number;
    sourceId: string;
    targetId: string;
}, {
    sourceId: string;
    targetId: string;
    type?: "related" | "upsell" | "cross_sell" | undefined;
    sortOrder?: number | undefined;
}>;
export declare const relatedProductReorderSchema: z.ZodObject<{
    order: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sortOrder: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        sortOrder: number;
    }, {
        id: string;
        sortOrder: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    order: {
        id: string;
        sortOrder: number;
    }[];
}, {
    order: {
        id: string;
        sortOrder: number;
    }[];
}>;
export declare const sizeGuideCreateSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    categoryId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type: z.ZodDefault<z.ZodString>;
    unit: z.ZodDefault<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    imagePublicId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    measurements: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: string;
    unit: string;
    measurements: Record<string, unknown>;
    description?: string | null | undefined;
    categoryId?: string | null | undefined;
    imageUrl?: string | null | undefined;
    imagePublicId?: string | null | undefined;
}, {
    name: string;
    measurements: Record<string, unknown>;
    type?: string | undefined;
    description?: string | null | undefined;
    categoryId?: string | null | undefined;
    imageUrl?: string | null | undefined;
    imagePublicId?: string | null | undefined;
    unit?: string | undefined;
}>;
export declare const sizeGuideUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    categoryId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type: z.ZodOptional<z.ZodString>;
    unit: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    imagePublicId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    measurements: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    type?: string | undefined;
    description?: string | null | undefined;
    categoryId?: string | null | undefined;
    imageUrl?: string | null | undefined;
    imagePublicId?: string | null | undefined;
    unit?: string | undefined;
    measurements?: Record<string, unknown> | undefined;
}, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    type?: string | undefined;
    description?: string | null | undefined;
    categoryId?: string | null | undefined;
    imageUrl?: string | null | undefined;
    imagePublicId?: string | null | undefined;
    unit?: string | undefined;
    measurements?: Record<string, unknown> | undefined;
}>;
