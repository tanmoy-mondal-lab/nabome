import { supabase } from "../supabase";
import { supabase as db } from "../supabase";

function isConnected() { return !!supabase; }

export async function getAddresses(userId: string) {
  if (!isConnected()) return [];
  const { data } = await supabase!.from("addresses").select("*").eq("user_id", userId).order("is_default", { ascending: false });
  return data || [];
}

export async function createAddress(address: any) {
  if (!isConnected()) return { id: `mock_${Date.now()}`, ...address };
  const { data, error } = await supabase!.from("addresses").insert(address).select().single();
  if (error) throw error;
  return data;
}

export async function updateAddress(id: string, updates: any) {
  if (!isConnected()) return { id, ...updates };
  const { data, error } = await supabase!.from("addresses").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteAddress(id: string) {
  if (!isConnected()) return;
  const { error } = await supabase!.from("addresses").delete().eq("id", id);
  if (error) throw error;
}

export async function setDefaultAddress(userId: string, id: string) {
  if (!isConnected()) return;
  await supabase!.from("addresses").update({ is_default: false }).eq("user_id", userId).neq("id", id);
  await supabase!.from("addresses").update({ is_default: true }).eq("id", id);
}
