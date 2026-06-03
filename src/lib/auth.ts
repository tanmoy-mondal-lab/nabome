import { supabase } from "./supabase";
import { neon, isNeonConnected } from "./neon";

export type AuthUser = {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: "customer" | "vendor" | "admin" | "super_admin";
  vendorStatus?: "pending" | "approved" | "rejected" | "suspended";
  createdAt: string;
};

export async function registerUser(params: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: "customer" | "vendor";
}) {
  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        full_name: params.name,
        phone: params.phone || "",
        role: params.role || "customer",
      },
    },
  });

  if (error) throw error;
  return data.user;
}

export async function loginUser(params: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });

  if (error) throw error;
  return mapSupabaseUser(data.user);
}

export async function logoutUser() {
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
}

export async function getSession(): Promise<AuthUser | null> {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;
  return mapSupabaseUser(data.session.user);
}

export function onAuthChange(callback: (user: AuthUser | null) => void) {
  const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
    callback(session?.user ? await mapSupabaseUser(session.user) : null);
  });
  return () => data?.subscription.unsubscribe();
}

export async function updateProfile(data: Partial<AuthUser>) {
  if (data.name) {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: data.name },
    });
    if (error) throw error;
  }

  if (await isNeonConnected()) {
    await neon.update("users", { name: data.name }, { id: data.id });
  }

  return data as AuthUser;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return { message: "Password reset email sent" };
}

export async function changePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

async function mapSupabaseUser(supabaseUser: any): Promise<AuthUser> {
  const metadata = supabaseUser.user_metadata || {};
  let role = metadata.role || "customer";
  let name = metadata.full_name || metadata.name || supabaseUser.email?.split("@")[0] || "User";
  let vendorStatus: AuthUser["vendorStatus"] = undefined;

  if (await isNeonConnected()) {
    const { data: dbUser } = await neon.select("users", { id: supabaseUser.id }, { single: true });
    if (dbUser) {
      role = dbUser.role || role;
      name = dbUser.name || name;
    }
    if (role === "vendor") {
      const { data: vendor } = await neon.select("vendors", { user_id: supabaseUser.id }, { single: true });
      if (vendor) {
        vendorStatus = vendor.approval_status;
      }
    }
  }

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    phone: supabaseUser.phone || metadata.phone || "",
    name,
    role,
    vendorStatus,
    createdAt: supabaseUser.created_at || new Date().toISOString(),
  };
}
