import { supabase } from "../lib/supabase";
import { neon, isNeonConnected } from "../lib/neon";
import type { AuthUser, LoginCredentials, CustomerRegisterData, VendorRegisterData, Role } from "../types/auth";

function mapUser(supabaseUser: any): AuthUser {
  const meta = supabaseUser.user_metadata || {};
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    phone: supabaseUser.phone || meta.phone || "",
    name: meta.full_name || meta.name || supabaseUser.email?.split("@")[0] || "User",
    role: (meta.role || "customer") as Role,
    createdAt: supabaseUser.created_at || new Date().toISOString(),
  };
}

export async function signUp(data: CustomerRegisterData) {
  const { data: result, error } = await supabase.auth.signUp({
    email: data.email!,
    password: data.password,
    options: {
      data: {
        full_name: data.name,
        phone: data.phone,
        gender: data.gender,
        role: "customer",
      },
    },
  });
  if (error) throw error;

  if (result.user && (await isNeonConnected())) {
    await neon.insert("users", {
      id: result.user.id,
      full_name: data.name,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      role: "customer",
    });
  }

  return result.user ? mapUser(result.user) : null;
}

export async function signIn(credentials: LoginCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email!,
    password: credentials.password,
  });
  if (error) throw error;
  return mapUser(data.user);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession() {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;
  return mapUser(data.session.user);
}

export async function refreshRole(): Promise<Role> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return "customer";

  if (await isNeonConnected()) {
    const { data: dbUser } = await neon.select("users", { id: userId }, { single: true, columns: "role" });
    if (dbUser?.role) return dbUser.role as Role;
  }

  const { data: supabaseUser } = await supabase.auth.getUser();
  const role = supabaseUser.user?.user_metadata?.role as Role;
  return role || "customer";
}

export async function registerVendor(data: VendorRegisterData) {
  const { data: result, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.ownerName,
        phone: data.phone,
        role: "vendor",
      },
    },
  });
  if (error) throw error;

  if (result.user && (await isNeonConnected())) {
    const slug = data.shopName
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `shop-${Date.now()}`;

    await neon.insert("users", {
      id: result.user.id,
      full_name: data.ownerName,
      email: data.email,
      phone: data.phone,
      role: "vendor",
    });

    await neon.insert("vendors", {
      user_id: result.user.id,
      shop_name: data.shopName,
      shop_slug: slug,
      shop_description: data.shopCategory,
      shop_email: data.email,
      shop_phone: data.phone,
      shop_address: data.businessAddress,
      approval_status: "pending",
    });
  }

  return result.user ? mapUser(result.user) : null;
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}
