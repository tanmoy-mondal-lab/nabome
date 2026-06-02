import { neon, isNeonConnected } from "../neon";

type Vendor = {
  id: string;
  user_id: string;
  shop_name: string;
  shop_slug: string;
  shop_description?: string;
  shop_logo?: string;
  shop_banner?: string;
  rating: number;
  reviews_count: number;
  total_products: number;
  approval_status: string;
};

export async function getVendors(approvedOnly = true) {
  if (!await isNeonConnected()) return [];
  const filters: Record<string, unknown> = {};
  if (approvedOnly) filters.approval_status = "approved";
  const { data } = await neon.select("vendors", filters, { order: "rating", ascending: false });
  return (data || []) as Vendor[];
}

export async function getVendorBySlug(slug: string) {
  if (!await isNeonConnected()) return null;
  const { data } = await neon.select("vendors", { shop_slug: slug }, { single: true });
  return data as Vendor | null;
}

export async function getVendorByUserId(userId: string) {
  if (!await isNeonConnected()) return null;
  const { data } = await neon.select("vendors", { user_id: userId }, { single: true });
  return data as Vendor | null;
}

export async function createVendor(vendor: Partial<Vendor>) {
  if (!await isNeonConnected()) throw new Error("Database not connected");
  const { data, error } = await neon.insert("vendors", vendor);
  if (error) throw error;
  return data?.[0] as Vendor;
}

export async function updateVendor(id: string, updates: Partial<Vendor>) {
  if (!await isNeonConnected()) throw new Error("Database not connected");
  const { data, error } = await neon.update("vendors", updates, { id });
  if (error) throw error;
  return data?.[0] as Vendor;
}

export async function getVendorAnalytics(vendorId: string) {
  if (!await isNeonConnected()) return null;
  const [ordersRes, productsRes, reviewsRes] = await Promise.all([
    neon.select("orders", { vendor_id: vendorId }, { columns: "id, grand_total, order_status, created_at" }),
    neon.select("products", { vendor_id: vendorId }, { columns: "id, status" }),
    neon.select("reviews", { vendor_id: vendorId }, { columns: "id, rating" }),
  ]);
  return {
    totalOrders: ordersRes.data?.length || 0,
    totalRevenue: ordersRes.data?.reduce((s: number, o: any) => s + (o.grand_total || 0), 0) || 0,
    totalProducts: productsRes.data?.length || 0,
    publishedProducts: productsRes.data?.filter((p: any) => p.status === "published").length || 0,
    averageRating: reviewsRes.data?.length
      ? reviewsRes.data.reduce((s: number, r: any) => s + (r.rating || 0), 0) / reviewsRes.data.length
      : 0,
  };
}
