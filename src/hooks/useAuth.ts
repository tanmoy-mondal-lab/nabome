// ─────────────────────────────────────────────────────────────
// USE AUTH — Hook for auth actions with loading/error states
// Security: Uses httpOnly cookies for tokens, no localStorage
// Handles session restore via API call and auto-refresh
// ─────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth-store";
import { authApi, type LoginRequest, type RegisterRequest } from "../lib/api/auth";
import { ApiError } from "../lib/api/client";
import { useCartStore } from "../storefront/stores/cart-store";
import { useCartSync } from "../storefront/hooks/useCartSync";

export function useAuth() {
  const store = useAuthStore();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { items } = useCartStore();
  const { mergeGuestCartOnServer, hydrateServerCart } = useCartSync(items);

  // ── Restore session on mount using cookies ──
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await authApi.me();
        store.setAuth(res.user);
      } catch {
        store.setLoading(false);
      }
    };
    restoreSession();
  }, [store]);

  // ── Listen for forced logout from API client (session expired) ──
  useEffect(() => {
    const handleForceLogout = () => {
      store.clearAuth();
      useCartStore.getState().switchUser();
      queryClient.removeQueries({ queryKey: ["auth"] });
    };
    window.addEventListener("auth:logout", handleForceLogout);
    return () => window.removeEventListener("auth:logout", handleForceLogout);
  }, [store, queryClient]);

  // ── Proactive refresh timer ──
  // Uses API refresh endpoint which sets new cookies automatically
  useEffect(() => {
    const checkAndRefresh = async () => {
      try {
        await authApi.refresh();
      } catch {
        store.clearAuth();
        useCartStore.getState().switchUser();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
    };

    const refreshTimer = setInterval(checkAndRefresh, 30_000);
    return () => clearInterval(refreshTimer);
  }, [store]);

  const login = useCallback(
    async (data: LoginRequest) => {
      setError(null);
      try {
        const guestCartItems = useCartStore.getState().items;
        const res = await authApi.login(data);
        store.setAuth(res.user);
        if (guestCartItems.length > 0) {
          await mergeGuestCartOnServer(guestCartItems);
        } else {
          await hydrateServerCart();
        }
        return res.user;
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Login failed";
        setError(message);
        throw err;
      }
    },
    [store, mergeGuestCartOnServer, hydrateServerCart]
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
    useCartStore.getState().switchUser();
    queryClient.removeQueries({ queryKey: ["auth"] });
  }, [store, queryClient]);

  const resendVerification = useCallback(async (email: string, turnstileToken?: string) => {
    setError(null);
    try {
      return await authApi.resendVerification(email, turnstileToken);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to resend verification email";
      setError(message);
      throw err;
    }
  }, []);

  const forgotPassword = useCallback(async (email: string, turnstileToken?: string) => {
    setError(null);
    try {
      return await authApi.forgotPassword(email, turnstileToken);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to send reset code";
      setError(message);
      throw err;
    }
  }, []);

  const verifyResetCode = useCallback(async (email: string, code: string, turnstileToken?: string) => {
    setError(null);
    try {
      return await authApi.verifyResetCode(email, code, turnstileToken);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Invalid verification code";
      setError(message);
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (email: string, code: string, password: string, turnstileToken?: string) => {
    setError(null);
    try {
      return await authApi.resetPassword(email, code, password, turnstileToken);
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
    verifyResetCode,
    resetPassword,
    changePassword,
    updateProfile,
  };
}
