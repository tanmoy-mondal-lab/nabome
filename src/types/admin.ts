import type { Product, Category, Collection, Brand } from "./product";
import type { Order } from "./order";
import type { Profile } from "./customer";
import type { Coupon } from "./coupon";
import type { Pagination } from "./common";

export interface DashboardStats {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalCustomers: number;
    totalRevenue: number;
    monthRevenue: number;
    monthOrders: number;
    lowStockVariants: number;
    pendingReviews: number;
  };
  ordersByStatus: { status: string; count: number }[];
  recentOrders: Order[];
  recentCustomers: Profile[];
  dailySales: { date: string; revenue: number; orders: number }[];
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice?: number;
  compareAtPrice?: number;
  currency: string;
  gender: string;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  category?: { id: string; name: string; slug: string };
  brand?: { id: string; name: string; slug: string };
  images: { url: string; isPrimary: boolean }[];
  variants: { id: string; size: string; color: string; stock: number; reservedStock: number }[];
  _count?: { reviews: number; orderItems: number };
  createdAt: string;
}

export interface ProductListData {
  products: ProductListItem[];
  pagination: Pagination;
}

export interface ProductDetailData {
  product: Product;
}

export interface OrderListData {
  orders: Order[];
  pagination: Pagination;
}

export interface OrderDetailData {
  order: Order;
}

export interface CustomerListData {
  customers: Profile[];
  pagination: Pagination;
}

export interface CustomerDetailData {
  customer: Profile;
}

export interface CategoryListData {
  categories: Category[];
}

export interface CollectionListData {
  collections: Collection[];
}

export interface BrandListData {
  brands: Brand[];
}

export interface CouponListData {
  coupons: Coupon[];
}

export interface MediaAsset {
  id: string;
  url: string;
  publicId?: string;
  secureUrl?: string;
  resourceType?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  originalFilename?: string;
  displayName?: string;
  altText?: string;
  folder?: string;
  entityType?: string;
  entityId?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  tags?: string[];
  createdAt: string;
}

export interface MediaListData {
  assets: MediaAsset[];
  folders: string[];
  pagination: Pagination;
}

export interface ReturnData {
  id: string;
  orderId: string;
  profileId: string;
  reason: string;
  status: string;
  adminNote?: string;
  createdAt: string;
}

export interface ReturnListData {
  returns: ReturnData[];
  pagination: Pagination;
}

export interface RefundData {
  id: string;
  orderId: string;
  returnRequestId?: string;
  amount: number;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface RefundListData {
  refunds: RefundData[];
  pagination: Pagination;
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  createdAt: string;
}

export interface SupportTicketListData {
  tickets: SupportTicket[];
  pagination: Pagination;
}

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationTemplate {
  id: string;
  event: string;
  subject: string;
  body: string;
}

export interface AnalyticsData {
  [key: string]: unknown;
}

export interface SettingsData {
  siteName?: string;
  siteDescription?: string;
  [key: string]: unknown;
}

export interface CMSData {
  id?: string;
  title?: string;
  slug?: string;
  content?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface BulkOperationResult {
  updated: number;
  deleted: number;
  archived: number;
  message?: string;
}

export interface InventoryOverview {
  stats: Record<string, unknown>;
  recentMovements: unknown[];
  alerts: unknown[];
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export interface SearchIndexStatus {
  indexed: boolean;
  count: number;
  lastIndexed: string | null;
}

export interface SearchResult {
  results: unknown[];
  total: number;
}

// FAQ types
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FAQListData {
  faqs: FAQ[];
}

// Label and Tag types
export interface ProductLabel {
  id: string;
  name: string;
  slug?: string;
  color?: string;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductTag {
  id: string;
  name: string;
  slug?: string;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Lookbook types
export interface Lookbook {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  coverImagePublicId?: string;
  isActive?: boolean;
  sortOrder?: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LookbookItem {
  id: string;
  lookbookId: string;
  productId: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  sortOrder?: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    images: { url: string }[];
  };
}

export interface LookbookDetailData {
  lookbook: Lookbook & { items: LookbookItem[] };
}

export interface LookbookListData {
  lookbooks: Lookbook[];
}

// Contact submission types
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead?: boolean;
  readAt?: string;
  createdAt?: string;
}

export interface ContactSubmissionListData {
  submissions: ContactSubmission[];
  unreadCount: number;
  pagination: Pagination;
}

// Newsletter subscriber types
export interface NewsletterSubscriber {
  id: string;
  email: string;
  isActive?: boolean;
  subscribedAt?: string;
  unsubscribedAt?: string;
  createdAt?: string;
}

export interface NewsletterSubscriberListData {
  subscribers: NewsletterSubscriber[];
  pagination: Pagination;
}

// Subcategory types
export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  categoryId: string;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Size Guide types
export interface SizeGuide {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId?: string;
  type?: string;
  unit?: string;
  imageUrl?: string;
  imagePublicId?: string;
  measurements?: { size: string; chest?: string; waist?: string; length?: string }[];
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Product Attribute types
export interface ProductAttribute {
  id: string;
  productId: string;
  key: string;
  value: string;
  sortOrder?: number;
}

// Campaign types
export interface Campaign {
  id: string;
  name: string;
  type: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Marketing types
export interface MarketingData {
  [key: string]: unknown;
}
