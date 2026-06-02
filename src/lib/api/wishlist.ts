import { neon, isNeonConnected } from "../neon";
import type { WishlistItem } from "../../context/WishlistContext";

const TABLE = "user_wishlist";

function getLocal(): WishlistItem[] {
  try {
    return JSON.parse(localStorage.getItem("nabome-wishlist") || "[]");
  } catch {
    return [];
  }
}

function setLocal(items: WishlistItem[]) {
  localStorage.setItem("nabome-wishlist", JSON.stringify(items));
}

async function readDb(userId: string): Promise<WishlistItem[]> {
  const { data } = await neon.select(TABLE, { user_id: userId }, { single: true });
  if (data && typeof (data as Record<string, unknown>).items === "string") {
    try { return JSON.parse((data as Record<string, unknown>).items as string); } catch { return []; }
  }
  return ((data as Record<string, unknown>)?.items as WishlistItem[]) || [];
}

async function writeDb(userId: string, items: WishlistItem[]) {
  const { data: existing } = await neon.select(TABLE, { user_id: userId }, { single: true });
  if (existing) {
    await neon.update(TABLE, { items: JSON.stringify(items), updated_at: new Date().toISOString() }, { user_id: userId });
  } else {
    await neon.insert(TABLE, { user_id: userId, items: JSON.stringify(items) });
  }
}

export async function getWishlist(userId?: string | null): Promise<WishlistItem[]> {
  if (!userId || !(await isNeonConnected())) return getLocal();
  return readDb(userId);
}

export async function addToWishlist(userId: string | null | undefined, item: WishlistItem) {
  const local = getLocal();
  if (!local.find((i) => i.id === item.id)) {
    local.push(item);
    setLocal(local);
  }

  if (userId && (await isNeonConnected())) {
    const db = await readDb(userId);
    if (!db.find((i) => i.id === item.id)) {
      db.push(item);
      await writeDb(userId, db);
    }
  }
}

export async function removeFromWishlist(userId: string | null | undefined, productId: number) {
  setLocal(getLocal().filter((i) => i.id !== productId));

  if (userId && (await isNeonConnected())) {
    const db = await readDb(userId);
    await writeDb(userId, db.filter((i) => i.id !== productId));
  }
}

export async function isInWishlist(userId: string | null | undefined, productId: number): Promise<boolean> {
  if (userId && (await isNeonConnected())) {
    const db = await readDb(userId);
    return !!db.find((i) => i.id === productId);
  }
  return !!getLocal().find((i) => i.id === productId);
}

export async function mergeWishlist(userId: string, localItems: WishlistItem[]) {
  if (!(await isNeonConnected())) {
    setLocal(localItems);
    return;
  }
  const db = await readDb(userId);
  for (const local of localItems) {
    if (!db.find((i) => i.id === local.id)) {
      db.push(local);
    }
  }
  await writeDb(userId, db);
  setLocal(db);
}
