// ─────────────────────────────────────────────────────────────
// PERMISSIONS SYSTEM — Granular access control
// ─────────────────────────────────────────────────────────────

export type Permission = string;

// Permission categories
export const PERMISSIONS = {
  // Products
  PRODUCTS_READ: "products:read",
  PRODUCTS_CREATE: "products:create",
  PRODUCTS_UPDATE: "products:update",
  PRODUCTS_DELETE: "products:delete",
  PRODUCTS_PUBLISH: "products:publish",
  
  // Orders
  ORDERS_READ: "orders:read",
  ORDERS_UPDATE: "orders:update",
  ORDERS_CANCEL: "orders:cancel",
  ORDERS_REFUND: "orders:refund",
  ORDERS_DELETE: "orders:delete",
  
  // Customers
  CUSTOMERS_READ: "customers:read",
  CUSTOMERS_UPDATE: "customers:update",
  CUSTOMERS_DELETE: "customers:delete",
  CUSTOMERS_BAN: "customers:ban",
  
  // Categories
  CATEGORIES_READ: "categories:read",
  CATEGORIES_CREATE: "categories:create",
  CATEGORIES_UPDATE: "categories:update",
  CATEGORIES_DELETE: "categories:delete",
  
  // Brands
  BRANDS_READ: "brands:read",
  BRANDS_CREATE: "brands:create",
  BRANDS_UPDATE: "brands:update",
  BRANDS_DELETE: "brands:delete",
  
  // Coupons
  COUPONS_READ: "coupons:read",
  COUPONS_CREATE: "coupons:create",
  COUPONS_UPDATE: "coupons:update",
  COUPONS_DELETE: "coupons:delete",
  
  // Campaigns
  CAMPAIGNS_READ: "campaigns:read",
  CAMPAIGNS_CREATE: "campaigns:create",
  CAMPAIGNS_UPDATE: "campaigns:update",
  CAMPAIGNS_DELETE: "campaigns:delete",
  
  // Content/CMS
  CMS_READ: "cms:read",
  CMS_CREATE: "cms:create",
  CMS_UPDATE: "cms:update",
  CMS_DELETE: "cms:delete",
  CMS_PUBLISH: "cms:publish",
  
  // Analytics
  ANALYTICS_READ: "analytics:read",
  ANALYTICS_EXPORT: "analytics:export",
  
  // Settings
  SETTINGS_READ: "settings:read",
  SETTINGS_UPDATE: "settings:update",
  
  // Users/Admin
  USERS_READ: "users:read",
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",
  USERS_ROLES: "users:roles",
  
  // Support
  SUPPORT_READ: "support:read",
  SUPPORT_UPDATE: "support:update",
  SUPPORT_DELETE: "support:delete",
  
  // Returns
  RETURNS_READ: "returns:read",
  RETURNS_CREATE: "returns:create",
  RETURNS_APPROVE: "returns:approve",
  RETURNS_REJECT: "returns:reject",
  RETURNS_PROCESS: "returns:process",
  
  // Refunds
  REFUNDS_READ: "refunds:read",
  REFUNDS_CREATE: "refunds:create",
  REFUNDS_PROCESS: "refunds:process",
  
  // Reports
  REPORTS_READ: "reports:read",
  REPORTS_EXPORT: "reports:export",
  
  // Audit Log
  AUDIT_READ: "audit:read",
  AUDIT_DELETE: "audit:delete",
  
  // System
  SYSTEM_HEALTH: "system:health",
  SYSTEM_CONFIG: "system:config",
  SYSTEM_MIGRATE: "system:migrate",
} as const;

// Role-based permission sets
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: Object.values(PERMISSIONS), // Admin has all permissions
  
  seller: [
    // Products
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_PUBLISH,
    
    // Orders
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_UPDATE,
    
    // Customers
    PERMISSIONS.CUSTOMERS_READ,
    
    // Categories
    PERMISSIONS.CATEGORIES_READ,
    
    // Brands
    PERMISSIONS.BRANDS_READ,
    
    // Coupons
    PERMISSIONS.COUPONS_READ,
    
    // Campaigns
    PERMISSIONS.CAMPAIGNS_READ,
    
    // Content
    PERMISSIONS.CMS_READ,
    
    // Analytics
    PERMISSIONS.ANALYTICS_READ,
    
    // Support
    PERMISSIONS.SUPPORT_READ,
    PERMISSIONS.SUPPORT_UPDATE,
    
    // Returns
    PERMISSIONS.RETURNS_READ,
    PERMISSIONS.RETURNS_APPROVE,
    PERMISSIONS.RETURNS_REJECT,
    
    // Refunds
    PERMISSIONS.REFUNDS_READ,
    PERMISSIONS.REFUNDS_PROCESS,
    
    // Reports
    PERMISSIONS.REPORTS_READ,
  ],
  
  customer: [
    // Basic customer permissions
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_CANCEL,
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.BRANDS_READ,
    PERMISSIONS.CAMPAIGNS_READ,
    PERMISSIONS.CMS_READ,
    PERMISSIONS.SUPPORT_READ,
    PERMISSIONS.RETURNS_READ,
    PERMISSIONS.RETURNS_CREATE,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return permissions.some(p => rolePermissions.includes(p));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: string, permissions: Permission[]): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return permissions.every(p => rolePermissions.includes(p));
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a user can perform an action based on their role
 */
export function canPerformAction(role: string, action: string): boolean {
  // Map actions to permissions
  const actionPermissionMap: Record<string, Permission> = {
    "create:product": PERMISSIONS.PRODUCTS_CREATE,
    "update:product": PERMISSIONS.PRODUCTS_UPDATE,
    "delete:product": PERMISSIONS.PRODUCTS_DELETE,
    "publish:product": PERMISSIONS.PRODUCTS_PUBLISH,
    "cancel:order": PERMISSIONS.ORDERS_CANCEL,
    "refund:order": PERMISSIONS.ORDERS_REFUND,
    "ban:user": PERMISSIONS.CUSTOMERS_BAN,
    "create:coupon": PERMISSIONS.COUPONS_CREATE,
    "delete:coupon": PERMISSIONS.COUPONS_DELETE,
    "migrate:database": PERMISSIONS.SYSTEM_MIGRATE,
    "update:settings": PERMISSIONS.SETTINGS_UPDATE,
  };
  
  const permission = actionPermissionMap[action];
  if (!permission) return false;
  
  return hasPermission(role, permission);
}
