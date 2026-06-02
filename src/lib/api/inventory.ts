import { neon, isNeonConnected } from "../neon";

export interface InventoryItem {
  productId: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  status: "active" | "draft" | "archived";
  imageUrl?: string;
}

export async function getVendorInventory(vendorId: string): Promise<InventoryItem[]> {
  if (!(await isNeonConnected())) return [];
  const { data } = await neon.select("products", { vendor_id: vendorId }, { order: "created_at", ascending: false });
  return ((data as Record<string, unknown>[]) || []).map((r) => ({
    productId: r.id as string,
    name: r.name as string,
    sku: r.sku as string || "",
    stock: Number(r.stock || 0),
    price: Number(r.price || 0),
    status: (r.status || "draft") as InventoryItem["status"],
    imageUrl: (r.images as string[])?.[0] || undefined,
  }));
}

export async function updateStock(productId: string, stock: number): Promise<void> {
  if (!(await isNeonConnected())) return;
  await neon.update("products", { stock }, { id: productId });
}

export async function bulkUpdateStock(updates: { productId: string; stock: number }[]): Promise<void> {
  if (!(await isNeonConnected())) return;
  for (const u of updates) {
    await neon.update("products", { stock: u.stock }, { id: u.productId });
  }
}
