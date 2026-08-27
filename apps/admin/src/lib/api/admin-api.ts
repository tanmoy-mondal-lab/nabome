/**
 * Admin API Client
 * Source: REST_API_SPECIFICATION.md, ADMIN_DASHBOARD_ARCHITECTURE.md
 */

import type {
  ApiResponse,
  ApiListResponse,
  OffsetPaginationQuery,
  SortQuery,
} from '@nabome/api-contracts';
import type {
  Shop,
  ShopPerformance,
  ShopAuditLog,
  CustomerProfile,
  LoginHistory,
  AuditTimeline,
  ProductModeration,
  ProductFlag,
  OrderGovernance,
  OrderOperationalNote,
  PaymentProvider,
  FinancialException,
  ReturnGovernance,
  CMSContent,
  CMSVersionHistory,
  SecurityAuditLog,
  ActiveSession,
  SecurityAlert,
  FailedLoginAttempt,
  BackgroundJob,
  QueueStatus,
  CacheStatus,
  SearchIndexStatus,
  StorageHealth,
  DatabaseHealth,
  APIHealth,
  ScheduledTask,
  PlatformKPIs,
  Report,
  PlatformSetting,
  TaxSetting,
  CommissionSetting,
  ShippingDefault,
  FeatureFlag,
  CommerceAnalytics,
  OperationalAnalytics,
  SecurityAnalytics,
} from '@/types/admin';

const API_BASE =
  (import.meta.env.VITE_PUBLIC_API_URL as string | undefined) ??
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:8788';

function getCsrfToken(): string | null {
  const m = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return m ? decodeURIComponent(m[1] ?? '') : null;
}

// ──────────────────────────────────────────────────────────────────────────────
// API Client Helpers
// ──────────────────────────────────────────────────────────────────────────────

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const csrf = getCsrfToken();
  if (csrf) headers['x-csrf-token'] = csrf;
  return headers;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    credentials: 'include', // Required for httpOnly cookies
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

// ──────────────────────────────────────────────────────────────────────────────
// Platform Overview API
// ──────────────────────────────────────────────────────────────────────────────

