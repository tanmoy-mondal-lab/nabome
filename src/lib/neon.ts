import { supabase } from "./supabase";

const API = "/api/neon-query";

type NeonFilters = Record<string, unknown>;
type NeonData = Record<string, unknown>;

type SelectOptions = {
  columns?: string;
  order?: string;
  ascending?: boolean;
  limit?: number;
  single?: boolean;
};

let connectedCache: boolean | null = null;
let connecting: Promise<boolean> | null = null;

async function call(method: string, table: string, opts?: { filters?: NeonFilters; data?: NeonData; options?: SelectOptions; sql?: string; params?: unknown[] }) {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, method, ...opts }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { data: null, error: new Error(body.error || `Neon API error: ${res.status}`) };
    }
    return await res.json();
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error("Neon request failed") };
  }
}

export const neon = {
  select(table: string, filters?: NeonFilters, options?: SelectOptions) {
    return call("select", table, { filters, options });
  },
  insert(table: string, data: NeonData) {
    return call("insert", table, { data });
  },
  update(table: string, data: NeonData, filters?: NeonFilters) {
    return call("update", table, { data, filters });
  },
  delete(table: string, filters?: NeonFilters) {
    return call("delete", table, { filters });
  },
  raw(sql: string, params?: unknown[]) {
    return call("raw", "", { sql, params });
  },
  count(table: string, filters?: NeonFilters) {
    return call("count", table, { filters });
  },
};

let supabaseSessionChecked = false;

export async function resolveUserId(): Promise<string | null> {
  try {
    if (!supabaseSessionChecked) {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.id) {
        supabaseSessionChecked = true;
        return data.session.user.id;
      }
    }
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id) supabaseSessionChecked = true;
    });
    setTimeout(() => listener?.subscription.unsubscribe(), 100);
    return null;
  } catch {
    return null;
  }
}

export async function isNeonConnected(): Promise<boolean> {
  if (connectedCache !== null) return connectedCache;
  if (connecting) return connecting;
  connecting = (async () => {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "raw", sql: "SELECT 1 as ok", params: [] }),
      });
      const json = await res.json();
      connectedCache = !json.error;
      return connectedCache;
    } catch {
      connectedCache = false;
      return false;
    } finally {
      connecting = null;
    }
  })();
  return connecting;
}
