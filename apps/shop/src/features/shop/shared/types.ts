/**
 * Shop Dashboard Types
 *
 * Canonical type definitions for the Shop Owner Dashboard
 * Following SHOP_OWNER_DASHBOARD_ARCHITECTURE.md and REST_API_SPECIFICATION.md
 */

// Dashboard KPI Types
export interface DashboardKPICard {
  title: string;
  value: number | string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  comparison?: string;
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}

// Revenue Summary
export interface RevenueSummary {
  today: number;
  yesterday: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
  trend: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  chartData?: ChartDataPoint[];
}

// Orders Summary
export interface OrdersSummary {
  today: number;
  yesterday: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled?: number;
  trend: {
    daily: number;
  };
  byStatus?: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

// Inventory Alerts
export interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  variantName: string;
  currentStock: number;
  threshold: number;
  severity: 'low' | 'critical';
  sku?: string;
}

// Earnings Summary
export interface EarningsSummary {
  gross: number;
  commission: number;
  net: number;
  pending: number;
  lastSettlement?: {
    amount: number;
    date: string;
  };
  nextSettlement?: {
    amount: number;
    estimatedDate: string;
  };
}

// Performance Metrics
export interface PerformanceMetric {
  name: string;
  current: number;
  target: number;
  status: 'green' | 'amber' | 'red';
  unit?: string;
}

// Recent Activity
export interface ActivityEvent {
  id: string;
  type: 'order' | 'payment' | 'product' | 'settlement' | 'inventory' | 'system';
  description: string;
  entityId?: string;
  entityName?: string;
  timestamp: string;
  icon?: string;
}

// Quick Action
export interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: string;
  shortcut?: string;
  action: () => void;
}

// Dashboard Data
export interface DashboardData {
  revenue: RevenueSummary;
  orders: OrdersSummary;
  inventory: {
    lowStockCount: number;
    outOfStockCount: number;
    totalProducts: number;
  };
  earnings: EarningsSummary;
  performance: PerformanceMetric[];
  alerts: InventoryAlert[];
  recentOrders: PendingOrder[];
  activity: ActivityEvent[];
}

// Pending Order (for dashboard)
export interface PendingOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  createdAt: string;
  status: string;
}

// Chart Data Types
export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

export interface RevenueChartData {
  period: 'today' | '7d' | '30d' | '90d' | 'custom';
  data: ChartDataPoint[];
}

export interface OrdersByStatusData {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface TopProductData {
  id: string;
  name: string;
  revenue: number;
  sales: number;
}

// Shop Context
export interface ShopContext {
  shopId: string;
  shopName: string;
  plan: 'starter' | 'growth' | 'enterprise';
  currency: string;
  timezone: string;
}

// Permission Types
export type ShopPermission =
  | 'shop:product:read'
  | 'shop:product:create'
  | 'shop:product:update'
  | 'shop:product:delete'
  | 'shop:product:publish'
  | 'shop:inventory:read'
  | 'shop:inventory:update'
  | 'shop:order:read'
  | 'shop:order:update'
  | 'shop:order:cancel'
  | 'shop:finance:read'
  | 'shop:export:create'
  | 'shop:message:read'
  | 'shop:message:send'
  | 'shop:settings:read'
  | 'shop:settings:update'
  | 'shop:staff:manage'
  | 'shop:analytics:read';

// User Role in Shop
export type ShopRole = 'owner' | 'manager' | 'staff' | 'viewer';

// Shop User
export interface ShopUser {
  id: string;
  name: string;
  email: string;
  role: ShopRole;
  permissions: ShopPermission[];
  avatar?: string;
  lastActive?: string;
}

// Notification Types
export interface ShopNotification {
  id: string;
  type:
    | 'new_order'
    | 'payment'
    | 'shipping'
    | 'return'
    | 'low_stock'
    | 'settlement'
    | 'system';
  title: string;
  message: string;
  entityId?: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}
