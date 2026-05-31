import { supabase } from "./supabase";
import { products as localProducts } from "../data/products";

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

export async function getProducts() {
  if (!supabase) return localProducts;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return localProducts;
  }

  return data;
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
    category: p.category || null,
    sizes: p.sizes || [],
    colors: p.colors || [],
    in_stock: p.stock > 0,
    is_new: p.isNew ?? false,
    is_bestseller: p.isBestSeller ?? false,
  }));

  const { error } = await supabase.from("products").insert(rows);
  if (error) console.error("Failed to seed products:", error);
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
