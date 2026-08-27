/**
 * Authorization middleware — integrates with @nabome/auth RBAC primitives.
 * Enforces permission checks based on user role and required permissions.
 * Follows the canonical role hierarchy: Guest 0 → Customer 10 → Shop Owner 20 → Admin 30 → System 100.
 */

import { can, hasRole, permissionsFor, type Permission } from '@nabome/auth';
import type { Role } from '@nabome/types';

import type { SessionPrincipal } from '../auth.ts';
import { ApiError } from '../http/errors.ts';

// ── Authorization Context ─────────────────────────────────────────────────────

export interface AuthenticatedContext extends SessionPrincipal {
  role: Role;
  permissions: Permission[];
}

// ── Permission Middleware ─────────────────────────────────────────────────────

/**
 * Require a specific permission. Throws FORBIDDEN if user lacks permission.
 * Uses additive role hierarchy from @nabome/auth (IS-01 resolution).
 */
export function requirePermission(permission: Permission) {
  return (context: AuthenticatedContext): void => {
    if (!can(context.role, permission)) {
      throw ApiError.forbidden(`Permission '${permission}' required`);
    }
  };
}

/**
 * Require at least a specific role level. Throws FORBIDDEN if user's role is lower.
 * Uses additive role hierarchy: higher roles inherit lower role permissions.
 */
export function requireRole(requiredRole: Role) {
  return (context: AuthenticatedContext): void => {
    if (!hasRole(context.role, requiredRole)) {
      throw ApiError.forbidden(`Role '${requiredRole}' required`);
    }
  };
}

/**
 * Require one of multiple permissions (OR logic). Throws FORBIDDEN if user lacks all.
 */
export function requireAnyPermission(...permissions: Permission[]) {
  return (context: AuthenticatedContext): void => {
    const hasAny = permissions.some((permission) =>
      can(context.role, permission),
    );
    if (!hasAny) {
      throw ApiError.forbidden(
        `One of permissions required: ${permissions.join(', ')}`,
      );
    }
  };
}

/**
 * Require all specified permissions (AND logic). Throws FORBIDDEN if user lacks any.
 */
export function requireAllPermissions(...permissions: Permission[]) {
  return (context: AuthenticatedContext): void => {
    const hasAll = permissions.every((permission) =>
      can(context.role, permission),
    );
    if (!hasAll) {
      throw ApiError.forbidden(
        `All permissions required: ${permissions.join(', ')}`,
      );
    }
  };
}

// ── Resource Ownership Checks ─────────────────────────────────────────────────

/**
 * Check if user owns a resource (e.g., their own profile, orders).
 * This is a common pattern for customer-level access control.
 */
export function requireOwnership(
  userId: string,
  resourceOwnerId: string,
): void {
  if (userId !== resourceOwnerId) {
    throw ApiError.forbidden(
      'You do not have permission to access this resource',
    );
  }
}

/**
 * Check if user owns a resource OR has admin role.
 * Allows admins to access any resource while restricting customers to their own.
 */
export function requireOwnershipOrAdmin(
  userId: string,
  resourceOwnerId: string,
  userRole: Role,
): void {
  if (userRole === 'admin' || userRole === 'system') {
    return; // Admins can access any resource
  }
  if (userId !== resourceOwnerId) {
    throw ApiError.forbidden(
      'You do not have permission to access this resource',
    );
  }
}

// ── Permission Helpers ────────────────────────────────────────────────────────

/**
 * Get all permissions for a user's role (for UI display or audit logging).
 */
export function getUserPermissions(role: Role): Permission[] {
  return permissionsFor(role);
}

/**
 * Check if user has a specific permission (non-throwing version).
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return can(role, permission);
}

/**
 * Check if user meets minimum role requirement (non-throwing version).
 */
export function meetsRoleRequirement(
  userRole: Role,
  requiredRole: Role,
): boolean {
  return hasRole(userRole, requiredRole);
}

// ── Common Permission Guards ─────────────────────────────────────────────────

/**
 * Guard for customer-only operations (e.g., viewing own orders).
 */
export const customerOnly = requireRole('customer');

/**
 * Guard for shop owner operations (e.g., managing shop products).
 */
export const shopOwnerOnly = requireRole('shop_owner');

/**
 * Guard for admin-only operations (e.g., managing users, platform settings).
 */
export const adminOnly = requireRole('admin');

/**
 * Guard for internal service operations (system role only).
 */
export const systemOnly = requireRole('system');

// ── Resource-Specific Guards ─────────────────────────────────────────────────

/**
 * Guard for product read operations (public access).
 */
export const canReadProducts = requirePermission(
  'catalog:products:read' as Permission,
);

/**
 * Guard for product create operations (shop owner and above).
 */
export const canCreateProducts = requirePermission(
  'catalog:products:create' as Permission,
);

/**
 * Guard for product update operations (shop owner and above).
 */
export const canUpdateProducts = requirePermission(
  'catalog:products:update' as Permission,
);

/**
 * Guard for product delete operations (admin only).
 */
export const canDeleteProducts = requirePermission(
  'catalog:products:delete' as Permission,
);

/**
 * Guard for order management (customer and above).
 */
export const canManageOrders = requirePermission(
  'orders:orders:read' as Permission,
);

/**
 * Guard for user management (admin only).
 */
export const canManageUsers = requirePermission(
  'system:users:manage' as Permission,
);
