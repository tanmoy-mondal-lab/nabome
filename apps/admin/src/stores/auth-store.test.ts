import { beforeEach, describe, expect, it } from 'vitest';

import type { User } from '@nabome/types';

import { useAuthStore } from './auth-store';

function makeUser(role: User['role']): User {
  return {
    id: 'u1',
    email: 'admin@nabome.online',
    firstName: 'Ada',
    role,
    status: 'active',
    locale: 'en-IN',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    isActive: true,
  };
}

describe('admin auth store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      status: 'guest',
    });
  });

  it('admits platform admins', () => {
    useAuthStore.getState().setUser(makeUser('admin'));
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().isAdmin()).toBe(true);
  });

  it('rejects shop owners and customers', () => {
    useAuthStore.getState().setUser(makeUser('shop_owner'));
    expect(useAuthStore.getState().isAdmin()).toBe(false);
    useAuthStore.getState().setUser(makeUser('customer'));
    expect(useAuthStore.getState().isAdmin()).toBe(false);
  });

  it('rejects guests', () => {
    expect(useAuthStore.getState().isAdmin()).toBe(false);
  });

  it('clears the session', () => {
    useAuthStore.getState().setUser(makeUser('admin'));
    useAuthStore.getState().clearUser();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().isAdmin()).toBe(false);
  });
});
