import { neon, isNeonConnected } from "../lib/neon";

export type VendorData = {
  id: string;
  user_id: string;
  shop_name: string;
  shop_slug: string;
  shop_logo: string | null;
  shop_banner: string | null;
  shop_description: string | null;
  shop_category: string | null;
  shop_email: string | null;
  shop_phone: string | null;
  shop_address: string | null;
  rating: number;
  reviews_count: number;
  total_products: number;
  total_orders: number;
  approval_status: string;
  created_at: string;
};

export async function getVendorByUserId(userId: string): Promise<VendorData | null> {
  if (!await isNeonConnected()) return null;
  const { data } = await neon.select("vendors", { user_id: userId }, { single: true });
  return data as VendorData | null;
}

export async function getVendorById(id: string): Promise<VendorData | null> {
  if (!await isNeonConnected()) return null;
  const { data } = await neon.select("vendors", { id }, { single: true });
  return data as VendorData | null;
}

export async function getVendorBySlug(slug: string): Promise<VendorData | null> {
  if (!await isNeonConnected()) return null;
  const { data } = await neon.select("vendors", { shop_slug: slug }, { single: true });
  return data as VendorData | null;
}

export async function updateVendor(id: string, updates: Partial<VendorData>) {
  if (!await isNeonConnected()) throw new Error("Database not connected");
  const { error } = await neon.update("vendors", updates as Record<string, unknown>, { id });
  if (error) throw error;
}

export async function getVendorDashboardStats(vendorId: string) {
  if (!await isNeonConnected()) return null;

  const { data: orders } = await neon.select("order_items", { vendor_id: vendorId });
  const items = (orders || []) as Record<string, unknown>[];

  const orderIds = [...new Set(items.map((i) => i.order_id as string))];
  const totalRevenue = items.reduce((s, i) => s + Number(i.subtotal || 0), 0);
  const totalOrders = orderIds.length;

  const { data: products } = await neon.select("products", { vendor_id: vendorId });
  const totalProducts = (products || []).length;

  const { data: reviews } = await neon.select("reviews", {}, {});
  const vendorProductIds = new Set((products || []).map((p: any) => p.id));
  const totalReviews = (reviews || []).filter((r: any) => vendorProductIds.has(r.product_id)).length;

  return {
    totalRevenue,
    totalOrders,
    totalProducts,
    totalReviews,
    recentOrders: orderIds.slice(0, 5),
  };
}
