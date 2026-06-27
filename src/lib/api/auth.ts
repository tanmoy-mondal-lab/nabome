// ─────────────────────────────────────────────────────────────
// AUTH SERVICE — All authentication API calls
// ─────────────────────────────────────────────────────────────

import { api } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
  turnstileToken?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  turnstileToken?: string;
}

export interface AuthResponse {
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    expiresIn: number;
  };
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  role: "customer" | "admin";
  firstName: string;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  lastLoginAt: string | null;
  loginCount: number;
  preferences?: Record<string, unknown> | null;
  createdAt?: string;
  _count?: {
    orders: number;
    addresses: number;
    wishlistItems: number;
    reviews: number;
  };
}

export interface AuthSession {
  id: string;
  deviceName: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  lastActiveAt: string;
  createdAt: string;
  expiresAt: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>("/auth/login", data),

  register: (data: RegisterRequest) =>
    api.post<{ user: { id: string; email: string; firstName: string }; message: string }>(
      "/auth/register",
      data
    ),

  logout: () =>
    api.post<{ message: string }>("/auth/logout"),

  refresh: (refreshToken: string) =>
    api.post<{ session: { accessToken: string; refreshToken: string; expiresAt: number; expiresIn: number } }>(
      "/auth/refresh",
      { refreshToken }
    ),

  me: () =>
    api.get<{ user: UserProfile }>("/auth/me"),

  updateMe: (data: Partial<Pick<UserProfile, "firstName" | "lastName" | "phone" | "avatarUrl"> & { preferences: Record<string, unknown> }>) =>
    api.put<{ user: UserProfile }>("/auth/me", data),

  forgotPassword: (email: string, turnstileToken?: string) =>
    api.post<{ message: string }>("/auth/forgot-password", { email, turnstileToken }),

  verifyResetCode: (email: string, code: string, turnstileToken?: string) =>
    api.post<{ message: string }>("/auth/verify-reset-code", { email, code, turnstileToken }),

  resetPassword: (email: string, code: string, password: string, turnstileToken?: string) =>
    api.post<{ message: string }>("/auth/reset-password", { email, code, password, turnstileToken }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<{ message: string }>("/auth/change-password", { currentPassword, newPassword }),

  getSessions: () =>
    api.get<{ sessions: AuthSession[] }>("/auth/sessions"),

  deleteSession: (sessionId: string) =>
    api.delete<{ message: string }>(`/auth/sessions/${sessionId}`),

  verifyEmail: (data: { email: string; code: string; turnstileToken?: string }) =>
    api.post<{ message: string }>("/auth/verify-email", data),

  resendVerification: (email: string, turnstileToken?: string) =>
    api.post<{ message: string }>("/auth/resend-verification", { email, turnstileToken }),

  changeEmail: (newEmail: string) =>
    api.post<{ message: string }>("/auth/change-email", { newEmail }),

  verifyEmailChange: (code: string) =>
    api.post<{ message: string }>("/auth/verify-email-change", { code }),
};
