import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useCustomer, syncCustomerFromAuth, type Customer } from "./CustomerContext";
import { loginMock, registerCustomerMock, registerVendorMock, logoutMock, getSession as mockGetSession, forgotPasswordMock, resetPasswordMock, changePasswordMock, updateProfileMock, validatePassword } from "../lib/mockAuth";
import { loginUser, registerUser, logoutUser, getSession as realGetSession, resetPassword, changePassword, updateProfile, onAuthChange } from "../lib/auth";
import { supabase } from "../lib/supabase";
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
    (async () => {
      if (supabase) {
        const realSession = await realGetSession();
        if (realSession) {
          setUser(realSession);
          syncCustomerFromAuth(customerFromAuthUser(realSession));
          setLoading(false);
          return;
        }
      }
      const mockSession = mockGetSession();
      if (mockSession) {
        setUser(mockSession);
        syncCustomerFromAuth(customerFromAuthUser(mockSession));
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const unsub = onAuthChange(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        syncCustomerFromAuth(customerFromAuthUser(authUser));
      } else {
        setUser(null);
        syncCustomerFromAuth(null);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (user && !customer) {
      syncCustomerFromAuth(customerFromAuthUser(user));
    }
  }, [user, customer]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    if (supabase) {
      try {
        const authUser = await loginUser({ email: credentials.email, password: credentials.password });
        setUser(authUser);
        syncCustomerFromAuth(customerFromAuthUser(authUser));
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Login failed" };
      }
    }
    const result = loginMock(credentials);
    if (result.success && result.user) {
      setUser(result.user);
      syncCustomerFromAuth(customerFromAuthUser(result.user));
    }
    return { success: result.success, error: result.error };
  }, []);

  const registerCustomer = useCallback(async (data: CustomerRegisterData) => {
    if (supabase) {
      try {
        const authUser = await registerUser({
          email: data.email,
          phone: data.phone,
          password: data.password,
          name: data.name,
          role: "customer",
        });
        const mapped: AuthUser = {
          id: (authUser as any).id,
          email: (authUser as any).email || data.email,
          phone: data.phone,
          name: data.name,
          role: "customer",
          createdAt: new Date().toISOString(),
        };
        setUser(mapped);
        syncCustomerFromAuth(customerFromAuthUser(mapped));
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Registration failed" };
      }
    }
    const result = registerCustomerMock(data);
    if (result.success && result.user) {
      setUser(result.user);
      syncCustomerFromAuth(customerFromAuthUser(result.user));
    }
    return { success: result.success, error: result.error };
  }, []);

  const registerVendor = useCallback(async (data: VendorRegisterData) => {
    if (supabase) {
      try {
        const authUser = await registerUser({
          email: data.email,
          phone: data.phone,
          password: data.password,
          name: data.ownerName,
          role: "vendor",
        });
        const mapped: AuthUser = {
          id: (authUser as any).id,
          email: data.email,
          phone: data.phone,
          name: data.ownerName,
          role: "vendor",
          createdAt: new Date().toISOString(),
        };
        setUser(mapped);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Registration failed" };
      }
    }
    const result = registerVendorMock(data);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return { success: result.success, error: result.error };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    syncCustomerFromAuth(null);
    logoutUser();
    logoutMock();
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    if (supabase) {
      try {
        await resetPassword(email);
        return true;
      } catch {
        return false;
      }
    }
    return forgotPasswordMock(email);
  }, []);

  const resetPw = useCallback(async (token: string, newPassword: string) => {
    if (supabase) {
      try {
        await changePassword(newPassword);
        return true;
      } catch {
        return false;
      }
    }
    return resetPasswordMock(token, newPassword);
  }, []);

  const changePw = useCallback(async (oldPassword: string, newPassword: string) => {
    if (!user) return false;
    if (supabase) {
      try {
        await changePassword(newPassword);
        return true;
      } catch {
        return false;
      }
    }
    return changePasswordMock(user.id, oldPassword, newPassword);
  }, [user]);

  const updateProfileCb = useCallback(async (data: Partial<Pick<AuthUser, "name" | "phone">>) => {
    if (!user) return false;
    if (supabase) {
      try {
        const updated = await updateProfile({ ...user, ...data });
        if (updated) {
          const merged = { ...user, ...data };
          setUser(merged);
          syncCustomerFromAuth(customerFromAuthUser(merged));
        }
        return true;
      } catch {
        return false;
      }
    }
    const ok = updateProfileMock(user.id, data);
    if (ok) {
      const session = mockGetSession();
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
    resetPassword: resetPw,
    changePassword: changePw,
    updateProfile: updateProfileCb,
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
  if (!ctx) throw new Error("useAuth must be used within CustomerProvider");
  return ctx;
}
