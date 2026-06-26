import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/auth-store';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'customer' as const,
  avatarUrl: null,
  phone: null,
  emailVerified: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  lastLoginAt: null,
  loginCount: 0,
};

const mockAdminUser = {
  ...mockUser,
  id: 'admin-1',
  email: 'admin@example.com',
  role: 'admin' as const,
};

describe('auth-store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
    });
  });

  describe('setAuth', () => {
    it('should set all auth fields', () => {
      useAuthStore.getState().setAuth(mockUser, 'access-123', 'refresh-123', Date.now() + 3600000);
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe('access-123');
      expect(state.refreshToken).toBe('refresh-123');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should derive isAdmin from customer role', () => {
      useAuthStore.getState().setAuth(mockUser, 'access', 'refresh', Date.now());
      expect(useAuthStore.getState().isAdmin).toBe(false);
    });

    it('should derive isAdmin from admin role', () => {
      useAuthStore.getState().setAuth(mockAdminUser, 'access', 'refresh', Date.now());
      expect(useAuthStore.getState().isAdmin).toBe(true);
    });
  });

  describe('setUser', () => {
    it('should update user', () => {
      useAuthStore.getState().setAuth(mockUser, 'access', 'refresh', Date.now());
      const updatedUser = { ...mockUser, firstName: 'Jane' };
      useAuthStore.getState().setUser(updatedUser);
      expect(useAuthStore.getState().user?.firstName).toBe('Jane');
    });

    it('should update isAdmin when role changes', () => {
      useAuthStore.getState().setAuth(mockUser, 'access', 'refresh', Date.now());
      expect(useAuthStore.getState().isAdmin).toBe(false);
      useAuthStore.getState().setUser(mockAdminUser);
      expect(useAuthStore.getState().isAdmin).toBe(true);
    });
  });

  describe('setTokens', () => {
    it('should update tokens', () => {
      useAuthStore.getState().setAuth(mockUser, 'old-access', 'old-refresh', Date.now());
      useAuthStore.getState().setTokens('new-access', 'new-refresh', Date.now() + 7200000);
      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('new-access');
      expect(state.refreshToken).toBe('new-refresh');
    });

    it('should not change user', () => {
      useAuthStore.getState().setAuth(mockUser, 'access', 'refresh', Date.now());
      useAuthStore.getState().setTokens('new-access', 'new-refresh', Date.now());
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });
  });

  describe('setLoading', () => {
    it('should set loading to true', () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it('should set loading to false', () => {
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('clearAuth', () => {
    it('should reset all fields', () => {
      useAuthStore.getState().setAuth(mockUser, 'access', 'refresh', Date.now());
      useAuthStore.getState().clearAuth();
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isAdmin).toBe(false);
    });
  });

  describe('initial state', () => {
    it('should have correct defaults', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isAdmin).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });
});
