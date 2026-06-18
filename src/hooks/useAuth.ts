// ─────────────────────────────────────────────────────────────
// USE AUTH — Hook for auth actions with loading/error states
// ─────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from "react";
import { useAuthStore } from "../stores/auth-store";
import { authApi, type LoginRequest, type RegisterRequest } from "../lib/api/auth";
import { ApiError } from "../lib/api/client";

export function useAuth() {
  const store = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  // Initialize — restore session on mount
  useEffect(() => {
    if (store.accessToken && !store.user) {
      authApi
        .me()
        .then((res) => {
          store.setUser(res.user);
          store.setLoading(false);
        })
        .catch(() => {
          store.clearAuth();
          store.setLoading(false);
        });
    } else {
      store.setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (data: LoginRequest) => {
      setError(null);
      try {
        const res = await authApi.login(data);
        store.setAuth(res.user, res.session.accessToken, res.session.refreshToken, res.session.expiresAt);
        return res.user;
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Login failed";
        setError(message);
        throw err;
      }
    },
    [store]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      setError(null);
      try {
        const res = await authApi.register(data);
        return res;
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Registration failed";
        setError(message);
        throw err;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Proceed even if API call fails
    }
    store.clearAuth();
  }, [store]);

  const forgotPassword = useCallback(async (email: string) => {
    setError(null);
    try {
      return await authApi.forgotPassword(email);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to send reset email";
      setError(message);
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (password: string) => {
    setError(null);
    try {
      return await authApi.resetPassword(password);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to reset password";
      setError(message);
      throw err;
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setError(null);
    try {
      return await authApi.changePassword(currentPassword, newPassword);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to change password";
      setError(message);
      throw err;
    }
  }, []);

  const updateProfile = useCallback(
    async (data: Parameters<typeof authApi.updateMe>[0]) => {
      setError(null);
      try {
        const res = await authApi.updateMe(data);
        store.setUser(res.user);
        return res.user;
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Failed to update profile";
        setError(message);
        throw err;
      }
    },
    [store]
  );

  return {
    // State
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isAdmin: store.isAdmin,
    isLoading: store.isLoading,
    error,

    // Actions
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
  };
}
