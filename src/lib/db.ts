import { supabase } from "./supabase";
import { products as localProducts } from "../data/products";
import type { Product, Variant } from "../data/products";

export type CartItem = {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  image?: string;
  variantId?: string;
};

export type CustomerData = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  customerUpi?: string;
  gender?: string;
};

export type OrderData = {
  billNo: string;
  customer: CustomerData;
  items: CartItem[];
  shipping: number;
  taxLabel: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  userEmail?: string;
  utr?: string;
  customerId?: string;
  shippingAddressId?: string | null;
  delivery?: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    district: string;
    city: string;
    state: string;
    pincode: string;
  };
};

// ─── PRODUCTS ──────────────────────────────────────────

type ProductRow = Record<string, unknown>;

async function attachVariants(productId: string): Promise<{ variants: Variant[]; sizes: string[]; colors: string[]; stock: number }> {
  if (!supabase) return { variants: [], sizes: [], colors: [], stock: 0 };
  const { data } = await supabase.from("product_variants").select("*").eq("product_id", productId);
  const variants: Variant[] = (data || []).map((v: Record<string, unknown>) => ({
    id: v.id as string,
    sku: v.sku as string | undefined,
    size: v.size as string,
    color: v.color as string,
    price: v.price as number,
    originalPrice: v.original_price as number | undefined,
    stock: v.stock as number,
    inStock: v.in_stock as boolean,
  }));
  const sizes = [...new Set(variants.map((v) => v.size))];
  const colors = [...new Set(variants.map((v) => v.color))];
  const stock = variants.reduce((s, v) => s + v.stock, 0);
  return { variants, sizes, colors, stock };
}

async function attachImages(productId: string): Promise<{ image: string; images: string[] }> {
  if (!supabase) return { image: "", images: [] };
  const { data } = await supabase.from("product_images").select("*").eq("product_id", productId).order("sort_order");
  const imgs = (data || []).map((i: Record<string, unknown>) => i.url as string);
  return { image: imgs[0] || "", images: imgs };
}

export async function mapProduct(row: ProductRow): Promise<Product> {
  const id = typeof row.id === "number" ? row.id : parseInt(row.id as string) || 0;
  const pid = String(row.id);
  const { variants, sizes, colors, stock } = await attachVariants(pid);
  const { image, images } = await attachImages(pid);

  return {
    id,
    name: (row.name as string) || "",
    price: variants.length > 0 ? variants[0].price : (row.price as number) || 0,
    originalPrice: variants.length > 0 ? (variants[0].originalPrice || variants[0].price) : (row.original_price as number) || (row.price as number) || 0,
    category: (row.category as Product["category"]) || "Unisex",
    image: image || (row.image as string) || "",
    images: images.length > 0 ? images : [(row.image as string) || ""],
    description: (row.description as string) || "",
    sizes: sizes.length > 0 ? sizes : (row.sizes as string[]) || [],
    colors: colors.length > 0 ? colors : (row.colors as string[]) || [],
    stock: stock > 0 ? stock : ((row.stock as number) ?? 10),
    variants: variants.length > 0 ? variants : undefined,
    isNew: (row.is_new as boolean) || false,
    isBestSeller: (row.is_bestseller as boolean) || false,
    isLimited: (row.is_limited as boolean) || false,
    tags: (row.tags as string[]) || [],
    material: (row.material as string) || "",
    fit: (row.fit as string) || "",
    rating: (row.rating as number) || 0,
    reviews: (row.reviews as number) || 0,
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!supabase) return localProducts;
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return localProducts;
  return Promise.all((data as ProductRow[]).map(mapProduct));
}

export async function seedProductsIfEmpty() {
  if (!supabase) return;
  const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
  if (count && count > 0) return;

  for (const p of localProducts) {
    const productId = String(p.id);
    const { error } = await supabase.from("products").insert({
      id: productId, name: p.name, price: p.price,
      original_price: p.originalPrice || null, description: p.description || null,
      category: p.category || null, material: p.material || "", fit: p.fit || "",
      is_new: p.isNew ?? false, is_bestseller: p.isBestSeller ?? false,
      is_limited: p.isLimited ?? false, tags: p.tags || [],
      rating: p.rating || 0, reviews_count: p.reviews || 0,
    });
    if (error) continue;

    const variantRows = [];
    for (const size of p.sizes) {
      for (const color of p.colors) {
        variantRows.push({
          product_id: productId, size, color, price: p.price,
          original_price: p.originalPrice || null, stock: p.stock || 0, in_stock: (p.stock || 0) > 0,
        });
      }
    }
    const { data: inserted } = await supabase.from("product_variants").insert(variantRows).select();
    if (inserted && inserted.length > 0) {
      const primary = inserted[0] as Record<string, unknown>;
      await supabase.from("product_variants").update({ is_primary: true }).eq("id", primary.id);
    }

    const imageRows = (p.images || [p.image]).map((url: string, i: number) => ({
      product_id: productId, url, sort_order: i, is_primary: i === 0,
    }));
    await supabase.from("product_images").insert(imageRows);
  }
}

