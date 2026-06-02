import { neon, isNeonConnected } from "../neon";
import type { CartItem } from "../../context/CartContext";

const TABLE = "user_cart";

function getLocal(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem("nabome-cart") || "[]");
  } catch {
    return [];
  }
}

function setLocal(items: CartItem[]) {
  localStorage.setItem("nabome-cart", JSON.stringify(items));
}

async function readDb(userId: string): Promise<CartItem[]> {
  const { data } = await neon.select(TABLE, { user_id: userId }, { single: true });
  if (data && typeof (data as Record<string, unknown>).items === "string") {
    try { return JSON.parse((data as Record<string, unknown>).items as string); } catch { return []; }
  }
  return ((data as Record<string, unknown>)?.items as CartItem[]) || [];
}

async function writeDb(userId: string, items: CartItem[]) {
  const { data: existing } = await neon.select(TABLE, { user_id: userId }, { single: true });
  if (existing) {
    await neon.update(TABLE, { items: JSON.stringify(items), updated_at: new Date().toISOString() }, { user_id: userId });
  } else {
    await neon.insert(TABLE, { user_id: userId, items: JSON.stringify(items) });
  }
}

export async function getCart(userId?: string | null): Promise<CartItem[]> {
  if (!userId || !(await isNeonConnected())) return getLocal();
  return readDb(userId);
}

export async function setCart(userId: string | null | undefined, items: CartItem[]) {
  setLocal(items);
  if (userId && (await isNeonConnected())) {
    await writeDb(userId, items);
  }
}

export async function addToCart(userId: string | null | undefined, item: CartItem) {
  const local = getLocal();
  const idx = local.findIndex(
    (i) => i.id === item.id && (item.variantId ? i.variantId === item.variantId : i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor)
  );
  if (idx >= 0) {
    local[idx].quantity += 1;
  } else {
    local.push({ ...item, quantity: 1 });
  }
  setLocal(local);

  if (userId && (await isNeonConnected())) {
    const db = await readDb(userId);
    const dbIdx = db.findIndex(
      (i) => i.id === item.id && (item.variantId ? i.variantId === item.variantId : i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor)
    );
    if (dbIdx >= 0) {
      db[dbIdx].quantity += 1;
    } else {
      db.push({ ...item, quantity: 1 });
    }
    await writeDb(userId, db);
  }
}

export async function updateCartQuantity(
  userId: string | null | undefined,
  productId: number,
  quantity: number,
  variantId?: string,
  selectedSize?: string,
  selectedColor?: string,
) {
  const local = getLocal();
  const idx = local.findIndex(
    (i) => i.id === productId && (variantId ? i.variantId === variantId : i.selectedSize === selectedSize && i.selectedColor === selectedColor)
  );
  if (idx >= 0) {
    local[idx].quantity = quantity;
    setLocal(local);
  }

  if (userId && (await isNeonConnected())) {
    const db = await readDb(userId);
    const dbIdx = db.findIndex(
      (i) => i.id === productId && (variantId ? i.variantId === variantId : i.selectedSize === selectedSize && i.selectedColor === selectedColor)
    );
    if (dbIdx >= 0) {
      db[dbIdx].quantity = quantity;
      await writeDb(userId, db);
    }
  }
}

export async function removeFromCart(
  userId: string | null | undefined,
  productId: number,
  variantId?: string,
  selectedSize?: string,
  selectedColor?: string,
) {
  const matcher = (i: CartItem) => i.id === productId && (variantId ? i.variantId === variantId : i.selectedSize === selectedSize && i.selectedColor === selectedColor);
  setLocal(getLocal().filter((i) => !matcher(i)));

  if (userId && (await isNeonConnected())) {
    const db = await readDb(userId);
    await writeDb(userId, db.filter((i) => !matcher(i)));
  }
}

export async function clearCart(userId: string | null | undefined) {
  localStorage.removeItem("nabome-cart");
  if (userId && (await isNeonConnected())) {
    await neon.delete(TABLE, { user_id: userId });
  }
}

export async function mergeCart(userId: string, localItems: CartItem[]) {
  if (!(await isNeonConnected())) {
    setLocal(localItems);
    return;
  }
  const db = await readDb(userId);
  for (const local of localItems) {
    const idx = db.findIndex(
      (i) => i.id === local.id && (local.variantId ? i.variantId === local.variantId : i.selectedSize === local.selectedSize && i.selectedColor === local.selectedColor)
    );
    if (idx >= 0) {
      db[idx].quantity = Math.max(db[idx].quantity, local.quantity);
    } else {
      db.push(local);
    }
  }
  await writeDb(userId, db);
  setLocal(db);
}
