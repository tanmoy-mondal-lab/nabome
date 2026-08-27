/**
 * Canonical order lifecycle statuses (18 states).
 * Source: MASTER_ARCHITECTURE_BLUEPRINT.md Appendix B.1 (binding).
 */
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'accepted'
  | 'rejected'
  | 'packing'
  | 'ready_to_ship'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'returned'
  | 'refunded'
  | 'archived'
  | 'failed_delivery'
  | 'held';

/**
 * Customer-visible order status mapping (10 states).
 * Source: MASTER_ARCHITECTURE_BLUEPRINT.md Appendix B.2 (binding).
 */
export type CustomerVisibleOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded'
  | 'completed';

/**
 * Payment lifecycle statuses.
 * Source: MASTER_ARCHITECTURE_BLUEPRINT.md Appendix B.3 (binding).
 */
export type PaymentStatus =
  | 'created'
  | 'initiated'
  | 'processing'
  | 'authorized'
  | 'captured'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired';

/**
 * Order-level payment sub-status.
 * Source: MASTER_ARCHITECTURE_BLUEPRINT.md Appendix B.3 (binding).
 */
export type OrderPaymentSubStatus =
  'pending' | 'authorized' | 'captured' | 'refunding' | 'refunded' | 'failed';

/**
 * Refund lifecycle statuses. Types: full | partial | credit_note (future).
 * Source: MASTER_ARCHITECTURE_BLUEPRINT.md Appendix B.3 (binding).
 */
export type RefundStatus =
  'initiated' | 'processing' | 'completed' | 'settled' | 'failed';

export type RefundType = 'full' | 'partial' | 'credit_note';

/**
 * Settlement lifecycle statuses (finance engine).
 * Source: MASTER_ARCHITECTURE_BLUEPRINT.md Appendix B.4 (binding).
 */
export type SettlementStatus =
  | 'pending'
  | 'eligible'
  | 'created'
  | 'review'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'paid'
  | 'rejected'
  | 'failed'
  | 'reversed';

/**
 * Shipment lifecycle statuses (12 states).
 * Source: MASTER_ARCHITECTURE_BLUEPRINT.md Appendix B.5 (binding).
 */
export type ShipmentStatus =
  | 'shipment_created'
  | 'ready_to_pack'
  | 'packed'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'closed'
  | 'delivery_failed'
  | 'exception'
  | 'returned_to_sender';

/**
 * Product lifecycle statuses.
 * Source: MASTER_ARCHITECTURE_BLUEPRINT.md Appendix B.6 (binding).
 */
export type ProductStatus = 'draft' | 'scheduled' | 'published' | 'archived';

/**
 * Inventory availability statuses.
 * availableStock = stock - reservedStock; low-stock threshold default 10.
 * Source: MASTER_ARCHITECTURE_BLUEPRINT.md Appendix B.6 (binding).
 */
export type InventoryStatus =
  'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder';

/**
 * Gender classification for products.
 * Source: CATALOG_ARCHITECTURE.md (binding).
 */
export type Gender = 'men' | 'women' | 'unisex';

/**
 * Collection types for product grouping.
 * Source: CATALOG_ARCHITECTURE.md (binding).
 */
export type CollectionType = 'manual' | 'dynamic' | 'smart';

/**
 * Access roles (additive hierarchy).
 * Guest 0 -> Customer 10 -> Shop Owner 20 -> Admin 30 -> System 100.
 * Source: MASTER_ARCHITECTURE_BLUEPRINT.md Appendix B.8 (binding).
 */
export type Role = 'guest' | 'customer' | 'shop_owner' | 'admin' | 'system';

/**
 * Canonical money representation: DECIMAL(10,2) INR, never float.
 * Gateway boundary converts to paise (x100).
 * Source: MASTER_ARCHITECTURE_BLUEPRINT.md Appendix B.7 (binding).
 */
