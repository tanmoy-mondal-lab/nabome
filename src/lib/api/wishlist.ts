import { supabase } from "../supabase";

function isConnected() { return !!supabase; }

export async function getWishlist(userId: string) {
  if (!isConnected()) return JSON.parse(localStorage.getItem("nabome-wishlist") || "[]");
  const { data } = await supabase!.from("wishlist").select("*, products(*)").eq("user_id", userId);
  return data || [];
}

export async function addToWishlist(userId: string, productId: string) {
  if (!isConnected()) {
    const wl = JSON.parse(localStorage.getItem("nabome-wishlist") || "[]");
    if (!wl.find((i: any) => i.product_id === productId)) {
      wl.push({ id: `mock_${Date.now()}`, product_id: productId });
      localStorage.setItem("nabome-wishlist", JSON.stringify(wl));
    }
    return;
  }
  const { error } = await supabase!.from("wishlist").upsert({ user_id: userId, product_id: productId }, { onConflict: "user_id,product_id" });
  if (error) throw error;
}

export async function removeFromWishlist(userId: string, productId: string) {
  if (!isConnected()) {
    const wl = JSON.parse(localStorage.getItem("nabome-wishlist") || "[]").filter((i: any) => i.product_id !== productId);
    localStorage.setItem("nabome-wishlist", JSON.stringify(wl));
    return;
  }
  const { error } = await supabase!.from("wishlist").delete().eq("user_id", userId).eq("product_id", productId);
  if (error) throw error;
}

export async function isInWishlist(userId: string, productId: string) {
  if (!isConnected()) {
    const wl = JSON.parse(localStorage.getItem("nabome-wishlist") || "[]");
    return !!wl.find((i: any) => i.product_id === productId);
  }
  const { data } = await supabase!.from("wishlist").select("id").eq("user_id", userId).eq("product_id", productId).single();
  return !!data;
}
