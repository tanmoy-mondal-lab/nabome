import { neon, isNeonConnected } from "../neon";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  product_count: number;
  is_active: boolean;
  subcategories: SubcategoryRow[];
};

export type SubcategoryRow = {
  id: string;
  name: string;
  slug: string;
  product_count: number;
};

function slugify(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100) || "category";
}

export async function getAdminCategories(): Promise<CategoryRow[]> {
  if (!await isNeonConnected()) return [];

  const { data: catData } = await neon.raw(`
    SELECT
      c.id, c.name, c.slug, c.description, c.image_url as image, c.is_active,
      COALESCE((SELECT COUNT(*) FROM products p WHERE p.category_id = c.id), 0) as product_count
    FROM categories c
    ORDER BY c.sort_order, c.name
  `);

  const cats = (catData || []) as any[];

  const { data: subData } = await neon.raw(`
    SELECT
      s.id, s.category_id, s.name, s.slug,
      COALESCE((SELECT COUNT(*) FROM products p WHERE p.subcategory_id = s.id), 0) as product_count
    FROM subcategories s
    ORDER BY s.sort_order, s.name
  `);

  const subs = (subData || []) as any[];
  const subMap = new Map<string, SubcategoryRow[]>();
  for (const s of subs) {
    const key = s.category_id as string;
    if (!subMap.has(key)) subMap.set(key, []);
    subMap.get(key)!.push({
      id: s.id as string,
      name: s.name as string,
      slug: s.slug as string,
      product_count: Number(s.product_count) || 0,
    });
  }

  return cats.map((c: any) => ({
    id: c.id as string,
    name: c.name as string,
    slug: c.slug as string,
    description: c.description as string || "",
    image: c.image as string || "",
    product_count: Number(c.product_count) || 0,
    is_active: c.is_active as boolean ?? true,
    subcategories: subMap.get(c.id as string) || [],
  }));
}

export async function createCategory(name: string, description?: string): Promise<string> {
  if (!await isNeonConnected()) throw new Error("Database not connected");
  const slug = slugify(name);
  const { data, error } = await neon.insert("categories", { name, slug, description: description || null });
  if (error) throw error;
  return (data?.[0] as any)?.id as string;
}

export async function updateCategory(id: string, name: string, description?: string): Promise<void> {
  if (!await isNeonConnected()) throw new Error("Database not connected");
  const updates: Record<string, unknown> = { name, slug: slugify(name) };
  if (description !== undefined) updates.description = description;
  const { error } = await neon.update("categories", updates, { id });
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  if (!await isNeonConnected()) throw new Error("Database not connected");
  const { error } = await neon.delete("categories", { id });
  if (error) throw error;
}

export async function createSubcategory(categoryId: string, name: string): Promise<string> {
  if (!await isNeonConnected()) throw new Error("Database not connected");
  const slug = `${slugify(name)}-${Date.now().toString(36)}`;
  const { data, error } = await neon.insert("subcategories", { category_id: categoryId, name, slug });
  if (error) throw error;
  return (data?.[0] as any)?.id as string;
}

export async function deleteSubcategory(id: string): Promise<void> {
  if (!await isNeonConnected()) throw new Error("Database not connected");
  const { error } = await neon.delete("subcategories", { id });
  if (error) throw error;
}
