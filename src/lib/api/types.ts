// API Response Types for NABOME
// Re-export from shared types to maintain single source of truth

export type {
  Pagination,
  ApiSuccessResponse,
  ApiErrorResponse,
  PaginatedResponse,
} from "../../types/common";

export type {
  DashboardData,
  Profile,
  AdminDashboard,
  AuthResponse,
  AuthSession,
} from "../../types/customer";

export type {
  Order,
  OrderItem,
  OrderStatusHistory,
  OrderTracking,
  OrderStats,
} from "../../types/order";

export type {
  Address,
  AddressInput,
} from "../../types/address";

export type {
  Product,
  ProductImage,
  ProductVariant,
  Category,
  Brand,
  Collection,
} from "../../types/product";

export type {
  Coupon,
  CouponRedemption,
} from "../../types/coupon";

export type {
  MediaType,
  EntityType,
  UploadOptions,
  UploadResult,
  ValidationResult,
} from "../../types/media";

// Additional API-specific types not in shared types
export interface WishlistItem {
  id: string;
  variantId: string;
  variant: {
    id: string;
    product: {
      id: string;
      name: string;
      slug: string;
      basePrice: number;
      salePrice?: number;
      images: { url: string }[];
    };
    size: string;
    color: string;
    stock: number;
  };
  createdAt: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderItemId?: string;
  profileId: string;
  reason: string;
  reasonDetail?: string;
  status: string;
  evidenceImages: string[];
  adminNote?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface Refund {
  id: string;
  returnRequestId?: string;
  orderId: string;
  amount: number;
  type: string;
  status: string;
  paymentMethod?: string;
  transactionId?: string;
  initiatedAt?: string;
  processedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  profileId?: string;
  orderId?: string;
  type: string;
  channel: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  sentAt?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  orderId?: string;
  profileId?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  assignedTo?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  maxQuantity: number;
}

// Generic API response
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}