export async function createProduct(data: Record<string, unknown>) {
  if (!supabase) return null;
  const id = data.id as string || `prod-${Date.now()}`;
  const { error } = await supabase.from("products").insert({ ...data, id });
  if (error) { console.error("Failed to create product:", error); return null; }
  const sizes = (data.sizes as string || "").split(",").map((s: string) => s.trim()).filter(Boolean);
  const colors = (data.colors as string || "").split(",").map((s: string) => s.trim()).filter(Boolean);
  const price = parseInt(data.price as string) || 0;
  const stock = parseInt(data.stock as string) || 10;
  if (sizes.length > 0 && colors.length > 0) {
    const variantRows = [];
    for (const size of sizes) {
      for (const color of colors) {
        variantRows.push({ product_id: id, size, color, price, original_price: data.original_price || null, stock, in_stock: stock > 0 });
      }
    }
    await supabase.from("product_variants").insert(variantRows);
  }
  if (data.image) {
    await supabase.from("product_images").insert({ product_id: id, url: data.image as string, is_primary: true, sort_order: 0 });
  }
  return id;
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  if (!supabase) return null;
  const { error } = await supabase.from("products").update(data).eq("id", id);
  if (error) { console.error("Failed to update product:", error); return null; }
  return id;
}

export async function deleteProduct(id: string) {
  if (!supabase) return null;
  await supabase.from("product_images").delete().eq("product_id", id);
  await supabase.from("product_variants").delete().eq("product_id", id);
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) { console.error("Failed to delete product:", error); return null; }
  return id;
}

export async function updateProductStock(id: string, delta: number) {
  if (!supabase) return;
  const { data: prod } = await supabase.from("products").select("stock").eq("id", id).single();
  if (!prod) return;
  const newStock = Math.max(0, (prod.stock as number) - delta);
  await supabase.from("products").update({ stock: newStock, in_stock: newStock > 0 }).eq("id", id);
}

// ─── VARIANTS ─────────────────────────────────────────

export async function getProductVariants(productId: string): Promise<Variant[]> {
  if (!supabase) return [];
  const { data } = await supabase.from("product_variants").select("*").eq("product_id", productId);
  return (data || []).map((v: Record<string, unknown>) => ({
    id: v.id as string, sku: v.sku as string | undefined,
    size: v.size as string, color: v.color as string,
    price: v.price as number, originalPrice: v.original_price as number | undefined,
    stock: v.stock as number, inStock: v.in_stock as boolean,
  }));
}

export async function createVariant(data: Record<string, unknown>) {
  if (!supabase) return null;
  const { error, data: result } = await supabase.from("product_variants").insert(data).select().single();
  if (error) { console.error("Failed to create variant:", error); return null; }
  return result;
}

export async function updateVariant(id: string, data: Record<string, unknown>) {
  if (!supabase) return null;
  const { error } = await supabase.from("product_variants").update(data).eq("id", id);
  if (error) { console.error("Failed to update variant:", error); return null; }
  return id;
}

export async function deleteVariant(id: string) {
  if (!supabase) return null;
  const { error } = await supabase.from("product_variants").delete().eq("id", id);
  if (error) { console.error("Failed to delete variant:", error); return null; }
  return id;
}

// ─── CUSTOMERS ─────────────────────────────────────────

export async function lookupCustomer(identifier: string) {
  if (!supabase) return null;
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
  let query = supabase.from("customers").select("id, name, phone, email, gender");
  if (isEmail) {
    query = query.eq("email", identifier.trim());
  } else {
    const digits = identifier.replace(/\D/g, "");
    query = query.or(`phone.eq.${identifier.trim()},phone.eq.+91${digits},phone.eq.91${digits}`);
  }
  const { data } = await query.limit(1).maybeSingle();
  return data;
}