export const platformOverviewApi = {
  getKPIs: async (period?: string) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);

    return apiRequest<PlatformKPIs>(
      `/api/v1/admin/platform/kpis${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Shop Management API
// ──────────────────────────────────────────────────────────────────────────────

export const shopManagementApi = {
  listShops: async (
    query?: OffsetPaginationQuery &
      SortQuery & {
        status?: string;
        search?: string;
      },
  ) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.sort) params.append('sort', query.sort);
    if (query?.order) params.append('order', query.order);
    if (query?.status) params.append('status', query.status);
    if (query?.search) params.append('search', query.search);

    return apiRequest<Shop[]>(
      `/api/v1/admin/shops${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getShop: async (shopId: string) => {
    return apiRequest<Shop>(`/api/v1/admin/shops/${shopId}`);
  },

  approveShop: async (shopId: string) => {
    return apiRequest<Shop>(`/api/v1/admin/shops/${shopId}/approve`, {
      method: 'POST',
    });
  },

  suspendShop: async (shopId: string, reason: string) => {
    return apiRequest<Shop>(`/api/v1/admin/shops/${shopId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  activateShop: async (shopId: string) => {
    return apiRequest<Shop>(`/api/v1/admin/shops/${shopId}/activate`, {
      method: 'POST',
    });
  },

  verifyShop: async (shopId: string) => {
    return apiRequest<Shop>(`/api/v1/admin/shops/${shopId}/verify`, {
      method: 'POST',
    });
  },

  getShopPerformance: async (shopId: string, period: string) => {
    return apiRequest<ShopPerformance>(
      `/api/v1/admin/shops/${shopId}/performance?period=${period}`,
    );
  },

  getShopAuditHistory: async (shopId: string) => {
    return apiRequest<ShopAuditLog[]>(
      `/api/v1/admin/shops/${shopId}/audit-history`,
    );
  },

  overrideShopSettings: async (
    shopId: string,
    settings: Record<string, unknown>,
  ) => {
    return apiRequest<Shop>(`/api/v1/admin/shops/${shopId}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Customer Management API
// ──────────────────────────────────────────────────────────────────────────────

export const customerManagementApi = {
  listCustomers: async (
    query?: OffsetPaginationQuery &
      SortQuery & {
        status?: string;
        search?: string;
      },
  ) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.sort) params.append('sort', query.sort);
    if (query?.order) params.append('order', query.order);
    if (query?.status) params.append('status', query.status);
    if (query?.search) params.append('search', query.search);

    return apiRequest<CustomerProfile[]>(
      `/api/v1/admin/customers${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getCustomer: async (customerId: string) => {
    return apiRequest<CustomerProfile>(`/api/v1/admin/customers/${customerId}`);
  },

  lockCustomer: async (customerId: string, reason: string) => {
    return apiRequest<CustomerProfile>(
      `/api/v1/admin/customers/${customerId}/lock`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      },
    );
  },

  unlockCustomer: async (customerId: string) => {
    return apiRequest<CustomerProfile>(
      `/api/v1/admin/customers/${customerId}/unlock`,
      {
        method: 'POST',
      },
    );
  },

  verifyEmail: async (customerId: string) => {
    return apiRequest<CustomerProfile>(
      `/api/v1/admin/customers/${customerId}/verify-email`,
      {
        method: 'POST',
      },
    );
  },

  sendPasswordReset: async (customerId: string) => {
    return apiRequest<{ success: boolean; message: string }>(
      `/api/v1/admin/customers/${customerId}/reset-password`,
      {
        method: 'POST',
      },
    );
  },

  suspendCustomer: async (customerId: string, reason: string) => {
    return apiRequest<CustomerProfile>(
      `/api/v1/admin/customers/${customerId}/suspend`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      },
    );
  },

  activateCustomer: async (customerId: string) => {
    return apiRequest<CustomerProfile>(
      `/api/v1/admin/customers/${customerId}/activate`,
      {
        method: 'POST',
      },
    );
  },

  exportCustomerData: async (customerId: string) => {
    return apiRequest<{ data: any; filename: string }>(
      `/api/v1/admin/customers/${customerId}/export`,
      {
        method: 'GET',
      },
    );
  },

  getLoginHistory: async (customerId: string) => {
    return apiRequest<LoginHistory[]>(
      `/api/v1/admin/customers/${customerId}/login-history`,
    );
  },

  getAuditTimeline: async (customerId: string) => {
    return apiRequest<AuditTimeline[]>(
      `/api/v1/admin/customers/${customerId}/audit-timeline`,
    );
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Product Governance API
// ──────────────────────────────────────────────────────────────────────────────

export const productGovernanceApi = {
  searchProducts: async (
    query?: OffsetPaginationQuery & {
      search?: string;
      status?: string;
      shopId?: string;
    },
  ) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.status) params.append('status', query.status);
    if (query?.shopId) params.append('shopId', query.shopId);

    return apiRequest<any[]>(
      `/api/v1/admin/products/search${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getModerationQueue: async (query?: OffsetPaginationQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());

    return apiRequest<ProductModeration[]>(
      `/api/v1/admin/products/moderation${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getFlaggedProducts: async (query?: OffsetPaginationQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());

    return apiRequest<ProductFlag[]>(
      `/api/v1/admin/products/flagged${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  approveProduct: async (productId: string) => {
    return apiRequest<ProductModeration>(
      `/api/v1/admin/products/${productId}/approve`,
      {
        method: 'POST',
      },
    );
  },

  rejectProduct: async (productId: string, reason: string) => {
    return apiRequest<ProductModeration>(
      `/api/v1/admin/products/${productId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      },
    );
  },

  bulkModerate: async (
    productIds: string[],
    action: 'approve' | 'reject',
    reason?: string,
  ) => {
    return apiRequest<{ success: number; failed: number }>(
      `/api/v1/admin/products/bulk-moderate`,
      {
        method: 'POST',
        body: JSON.stringify({ productIds, action, reason }),
      },
    );
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Order Governance API
// ──────────────────────────────────────────────────────────────────────────────

export const orderGovernanceApi = {
  searchOrders: async (
    query?: OffsetPaginationQuery & {
      search?: string;
      status?: string;
      shopId?: string;
      customerId?: string;
    },
  ) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.status) params.append('status', query.status);
    if (query?.shopId) params.append('shopId', query.shopId);
    if (query?.customerId) params.append('customerId', query.customerId);

    return apiRequest<any[]>(
      `/api/v1/admin/orders/search${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getExceptionQueue: async (query?: OffsetPaginationQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());

    return apiRequest<OrderGovernance[]>(
      `/api/v1/admin/orders/exceptions${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getOrderGovernance: async (orderId: string) => {
    return apiRequest<OrderGovernance>(
      `/api/v1/admin/orders/${orderId}/governance`,
    );
  },

  addOperationalNote: async (
    orderId: string,
    note: string,
    isInternal: boolean = true,
  ) => {
    return apiRequest<OrderOperationalNote>(
      `/api/v1/admin/orders/${orderId}/notes`,
      {
        method: 'POST',
        body: JSON.stringify({ note, isInternal }),
      },
    );
  },

  manualIntervention: async (
    orderId: string,
    action: string,
    reason: string,
  ) => {
    return apiRequest<OrderGovernance>(
      `/api/v1/admin/orders/${orderId}/intervene`,
      {
        method: 'POST',
        body: JSON.stringify({ action, reason }),
      },
    );
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Payments Governance API
// ──────────────────────────────────────────────────────────────────────────────

export const paymentsGovernanceApi = {
  getProviderHealth: async () => {
    return apiRequest<PaymentProvider[]>('/api/v1/admin/payments/health');
  },

  searchTransactions: async (
    query?: OffsetPaginationQuery & {
      search?: string;
      status?: string;
      provider?: string;
    },
  ) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.status) params.append('status', query.status);
    if (query?.provider) params.append('provider', query.provider);

    return apiRequest<any[]>(
      `/api/v1/admin/payments/transactions${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getSettlements: async (
    query?: OffsetPaginationQuery & {
      status?: string;
    },
  ) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.status) params.append('status', query.status);

    return apiRequest<any[]>(
      `/api/v1/admin/payments/settlements${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getRefunds: async (
    query?: OffsetPaginationQuery & {
      status?: string;
    },
  ) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.status) params.append('status', query.status);

    return apiRequest<any[]>(
      `/api/v1/admin/payments/refunds${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getFinancialExceptions: async (
    query?: OffsetPaginationQuery & {
      type?: string;
      status?: string;
    },
  ) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.type) params.append('type', query.type);
    if (query?.status) params.append('status', query.status);

    return apiRequest<FinancialException[]>(
      `/api/v1/admin/payments/exceptions${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Returns Governance API
// ──────────────────────────────────────────────────────────────────────────────

export const returnsGovernanceApi = {
  getReturnsQueue: async (
    query?: OffsetPaginationQuery & {
      status?: string;
    },
  ) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.status) params.append('status', query.status);

    return apiRequest<ReturnGovernance[]>(
      `/api/v1/admin/returns/queue${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getReturnGovernance: async (returnId: string) => {
    return apiRequest<ReturnGovernance>(`/api/v1/admin/returns/${returnId}`);
  },

  overridePolicy: async (returnId: string, overrideReason: string) => {
    return apiRequest<ReturnGovernance>(
      `/api/v1/admin/returns/${returnId}/override-policy`,
      {
        method: 'POST',
        body: JSON.stringify({ reason: overrideReason }),
      },
    );
  },

  getDisputes: async (
    query?: OffsetPaginationQuery & {
      status?: string;
    },
  ) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.status) params.append('status', query.status);

    return apiRequest<ReturnGovernance[]>(
      `/api/v1/admin/returns/disputes${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getFraudReview: async (
    query?: OffsetPaginationQuery & {
      status?: string;
    },
  ) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.status) params.append('status', query.status);

    return apiRequest<ReturnGovernance[]>(
      `/api/v1/admin/returns/fraud-review${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// CMS Governance API
// ──────────────────────────────────────────────────────────────────────────────

export const cmsGovernanceApi = {
  getContent: async (type?: string) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);

    return apiRequest<CMSContent[]>(
      `/api/v1/admin/cms${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getContentById: async (contentId: string) => {
    return apiRequest<CMSContent>(`/api/v1/admin/cms/${contentId}`);
  },

  createContent: async (content: Partial<CMSContent>) => {
    return apiRequest<CMSContent>('/api/v1/admin/cms', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  },

  updateContent: async (contentId: string, content: Partial<CMSContent>) => {
    return apiRequest<CMSContent>(`/api/v1/admin/cms/${contentId}`, {
      method: 'PATCH',
      body: JSON.stringify(content),
    });
  },

  publishContent: async (contentId: string) => {
    return apiRequest<CMSContent>(`/api/v1/admin/cms/${contentId}/publish`, {
      method: 'POST',
    });
  },

  scheduleContent: async (contentId: string, scheduledFor: string) => {
    return apiRequest<CMSContent>(`/api/v1/admin/cms/${contentId}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduledFor }),
    });
  },

  getVersionHistory: async (contentId: string) => {
    return apiRequest<CMSVersionHistory[]>(
      `/api/v1/admin/cms/${contentId}/versions`,
    );
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Security Operations API
// ──────────────────────────────────────────────────────────────────────────────

export const securityOperationsApi = {
  getAuditLogs: async (
    query?: OffsetPaginationQuery & {
      userId?: string;
      action?: string;
      resource?: string;
      startDate?: string;
      endDate?: string;
    },
  ) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.userId) params.append('userId', query.userId);
    if (query?.action) params.append('action', query.action);
    if (query?.resource) params.append('resource', query.resource);
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);

    return apiRequest<SecurityAuditLog[]>(
      `/api/v1/admin/security/audit-logs${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getActiveSessions: async (userId?: string) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);

    return apiRequest<ActiveSession[]>(
      `/api/v1/admin/security/sessions${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  revokeSession: async (sessionId: string) => {
    return apiRequest<{ success: boolean }>(
      `/api/v1/admin/security/sessions/${sessionId}`,
      {
        method: 'DELETE',
      },
    );
  },

  getRBAC: async () => {
    return apiRequest<any>('/api/v1/admin/security/rbac');
  },

  getPermissions: async () => {
    return apiRequest<any>('/api/v1/admin/security/permissions');
  },

  getFailedLogins: async (
    query?: OffsetPaginationQuery & {
      userId?: string;
    },
  ) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.userId) params.append('userId', query.userId);

    return apiRequest<FailedLoginAttempt[]>(
      `/api/v1/admin/security/failed-logins${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getSecurityAlerts: async (
    query?: OffsetPaginationQuery & {
      severity?: string;
      status?: string;
    },
  ) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.severity) params.append('severity', query.severity);
    if (query?.status) params.append('status', query.status);

    return apiRequest<SecurityAlert[]>(
      `/api/v1/admin/security/alerts${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  resolveAlert: async (alertId: string, resolution: string) => {
    return apiRequest<SecurityAlert>(
      `/api/v1/admin/security/alerts/${alertId}/resolve`,
      {
        method: 'POST',
        body: JSON.stringify({ resolution }),
      },
    );
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// System Operations API
// ──────────────────────────────────────────────────────────────────────────────

export const systemOperationsApi = {
  getBackgroundJobs: async (
    query?: OffsetPaginationQuery & {
      status?: string;
      type?: string;
    },
  ) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.status) params.append('status', query.status);
    if (query?.type) params.append('type', query.type);

    return apiRequest<BackgroundJob[]>(
      `/api/v1/admin/system/jobs${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getQueueStatus: async () => {
    return apiRequest<QueueStatus[]>('/api/v1/admin/system/queues');
  },

  getCacheStatus: async () => {
    return apiRequest<CacheStatus[]>('/api/v1/admin/system/cache');
  },

  getSearchIndexStatus: async () => {
    return apiRequest<SearchIndexStatus[]>('/api/v1/admin/system/search-index');
  },

  getStorageHealth: async () => {
    return apiRequest<StorageHealth[]>('/api/v1/admin/system/storage');
  },

  getDatabaseHealth: async () => {
    return apiRequest<DatabaseHealth>('/api/v1/admin/system/database');
  },

  getAPIHealth: async () => {
    return apiRequest<APIHealth[]>('/api/v1/admin/system/api');
  },

  getScheduledTasks: async () => {
    return apiRequest<ScheduledTask[]>('/api/v1/admin/system/scheduled-tasks');
  },

  triggerTask: async (taskId: string) => {
    return apiRequest<ScheduledTask>(
      `/api/v1/admin/system/scheduled-tasks/${taskId}/trigger`,
      {
        method: 'POST',
      },
    );
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Reports API
// ──────────────────────────────────────────────────────────────────────────────

export const reportsApi = {
  generateRevenueReport: async (query?: {
    startDate?: string;
    endDate?: string;
    period?: string;
  }) => {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.period) params.append('period', query.period);

    return apiRequest<any>(
      `/api/v1/admin/reports/revenue${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  generateCommerceReport: async (query?: {
    startDate?: string;
    endDate?: string;
    period?: string;
  }) => {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.period) params.append('period', query.period);

    return apiRequest<any>(
      `/api/v1/admin/reports/commerce${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  generateCustomerReport: async (query?: {
    startDate?: string;
    endDate?: string;
    segment?: string;
  }) => {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.segment) params.append('segment', query.segment);

    return apiRequest<any>(
      `/api/v1/admin/reports/customers${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  generateShopReport: async (query?: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.status) params.append('status', query.status);

    return apiRequest<any>(
      `/api/v1/admin/reports/shops${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  generateSecurityReport: async (query?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }) => {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.type) params.append('type', query.type);

    return apiRequest<any>(
      `/api/v1/admin/reports/security${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  generateAuditReport: async (query?: {
    startDate?: string;
    endDate?: string;
    action?: string;
  }) => {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.action) params.append('action', query.action);

    return apiRequest<any>(
      `/api/v1/admin/reports/audit${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  generateOperationsReport: async (query?: {
    startDate?: string;
    endDate?: string;
    metric?: string;
  }) => {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.metric) params.append('metric', query.metric);

    return apiRequest<any>(
      `/api/v1/admin/reports/operations${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Platform Settings API
// ──────────────────────────────────────────────────────────────────────────────

export const platformSettingsApi = {
  getGlobalSettings: async () => {
    return apiRequest<any>('/api/v1/admin/settings/global');
  },

  updateGlobalSettings: async (settings: Record<string, unknown>) => {
    return apiRequest<any>('/api/v1/admin/settings/global', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  getTaxSettings: async () => {
    return apiRequest<TaxSetting>('/api/v1/admin/settings/tax');
  },

  updateTaxSettings: async (settings: Record<string, unknown>) => {
    return apiRequest<TaxSetting>('/api/v1/admin/settings/tax', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  getCommissionSettings: async () => {
    return apiRequest<CommissionSetting>('/api/v1/admin/settings/commission');
  },

  updateCommissionSettings: async (settings: Record<string, unknown>) => {
    return apiRequest<CommissionSetting>('/api/v1/admin/settings/commission', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  getShippingSettings: async () => {
    return apiRequest<ShippingDefault>('/api/v1/admin/settings/shipping');
  },

  updateShippingSettings: async (settings: Record<string, unknown>) => {
    return apiRequest<ShippingDefault>('/api/v1/admin/settings/shipping', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  getPaymentSettings: async () => {
    return apiRequest<any>('/api/v1/admin/settings/payment');
  },

  updatePaymentSettings: async (settings: Record<string, unknown>) => {
    return apiRequest<any>('/api/v1/admin/settings/payment', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  getCMSSettings: async () => {
    return apiRequest<any>('/api/v1/admin/settings/cms');
  },

  updateCMSSettings: async (settings: Record<string, unknown>) => {
    return apiRequest<any>('/api/v1/admin/settings/cms', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  getNotificationSettings: async () => {
    return apiRequest<any>('/api/v1/admin/settings/notifications');
  },

  updateNotificationSettings: async (settings: Record<string, unknown>) => {
    return apiRequest<any>('/api/v1/admin/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  getFeatureFlags: async () => {
    return apiRequest<FeatureFlag[]>('/api/v1/admin/settings/feature-flags');
  },

  updateFeatureFlag: async (
    flagId: string,
    enabled: boolean,
    reason?: string,
  ) => {
    return apiRequest<FeatureFlag>(
      `/api/v1/admin/settings/feature-flags/${flagId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ enabled, reason }),
      },
    );
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Analytics API
// ──────────────────────────────────────────────────────────────────────────────

export const analyticsApi = {
  getCommerceAnalytics: async (query?: {
    startDate?: string;
    endDate?: string;
    period?: string;
  }) => {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.period) params.append('period', query.period);

    return apiRequest<CommerceAnalytics>(
      `/api/v1/admin/analytics/commerce${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getOperationalAnalytics: async (query?: {
    startDate?: string;
    endDate?: string;
    metric?: string;
  }) => {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.metric) params.append('metric', query.metric);

    return apiRequest<OperationalAnalytics>(
      `/api/v1/admin/analytics/operational${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getSecurityAnalytics: async (query?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }) => {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.type) params.append('type', query.type);

    return apiRequest<SecurityAnalytics>(
      `/api/v1/admin/analytics/security${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getPerformanceAnalytics: async (query?: {
    startDate?: string;
    endDate?: string;
    metric?: string;
  }) => {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.metric) params.append('metric', query.metric);

    return apiRequest<any>(
      `/api/v1/admin/analytics/performance${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getCustomerAnalytics: async (query?: {
    startDate?: string;
    endDate?: string;
    segment?: string;
  }) => {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.segment) params.append('segment', query.segment);

    return apiRequest<any>(
      `/api/v1/admin/analytics/customers${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getShopAnalytics: async (query?: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.status) params.append('status', query.status);

    return apiRequest<any>(
      `/api/v1/admin/analytics/shops${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },
};
