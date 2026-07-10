export type Permission = string;
export declare const PERMISSIONS: {
    readonly PRODUCTS_READ: "products:read";
    readonly PRODUCTS_CREATE: "products:create";
    readonly PRODUCTS_UPDATE: "products:update";
    readonly PRODUCTS_DELETE: "products:delete";
    readonly PRODUCTS_PUBLISH: "products:publish";
    readonly ORDERS_READ: "orders:read";
    readonly ORDERS_UPDATE: "orders:update";
    readonly ORDERS_CANCEL: "orders:cancel";
    readonly ORDERS_REFUND: "orders:refund";
    readonly ORDERS_DELETE: "orders:delete";
    readonly CUSTOMERS_READ: "customers:read";
    readonly CUSTOMERS_UPDATE: "customers:update";
    readonly CUSTOMERS_DELETE: "customers:delete";
    readonly CUSTOMERS_BAN: "customers:ban";
    readonly CATEGORIES_READ: "categories:read";
    readonly CATEGORIES_CREATE: "categories:create";
    readonly CATEGORIES_UPDATE: "categories:update";
    readonly CATEGORIES_DELETE: "categories:delete";
    readonly BRANDS_READ: "brands:read";
    readonly BRANDS_CREATE: "brands:create";
    readonly BRANDS_UPDATE: "brands:update";
    readonly BRANDS_DELETE: "brands:delete";
    readonly COUPONS_READ: "coupons:read";
    readonly COUPONS_CREATE: "coupons:create";
    readonly COUPONS_UPDATE: "coupons:update";
    readonly COUPONS_DELETE: "coupons:delete";
    readonly CAMPAIGNS_READ: "campaigns:read";
    readonly CAMPAIGNS_CREATE: "campaigns:create";
    readonly CAMPAIGNS_UPDATE: "campaigns:update";
    readonly CAMPAIGNS_DELETE: "campaigns:delete";
    readonly CMS_READ: "cms:read";
    readonly CMS_CREATE: "cms:create";
    readonly CMS_UPDATE: "cms:update";
    readonly CMS_DELETE: "cms:delete";
    readonly CMS_PUBLISH: "cms:publish";
    readonly ANALYTICS_READ: "analytics:read";
    readonly ANALYTICS_EXPORT: "analytics:export";
    readonly SETTINGS_READ: "settings:read";
    readonly SETTINGS_UPDATE: "settings:update";
    readonly USERS_READ: "users:read";
    readonly USERS_CREATE: "users:create";
    readonly USERS_UPDATE: "users:update";
    readonly USERS_DELETE: "users:delete";
    readonly USERS_ROLES: "users:roles";
    readonly SUPPORT_READ: "support:read";
    readonly SUPPORT_UPDATE: "support:update";
    readonly SUPPORT_DELETE: "support:delete";
    readonly RETURNS_READ: "returns:read";
    readonly RETURNS_CREATE: "returns:create";
    readonly RETURNS_APPROVE: "returns:approve";
    readonly RETURNS_REJECT: "returns:reject";
    readonly RETURNS_PROCESS: "returns:process";
    readonly REFUNDS_READ: "refunds:read";
    readonly REFUNDS_CREATE: "refunds:create";
    readonly REFUNDS_PROCESS: "refunds:process";
    readonly REPORTS_READ: "reports:read";
    readonly REPORTS_EXPORT: "reports:export";
    readonly AUDIT_READ: "audit:read";
    readonly AUDIT_DELETE: "audit:delete";
    readonly SYSTEM_HEALTH: "system:health";
    readonly SYSTEM_CONFIG: "system:config";
    readonly SYSTEM_MIGRATE: "system:migrate";
};
export declare const ROLE_PERMISSIONS: Record<string, Permission[]>;
/**
 * Check if a role has a specific permission
 */
export declare function hasPermission(role: string, permission: Permission): boolean;
/**
 * Check if a role has any of the specified permissions
 */
export declare function hasAnyPermission(role: string, permissions: Permission[]): boolean;
/**
 * Check if a role has all of the specified permissions
 */
export declare function hasAllPermissions(role: string, permissions: Permission[]): boolean;
/**
 * Get all permissions for a role
 */
export declare function getPermissionsForRole(role: string): Permission[];
/**
 * Check if a user can perform an action based on their role
 */
export declare function canPerformAction(role: string, action: string): boolean;