export async function createCustomer(data: { name: string; phone: string; email?: string; gender?: string }) {
  if (!supabase) return null;
  const { data: customer, error } = await supabase
    .from("customers")
    .insert({ name: data.name, phone: data.phone, email: data.email || null, gender: data.gender || null })
    .select("id, name, phone, email, gender").single();
  if (error) { console.error("Failed to create customer:", error); return null; }
  return customer;
}

export async function updateCustomer(id: string, data: { name?: string; phone?: string; email?: string; gender?: string }) {
  if (!supabase) return null;
  const { error } = await supabase.from("customers").update(data).eq("id", id);
  if (error) { console.error("Failed to update customer:", error); return null; }
  return id;
}

export async function getCustomers(): Promise<Record<string, unknown>[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("customers")
    .select("id, name, phone, email, gender, created_at")
    .order("created_at", { ascending: false });
  return data || [];
}

// ─── ADDRESSES ─────────────────────────────────────────

export type Address = {
  id: string;
  customer_id: string;
  label: string;
  name: string;
  phone: string;
  email?: string | null;
  address: string;
  district: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

export async function getAddresses(customerId: string): Promise<Address[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("addresses")
    .select("*")
    .eq("customer_id", customerId)
    .order("is_default", { ascending: false });
  return data || [];
}

export async function createAddress(data: {
  customer_id: string;
  label: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  district: string;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
}) {
  if (!supabase) return null;
  if (data.is_default) {
    await supabase.from("addresses").update({ is_default: false }).eq("customer_id", data.customer_id);
  }
  const { data: result, error } = await supabase.from("addresses").insert({
    customer_id: data.customer_id,
    label: data.label,
    name: data.name,
    phone: data.phone,
    email: data.email || null,
    address: data.address,
    district: data.district,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    is_default: data.is_default ?? false,
  }).select("id").single();
  if (error) { console.error("Failed to create address:", error); return null; }
  return result.id;
}

export async function updateAddress(id: string, data: Partial<Address>) {
  if (!supabase) return null;
  if (data.is_default && data.customer_id) {
    await supabase.from("addresses").update({ is_default: false }).eq("customer_id", data.customer_id).neq("id", id);
  }
  const { error } = await supabase.from("addresses").update(data).eq("id", id);
  if (error) { console.error("Failed to update address:", error); return null; }
  return id;
}

export async function deleteAddress(id: string) {
  if (!supabase) return null;
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  if (error) { console.error("Failed to delete address:", error); return null; }
  return id;
}

export async function setDefaultAddress(id: string, customerId: string) {
  if (!supabase) return null;
  await supabase.from("addresses").update({ is_default: false }).eq("customer_id", customerId);
  await supabase.from("addresses").update({ is_default: true }).eq("id", id);
  return id;
}

// ─── ORDERS ────────────────────────────────────────────

export async function createOrder(data: OrderData) {
  if (!supabase) return null;

  const customerId = data.customerId || await createCustomer(data.customer);

  const { error: orderError, data: order } = await supabase
    .from("orders")
    .insert({
      bill_no: data.billNo, customer_id: customerId,
      customer_snapshot: data.customer,
      customer_name: data.customer.name, customer_email: data.customer.email,
      customer_phone: data.customer.phone,
      shipping_address_id: data.shippingAddressId || null,
      delivery_name: data.delivery?.name || null,
      delivery_phone: data.delivery?.phone || null,
      delivery_email: data.delivery?.email || null,
      delivery_address: data.delivery?.address || null,
      delivery_district: data.delivery?.district || null,
      delivery_city: data.delivery?.city || null,
      delivery_state: data.delivery?.state || null,
      delivery_pincode: data.delivery?.pincode || null,
      subtotal: data.total - data.shipping, shipping_cost: data.shipping,
      total: data.total, payment_method: data.paymentMethod,
      payment_status: data.paymentStatus, order_status: data.orderStatus,
      user_email: data.userEmail || null, utr: data.utr || null,
    })
    .select("id").single();

  if (orderError || !order) { console.error("Failed to create order:", orderError); return null; }

  const orderId = order.id as string;

  // Insert order_items (new normalized table)
  const orderItems = data.items.map((item) => ({
    order_id: orderId, product_id: String(item.id),
    variant_id: item.variantId || null,
    product_name: item.name, variant_size: item.selectedSize || null,
    variant_color: item.selectedColor || null, product_image: item.image || null,
    quantity: item.quantity, unit_price: item.price,
    total_price: item.price * item.quantity,
  }));
  await supabase.from("order_items").insert(orderItems);

  // Log initial status
  await logOrderStatus(orderId, data.orderStatus, "Order placed");

  // Decrement stock (old field for backward compat)
  for (const item of data.items) {
    await updateProductStock(String(item.id), item.quantity);
  }

  return data.billNo;
}

export async function getOrdersByEmail(email: string) {
  if (!supabase) return [];
  const { data, error } = await supabase.from("orders").select("*").eq("user_email", email).order("created_at", { ascending: false });
  if (error) return [];
  return data;
}

export async function getOrdersByCustomer(customerId: string) {
  if (!supabase) return [];
  const { data, error } = await supabase.from("orders").select("*").eq("customer_id", customerId).order("created_at", { ascending: false });
  if (error) return [];
  return data;
}

export async function getAllOrders() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return data;
}

