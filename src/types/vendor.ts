export type ProductStatus = "draft" | "pending_approval" | "published" | "rejected" | "soft_deleted";

export type VendorOrderStatus = "new" | "processing" | "packed" | "shipped" | "delivered" | "cancelled";

export interface VendorShop {
  id: string;
  vendorId: string;
  slug: string;
  shopName: string;
  shopLogo: string;
  shopBanner: string;
  shopDescription: string;
  shopCategory: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  rating: number;
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  createdAt: string;
}

export interface VendorProduct {
  id: string;
  vendorId: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  discountPrice: number;
  stockQuantity: number;
  sku: string;
  tags: string[];
  gender: string;
  material: string;
  sizes: string[];
  colors: string[];
  images: string[];
  mainImage: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

export interface VendorOrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

export interface VendorOrder {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: VendorOrderItem[];
  total: number;
  status: VendorOrderStatus;
  trackingNumber: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  createdAt: string;
  note: string;
}

export interface VendorCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
  city: string;
}

export interface VendorReview {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  comment: string;
  reply: string;
  createdAt: string;
  reported: boolean;
}

export interface InventoryItem {
  productId: string;
  productName: string;
  productImage: string;
  currentStock: number;
  lowStockThreshold: number;
  soldToday: number;
  soldThisMonth: number;
  lastRestocked: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export interface InventoryHistoryEntry {
  id: string;
  productId: string;
  productName: string;
  type: "restock" | "sale" | "adjustment" | "return";
  quantity: number;
  date: string;
  note: string;
}

export interface AnalyticsData {
  todayRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  productsCount: number;
  lowStockAlerts: number;
  customerCount: number;
  recentReviews: number;
  revenueChart: { month: string; revenue: number }[];
  orderChart: { month: string; orders: number }[];
  bestSellingProducts: { name: string; sales: number; revenue: number; image: string }[];
  topCategories: { category: string; count: number; revenue: number }[];
  monthlyGrowth: number;
  customerGrowth: number;
  orderStatusBreakdown: { status: string; count: number }[];
}

export type VendorTab =
  | "home"
  | "products"
  | "orders"
  | "customers"
  | "reviews"
  | "inventory"
  | "analytics"
  | "shop"
  | "profile"
  | "trash";
