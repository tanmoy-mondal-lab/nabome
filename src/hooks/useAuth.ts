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
  // Select only the primitives/actions we need so the hook does not
  // re-run effects on every unrelated state change.
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { items } = useCartStore();
  const { mergeGuestCartOnServer, hydrateServerCart } = useCartSync(items);

  // ── Listen for forced logout from API client (session expired) ──
  useEffect(() => {
    const handleForceLogout = () => {
      clearAuth();
      useCartStore.getState().switchUser();
      queryClient.removeQueries({ queryKey: ["auth"] });
    };
    window.addEventListener("auth:logout", handleForceLogout);
    return () => window.removeEventListener("auth:logout", handleForceLogout);
  }, [clearAuth, queryClient]);

  // ── Proactive refresh timer ──
  // Uses API refresh endpoint which sets new cookies automatically
  useEffect(() => {
    const checkAndRefresh = async () => {
      // Nothing to refresh if we're not authenticated.
      if (!useAuthStore.getState().isAuthenticated) return;
      try {
        await authApi.refresh();
      } catch (err) {
        // A genuine auth failure (session revoked/expired) should end the
        // session. Transient errors — network blip, 5xx, gateway/Cloudflare
        // hiccup, rate limit, momentary DB issue — must NOT log the user out.
        // In that case we simply try again on the next tick and keep the
        // existing session intact.
        const isAuthFailure = err instanceof ApiError && err.status === 401;
        if (isAuthFailure) {
          useAuthStore.getState().clearAuth();
          useCartStore.getState().switchUser();
          if (typeof window !== "undefined") {
            // Only redirect if we're not already on an auth page, otherwise we
            // would pointlessly reload the login/register screen every interval.
            const onAuthPage = window.location.pathname.startsWith("/auth");
            if (!onAuthPage) {
              window.location.href = "/auth/login";
            }
          }
        }
      }
    };

    const refreshTimer = setInterval(checkAndRefresh, 600_000);
    return () => clearInterval(refreshTimer);
  }, []);

  const login = useCallback(
    async (data: LoginRequest) => {
      setError(null);
      try {
        const guestCartItems = useCartStore.getState().items;
        const res = await authApi.login(data);
        setAuth(res.user);
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
    [setAuth, mergeGuestCartOnServer, hydrateServerCart]
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
    clearAuth();
    useCartStore.getState().switchUser();
    queryClient.removeQueries({ queryKey: ["auth"] });
  }, [clearAuth, queryClient]);

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
        setUser(res.user);
        return res.user;
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Failed to update profile";
        setError(message);
        throw err;
      }
    },
    [setUser]
  );

  return {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
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
