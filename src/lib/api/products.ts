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

// ─── VENDOR PRODUCT MANAGEMENT ──────────────────────

export type SaveProductInput = {
  vendor_id: string;
  name: string;
  description: string;
  category_name: string;
  price: number;
  discount_price: number;
  stock: number;
  sizes: string[];
  colors: string[];
  images: string[];
  gender: string;
  material: string;
  brand: string;
  tags: string;
  status?: string;
};

export type VendorProductListItem = {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  category_name: string;
  gender: string;
  material: string;
  brand: string;
  tags: string[];
  status: string;
  images: { url: string; is_primary: boolean }[];
  price: number;
  discount_price: number;
  stock: number;
  sizes: string[];
  colors: string[];
  created_at: string;
  updated_at: string;
};

function slugify(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100) || "product";
}

export async function saveVendorProduct(input: SaveProductInput, productId?: string): Promise<string> {
  if (!await isNeonConnected()) throw new Error("Database not connected");

  const { data: catData } = await neon.raw(
    `SELECT id FROM categories WHERE LOWER(name) = LOWER($1) LIMIT 1`,
    [input.category_name]
  );
  const categoryId = catData?.[0]?.id || null;

  const slug = `${slugify(input.name)}-${Date.now().toString(36)}`;

  const productData: Record<string, unknown> = {
    vendor_id: input.vendor_id,
    name: input.name,
    description: input.description,
    slug,
    category_id: categoryId,
    gender: input.gender || null,
    material: input.material || null,
    brand: input.brand || null,
    tags: input.tags ? input.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
  };
  if (input.status) productData.status = input.status;

  let pid: string;

  if (productId) {
    pid = productId;
    await neon.update("products", productData, { id: productId });
    await neon.delete("product_variants", { product_id: productId });
    await neon.delete("product_images", { product_id: productId });
  } else {
    const result = await neon.insert("products", productData);
    const inserted = result.data?.[0] as Record<string, unknown> | undefined;
    pid = inserted?.id as string;
    if (!pid) throw new Error("Failed to create product");
  }

  const price = Number(input.price) || 0;
  const discountPrice = input.discount_price ? Number(input.discount_price) : null;
  const stock = Number(input.stock) || 0;

  const s = input.sizes.length > 0 ? input.sizes : ["One Size"];
  const c = input.colors.length > 0 ? input.colors : ["Default"];

  for (const size of s) {
    for (const color of c) {
      await neon.insert("product_variants", {
        product_id: pid,
        size,
        color,
        price,
        original_price: discountPrice,
        stock,
        in_stock: stock > 0,
      });
    }
  }

  for (let i = 0; i < input.images.length; i++) {
    await neon.insert("product_images", {
      product_id: pid,
      url: input.images[i],
      sort_order: i,
      is_primary: i === 0,
    });
  }

  return pid;
}

export async function getVendorProductsList(vendorId: string): Promise<VendorProductListItem[]> {
  if (!await isNeonConnected()) return [];

  const { data } = await neon.raw(`
    SELECT
      p.id, p.vendor_id, p.name, p.description, p.gender, p.material,
      p.brand, p.tags, p.status, p.created_at, p.updated_at,
      c.name as category_name,
      COALESCE(
        (SELECT json_agg(jsonb_build_object('url', pi.url, 'is_primary', pi.is_primary) ORDER BY pi.sort_order)
         FROM product_images pi WHERE pi.product_id = p.id LIMIT 1),
        '[]'::json
      ) as images,
      COALESCE((SELECT MIN(v.price) FROM product_variants v WHERE v.product_id = p.id), 0) as price,
      (SELECT MIN(v.original_price) FROM product_variants v WHERE v.product_id = p.id) as discount_price,
      COALESCE((SELECT SUM(v.stock) FROM product_variants v WHERE v.product_id = p.id), 0) as stock_total,
      COALESCE((SELECT json_agg(DISTINCT v.size) FROM product_variants v WHERE v.product_id = p.id), '[]'::json) as sizes,
      COALESCE((SELECT json_agg(DISTINCT v.color) FROM product_variants v WHERE v.product_id = p.id), '[]'::json) as colors
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.vendor_id = $1
    ORDER BY p.created_at DESC
  `, [vendorId]);

  return (data || []).map((row: any) => ({
    id: row.id,
    vendor_id: row.vendor_id,
    name: row.name || "",
    description: row.description || "",
    category_name: row.category_name || "",
    gender: row.gender || "",
    material: row.material || "",
    brand: row.brand || "",
    tags: row.tags || [],
    status: row.status || "draft",
    images: Array.isArray(row.images) ? row.images : [],
    price: Number(row.price) || 0,
    discount_price: row.discount_price ? Number(row.discount_price) : 0,
    stock: Number(row.stock_total) || 0,
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    colors: Array.isArray(row.colors) ? row.colors : [],
    created_at: row.created_at || "",
    updated_at: row.updated_at || "",
  }));
}