export async function updateOrderStatus(billNo: string, status: string) {
  if (!supabase) return null;
  await supabase.from("orders").update({ order_status: status, updated_at: new Date().toISOString() }).eq("bill_no", billNo);
  const { data: order } = await supabase.from("orders").select("id").eq("bill_no", billNo).single();
  if (order) await logOrderStatus(order.id as string, status, `Status changed to ${status}`);
  return billNo;
}

// ─── ORDER ITEMS ───────────────────────────────────────

export async function getOrderItems(orderId: string) {
  if (!supabase) return [];
  const { data } = await supabase.from("order_items").select("*").eq("order_id", orderId);
  return data || [];
}

export async function getOrderItemsByBillNo(billNo: string) {
  if (!supabase) return [];
  const { data: order } = await supabase.from("orders").select("id").eq("bill_no", billNo).single();
  if (!order) return [];
  return getOrderItems(order.id as string);
}

// ─── ORDER STATUS HISTORY ──────────────────────────────

export async function logOrderStatus(orderId: string, status: string, note?: string) {
  if (!supabase) return;
  await supabase.from("order_status_history").insert({ order_id: orderId, status, note });
}

export async function getOrderHistory(orderId: string) {
  if (!supabase) return [];
  const { data } = await supabase.from("order_status_history").select("*").eq("order_id", orderId).order("created_at");
  return data || [];
}

// ─── REVIEWS ───────────────────────────────────────────

export async function getProductReviews(productId: string) {
  if (!supabase) return [];
  const { data } = await supabase.from("reviews").select("*").eq("product_id", productId).eq("is_approved", true).order("created_at", { ascending: false });
  return data || [];
}

export async function createReview(data: Record<string, unknown>) {
  if (!supabase) return null;
  const { error } = await supabase.from("reviews").insert(data);
  if (error) return null;
  return "ok";
}

export async function getAllReviews() {
  if (!supabase) return [];
  const { data } = await supabase.from("reviews").select("*, products(name)").order("created_at", { ascending: false });
  return data || [];
}

export async function approveReview(id: string) {
  if (!supabase) return null;
  await supabase.from("reviews").update({ is_approved: true }).eq("id", id);
  return id;
}

// ─── PROFILES ──────────────────────────────────────────

export type ProfileData = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  customerUpi: string;
  role: string;
};

export function loadProfile(): ProfileData {
  const saved = localStorage.getItem("nabome-profile");
  if (saved) {
    try { return JSON.parse(saved); } catch { /* fall through */ }
  }
  return { name: "", phone: "", email: "", address: "", city: "", state: "", pincode: "", customerUpi: "", role: "customer" };
}

export function saveProfileLocally(data: ProfileData) {
  localStorage.setItem("nabome-profile", JSON.stringify(data));
}

export async function saveProfileToSupabase(data: ProfileData) {
  if (!supabase) return;
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;
  if (!userId) return;
  const isAdmin = data.email === import.meta.env.VITE_ADMIN_EMAIL;
  const role = isAdmin ? "admin" : (data.role || "customer");
  await supabase.from("profiles").upsert({
    id: userId, name: data.name, phone: data.phone, email: data.email,
    address: data.address, city: data.city, state: data.state,
    pincode: data.pincode, customer_upi: data.customerUpi, role,
    updated_at: new Date().toISOString(),
  }, { onConflict: "id" });
}

export async function loadProfileFromSupabase(): Promise<ProfileData | null> {
  if (!supabase) return null;
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;
  if (!userId) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error || !data) return null;
  return {
    name: data.name || "", phone: data.phone || "", email: data.email || "",
    address: data.address || "", city: data.city || "", state: data.state || "",
    pincode: data.pincode || "", customerUpi: data.customer_upi || "", role: data.role || "customer",
  };
}

