import { neon, isNeonConnected } from "../neon";

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  linkText?: string;
  position: "hero" | "promo" | "sidebar";
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

function mapRow(row: Record<string, unknown>): Banner {
  return {
    id: row.id as string,
    title: row.title as string,
    subtitle: (row.subtitle as string) || undefined,
    description: (row.description as string) || undefined,
    imageUrl: row.image_url as string,
    linkUrl: (row.link_url as string) || undefined,
    linkText: (row.link_text as string) || undefined,
    position: row.position as Banner["position"],
    sortOrder: Number(row.sort_order || 0),
    isActive: row.is_active !== false,
    createdAt: row.created_at as string,
  };
}

export async function getBanners(position?: string): Promise<Banner[]> {
  if (!(await isNeonConnected())) return [];
  const filter: Record<string, unknown> = { is_active: true };
  if (position) filter.position = position;
  const { data } = await neon.select("banners", filter, { order: "sort_order", ascending: true });
  return ((data as Record<string, unknown>[]) || []).map(mapRow);
}

export async function createBanner(banner: Omit<Banner, "id" | "createdAt">): Promise<void> {
  if (!(await isNeonConnected())) return;
  await neon.insert("banners", {
    title: banner.title,
    subtitle: banner.subtitle || null,
    description: banner.description || null,
    image_url: banner.imageUrl,
    link_url: banner.linkUrl || null,
    link_text: banner.linkText || null,
    position: banner.position,
    sort_order: banner.sortOrder,
    is_active: banner.isActive,
  });
}

export async function updateBanner(id: string, updates: Partial<Banner>): Promise<void> {
  if (!(await isNeonConnected())) return;
  const db: Record<string, unknown> = {};
  if (updates.title !== undefined) db.title = updates.title;
  if (updates.subtitle !== undefined) db.subtitle = updates.subtitle;
  if (updates.description !== undefined) db.description = updates.description;
  if (updates.imageUrl !== undefined) db.image_url = updates.imageUrl;
  if (updates.linkUrl !== undefined) db.link_url = updates.linkUrl;
  if (updates.linkText !== undefined) db.link_text = updates.linkText;
  if (updates.position !== undefined) db.position = updates.position;
  if (updates.sortOrder !== undefined) db.sort_order = updates.sortOrder;
  if (updates.isActive !== undefined) db.is_active = updates.isActive;
  await neon.update("banners", db, { id });
}

export async function deleteBanner(id: string): Promise<void> {
  if (!(await isNeonConnected())) return;
  await neon.delete("banners", { id });
}