export async function getVendorProductForEdit(productId: string, vendorId: string): Promise<SaveProductInput | null> {
  if (!await isNeonConnected()) return null;

  const { data: prodData } = await neon.raw(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.id = $1 AND p.vendor_id = $2
  `, [productId, vendorId]);

  if (!prodData || prodData.length === 0) return null;
  const product = prodData[0];

  const { data: variants } = await neon.select("product_variants", { product_id: productId });
  const { data: images } = await neon.select("product_images", { product_id: productId }, { order: "sort_order", ascending: true });

  const variantRows = variants || [];
  const sizes = [...new Set(variantRows.map((v: any) => String(v.size)))] as string[];
  const colors = [...new Set(variantRows.map((v: any) => String(v.color)))] as string[];
  const firstVariant = variantRows[0] as Record<string, unknown> | undefined;

  return {
    vendor_id: vendorId,
    name: String(product.name || ""),
    description: String(product.description || ""),
    category_name: String(product.category_name || ""),
    price: Number(firstVariant?.price) || 0,
    discount_price: Number(firstVariant?.original_price) || 0,
    stock: Number(firstVariant?.stock) || 0,
    sizes,
    colors,
    images: (images || []).map((i: any) => String(i.url)),
    gender: String(product.gender || ""),
    material: String(product.material || ""),
    brand: String(product.brand || ""),
    tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
    status: String(product.status || "draft"),
  } satisfies SaveProductInput;
}

export async function softDeleteVendorProduct(id: string): Promise<void> {
  if (!await isNeonConnected()) throw new Error("Database not connected");
  const { error } = await neon.update("products", { status: "archived" }, { id });
  if (error) throw error;
}

export async function duplicateVendorProduct(id: string, vendorId: string): Promise<string | null> {
  const input = await getVendorProductForEdit(id, vendorId);
  if (!input) return null;
  return saveVendorProduct({ ...input, name: `${input.name} (Copy)`, status: "draft" });
}

// ─── ADMIN PRODUCT MANAGEMENT ─────────────────

export type AdminProductRow = {
  id: string;
  vendor_id: string;
  vendor_name: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  image: string;
  rejection_note?: string;
  created_at: string;
};

export async function getAdminProducts(): Promise<AdminProductRow[]> {
  if (!await isNeonConnected()) return [];
  const { data } = await neon.raw(`
    SELECT
      p.id, p.vendor_id, p.name, p.status, p.created_at, p.rejection_note as rejection_note,
      COALESCE((SELECT MIN(v.price) FROM product_variants v WHERE v.product_id = p.id), 0) as price,
      COALESCE((SELECT SUM(v.stock) FROM product_variants v WHERE v.product_id = p.id), 0) as stock_total,
      COALESCE((SELECT v.url FROM product_images v WHERE v.product_id = p.id AND v.is_primary = true LIMIT 1),
               (SELECT v.url FROM product_images v WHERE v.product_id = p.id LIMIT 1), '') as image,
      COALESCE(c.name, 'Uncategorized') as category,
      COALESCE(u.name, vs.shop_name, 'Unknown') as vendor_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN vendors vs ON vs.id = p.vendor_id
    LEFT JOIN users u ON u.id = vs.user_id
    ORDER BY p.created_at DESC
  `);
  return ((data || []) as any[]).map((row: any) => ({
    id: row.id as string,
    vendor_id: row.vendor_id as string,
    vendor_name: row.vendor_name as string || "Unknown",
    name: row.name as string || "",
    category: row.category as string || "",
    price: Number(row.price) || 0,
    stock: Number(row.stock_total) || 0,
    status: row.status as string || "draft",
    image: row.image as string || "",
    rejection_note: row.rejection_note as string || undefined,
    created_at: row.created_at as string || "",
  }));
}

export async function approveProduct(id: string): Promise<void> {
  if (!await isNeonConnected()) throw new Error("Database not connected");
  const { error } = await neon.update("products", { status: "published", rejection_note: null }, { id });
  if (error) throw error;
}

export async function rejectProduct(id: string, reason: string): Promise<void> {
  if (!await isNeonConnected()) throw new Error("Database not connected");
  const { error } = await neon.update("products", { status: "rejected", rejection_note: reason }, { id });
  if (error) throw error;
}

export async function restoreProduct(id: string): Promise<void> {
  if (!await isNeonConnected()) throw new Error("Database not connected");
  const { error } = await neon.update("products", { status: "draft", rejection_note: null }, { id });
  if (error) throw error;
}

export async function permanentDeleteProduct(id: string): Promise<void> {
  if (!await isNeonConnected()) throw new Error("Database not connected");
  await neon.delete("product_images", { product_id: id });
  await neon.delete("product_variants", { product_id: id });
  const { error } = await neon.delete("products", { id });
  if (error) throw error;
}
