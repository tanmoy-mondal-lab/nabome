export type AdminTab =
  | "home"
  | "vendors"
  | "products"
  | "categories"
  | "customers"
  | "orders"
  | "reviews"
  | "coupons"
  | "banners"
  | "notifications"
  | "reports"
  | "settings"
  | "logs";

export interface AdminVendor {
  id: string;
  shopName: string;
  ownerName: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  registrationDate: string;
  productCount: number;
  orderCount: number;
  revenue: number;
  rating: number;
  logo: string;
}

export interface AdminProduct {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorShop: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "draft" | "pending_approval" | "published" | "rejected" | "soft_deleted";
  createdAt: string;
  image: string;
  rejectionReason?: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  subcategories: AdminSubcategory[];
  productCount: number;
  isActive: boolean;
}

export interface AdminSubcategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface AdminCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  city: string;
  orderCount: number;
  totalSpent: number;
  status: "active" | "suspended";
  registeredAt: string;
  lastActive: string;
}

export interface AdminOrder {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vendorName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: "pending" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  createdAt: string;
  shippingAddress: string;
  note: string;
}

export interface AdminReview {
  id: string;
  productName: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  comment: string;
  reply: string;
  status: "visible" | "hidden" | "reported";
  createdAt: string;
}

export interface AdminCoupon {
  id: string;
  code: string;
  type: "flat" | "percentage" | "free_shipping";
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  description: string;
}

export interface AdminBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  position: "hero" | "promo" | "featured";
  isActive: boolean;
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: "system" | "offer" | "order" | "alert";
  audience: "all_customers" | "all_vendors" | "single_vendor" | "single_customer";
  recipientName?: string;
  sentAt: string;
  readCount: number;
}

export interface AdminReport {
  id: string;
  type: "revenue" | "orders" | "vendors" | "customers" | "products";
  title: string;
  period: string;
  data: { label: string; value: number }[];
  total: number;
  growth: number;
}

export interface AdminSiteSettings {
  brandName: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  supportEmail: string;
  address: string;
  socialLinks: { platform: string; url: string }[];
  footerText: string;
  footerDescription: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  currency: string;
  taxRate: number;
  shippingCharge: number;
  freeShippingAbove: number;
}

export interface AdminLog {
  id: string;
  action: string;
  type: "vendor_approval" | "vendor_rejection" | "product_approval" | "product_rejection" | "order_update" | "admin_action" | "customer_action";
  performedBy: string;
  targetName: string;
  details: string;
  createdAt: string;
}

export interface AdminDashboardStats {
  totalCustomers: number;
  totalVendors: number;
  pendingVendors: number;
  totalProducts: number;
  pendingProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  customerGrowth: number;
  vendorGrowth: number;
  revenueGrowth: number;
  orderGrowth: number;
  revenueChart: { month: string; revenue: number }[];
  orderChart: { month: string; orders: number }[];
  vendorChart: { month: string; vendors: number }[];
  categoryDistribution: { category: string; count: number }[];
  recentActivities: { action: string; time: string; type: string }[];
}
