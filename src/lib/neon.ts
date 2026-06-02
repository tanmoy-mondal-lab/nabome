// Frontend client for Neon — calls Vercel API route at /api/neon-query
// Each method returns { data, error } matching Supabase shape for drop-in compat

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

export async function isNeonConnected() {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "raw", sql: "SELECT 1 as ok", params: [] }),
    });
    const json = await res.json();
    return !json.error;
  } catch {
    return false;
  }
}
