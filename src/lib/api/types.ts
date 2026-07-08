// API Response Types for NABOME

// Common types
export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Dashboard
export interface DashboardData {
  recentOrders: Order[];
  wishlistCount: number;
  addressesCount: number;
  unreadNotifications: number;
}

// Orders
export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantLabel: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface OrderTracking {
  timeline: OrderStatusHistory[];
  shipping: Address | null;
  currentStatus: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface OrderStatusHistory {
  id: string;
  status: string;
  note?: string;
  createdAt: string;
}

export interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  deliveredOrders: number;
}

// Profile
export interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  preferences?: Record<string, unknown>;
}

// Addresses
export interface Address {
  id: string;
  profileId: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  isBillingDefault: boolean;
  addressType: string;
}

// Wishlist
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

// Returns
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

// Refunds
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

// Notifications
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

// Support Tickets
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

// Cart
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

// Products
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  categoryId?: string;
  subcategoryId?: string;
  collectionId?: string;
  brandId?: string;
  basePrice: number;
  compareAtPrice?: number;
  salePrice?: string;
  discountPercent?: number;
  currency: string;
  gender: string;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  sortOrder: number;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductImage {
  id: string;
  productId: string;
  variantId?: string;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: string;
  color: string;
  colorHex?: string;
  priceAdjustment: number;
  stock: number;
  reservedStock: number;
  isActive: boolean;
}

// Categories
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
}

// Collections
export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  heroImageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

// Admin Dashboard
export interface AdminDashboard {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
  pendingReviews: number;
  ordersByStatus: { status: string; count: number }[];
  recentOrders: Order[];
  recentCustomers: Profile[];
  dailySales: { date: string; revenue: number; orders: number }[];
}

// Generic API response
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}
