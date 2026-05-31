import { supabase } from "./supabase";
import { products as localProducts } from "../data/products";
import type { Product } from "../data/products";

export type CartItem = {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  image?: string;
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
};

// ─── PRODUCTS ──────────────────────────────────────────

type ProductRow = Record<string, unknown>;

function mapProduct(row: ProductRow): Product {
  return {
    id: typeof row.id === "number" ? row.id : parseInt(row.id as string) || 0,
    name: (row.name as string) || "",
    price: (row.price as number) || 0,
    originalPrice: (row.original_price as number) || (row.price as number) || 0,
    category: (row.category as Product["category"]) || "Unisex",
    image: (row.image as string) || "",
    images: (row.images as string[]) || [(row.image as string) || ""],
    description: (row.description as string) || "",
    sizes: (row.sizes as string[]) || [],
    colors: (row.colors as string[]) || [],
    stock: (row.stock as number) ?? 10,
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

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return localProducts;
  }

  return (data as ProductRow[]).map(mapProduct);
}

export async function seedProductsIfEmpty() {
  if (!supabase) return;

  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  if (count && count > 0) return;

  const rows = localProducts.map((p) => ({
    id: String(p.id),
    name: p.name,
    price: p.price,
    original_price: p.originalPrice || null,
    description: p.description || null,
    image: p.image || null,
    images: p.images || [p.image || ""],
    category: p.category || null,
    sizes: p.sizes || [],
    colors: p.colors || [],
    stock: p.stock,
    in_stock: p.stock > 0,
    is_new: p.isNew ?? false,
    is_bestseller: p.isBestSeller ?? false,
    is_limited: p.isLimited ?? false,
    tags: p.tags || [],
    material: p.material || "",
    fit: p.fit || "",
    rating: p.rating || 0,
    reviews: p.reviews || 0,
  }));

  const { error } = await supabase.from("products").insert(rows);
  if (error) console.error("Failed to seed products:", error);
}

export async function createProduct(data: Record<string, unknown>) {
  if (!supabase) return null;

  const { error } = await supabase.from("products").insert(data);
  if (error) {
    console.error("Failed to create product:", error);
    return null;
  }
  return data.id as string;
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  if (!supabase) return null;

  const { error } = await supabase.from("products").update(data).eq("id", id);
  if (error) {
    console.error("Failed to update product:", error);
    return null;
  }
  return id;
}

export async function deleteProduct(id: string) {
  if (!supabase) return null;

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error("Failed to delete product:", error);
    return null;
  }
  return id;
}

// ─── CUSTOMERS ─────────────────────────────────────────

export async function createCustomer(data: CustomerData) {
  if (!supabase) return null;

  const { data: customer, error } = await supabase
    .from("customers")
    .insert({
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      customer_upi: data.customerUpi || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create customer:", error);
    return null;
  }

  return customer.id;
}

// ─── ORDERS ────────────────────────────────────────────

export async function createOrder(data: OrderData) {
  if (!supabase) return null;

  const customerId = await createCustomer(data.customer);

  const { error } = await supabase.from("orders").insert({
    bill_no: data.billNo,
    customer_id: customerId,
    customer_snapshot: data.customer,
    items: data.items,
    shipping: data.shipping,
    tax_label: data.taxLabel,
    total: data.total,
    payment_method: data.paymentMethod,
    payment_status: data.paymentStatus,
    order_status: data.orderStatus,
    user_email: data.userEmail || null,
  });

  if (error) {
    console.error("Failed to create order:", error);
    return null;
  }

  return data.billNo;
}

export async function getOrdersByEmail(email: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_email", email)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }

  return data;
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
};

export function loadProfile(): ProfileData {
  const saved = localStorage.getItem("nabome-profile");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      /* fall through */
    }
  }
  return {
    name: "", phone: "", email: "",
    address: "", city: "", state: "", pincode: "",
    customerUpi: "",
  };
}

export function saveProfileLocally(data: ProfileData) {
  localStorage.setItem("nabome-profile", JSON.stringify(data));
}

export async function saveProfileToSupabase(data: ProfileData) {
  if (!supabase) return;

  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;
  if (!userId) return;

  await supabase.from("profiles").upsert(
    {
      id: userId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      customer_upi: data.customerUpi,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
}

export async function loadProfileFromSupabase(): Promise<ProfileData | null> {
  if (!supabase) return null;

  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  return {
    name: data.name || "",
    phone: data.phone || "",
    email: data.email || "",
    address: data.address || "",
    city: data.city || "",
    state: data.state || "",
    pincode: data.pincode || "",
    customerUpi: data.customer_upi || "",
  };
}

// ─── NEWSLETTER ────────────────────────────────────────

export async function subscribeNewsletter(email: string) {
  if (!supabase) return "local";

  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email });

  if (error) {
    if (error.code === "23505") return "duplicate";
    console.error("Failed to subscribe:", error);
    return "error";
  }

  return "ok";
}
