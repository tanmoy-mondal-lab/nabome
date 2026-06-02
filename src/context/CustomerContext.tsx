import { createContext, useContext, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  gender?: string | null;
};

type CustomerContextType = {
  customer: Customer | null;
  loading: boolean;
  login: (identifier: string) => Promise<{ found: boolean; customer?: Customer }>;
  register: (data: { name: string; phone: string; email?: string; gender: string }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const CustomerContext = createContext<CustomerContextType | null>(null);

function loadSession(): Customer | null {
  try {
    const raw = localStorage.getItem("nabome-customer");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(c: Customer) {
  localStorage.setItem("nabome-customer", JSON.stringify(c));
}

function clearSession() {
  localStorage.removeItem("nabome-customer");
}

let _setCustomer: ((c: Customer | null) => void) | null = null;

export function syncCustomerFromAuth(c: Customer | null) {
  if (_setCustomer) {
    _setCustomer(c);
    if (c) saveSession(c);
    else clearSession();
  }
}

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(loadSession);

  _setCustomer = setCustomer;
  const [loading] = useState(false);

  const login = async (identifier: string): Promise<{ found: boolean; customer?: Customer }> => {
    const trimmed = identifier.trim();
    if (!trimmed) return { found: false };

    if (!supabase) return { found: false };

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    let query = supabase.from("customers").select("*");
    if (isEmail) {
      query = query.eq("email", trimmed);
    } else {
      const digits = trimmed.replace(/\D/g, "");
      query = query.or(`phone.eq.${trimmed},phone.eq.+91${digits},phone.eq.91${digits}`);
    }

    const { data: rows } = await query.limit(1);
    const data = rows?.[0] || null;

    if (data) {
      const c: Customer = {
        id: data.id,
        name: data.name || "",
        phone: data.phone || "",
        email: data.email || null,
        gender: data.gender || null,
      };
      setCustomer(c);
      saveSession(c);
      return { found: true, customer: c };
    }

    return { found: false };
  };

  const register = async (data: {
    name: string;
    phone: string;
    email?: string;
    gender: string;
  }): Promise<{ ok: boolean; error?: string }> => {
    if (!supabase) return { ok: false, error: "Database not configured" };

    const digits = data.phone.replace(/\D/g, "");
    const cleanPhone = digits.startsWith("91") ? `+${digits}` : `+91${digits}`;

    const { data: newCustomer, error } = await supabase
      .from("customers")
      .insert({
        name: data.name,
        phone: cleanPhone,
        email: data.email?.trim() || null,
        gender: data.gender,
      })
      .select("id, name, phone, email, gender")
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    const c: Customer = {
      id: newCustomer.id,
      name: newCustomer.name,
      phone: newCustomer.phone,
      email: newCustomer.email,
      gender: newCustomer.gender,
    };
    setCustomer(c);
    saveSession(c);
    return { ok: true };
  };

  const logout = () => {
    setCustomer(null);
    clearSession();
  };

  const refresh = async () => {
    if (!supabase || !customer) return;
    const { data } = await supabase.from("customers").select("*").eq("id", customer.id).single();
    if (data) {
      const c: Customer = {
        id: data.id,
        name: data.name || "",
        phone: data.phone || "",
        email: data.email || null,
        gender: data.gender || null,
      };
      setCustomer(c);
      saveSession(c);
    }
  };

  return (
    <CustomerContext.Provider value={{ customer, loading, login, register, logout, refresh }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error("useCustomer must be used within CustomerProvider");
  return ctx;
}
