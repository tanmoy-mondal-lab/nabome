import { neon, isNeonConnected } from "../neon";

export interface Customer {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  isVendor: boolean;
  createdAt: string;
  updatedAt?: string;
  totalOrders?: number;
  totalSpent?: number;
}

function mapRow(row: Record<string, unknown>): Customer {
  return {
    id: row.id as string,
    name: (row.name as string) || undefined,
    email: row.email as string,
    phone: (row.phone as string) || undefined,
    avatarUrl: (row.avatar_url as string) || undefined,
    isActive: row.is_active !== false,
    isVendor: !!row.is_vendor,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    totalOrders: row.total_orders != null ? Number(row.total_orders) : undefined,
    totalSpent: row.total_spent != null ? Number(row.total_spent) : undefined,
  };
}

export async function getCustomers(params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<Customer[]> {
  if (!(await isNeonConnected())) return [];
  let query = `SELECT u.*, (SELECT COUNT(*) FROM orders WHERE orders.user_id = u.id) as total_orders FROM users u`;
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (params?.search) {
    const i = values.length + 1;
    conditions.push(`(u.name ILIKE $${i} OR u.email ILIKE $${i})`);
    values.push(`%${params.search}%`);
  }
  if (params?.status === "active") { conditions.push(`u.is_active = true`); }
  else if (params?.status === "inactive") { conditions.push(`u.is_active = false`); }

  if (conditions.length > 0) query += ` WHERE ${conditions.join(" AND ")}`;
  query += ` ORDER BY u.created_at DESC`;

  if (params?.limit) { query += ` LIMIT ${params.limit} OFFSET ${((params.page || 1) - 1) * params.limit}`; }

  const { data } = await neon.raw(query, values.length > 0 ? values : undefined);
  return ((data as Record<string, unknown>[]) || []).map(mapRow);
}

export async function getUserById(userId: string): Promise<Customer | null> {
  if (!(await isNeonConnected())) return null;
  const { data } = await neon.select("users", { id: userId }, { limit: 1 });
  const rows = data as Record<string, unknown>[];
  return rows?.[0] ? mapRow(rows[0]) : null;
}

export async function suspendUser(userId: string, suspend = true): Promise<void> {
  if (!(await isNeonConnected())) return;
  await neon.update("users", { is_active: !suspend }, { id: userId });
}

export async function getVendorCustomers(vendorId: string): Promise<Customer[]> {
  if (!(await isNeonConnected())) return [];
  const { data } = await neon.raw(`
    SELECT DISTINCT u.id, u.name, u.email, u.phone, u.avatar_url, u.created_at,
      COUNT(o.id) OVER (PARTITION BY u.id) as total_orders,
      SUM(o.total) OVER (PARTITION BY u.id) as total_spent
    FROM users u
    JOIN orders o ON o.user_id = u.id
    WHERE o.id IN (SELECT DISTINCT order_id FROM order_items WHERE vendor_id = $1)
    ORDER BY total_spent DESC
  `, [vendorId]);
  return ((data as Record<string, unknown>[]) || []).map(mapRow);
}
