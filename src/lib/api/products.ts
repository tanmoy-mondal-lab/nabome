import { neon, isNeonConnected } from "../neon";
import { products as localProducts } from "../../data/products";

export type ProductRow = Record<string, unknown>;

const FALLBACK_PRODUCTS = localProducts;

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
  if (!await isNeonConnected()) return FALLBACK_PRODUCTS;
  const { data } = await neon.select("products", {}, { order: "created_at", ascending: false });
  if (!data || data.length === 0) return FALLBACK_PRODUCTS;
  return data.map(mapProduct);
}

export async function getProductById(id: string | number) {
  if (!await isNeonConnected()) return FALLBACK_PRODUCTS.find((p) => p.id === Number(id)) || null;
  const { data } = await neon.select("products", { id }, { single: true });
  if (!data) return FALLBACK_PRODUCTS.find((p) => p.id === Number(id)) || null;
  return mapProduct(data);
}

export async function getProductsByVendor(vendorId: string) {
  if (!await isNeonConnected()) return FALLBACK_PRODUCTS;
  const { data } = await neon.select("products", { vendor_id: vendorId });
  return (data || []).map(mapProduct);
}

export async function getProductsByCategory(categorySlug: string) {
  if (!await isNeonConnected()) return FALLBACK_PRODUCTS.filter((p) => p.category.toLowerCase() === categorySlug.toLowerCase());
  const { data } = await neon.raw(
    `SELECT p.* FROM products p JOIN categories c ON c.id = p.category_id WHERE c.slug = $1`,
    [categorySlug]
  );
  return (data || []).map(mapProduct);
}

export async function getCategories() {
  if (!await isNeonConnected()) return [];
  const { data } = await neon.select("categories", {}, { order: "sort_order", ascending: true });
  return data || [];
}

export async function createProduct(product: any) {
  if (!await isNeonConnected()) throw new Error("Database not connected");
  const { data, error } = await neon.insert("products", product);
  if (error) throw error;
  return data?.[0] || null;
}

export async function updateProduct(id: string, updates: any) {
  if (!await isNeonConnected()) throw new Error("Database not connected");
  const { data, error } = await neon.update("products", updates, { id });
  if (error) throw error;
  return data?.[0] || null;
}

export async function deleteProduct(id: string) {
  if (!await isNeonConnected()) throw new Error("Database not connected");
  const { error } = await neon.update("products", { status: "archived" }, { id });
  if (error) throw error;
}
