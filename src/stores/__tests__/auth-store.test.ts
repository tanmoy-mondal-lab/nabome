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
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
    });
  });

  describe('setAuth', () => {
    it('should set all auth fields', () => {
      useAuthStore.getState().setAuth(mockUser);
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isAdmin).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('should derive isAdmin from customer role', () => {
      useAuthStore.getState().setAuth(mockUser);
      expect(useAuthStore.getState().isAdmin).toBe(false);
    });

    it('should derive isAdmin from admin role', () => {
      useAuthStore.getState().setAuth(mockAdminUser);
      expect(useAuthStore.getState().isAdmin).toBe(true);
    });
  });

  describe('setUser', () => {
    it('should update user', () => {
      useAuthStore.getState().setAuth(mockUser);
      const updatedUser = { ...mockUser, firstName: 'Jane' };
      useAuthStore.getState().setUser(updatedUser);
      expect(useAuthStore.getState().user?.firstName).toBe('Jane');
    });

    it('should update isAdmin when role changes', () => {
      useAuthStore.getState().setAuth(mockUser);
      expect(useAuthStore.getState().isAdmin).toBe(false);
      useAuthStore.getState().setUser(mockAdminUser);
      expect(useAuthStore.getState().isAdmin).toBe(true);
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
      useAuthStore.getState().setAuth(mockUser);
      useAuthStore.getState().clearAuth();
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isAdmin).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('initial state', () => {
    it('should have correct defaults', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isAdmin).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });
});
