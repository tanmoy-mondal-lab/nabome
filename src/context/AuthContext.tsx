import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useCustomer, syncCustomerFromAuth, type Customer } from "./CustomerContext";
import { loginUser, registerUser, logoutUser, getSession, resetPassword, changePassword, updateProfile, onAuthChange } from "../lib/auth";
import { neon, isNeonConnected } from "../lib/neon";
import type { AuthUser, LoginCredentials, CustomerRegisterData, VendorRegisterData, Role, PasswordValidation } from "../types/auth";

export type { AuthUser, Role, PasswordValidation };

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: Role | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  registerCustomer: (data: CustomerRegisterData) => Promise<{ success: boolean; error?: string; needsEmailConfirm?: boolean }>;
  registerVendor: (data: VendorRegisterData) => Promise<{ success: boolean; error?: string; needsEmailConfirm?: boolean }>;
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
    state: null,
    district: null,
    city: null,
    pincode: null,
    avatar_url: null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { customer } = useCustomer();

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session) {
        setUser(session);
        syncCustomerFromAuth(customerFromAuthUser(session));
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
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
    try {
      const authUser = await loginUser({ email: credentials.email!, password: credentials.password });
      setUser(authUser);
      syncCustomerFromAuth(customerFromAuthUser(authUser));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Login failed" };
    }
  }, []);

  const registerCustomer = useCallback(async (data: CustomerRegisterData) => {
    try {
      await registerUser({
        email: data.email!,
        password: data.password,
        name: data.name,
        phone: data.phone,
        role: "customer",
      });
      return { success: true, needsEmailConfirm: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Registration failed" };
    }
  }, []);

  const registerVendor = useCallback(async (data: VendorRegisterData) => {
    try {
      const supabaseUser = await registerUser({
        email: data.email,
        password: data.password,
        name: data.ownerName,
        phone: data.phone,
        role: "vendor",
      });
      if (supabaseUser?.id && await isNeonConnected()) {
        const slug = data.shopName
          .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `shop-${Date.now()}`;
        await neon.insert("users", {
          id: supabaseUser.id,
          email: data.email,
          phone: data.phone,
          name: data.ownerName,
          role: "vendor",
        });
        await neon.insert("vendors", {
          user_id: supabaseUser.id,
          shop_name: data.shopName,
          shop_slug: slug,
          shop_description: data.shopCategory,
          shop_email: data.email,
          shop_phone: data.phone,
          shop_address: data.businessAddress,
          approval_status: "pending",
        });
      }
      return { success: true, needsEmailConfirm: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Registration failed" };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    syncCustomerFromAuth(null);
    logoutUser();
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await resetPassword(email);
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetPw = useCallback(async (_token: string, newPassword: string) => {
    try {
      await changePassword(newPassword);
      return true;
    } catch {
      return false;
    }
  }, []);

  const changePw = useCallback(async (_oldPassword: string, newPassword: string) => {
    if (!user) return false;
    try {
      await changePassword(newPassword);
      return true;
    } catch {
      return false;
    }
  }, [user]);

  const updateProfileCb = useCallback(async (data: Partial<Pick<AuthUser, "name" | "phone">>) => {
    if (!user) return false;
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
  }, [user]);

  function validatePassword(password: string): PasswordValidation {
    const errors: string[] = [];
    if (password.length < 8) errors.push("At least 8 characters.");
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter.");
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter.");
    if (!/[0-9]/.test(password)) errors.push("One number.");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("One special character.");
    const score = [password.length >= 8, password.length >= 12, /[A-Z]/.test(password), /[a-z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
    const strength: "weak" | "medium" | "strong" | "very-strong" = score <= 2 ? "weak" : score <= 3 ? "medium" : score <= 5 ? "strong" : "very-strong";
    return { valid: errors.length === 0, errors, strength };
  }

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
