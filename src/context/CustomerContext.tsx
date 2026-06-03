import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { neon, isNeonConnected } from "../lib/neon";
import type { AuthUser } from "../types/auth";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  gender?: string | null;
  state?: string | null;
  district?: string | null;
  city?: string | null;
  pincode?: string | null;
  avatar_url?: string | null;
};

type CustomerContextType = {
  customer: Customer | null;
  loading: boolean;
  logout: () => void;
  refresh: () => Promise<void>;
};

const CustomerContext = createContext<CustomerContextType | null>(null);

function customerFromAuthUser(user: AuthUser): Customer {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email || null,
    gender: null,
    state: null,
    district: null,
    city: null,
    pincode: null,
    avatar_url: null,
  };
}

export function CustomerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const mapRow = (row: any): Customer => ({
    id: row.id,
    name: row.name || "",
    phone: row.phone || "",
    email: row.email || null,
    gender: row.gender || null,
    state: row.state || null,
    district: row.district || null,
    city: row.city || null,
    pincode: row.pincode || null,
    avatar_url: row.avatar_url || null,
  });

  useEffect(() => {
    if (!user) {
      setCustomer(null);
      setLoading(false);
      return;
    }
    setCustomer(customerFromAuthUser(user));
    setLoading(false);
  }, [user]);

  const logout = () => {
    setCustomer(null);
  };

  const refresh = async () => {
    if (!customer) return;
    if (!await isNeonConnected()) return;
    const { data } = await neon.select("users", { id: customer.id }, { single: true });
    if (data) setCustomer(mapRow(data));
  };

  return (
    <CustomerContext.Provider value={{ customer, loading, logout, refresh }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error("useCustomer must be used within CustomerProvider");
  return ctx;
}
