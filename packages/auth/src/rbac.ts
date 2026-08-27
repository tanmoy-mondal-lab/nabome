import type { Role } from '@nabome/types';

/**
 * RBAC primitives — additive role hierarchy and `{scope}:{resource}:{action}`
 * permissions (MASTER_ARCHITECTURE_BLUEPRINT.md B.8, binding).
 * Framework-agnostic: no React, no platform APIs.
 */

export const ROLE_HIERARCHY: readonly Role[] = [
  'guest',
  'customer',
  'shop_owner',
  'admin',
  'system',
] as const;

export const ROLE_LEVEL: Record<Role, number> = {
  guest: 0,
  customer: 10,
  shop_owner: 20,
  admin: 30,
  system: 100,
};

/** Whether `role` has at least the access level of `required`. */
export function hasRole(role: Role, required: Role): boolean {
  return ROLE_LEVEL[role] >= ROLE_LEVEL[required];
}

export type Scope =
  | 'catalog'
  | 'cart'
  | 'checkout'
  | 'orders'
  | 'account'
  | 'shop'
  | 'customers'
  | 'analytics'
  | 'finance'
  | 'cms'
  | 'media'
  | 'settings'
  | 'system';

export type Resource =
  | 'products'
  | 'categories'
  | 'collections'
  | 'brands'
  | 'variants'
  | 'inventory'
  | 'coupons'
  | 'reviews'
  | 'orders'
  | 'returns'
  | 'refunds'
  | 'shipments'
  | 'customers'
  | 'notifications'
  | 'webhooks'
  | 'exports'
  | 'settings'
  | 'users'
  | 'cart'
  | 'analytics'
  | 'cms'
  | 'media';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';

/** Canonical permission string: `{scope}:{resource}:{action}` (B.8). */
export type Permission = `${Scope}:${Resource}:${Action}`;

/**
 * Minimum role required for each permission. Additive hierarchy means any
 * higher role inherits the permission. Default-deny: unknown permissions are
 * forbidden (SEC §2 / TECH_STACK §4.2).
 */
export const PERMISSION_ROLES: Partial<Record<Permission, Role>> = {
  'catalog:products:read': 'guest',
  'catalog:categories:read': 'guest',
  'catalog:collections:read': 'guest',
  'catalog:brands:read': 'guest',
  'catalog:products:create': 'shop_owner',
  'catalog:products:update': 'shop_owner',
  'catalog:products:delete': 'admin',
  'catalog:categories:create': 'admin',
  'catalog:categories:update': 'admin',
  'catalog:categories:delete': 'admin',
  'cart:cart:create': 'guest',
  'cart:cart:read': 'customer',
  'cart:cart:update': 'customer',
  'cart:cart:delete': 'customer',
  'checkout:orders:create': 'customer',
  'orders:orders:read': 'customer',
  'orders:orders:update': 'admin',
  'orders:orders:manage': 'admin',
  'orders:returns:create': 'customer',
  'orders:returns:update': 'admin',
  'account:users:read': 'customer',
  'account:users:update': 'customer',
  'shop:products:manage': 'shop_owner',
  'shop:orders:manage': 'shop_owner',
  'shop:customers:read': 'shop_owner',
  'shop:analytics:read': 'shop_owner',
  'shop:settings:update': 'shop_owner',
  'analytics:analytics:read': 'admin',
  'finance:refunds:manage': 'admin',
  'cms:cms:update': 'admin',
  'media:media:manage': 'shop_owner',
  'settings:settings:update': 'admin',
  'system:users:manage': 'admin',
  'system:webhooks:manage': 'admin',
};

/** Whether `role` may perform `permission` (default deny). */
export function can(role: Role, permission: Permission): boolean {
  const required = PERMISSION_ROLES[permission];
  if (!required) {
    return false;
  }
  return hasRole(role, required);
}

/** List permissions granted to a role (for auditing / UI). */
export function permissionsFor(role: Role): Permission[] {
  return (Object.keys(PERMISSION_ROLES) as Permission[]).filter((permission) =>
    can(role, permission),
  );
}

/** The single explicit `super_admin` capability flag (B.8). */
export const SUPER_ADMIN_PERMISSION = 'system:users:manage' as const;
