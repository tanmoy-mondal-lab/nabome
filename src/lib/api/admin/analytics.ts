import { api } from "../client";

export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueByPeriod: { period: string; revenue: number; orders: number }[];
  topProducts: { productId: string; productName: string; revenue: number; quantity: number }[];
  revenueByCategory: { categoryId: string; categoryName: string; revenue: number }[];
}

export interface ProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  topSellingProducts: { productId: string; productName: string; sales: number; revenue: number }[];
  productsByCategory: { categoryId: string; categoryName: string; count: number }[];
}

export interface CustomerAnalytics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  topCustomers: { customerId: string; customerName: string; totalSpent: number; orderCount: number }[];
  customerGrowth: { period: string; newCustomers: number }[];
}

export interface DeliveryAddressAnalytics {
  topCities: { city: string; state: string; orderCount: number; revenue: number }[];
  topStates: { state: string; orderCount: number; revenue: number }[];
  topPincodes: { pincode: string; city: string; orderCount: number; revenue: number }[];
}

export const analyticsApi = {
  getSales: (params?: Record<string, string | undefined>) =>
    api.get<SalesAnalytics>("/admin/analytics/sales", { params }),
  getProducts: () => api.get<ProductAnalytics>("/admin/analytics/products"),
  getCustomers: () => api.get<CustomerAnalytics>("/admin/analytics/customers"),
  getDeliveryAddresses: (params?: Record<string, string | undefined>) =>
    api.get<DeliveryAddressAnalytics>("/admin/analytics/delivery-addresses", { params }),
};
