import { supabase } from "../lib/supabase";
import { neon, isNeonConnected } from "../lib/neon";

export type ProfileData = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  gender: string | null;
  profile_image: string | null;
  role: string;
};

export async function getProfile(): Promise<ProfileData | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return null;

  const { data: authUser } = await supabase.auth.getUser();
  const meta = authUser.user?.user_metadata || {};

  if (await isNeonConnected()) {
    const { data: dbUser } = await neon.select("users", { id: userId }, { single: true });
    if (dbUser) {
      return {
        id: userId,
        full_name: (dbUser as any).full_name || meta.full_name || "",
        email: (dbUser as any).email || authUser.user?.email || "",
        phone: (dbUser as any).phone || meta.phone || "",
        gender: (dbUser as any).gender || null,
        profile_image: (dbUser as any).profile_image || null,
        role: (dbUser as any).role || meta.role || "customer",
      };
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profile) {
    return {
      id: userId,
      full_name: (profile as any).name || meta.full_name || "",
      email: (profile as any).email || authUser.user?.email || "",
      phone: (profile as any).phone || meta.phone || "",
      gender: null,
      profile_image: null,
      role: (profile as any).role || meta.role || "customer",
    };
  }

  return {
    id: userId,
    full_name: meta.full_name || "",
    email: authUser.user?.email || "",
    phone: meta.phone || "",
    gender: null,
    profile_image: null,
    role: meta.role || "customer",
  };
}

export async function updateProfile(data: Partial<ProfileData>) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) throw new Error("Not authenticated");

  if (data.full_name) {
    await supabase.auth.updateUser({ data: { full_name: data.full_name } });
  }

  const payload: Record<string, unknown> = {};
  if (data.full_name !== undefined) payload.full_name = data.full_name;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.gender !== undefined) payload.gender = data.gender;
  if (data.profile_image !== undefined) payload.profile_image = data.profile_image;

  if (await isNeonConnected()) {
    await neon.update("users", payload, { id: userId });
  }

  await supabase.from("profiles").upsert({
    id: userId,
    name: data.full_name,
    phone: data.phone,
    updated_at: new Date().toISOString(),
  });
}

export async function uploadProfileImage(file: File): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) throw new Error("Not authenticated");

  const filePath = `profiles/${userId}/${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage
    .from("nabome-images")
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("nabome-images")
    .getPublicUrl(data.path);

  await updateProfile({ profile_image: urlData.publicUrl });
  return urlData.publicUrl;
}
