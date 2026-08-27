/**
 * Admin Dashboard Types
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md, IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md
 */

import type {
  Id,
  Money,
  OrderStatus,
  ProductStatus,
  UserStatus,
  Role,
} from '@nabome/types';

// ──────────────────────────────────────────────────────────────────────────────
// Admin Permissions & RBAC
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Permission format: {scope}:{resource}:{action}
 * Source: IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md
 */
export type Permission = string;

/**
 * Admin-specific scopes
 */
export type AdminScope =
  'platform' | 'governance' | 'monitoring' | 'reports' | 'settings';

/**
 * Admin resources
 */
export type AdminResource =
  | 'shop'
  | 'customer'
  | 'product'
  | 'order'
  | 'payment'
  | 'return'
  | 'cms'
  | 'security'
  | 'system'
  | 'report'
  | 'setting';

/**
 * Admin actions
 */
export type AdminAction =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'suspend'
  | 'activate'
  | 'moderate'
  | 'audit'
  | 'configure';

/**
 * Admin permission check result
 */
export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Shop Management Types
// ──────────────────────────────────────────────────────────────────────────────

export type ShopStatus =
  'pending' | 'active' | 'suspended' | 'banned' | 'under_review';

export interface Shop {
  id: Id;
  ownerId: Id;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  status: ShopStatus;
  verifiedAt?: string | null;
  suspendedAt?: string | null;
  suspendedReason?: string | null;
  commissionRate: string; // DECIMAL(5,2)
  totalProducts: number;
  totalOrders: number;
  totalRevenue: Money;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: Id;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
}

export interface ShopPerformance {
  shopId: Id;
  period: string; // ISO 8601 date range
  orders: number;
  revenue: Money;
  averageOrderValue: Money;
  conversionRate: number;
  fulfillmentRate: number;
  returnRate: number;
  rating: number;
}

