import { neon, isNeonConnected } from "../neon";

export async function getAddresses(userId: string) {
  if (!await isNeonConnected()) return [];
  const { data } = await neon.select("addresses", { user_id: userId }, { order: "is_default", ascending: false });
  return data || [];
}

export async function createAddress(address: any) {
  if (!await isNeonConnected()) return { id: `mock_${Date.now()}`, ...address };
  const { data, error } = await neon.insert("addresses", address);
  if (error) throw error;
  return data?.[0] || null;
}

export async function updateAddress(id: string, updates: any) {
  if (!await isNeonConnected()) return { id, ...updates };
  const { data, error } = await neon.update("addresses", updates, { id });
  if (error) throw error;
  return data?.[0] || null;
}

export async function deleteAddress(id: string) {
  if (!await isNeonConnected()) return;
  const { error } = await neon.delete("addresses", { id });
  if (error) throw error;
}

export async function setDefaultAddress(userId: string, id: string) {
  if (!await isNeonConnected()) return;
  await neon.update("addresses", { is_default: false }, { user_id: userId, id__neq: id });
  await neon.update("addresses", { is_default: true }, { id });
}
