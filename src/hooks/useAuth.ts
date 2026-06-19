// ─────────────────────────────────────────────────────────────
// USE AUTH — Hook for auth actions with loading/error states
// Handles session restore, auto-refresh, and expiry detection
// ─────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect, useRef } from "react";
import { useAuthStore } from "../stores/auth-store";
import { authApi, type LoginRequest, type RegisterRequest } from "../lib/api/auth";
import { ApiError } from "../lib/api/client";

const REFRESH_MARGIN_SECONDS = 60;

export function useAuth() {
  const store = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Listen for forced logout from API client (session expired) ──
  useEffect(() => {
    const handleForceLogout = () => {
      store.clearAuth();
    };
    window.addEventListener("auth:logout", handleForceLogout);
    return () => window.removeEventListener("auth:logout", handleForceLogout);
  }, [store]);

  // ── Proactive refresh timer ──
  // Checks every 30s whether the token is about to expire
  // and attempts a silent refresh before it does
  useEffect(() => {
    if (!store.refreshToken || !store.expiresAt) return;

    const checkAndRefresh = async () => {
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = store.expiresAt! - now;

      if (timeUntilExpiry > REFRESH_MARGIN_SECONDS) return;

      try {
        const res = await authApi.refresh(store.refreshToken!);
        store.setTokens(
          res.session.accessToken,
          res.session.refreshToken,
          res.session.expiresAt
        );
      } catch {
        store.clearAuth();
      }
    };

    refreshTimer.current = setInterval(checkAndRefresh, 30_000);
    checkAndRefresh();

    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [store.refreshToken, store.expiresAt]);

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

  const resendVerification = useCallback(async (email: string) => {
    setError(null);
    try {
      return await authApi.resendVerification(email);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to resend verification email";
      setError(message);
      throw err;
    }
  }, []);

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
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isAdmin: store.isAdmin,
    isLoading: store.isLoading,
    error,

    login,
    register,
    logout,
    resendVerification,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
  };
}
