import { supabase } from "../supabase";

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

function isConnected() { return !!supabase; }

export async function getVendors(approvedOnly = true) {
  if (!isConnected()) return [];
  let query = supabase!.from("vendors").select("*");
  if (approvedOnly) query = query.eq("approval_status", "approved");
  const { data } = await query.order("rating", { ascending: false });
  return (data || []) as Vendor[];
}

export async function getVendorBySlug(slug: string) {
  if (!isConnected()) return null;
  const { data } = await supabase!.from("vendors").select("*").eq("shop_slug", slug).single();
  return data as Vendor | null;
}

export async function getVendorByUserId(userId: string) {
  if (!isConnected()) return null;
  const { data } = await supabase!.from("vendors").select("*").eq("user_id", userId).single();
  return data as Vendor | null;
}

export async function createVendor(vendor: Partial<Vendor>) {
  if (!isConnected()) throw new Error("Database not connected");
  const { data, error } = await supabase!.from("vendors").insert(vendor).select().single();
  if (error) throw error;
  return data as Vendor;
}

export async function updateVendor(id: string, updates: Partial<Vendor>) {
  if (!isConnected()) throw new Error("Database not connected");
  const { data, error } = await supabase!.from("vendors").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data as Vendor;
}

export async function getVendorAnalytics(vendorId: string) {
  if (!isConnected()) return null;
  const [orders, products, reviews] = await Promise.all([
    supabase!.from("orders").select("id, grand_total, order_status, created_at").eq("vendor_id", vendorId),
    supabase!.from("products").select("id, status").eq("vendor_id", vendorId),
    supabase!.from("reviews").select("id, rating").eq("product_id", vendorId),
  ]);
  return {
    totalOrders: orders.data?.length || 0,
    totalRevenue: orders.data?.reduce((s, o) => s + (o.grand_total || 0), 0) || 0,
    totalProducts: products.data?.length || 0,
    publishedProducts: products.data?.filter((p) => p.status === "published").length || 0,
    averageRating: reviews.data?.length
      ? reviews.data.reduce((s, r) => s + (r.rating || 0), 0) / reviews.data.length
      : 0,
  };
}