export interface ShopAuditLog {
  id: Id;
  shopId: Id;
  action:
    | 'created'
    | 'approved'
    | 'suspended'
    | 'activated'
    | 'verified'
    | 'settings_changed';
  performedBy: Id;
  performedAt: string;
  reason?: string | null;
  changes?: Record<string, unknown> | null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Customer Management Types
// ──────────────────────────────────────────────────────────────────────────────

export interface CustomerProfile {
  id: Id;
  userId: Id;
  email: string;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  status: UserStatus;
  lockedAt?: string | null;
  lockedReason?: string | null;
  totalOrders: number;
  totalSpent: Money;
  averageOrderValue: Money;
  lastOrderAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginHistory {
  id: Id;
  userId: Id;
  loginAt: string;
  ip?: string | null;
  userAgent?: string | null;
  success: boolean;
  failureReason?: string | null;
}

export interface AuditTimeline {
  id: Id;
  userId: Id;
  entityType: string;
  entityId: Id;
  action: string;
  performedBy: Id;
  performedAt: string;
  changes?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Product Governance Types
// ──────────────────────────────────────────────────────────────────────────────

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface ProductModeration {
  id: Id;
  productId: Id;
  shopId: Id;
  status: ModerationStatus;
  moderatedBy?: Id | null;
  moderatedAt?: string | null;
  rejectionReason?: string | null;
  flags: ProductFlag[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFlag {
  id: Id;
  productId: Id;
  flagType:
    'inappropriate' | 'copyright' | 'counterfeit' | 'misleading' | 'other';
  reportedBy: Id;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: Id | null;
  reviewedAt?: string | null;
  createdAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Order Governance Types
// ──────────────────────────────────────────────────────────────────────────────

export type OrderException =
  | 'payment_failed'
  | 'high_value'
  | 'suspicious'
  | 'address_mismatch'
  | 'inventory_issue';

export interface OrderGovernance {
  id: Id;
  orderId: Id;
  status: OrderStatus;
  exceptions: OrderException[];
  requiresManualReview: boolean;
  reviewedBy?: Id | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  operationalNotes: OrderOperationalNote[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderOperationalNote {
  id: Id;
  orderId: Id;
  addedBy: Id;
  note: string;
  isInternal: boolean;
  createdAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Payments Governance Types
// ──────────────────────────────────────────────────────────────────────────────

export type ProviderHealth = 'healthy' | 'degraded' | 'down';

export interface PaymentProvider {
  id: Id;
  name: string;
  type: 'razorpay';
  status: ProviderHealth;
  lastHealthCheck: string;
  uptimePercentage: number;
  totalTransactions: number;
  successRate: number;
  averageResponseTime: number; // milliseconds
}

export interface FinancialException {
  id: Id;
  type: 'settlement_mismatch' | 'refund_anomaly' | 'chargeback' | 'dispute';
  severity: 'low' | 'medium' | 'high' | 'critical';
  amount: Money;
  orderId?: Id | null;
  paymentId: Id;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  resolvedBy?: Id | null;
  resolvedAt?: string | null;
  createdAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Returns Governance Types
// ──────────────────────────────────────────────────────────────────────────────

export type ReturnStatus =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'in_transit'
  | 'received'
  | 'refunded'
  | 'closed';

export interface ReturnGovernance {
  id: Id;
  returnId: Id;
  orderId: Id;
  userId: Id;
  status: ReturnStatus;
  reason: string;
  refundAmount: Money;
  policyOverride?: {
    overriddenBy: Id;
    originalPolicy: string;
    overrideReason: string;
    overriddenAt: string;
  } | null;
  fraudReview?: {
    reviewedBy: Id;
    riskScore: number;
    decision: 'approve' | 'reject' | 'investigate';
    reviewedAt: string;
  } | null;
  dispute?: {
    raisedBy: Id;
    reason: string;
    status: 'open' | 'resolved';
    resolvedBy?: Id | null;
    resolvedAt?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// CMS Governance Types
// ──────────────────────────────────────────────────────────────────────────────

export type ContentType =
  'homepage' | 'banner' | 'featured_products' | 'section';

export interface CMSContent {
  id: Id;
  type: ContentType;
  name: string;
  content: Record<string, unknown>;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  publishedAt?: string | null;
  scheduledFor?: string | null;
  createdBy: Id;
  updatedBy: Id;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CMSVersionHistory {
  id: Id;
  contentId: Id;
  version: number;
  content: Record<string, unknown>;
  changedBy: Id;
  changeReason?: string | null;
  createdAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Security Operations Types
// ──────────────────────────────────────────────────────────────────────────────

export interface SecurityAuditLog {
  id: Id;
  userId?: Id | null;
  action: string;
  resource: string;
  resourceId?: Id | null;
  ip?: string | null;
  userAgent?: string | null;
  success: boolean;
  failureReason?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface ActiveSession {
  id: Id;
  userId: Id;
  ip?: string | null;
  userAgent?: string | null;
  lastActivity: string;
  expiresAt: string;
  createdAt: string;
}

export interface SecurityAlert {
  id: Id;
  type:
    | 'brute_force'
    | 'suspicious_activity'
    | 'privilege_escalation'
    | 'data_breach'
    | 'malware';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedUsers: Id[];
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  resolvedBy?: Id | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface FailedLoginAttempt {
  id: Id;
  email: string;
  ip?: string | null;
  attemptedAt: string;
  userAgent?: string | null;
  failureReason: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// System Operations Types
// ──────────────────────────────────────────────────────────────────────────────

export type JobStatus =
  'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface BackgroundJob {
  id: Id;
  name: string;
  type: string;
  status: JobStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  error?: string | null;
  progress?: number | null;
  metadata?: Record<string, unknown> | null;
}

export interface QueueStatus {
  name: string;
  size: number;
  processing: number;
  failed: number;
  avgProcessingTime: number;
}

export interface CacheStatus {
  name: string;
  hitRate: number;
  size: number;
  evictionCount: number;
}

export interface SearchIndexStatus {
  name: string;
  documentCount: number;
  lastIndexed: string;
  health: 'healthy' | 'degraded' | 'rebuilding';
}

export interface StorageHealth {
  provider: 'r2';
  status: 'healthy' | 'degraded' | 'down';
  totalUsed: number; // bytes
  totalCapacity: number; // bytes
  lastHealthCheck: string;
}

export interface DatabaseHealth {
  status: 'healthy' | 'degraded' | 'down';
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };
  latency: number; // milliseconds
  lastHealthCheck: string;
}

export interface APIHealth {
  endpoint: string;
  status: 'healthy' | 'degraded' | 'down';
  avgResponseTime: number;
  errorRate: number;
  uptime: number;
  lastHealthCheck: string;
}

export interface ScheduledTask {
  id: Id;
  name: string;
  schedule: string; // cron expression
  lastRun?: string | null;
  nextRun: string;
  status: 'active' | 'paused' | 'failed';
  lastStatus?: JobStatus | null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Platform Overview / KPIs
// ──────────────────────────────────────────────────────────────────────────────

export interface PlatformKPIs {
  period: string; // ISO 8601 date range
  revenue: {
    total: Money;
    growth: number; // percentage
  };
  orders: {
    total: number;
    growth: number;
  };
  shops: {
    total: number;
    active: number;
    pending: number;
  };
  customers: {
    total: number;
    new: number;
    active: number;
  };
  products: {
    total: number;
    published: number;
    pendingModeration: number;
  };
  payments: {
    totalTransactions: number;
    successRate: number;
    totalVolume: Money;
  };
  returns: {
    total: number;
    rate: number; // percentage
    refundAmount: Money;
  };
  system: {
    uptime: number; // percentage
    avgResponseTime: number;
    errorRate: number;
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Reports Types
// ──────────────────────────────────────────────────────────────────────────────

export type ReportType =
  | 'revenue'
  | 'commerce'
  | 'customer'
  | 'shop'
  | 'security'
  | 'audit'
  | 'operations';

export type ReportFormat = 'pdf' | 'csv' | 'json';

export interface Report {
  id: Id;
  type: ReportType;
  name: string;
  description?: string | null;
  generatedBy: Id;
  parameters: Record<string, unknown>;
  format: ReportFormat;
  fileUrl?: string | null;
  status: 'generating' | 'completed' | 'failed';
  error?: string | null;
  generatedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Platform Settings Types
// ──────────────────────────────────────────────────────────────────────────────

export type SettingType =
  | 'global'
  | 'tax'
  | 'commission'
  | 'shipping'
  | 'payment'
  | 'cms'
  | 'notification'
  | 'feature_flag';

export interface PlatformSetting {
  id: Id;
  key: string;
  type: SettingType;
  value: unknown;
  description?: string | null;
  isPublic: boolean;
  isReadOnly: boolean;
  updatedAt: string;
  updatedBy: Id;
}

export interface TaxSetting {
  id: Id;
  region: string;
  rate: string; // DECIMAL(5,2)
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionSetting {
  id: Id;
  category?: string | null;
  defaultRate: string; // DECIMAL(5,2)
  minRate?: string | null;
  maxRate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingDefault {
  id: Id;
  region: string;
  baseRate: Money;
  freeShippingThreshold?: Money | null;
  estimatedDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlag {
  id: Id;
  key: string;
  enabled: boolean;
  description?: string | null;
  rolloutPercentage?: number | null;
  createdAt: string;
  updatedAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Analytics Types
// ──────────────────────────────────────────────────────────────────────────────

export interface AnalyticsEvent {
  id: Id;
  eventType: string;
  userId?: Id | null;
  sessionId?: string | null;
  properties: Record<string, unknown>;
  timestamp: string;
}

export interface CommerceAnalytics {
  period: string;
  totalRevenue: Money;
  totalOrders: number;
  averageOrderValue: Money;
  conversionRate: number;
  topProducts: Array<{
    productId: Id;
    productName: string;
    revenue: Money;
    unitsSold: number;
  }>;
  topCategories: Array<{
    categoryId: Id;
    categoryName: string;
    revenue: Money;
  }>;
}

export interface OperationalAnalytics {
  period: string;
  fulfillmentRate: number;
  returnRate: number;
  refundRate: number;
  averageFulfillmentTime: number; // hours
  averageResponseTime: number; // hours
}

export interface SecurityAnalytics {
  period: string;
  totalAttempts: number;
  failedAttempts: number;
  suspiciousActivities: number;
  blockedIPs: number;
  topAttackTypes: Array<{
    type: string;
    count: number;
  }>;
}
