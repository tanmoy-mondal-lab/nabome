// ─────────────────────────────────────────────────────────────
// AUTH SERVICE — All authentication API calls
// ─────────────────────────────────────────────────────────────

import { api } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  phone?: string;
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
  role: "customer" | "super_admin";
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

  me: () =>
    api.get<{ user: UserProfile }>("/auth/me"),

  updateMe: (data: Partial<Pick<UserProfile, "firstName" | "lastName" | "phone" | "avatarUrl"> & { preferences: Record<string, unknown> }>) =>
    api.put<{ user: UserProfile }>("/auth/me", data),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>("/auth/forgot-password", { email }),

  resetPassword: (password: string) =>
    api.post<{ message: string }>("/auth/reset-password", { password }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<{ message: string }>("/auth/change-password", { currentPassword, newPassword }),

  getSessions: () =>
    api.get<{ sessions: AuthSession[] }>("/auth/sessions"),

  deleteSession: (sessionId: string) =>
    api.delete<{ message: string }>(`/auth/sessions/${sessionId}`),
};
