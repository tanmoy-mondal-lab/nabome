import { supabase } from "../supabase";

function isConnected() { return !!supabase; }

export async function getCart(userId: string) {
  if (!isConnected()) return JSON.parse(localStorage.getItem("nabome-cart") || "[]");
  const { data } = await supabase!.from("cart").select("*, products(*)").eq("user_id", userId);
  return data || [];
}

export async function addToCart(userId: string, productId: string, variantId: string, quantity = 1) {
  if (!isConnected()) {
    const cart = JSON.parse(localStorage.getItem("nabome-cart") || "[]");
    const existing = cart.findIndex((i: any) => i.product_id === productId && i.variant_id === variantId);
    if (existing >= 0) cart[existing].quantity += quantity;
    else cart.push({ id: `mock_${Date.now()}`, product_id: productId, variant_id: variantId, quantity });
    localStorage.setItem("nabome-cart", JSON.stringify(cart));
    return cart;
  }
  const existing = await supabase!.from("cart").select("*").eq("user_id", userId).eq("product_id", productId).eq("variant_id", variantId).single();
  if (existing.data) {
    const { error } = await supabase!.from("cart").update({ quantity: existing.data.quantity + quantity }).eq("id", existing.data.id);
    if (error) throw error;
  } else {
    const { error } = await supabase!.from("cart").insert({ user_id: userId, product_id: productId, variant_id: variantId, quantity });
    if (error) throw error;
  }
}

export async function updateCartQuantity(id: string, quantity: number) {
  if (!isConnected()) {
    const cart = JSON.parse(localStorage.getItem("nabome-cart") || "[]");
    const idx = cart.findIndex((i: any) => i.id === id);
    if (idx >= 0) { cart[idx].quantity = quantity; localStorage.setItem("nabome-cart", JSON.stringify(cart)); }
    return;
  }
  const { error } = await supabase!.from("cart").update({ quantity }).eq("id", id);
  if (error) throw error;
}

export async function removeFromCart(id: string) {
  if (!isConnected()) {
    const cart = JSON.parse(localStorage.getItem("nabome-cart") || "[]").filter((i: any) => i.id !== id);
    localStorage.setItem("nabome-cart", JSON.stringify(cart));
    return;
  }
  const { error } = await supabase!.from("cart").delete().eq("id", id);
  if (error) throw error;
}

export async function clearCart(userId: string) {
  localStorage.removeItem("nabome-cart");
  if (!isConnected()) return;
  await supabase!.from("cart").delete().eq("user_id", userId);
}
