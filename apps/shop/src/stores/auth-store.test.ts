import { beforeEach, describe, expect, it } from 'vitest';

import type { User } from '@nabome/types';

import { useAuthStore } from './auth-store';

function makeUser(role: User['role']): User {
  return {
    id: 'u1',
    email: 'owner@nabome.online',
    firstName: 'Omar',
    role,
    status: 'active',
    locale: 'en-IN',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    isActive: true,
  };
}

describe('shop auth store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      status: 'guest',
    });
  });

  it('admits shop owners', () => {
    useAuthStore.getState().setUser(makeUser('shop_owner'));
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().isShopOwner()).toBe(true);
  });

  it('admits admins via the additive hierarchy', () => {
    useAuthStore.getState().setUser(makeUser('admin'));
    expect(useAuthStore.getState().isShopOwner()).toBe(true);
  });

  it('rejects customers and guests', () => {
    useAuthStore.getState().setUser(makeUser('customer'));
    expect(useAuthStore.getState().isShopOwner()).toBe(false);
    useAuthStore.getState().clearUser();
    expect(useAuthStore.getState().isShopOwner()).toBe(false);
  });
});
