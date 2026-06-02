import { createContext, useContext, useState, type ReactNode } from "react";
import { neon, isNeonConnected } from "../lib/neon";

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

  const login = async (identifier: string): Promise<{ found: boolean; customer?: Customer }> => {
    const trimmed = identifier.trim();
    if (!trimmed) return { found: false };

    if (!await isNeonConnected()) return { found: false };

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    const { data: rows } = isEmail
      ? await neon.select("users", { email: trimmed })
      : await neon.raw(
          `SELECT * FROM users WHERE phone IN ($1, $2, $3) LIMIT 1`,
          [trimmed, `+91${trimmed.replace(/\D/g, "")}`, `91${trimmed.replace(/\D/g, "")}`]
        );

    const data = rows?.[0] || null;

    if (data) {
      const c = mapRow(data);
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
    if (!await isNeonConnected()) return { ok: false, error: "Database not configured" };

    const digits = data.phone.replace(/\D/g, "");
    const cleanPhone = digits.startsWith("91") ? `+${digits}` : `+91${digits}`;

    const { data: newRows, error } = await neon.insert("users", {
      name: data.name,
      phone: cleanPhone,
      email: data.email?.trim() || null,
      gender: data.gender,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    const newCustomer = newRows?.[0];
    if (!newCustomer) return { ok: false, error: "Failed to create customer" };

    const c = mapRow(newCustomer);
    setCustomer(c);
    saveSession(c);
    return { ok: true };
  };

  const logout = () => {
    setCustomer(null);
    clearSession();
  };

  const refresh = async () => {
    if (!await isNeonConnected() || !customer) return;
    const { data } = await neon.select("users", { id: customer.id }, { single: true });
    if (data) {
      setCustomer(mapRow(data));
      saveSession(mapRow(data));
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
