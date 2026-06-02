import { neon, isNeonConnected } from "../neon";

export async function getCart(userId: string) {
  if (!await isNeonConnected()) return JSON.parse(localStorage.getItem("nabome-cart") || "[]");
  const { data } = await neon.raw(
    `SELECT c.*, p.* FROM cart c JOIN products p ON p.id = c.product_id WHERE c.user_id = $1`,
    [userId]
  );
  return data || [];
}

export async function addToCart(userId: string, productId: string, variantId: string, quantity = 1) {
  if (!await isNeonConnected()) {
    const cart = JSON.parse(localStorage.getItem("nabome-cart") || "[]");
    const existing = cart.findIndex((i: any) => i.product_id === productId && i.variant_id === variantId);
    if (existing >= 0) cart[existing].quantity += quantity;
    else cart.push({ id: `mock_${Date.now()}`, product_id: productId, variant_id: variantId, quantity });
    localStorage.setItem("nabome-cart", JSON.stringify(cart));
    return cart;
  }
  const { data: existing } = await neon.select("cart", { user_id: userId, product_id: productId, variant_id: variantId }, { single: true });
  if (existing) {
    const { error } = await neon.update("cart", { quantity: existing.quantity + quantity }, { id: existing.id });
    if (error) throw error;
  } else {
    const { error } = await neon.insert("cart", { user_id: userId, product_id: productId, variant_id: variantId, quantity });
    if (error) throw error;
  }
}

export async function updateCartQuantity(id: string, quantity: number) {
  if (!await isNeonConnected()) {
    const cart = JSON.parse(localStorage.getItem("nabome-cart") || "[]");
    const idx = cart.findIndex((i: any) => i.id === id);
    if (idx >= 0) { cart[idx].quantity = quantity; localStorage.setItem("nabome-cart", JSON.stringify(cart)); }
    return;
  }
  const { error } = await neon.update("cart", { quantity }, { id });
  if (error) throw error;
}

export async function removeFromCart(id: string) {
  if (!await isNeonConnected()) {
    const cart = JSON.parse(localStorage.getItem("nabome-cart") || "[]").filter((i: any) => i.id !== id);
    localStorage.setItem("nabome-cart", JSON.stringify(cart));
    return;
  }
  const { error } = await neon.delete("cart", { id });
  if (error) throw error;
}

export async function clearCart(userId: string) {
  localStorage.removeItem("nabome-cart");
  if (!await isNeonConnected()) return;
  await neon.delete("cart", { user_id: userId });
}
