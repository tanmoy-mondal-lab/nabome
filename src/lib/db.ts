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
  utr?: string;
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

export async function updateProductStock(id: string, delta: number) {
  if (!supabase) return;

  const { data: prod } = await supabase
    .from("products")
    .select("stock")
    .eq("id", id)
    .single();

  if (!prod) return;

  const newStock = Math.max(0, (prod.stock as number) - delta);
  await supabase
    .from("products")
    .update({ stock: newStock, in_stock: newStock > 0 })
    .eq("id", id);
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
    utr: data.utr || null,
  });

  if (error) {
    console.error("Failed to create order:", error);
    return null;
  }

  // Decrement stock for each item
  for (const item of data.items) {
    await updateProductStock(String(item.id), item.quantity);
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

export async function getAllOrders() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }

  return data;
}

export async function updateOrderStatus(billNo: string, status: string) {
  if (!supabase) return null;

  const { error } = await supabase
    .from("orders")
    .update({ order_status: status })
    .eq("bill_no", billNo);

  if (error) {
    console.error("Failed to update order:", error);
    return null;
  }

  return billNo;
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
    try {
      return JSON.parse(saved);
    } catch {
      /* fall through */
    }
  }
  return {
    name: "", phone: "", email: "",
    address: "", city: "", state: "", pincode: "",
    customerUpi: "", role: "customer",
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

  const isAdmin = data.email === import.meta.env.VITE_ADMIN_EMAIL;
  const role = isAdmin ? "admin" : (data.role || "customer");

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
      role,
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
    role: data.role || "customer",
  };
}

// ─── ROLE HELPERS ─────────────────────────────────────

export async function getUserRole(): Promise<string> {
  const local = JSON.parse(localStorage.getItem("nabome-user") || "{}");
  if (!supabase) return local.email === import.meta.env.VITE_ADMIN_EMAIL ? "admin" : "customer";

  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;
  if (!userId) return local.email === import.meta.env.VITE_ADMIN_EMAIL ? "admin" : "customer";

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (data?.role === "admin") return "admin";

  const email = session?.session?.user?.email || "";
  if (email === import.meta.env.VITE_ADMIN_EMAIL) return "admin";

  return "customer";
}

export async function seedAdminRole(userId: string, email: string) {
  if (!supabase) return;
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  if (!adminEmail || email !== adminEmail) return;

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (data) {
    await supabase
      .from("profiles")
      .update({ role: "admin", email })
      .eq("id", userId);
  } else {
    await supabase.from("profiles").insert({
      id: userId,
      email,
      role: "admin",
    });
  }
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

// ─── SEARCH HELPERS ────────────────────────────────────

export function matchesSearch(product: Product, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const fields = [
    product.name,
    product.category,
    ...product.tags,
    product.description,
    product.material,
    product.fit,
  ];
  return fields.some((f) => f?.toLowerCase().includes(q));
}