// ─── ROLE HELPERS ─────────────────────────────────────

export async function getUserRole(): Promise<string> {
  const local = JSON.parse(localStorage.getItem("nabome-user") || "{}");
  if (!supabase) return local.email === import.meta.env.VITE_ADMIN_EMAIL ? "admin" : "customer";
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;
  if (!userId) return local.email === import.meta.env.VITE_ADMIN_EMAIL ? "admin" : "customer";
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if (data?.role === "admin") return "admin";
  const email = session?.session?.user?.email || "";
  if (email === import.meta.env.VITE_ADMIN_EMAIL) return "admin";
  return "customer";
}

export async function seedAdminRole(userId: string, email: string) {
  if (!supabase) return;
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  if (!adminEmail || email !== adminEmail) return;
  const { data } = await supabase.from("profiles").select("id").eq("id", userId).single();
  if (data) {
    await supabase.from("profiles").update({ role: "admin", email }).eq("id", userId);
  } else {
    await supabase.from("profiles").insert({ id: userId, email, role: "admin" });
  }
}

// ─── SITE QUOTES (editable Bengali/cultural quotes) ───

export type SiteQuote = {
  id: string;
  text: string;
  attribution: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
};

const DEFAULT_QUOTES: Omit<SiteQuote, "id" | "created_at">[] = [
  { text: "আমার সোনার বাংলা, আমি তোমায় ভালোবাসি", attribution: "Rabindranath Tagore", is_active: true, sort_order: 0 },
  { text: "বাঙ্গালীর সর্বস্ব তব, মা যে তোর নয়নামৃত ধারা", attribution: "Kazi Nazrul Islam", is_active: true, sort_order: 1 },
  { text: "চলো যাই, চলো যাই, যেখানে আলোর উৎসব", attribution: "Jibanananda Das", is_active: true, sort_order: 2 },
  { text: "আমি বাংলায় গান গাই, আমি বাংলার গান গাই", attribution: "বাংলা সংস্কৃতি", is_active: true, sort_order: 3 },
  { text: "একটি শিল্পী কখনো তার সংস্কৃতি হারায় না", attribution: "নবME Philosophy", is_active: true, sort_order: 4 },
];

export async function getSiteQuotes(): Promise<SiteQuote[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("site_quotes")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data as SiteQuote[];
}

export async function getAllSiteQuotes(): Promise<SiteQuote[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("site_quotes")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data as SiteQuote[];
}

export async function createSiteQuote(data: { text: string; attribution: string; is_active?: boolean; sort_order?: number }) {
  if (!supabase) return null;
  const { data: row, error } = await supabase
    .from("site_quotes")
    .insert({
      text: data.text,
      attribution: data.attribution,
      is_active: data.is_active ?? true,
      sort_order: data.sort_order ?? 0,
    })
    .select()
    .single();
  if (error) {
    console.error("Failed to create quote:", error);
    return null;
  }
  return row as SiteQuote;
}

export async function updateSiteQuote(id: string, data: Partial<SiteQuote>) {
  if (!supabase) return null;
  const { data: row, error } = await supabase
    .from("site_quotes")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("Failed to update quote:", error);
    return null;
  }
  return row as SiteQuote;
}

export async function deleteSiteQuote(id: string) {
  if (!supabase) return false;
  const { error } = await supabase.from("site_quotes").delete().eq("id", id);
  if (error) {
    console.error("Failed to delete quote:", error);
    return false;
  }
  return true;
}

export async function seedDefaultQuotesIfEmpty() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("site_quotes")
    .select("id")
    .limit(1);
  if (error) return;
  if (data && data.length > 0) return;
  for (const q of DEFAULT_QUOTES) {
    await supabase.from("site_quotes").insert(q);
  }
}

// ─── NEWSLETTER ────────────────────────────────────────

export async function subscribeNewsletter(email: string) {
  if (!supabase) return "local";
  const { error } = await supabase.from("newsletter_subscribers").insert({ email });
  if (error) {
    if (error.code === "23505") return "duplicate";
    console.error("Failed to subscribe:", error);
    return "error";
  }
  return "ok";
}

// ─── SEARCH HELPERS ────────────────────────────────────

export function matchesSearch(product: Product, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const fields = [product.name, product.category, ...product.tags, product.description, product.material, product.fit];
  return fields.some((f) => f?.toLowerCase().includes(q));
}
