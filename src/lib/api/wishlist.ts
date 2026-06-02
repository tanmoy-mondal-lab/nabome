import { neon, isNeonConnected } from "../neon";

export async function getWishlist(userId: string) {
  if (!await isNeonConnected()) return JSON.parse(localStorage.getItem("nabome-wishlist") || "[]");
  const { data } = await neon.raw(
    `SELECT w.*, p.* FROM wishlist w JOIN products p ON p.id = w.product_id WHERE w.user_id = $1`,
    [userId]
  );
  return data || [];
}

export async function addToWishlist(userId: string, productId: string) {
  if (!await isNeonConnected()) {
    const wl = JSON.parse(localStorage.getItem("nabome-wishlist") || "[]");
    if (!wl.find((i: any) => i.product_id === productId)) {
      wl.push({ id: `mock_${Date.now()}`, product_id: productId });
      localStorage.setItem("nabome-wishlist", JSON.stringify(wl));
    }
    return;
  }
  const existing = await neon.select("wishlist", { user_id: userId, product_id: productId }, { single: true });
  if (!existing.data) {
    const { error } = await neon.insert("wishlist", { user_id: userId, product_id: productId });
    if (error) throw error;
  }
}

export async function removeFromWishlist(userId: string, productId: string) {
  if (!await isNeonConnected()) {
    const wl = JSON.parse(localStorage.getItem("nabome-wishlist") || "[]").filter((i: any) => i.product_id !== productId);
    localStorage.setItem("nabome-wishlist", JSON.stringify(wl));
    return;
  }
  const { error } = await neon.delete("wishlist", { user_id: userId, product_id: productId });
  if (error) throw error;
}

export async function isInWishlist(userId: string, productId: string) {
  if (!await isNeonConnected()) {
    const wl = JSON.parse(localStorage.getItem("nabome-wishlist") || "[]");
    return !!wl.find((i: any) => i.product_id === productId);
  }
  const { data } = await neon.select("wishlist", { user_id: userId, product_id: productId }, { single: true });
  return !!data;
}