export interface Money {
  /** Decimal value in major units (INR). Transmitted as string (Prisma Decimal JSON). */
  amount: string;
  /** ISO 4217 code. Only INR is supported. */
  currency: 'INR';
}

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface SoftDelete {
  isActive: boolean;
}

/** UUID v4 primary key (binding: B.7). */
export type Id = string;

// ──────────────────────────────────────────────────────────────────────────────
// Identity
// ──────────────────────────────────────────────────────────────────────────────

/** Matches the canonical Prisma `UserStatus` enum (apps/api/prisma/schema.prisma). */
export type UserStatus =
  'active' | 'suspended' | 'banned' | 'pending_verification';

export interface User extends Timestamps, SoftDelete {
  id: Id;
  email: string;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role: Role;
  status: UserStatus;
  emailVerifiedAt?: string | null;
  locale: 'en-IN' | 'bn-IN' | 'hi-IN';
  avatarUrl?: string | null;
}

export interface Address extends Timestamps {
  id: Id;
  userId: Id;
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface Session {
  id: Id;
  userId: Id;
  /** Rotating refresh token (hashed at rest). */
  refreshTokenHash: string;
  userAgent?: string | null;
  ip?: string | null;
  expiresAt: string;
  createdAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Catalog
// ──────────────────────────────────────────────────────────────────────────────

export interface Category extends Timestamps {
  id: Id;
  parentId?: Id | null;
  name: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  banner?: string | null;
  sortOrder: number;
  isActive: boolean;
  isHidden: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface Collection extends Timestamps {
  id: Id;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  type: CollectionType;
  startsAt?: string | null;
  endsAt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  rules?: Record<string, unknown> | null;
}

export interface Brand extends Timestamps, SoftDelete {
  id: Id;
  name: string;
  slug: string;
  logoUrl?: string | null;
  isActive: boolean;
}

export interface Shop extends Timestamps, SoftDelete {
  id: Id;
  ownerId: Id;
  name: string;
  slug: string;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  payoutMethod: 'digital' | 'bank_transfer' | 'upi';
  payoutDetails?: Record<string, unknown> | null;
  isActive: boolean;
}

export interface ProductMedia {
  id: Id;
  productId: Id;
  variantId?: Id | null;
  type: string;
  url: string;
  altText?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAttributeValue {
  /** Dynamic global attribute key (CC-01). */
  attribute: string;
  value: string;
}

export interface ProductVariant extends Timestamps {
  id: Id;
  productId: Id;
  sku: string;
  name: string;
  attributes?: Record<string, unknown> | null;
  price: Money;
  compareAtPrice?: Money | null;
  availableStock: number;
  reservedStock: number;
  inventoryStatus: InventoryStatus;
  lowStockThreshold: number;
  isActive: boolean;
  sortOrder: number;
}

export interface Product extends Timestamps {
  id: Id;
  categoryId: Id;
  brandId?: Id | null;
  shopId: Id;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  status: ProductStatus;
  isFeatured: boolean;
  isNew: boolean;
  isTrending: boolean;
  gender: Gender;
  sortOrder: number;
  basePrice: Money;
  compareAtPrice?: Money | null;
  costPrice?: Money | null;
  weightGrams?: number | null;
  isActive: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  reviewCount: number;
  averageRating: number;
  totalSold: number;
  tags: string[];
  meta?: Record<string, unknown> | null;
  category?: Category;
  brand?: Brand;
  shop?: Shop;
  collections?: Collection[];
  media?: ProductMedia[];
  variants?: ProductVariant[];
}

export interface ProductCollection {
  id: Id;
  productId: Id;
  collectionId: Id;
  sortOrder: number;
  createdAt: string;
}

export interface ProductAttribute {
  id: Id;
  productId: Id;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review extends Timestamps {
  id: Id;
  productId: Id;
  userId: Id;
  rating: number;
  title?: string | null;
  body?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  helpfulCount: number;
  verifiedPurchase: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// Cart & Wishlist
// ──────────────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: Id;
  cartId: Id;
  productId: Id;
  variantId: Id;
  productSlug: string;
  productName: string;
  imageUrl?: string | null;
  sku: string;
  attributes: ProductAttributeValue[];
  unitPrice: Money;
  quantity: number;
  lineTotal: Money;
  isAvailable: boolean;
}

export interface Cart extends Timestamps {
  id: Id;
  userId?: Id | null;
  /** Guest cart token (cookie). */
  guestToken?: string | null;
  items: CartItem[];
  subtotal: Money;
  itemCount: number;
  expiresAt: string;
}

export interface WishlistItem {
  id: Id;
  wishlistId: Id;
  productId: Id;
  productSlug: string;
  productName: string;
  imageUrl?: string | null;
  price: Money;
  createdAt: string;
}

export interface Wishlist extends Timestamps {
  id: Id;
  userId: Id;
  items: WishlistItem[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Orders & Fulfilment
// ──────────────────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: Id;
  orderId: Id;
  productId: Id;
  variantId: Id;
  productName: string;
  sku: string;
  attributes: ProductAttributeValue[];
  unitPrice: Money;
  quantity: number;
  lineTotal: Money;
  imageUrl?: string | null;
}

export interface OrderLineAmounts {
  subtotal: Money;
  discountTotal: Money;
  shippingTotal: Money;
  taxTotal: Money;
  grandTotal: Money;
}

export interface OrderAddress {
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order extends Timestamps {
  id: Id;
  /** Display number: NAB-YYYYMMDD-XXXXXX (B.7). */
  orderNumber: string;
  userId?: Id | null;
  guestToken?: string | null;
  shopId?: Id | null;
  status: OrderStatus;
  customerVisibleStatus: CustomerVisibleOrderStatus;
  paymentStatus: OrderPaymentSubStatus;
  items: OrderItem[];
  amounts: OrderLineAmounts;
  shippingAddress?: OrderAddress | null;
  billingAddress?: OrderAddress | null;
  couponCode?: string | null;
  paymentId?: Id | null;
  shipmentId?: Id | null;
  cancelledAt?: string | null;
  deliveredAt?: string | null;
  shop?: Shop;
}

export interface Shipment extends Timestamps {
  id: Id;
  orderId: Id;
  status: ShipmentStatus;
  trackingNumber?: string | null;
  carrier?: string | null;
  estimatedDelivery?: string | null;
  events: ShipmentEvent[];
}

export interface ShipmentEvent {
  status: ShipmentStatus;
  occurredAt: string;
  location?: string | null;
  note?: string | null;
}

export interface Payment extends Timestamps {
  id: Id;
  orderId: Id;
  provider: 'razorpay';
  providerPaymentId: string;
  status: PaymentStatus;
  amount: Money;
  currency: 'INR';
  method?: string | null;
  failureReason?: string | null;
  capturedAt?: string | null;
}

export interface Refund extends Timestamps {
  id: Id;
  orderId: Id;
  paymentId: Id;
  status: RefundStatus;
  type: RefundType;
  amount: Money;
  reason?: string | null;
  providerRefundId?: string | null;
  settledAt?: string | null;
}

export interface ReturnRequest extends Timestamps {
  id: Id;
  orderId: Id;
  userId: Id;
  items: OrderItem[];
  reason: string;
  status: 'requested' | 'approved' | 'rejected' | 'completed';
}

// ──────────────────────────────────────────────────────────────────────────────
// Commerce support
// ──────────────────────────────────────────────────────────────────────────────

export interface Coupon extends Timestamps, SoftDelete {
  id: Id;
  code: string;
  type: 'percentage' | 'fixed';
  value: string;
  minOrderAmount?: Money | null;
  maxDiscount?: Money | null;
  startsAt: string;
  expiresAt: string;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
}

export type NotificationChannel = 'in_app' | 'email' | 'push';

export interface Notification extends Timestamps {
  id: Id;
  userId: Id;
  type: string;
  title: string;
  body: string;
  channel: NotificationChannel;
  readAt?: string | null;
}
