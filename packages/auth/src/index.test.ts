import { describe, expect, it } from 'vitest';

import { can, hasRole, permissionsFor } from './rbac.ts';
import { isPasswordPolicyCompliant } from './session.ts';

describe('rbac', () => {
  it('implements the additive hierarchy', () => {
    expect(hasRole('admin', 'customer')).toBe(true);
    expect(hasRole('customer', 'admin')).toBe(false);
  });

  it('defaults to deny for unknown permissions', () => {
    expect(can('admin', 'system:users:create' as never)).toBe(false);
  });

  it('grants catalog reads to guests and writes to shop owners', () => {
    expect(can('guest', 'catalog:products:read')).toBe(true);
    expect(can('customer', 'catalog:products:create')).toBe(false);
    expect(can('shop_owner', 'catalog:products:create')).toBe(true);
    expect(can('shop_owner', 'catalog:products:delete')).toBe(false);
    expect(can('admin', 'catalog:products:delete')).toBe(true);
  });

  it('exposes granted permission lists', () => {
    expect(permissionsFor('guest')).toContain('catalog:products:read');
    expect(permissionsFor('guest')).not.toContain('orders:orders:manage');
  });
});

describe('password policy', () => {
  it('enforces the 8..128 length bounds', () => {
    expect(isPasswordPolicyCompliant('1234567')).toBe(false);
    expect(isPasswordPolicyCompliant('12345678')).toBe(true);
  });
});
