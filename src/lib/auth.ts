import { supabase } from "./supabase";

export type AuthUser = {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  role: "customer" | "vendor" | "admin";
  status: "active" | "suspended" | "banned";
  avatar_url?: string;
};

// ─── REGISTRATION ───────────────────────────

export async function registerUser(params: {
  email?: string;
  phone?: string;
  password: string;
  name: string;
  role?: "customer" | "vendor";
}) {
  if (!supabase) {
    // Fallback to mock
    const users = JSON.parse(localStorage.getItem("nabome-users") || "[]");
    const exists = users.find((u: any) => u.email === params.email || u.phone === params.phone);
    if (exists) throw new Error("User already exists");
    const newUser = {
      id: `mock_${Date.now()}`,
      email: params.email,
      phone: params.phone,
      name: params.name,
      password: params.password,
      role: params.role || "customer",
      status: "active",
    };
    users.push(newUser);
    localStorage.setItem("nabome-users", JSON.stringify(users));
    localStorage.setItem("nabome-current-user", JSON.stringify(newUser));
    return newUser;
  }

  const { data, error } = await supabase.auth.signUp({
    email: params.email!,
    password: params.password,
    options: {
      data: {
        name: params.name,
        phone: params.phone,
        role: params.role || "customer",
      },
    },
  });

  if (error) throw error;
  return data.user;
}

// ─── LOGIN ──────────────────────────────────

export async function loginUser(params: {
  email?: string;
  password: string;
}) {
  if (!supabase) {
    const users = JSON.parse(localStorage.getItem("nabome-users") || "[]");
    const user = users.find(
      (u: any) => (u.email === params.email || u.phone === params.email) && u.password === params.password
    );
    if (!user) throw new Error("Invalid credentials");
    localStorage.setItem("nabome-current-user", JSON.stringify(user));
    return user as AuthUser;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: params.email!,
    password: params.password,
  });

  if (error) throw error;
  return mapSupabaseUser(data.user);
}

// ─── LOGOUT ─────────────────────────────────

export async function logoutUser() {
  localStorage.removeItem("nabome-current-user");
  if (!supabase) return;
  await supabase.auth.signOut();
}

// ─── GET SESSION ────────────────────────────

export async function getSession(): Promise<AuthUser | null> {
  const mock = localStorage.getItem("nabome-current-user");
  if (mock) return JSON.parse(mock) as AuthUser;

  if (!supabase) return null;

  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;
  return mapSupabaseUser(data.session.user);
}

// ─── ON AUTH STATE CHANGE ───────────────────

export function onAuthChange(callback: (user: AuthUser | null) => void) {
  if (!supabase) {
    const check = () => {
      const mock = localStorage.getItem("nabome-current-user");
      callback(mock ? JSON.parse(mock) as AuthUser : null);
    };
    check();
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }

  const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
    callback(session?.user ? await mapSupabaseUser(session.user) : null);
  });
  return () => data?.subscription.unsubscribe();
}

// ─── UPDATE PROFILE ─────────────────────────

export async function updateProfile(data: Partial<AuthUser>) {
  const mock = localStorage.getItem("nabome-current-user");
  if (mock) {
    const user = { ...JSON.parse(mock), ...data } as AuthUser;
    localStorage.setItem("nabome-current-user", JSON.stringify(user));
    return user;
  }

  if (!supabase) throw new Error("No auth configured");

  const { error } = await supabase.auth.updateUser({
    data: { name: data.name },
  });
  if (error) throw error;

  if (supabase) {
    await supabase.from("users").upsert({
      id: data.id,
      name: data.name,
      avatar_url: data.avatar_url,
    });
  }

  return data as AuthUser;
}

// ─── RESET PASSWORD ─────────────────────────

export async function resetPassword(email: string) {
  if (!supabase) {
    const users = JSON.parse(localStorage.getItem("nabome-users") || "[]");
    const user = users.find((u: any) => u.email === email);
    if (!user) throw new Error("No user found with this email");
    return { message: "Password reset email sent (mock)" };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return { message: "Password reset email sent" };
}

// ─── CHANGE PASSWORD ────────────────────────

export async function changePassword(newPassword: string) {
  if (!supabase) {
    const mock = localStorage.getItem("nabome-current-user");
    if (!mock) throw new Error("Not logged in");
    const user = JSON.parse(mock);
    user.password = newPassword;
    const users = JSON.parse(localStorage.getItem("nabome-users") || "[]");
    const idx = users.findIndex((u: any) => u.id === user.id);
    if (idx >= 0) users[idx].password = newPassword;
    localStorage.setItem("nabome-users", JSON.stringify(users));
    localStorage.setItem("nabome-current-user", JSON.stringify(user));
    return;
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

// ─── HELPERS ────────────────────────────────

async function mapSupabaseUser(supabaseUser: any): Promise<AuthUser> {
  const metadata = supabaseUser.user_metadata || {};
  let role = metadata.role || "customer";
  let name = metadata.name || supabaseUser.email?.split("@")[0] || "User";

  // Fetch from users table for more complete data
  if (supabase) {
    const { data: dbUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", supabaseUser.id)
      .single();

    if (dbUser) {
      role = dbUser.role || role;
      name = dbUser.name || name;
    }
  }

  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    phone: supabaseUser.phone || metadata.phone,
    name,
    role,
    status: "active",
  };
}
