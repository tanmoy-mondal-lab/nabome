/**
 * Admin Permissions Hook
 * Source: IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md
 */

import { useMemo } from 'react';

import type { Permission, PermissionCheck } from '@/types/admin';

interface UseAdminPermissionsOptions {
  permissions?: Permission[];
}

export function useAdminPermissions({
  permissions = [],
}: UseAdminPermissionsOptions = {}) {
  const hasPermission = useMemo(() => {
    return (requiredPermission: Permission): boolean => {
      return permissions.includes(requiredPermission);
    };
  }, [permissions]);

  const hasAnyPermission = useMemo(() => {
    return (requiredPermissions: Permission[]): boolean => {
      return requiredPermissions.some((p) => permissions.includes(p));
    };
  }, [permissions]);

  const hasAllPermissions = useMemo(() => {
    return (requiredPermissions: Permission[]): boolean => {
      return requiredPermissions.every((p) => permissions.includes(p));
    };
  }, [permissions]);

  const checkPermission = useMemo(() => {
    return (requiredPermission: Permission): PermissionCheck => {
      const allowed = permissions.includes(requiredPermission);
      return {
        allowed,
        reason: allowed
          ? undefined
          : `Missing permission: ${requiredPermission}`,
      };
    };
  }, [permissions]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkPermission,
    permissions,
  };
}
