import { neon, isNeonConnected } from "../neon";

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

function mapRow(row: Record<string, unknown>): Coupon {
  return {
    id: row.id as string,
    code: row.code as string,
    description: (row.description as string) || undefined,
    discountType: row.discount_type as Coupon["discountType"],
    discountValue: Number(row.discount_value),
    minOrderValue: row.min_order_value != null ? Number(row.min_order_value) : undefined,
    maxDiscount: row.max_discount != null ? Number(row.max_discount) : undefined,
    usageLimit: row.usage_limit != null ? Number(row.usage_limit) : undefined,
    usedCount: Number(row.used_count || 0),
    startsAt: (row.starts_at as string) || undefined,
    expiresAt: (row.expires_at as string) || undefined,
    isActive: row.is_active !== false,
    createdAt: row.created_at as string,
  };
}

export async function getCoupons(): Promise<Coupon[]> {
  if (!(await isNeonConnected())) return [];
  const { data } = await neon.select("coupons", {}, { order: "created_at", ascending: false });
  return ((data as Record<string, unknown>[]) || []).map(mapRow);
}

export async function validateCoupon(code: string): Promise<Coupon | null> {
  if (!(await isNeonConnected())) return null;
  const { data } = await neon.select("coupons", { code, is_active: true }, { limit: 1 });
  const rows = data as Record<string, unknown>[];
  return rows?.[0] ? mapRow(rows[0]) : null;
}

export async function createCoupon(coupon: Omit<Coupon, "id" | "usedCount" | "createdAt">): Promise<void> {
  if (!(await isNeonConnected())) return;
  await neon.insert("coupons", {
    code: coupon.code,
    description: coupon.description || null,
    discount_type: coupon.discountType,
    discount_value: coupon.discountValue,
    min_order_value: coupon.minOrderValue ?? null,
    max_discount: coupon.maxDiscount ?? null,
    usage_limit: coupon.usageLimit ?? null,
    starts_at: coupon.startsAt || null,
    expires_at: coupon.expiresAt || null,
    is_active: coupon.isActive,
  });
}

export async function updateCoupon(id: string, updates: Partial<Coupon>): Promise<void> {
  if (!(await isNeonConnected())) return;
  const db: Record<string, unknown> = {};
  if (updates.code !== undefined) db.code = updates.code;
  if (updates.description !== undefined) db.description = updates.description;
  if (updates.discountType !== undefined) db.discount_type = updates.discountType;
  if (updates.discountValue !== undefined) db.discount_value = updates.discountValue;
  if (updates.minOrderValue !== undefined) db.min_order_value = updates.minOrderValue;
  if (updates.maxDiscount !== undefined) db.max_discount = updates.maxDiscount;
  if (updates.usageLimit !== undefined) db.usage_limit = updates.usageLimit;
  if (updates.isActive !== undefined) db.is_active = updates.isActive;
  await neon.update("coupons", db, { id });
}

export async function deleteCoupon(id: string): Promise<void> {
  if (!(await isNeonConnected())) return;
  await neon.delete("coupons", { id });
}
