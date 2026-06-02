import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useCustomer, syncCustomerFromAuth, type Customer } from "./CustomerContext";
import { loginMock, registerCustomerMock, registerVendorMock, logoutMock, getSession, forgotPasswordMock, resetPasswordMock, changePasswordMock, updateProfileMock, validatePassword } from "../lib/mockAuth";
import type { AuthUser, LoginCredentials, CustomerRegisterData, VendorRegisterData, Role, PasswordValidation } from "../types/auth";

export type { AuthUser, Role, PasswordValidation };

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: Role | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  registerCustomer: (data: CustomerRegisterData) => Promise<{ success: boolean; error?: string }>;
  registerVendor: (data: VendorRegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  updateProfile: (data: Partial<Pick<AuthUser, "name" | "phone">>) => Promise<boolean>;
  validatePassword: (password: string) => PasswordValidation;
};

const AuthContext = createContext<AuthContextType | null>(null);

function customerFromAuthUser(u: AuthUser): Customer {
  return {
    id: u.id,
    name: u.name,
    phone: u.phone,
    email: u.email || null,
    gender: null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { customer } = useCustomer();

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
      syncCustomerFromAuth(customerFromAuthUser(session));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user && !customer) {
      syncCustomerFromAuth(customerFromAuthUser(user));
    }
  }, [user, customer]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = loginMock(credentials);
    if (result.success && result.user) {
      setUser(result.user);
      syncCustomerFromAuth(customerFromAuthUser(result.user));
    }
    return { success: result.success, error: result.error };
  }, []);

  const registerCustomer = useCallback(async (data: CustomerRegisterData) => {
    const result = registerCustomerMock(data);
    if (result.success && result.user) {
      setUser(result.user);
      syncCustomerFromAuth(customerFromAuthUser(result.user));
    }
    return { success: result.success, error: result.error };
  }, []);

  const registerVendor = useCallback(async (data: VendorRegisterData) => {
    const result = registerVendorMock(data);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return { success: result.success, error: result.error };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    syncCustomerFromAuth(null);
    logoutMock();
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    return forgotPasswordMock(email);
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    return resetPasswordMock(token, newPassword);
  }, []);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    if (!user) return false;
    return changePasswordMock(user.id, oldPassword, newPassword);
  }, [user]);

  const updateProfile = useCallback(async (data: Partial<Pick<AuthUser, "name" | "phone">>) => {
    if (!user) return false;
    const ok = updateProfileMock(user.id, data);
    if (ok) {
      const session = getSession();
      if (session) setUser(session);
    }
    return ok;
  }, [user]);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    role: user?.role || null,
    login,
    registerCustomer,
    registerVendor,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    validatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
