import { supabase } from "../supabase";
import { products as localProducts } from "../../data/products";

export type ProductRow = Record<string, unknown>;

const FALLBACK_PRODUCTS = localProducts;

function isConnected() { return !!supabase; }

function mapProduct(row: any) {
  return {
    id: typeof row.id === "number" ? row.id : parseInt(row.id) || 0,
    name: row.name || "",
    price: row.price || 0,
    originalPrice: row.original_price || row.originalPrice || 0,
    category: row.category || "Unisex",
    image: row.image || row.images?.[0] || "",
    images: row.images || (row.image ? [row.image] : []),
    description: row.description || "",
    sizes: row.sizes || [],
    colors: row.colors || [],
    stock: row.stock ?? 10,
    isNew: row.is_new ?? row.isNew ?? false,
    isBestSeller: row.is_bestseller ?? row.isBestSeller ?? false,
    isLimited: row.is_limited ?? row.isLimited ?? false,
    tags: row.tags || [],
    material: row.material || "",
    fit: row.fit || "",
    rating: row.rating || row.average_rating || 0,
    reviews: row.reviews_count || row.reviews || 0,
  };
}

export async function getProducts() {
  if (!isConnected()) return FALLBACK_PRODUCTS;
  const { data } = await supabase!.from("products").select("*").order("created_at", { ascending: false });
  if (!data || data.length === 0) return FALLBACK_PRODUCTS;
  return data.map(mapProduct);
}

export async function getProductById(id: string | number) {
  if (!isConnected()) return FALLBACK_PRODUCTS.find((p) => p.id === Number(id)) || null;
  const { data } = await supabase!.from("products").select("*").eq("id", id).single();
  if (!data) return FALLBACK_PRODUCTS.find((p) => p.id === Number(id)) || null;
  return mapProduct(data);
}

export async function getProductsByVendor(vendorId: string) {
  if (!isConnected()) return FALLBACK_PRODUCTS;
  const { data } = await supabase!.from("products").select("*").eq("vendor_id", vendorId);
  return (data || []).map(mapProduct);
}

export async function getProductsByCategory(categorySlug: string) {
  if (!isConnected()) return FALLBACK_PRODUCTS.filter((p) => p.category.toLowerCase() === categorySlug.toLowerCase());
  const { data } = await supabase!.from("products").select("*, categories!inner(slug)").eq("categories.slug", categorySlug);
  return (data || []).map(mapProduct);
}

export async function getCategories() {
  if (!isConnected()) return [];
  const { data } = await supabase!.from("categories").select("*").order("sort_order");
  return data || [];
}

export async function createProduct(product: any) {
  if (!isConnected()) throw new Error("Database not connected");
  const { data, error } = await supabase!.from("products").insert(product).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, updates: any) {
  if (!isConnected()) throw new Error("Database not connected");
  const { data, error } = await supabase!.from("products").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  if (!isConnected()) throw new Error("Database not connected");
  const { error } = await supabase!.from("products").update({ status: "archived" }).eq("id", id);
  if (error) throw error;
}
