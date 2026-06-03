import { neon, isNeonConnected } from "../lib/neon";
import { products as fallbackProducts } from "../data/products";

export type ProductFilters = {
  category?: string;
  vendorId?: string;
  status?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
};

export async function getProducts(filters?: ProductFilters) {
  if (!await isNeonConnected()) return fallbackProducts;

  let conditions = [];
  const params: unknown[] = [];
  let idx = 1;

  if (filters?.category) {
    conditions.push(`c.slug = $${idx++}`);
    params.push(filters.category);
  }
  if (filters?.vendorId) {
    conditions.push(`p.vendor_id = $${idx++}`);
    params.push(filters.vendorId);
  }
  if (filters?.status) {
    conditions.push(`p.status = $${idx++}`);
    params.push(filters.status);
  } else {
    conditions.push(`p.status = 'published'`);
  }
  if (filters?.search) {
    conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx})`);
    params.push(`%${filters.search}%`);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { data } = await neon.raw(`
    SELECT
      p.id, p.name, p.slug, p.description, p.gender, p.material,
      p.tags, p.status, p.average_rating, p.reviews_count,
      p.sold_count, p.is_new, p.is_bestseller, p.is_featured, p.is_limited,
      p.created_at, p.updated_at,
      c.name as category_name, c.slug as category_slug,
      v.shop_name as vendor_name, v.shop_slug as vendor_slug,
      COALESCE(
        (SELECT json_agg(jsonb_build_object('url', pi.url, 'is_primary', pi.is_primary)
         ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.id),
        '[]'::json
      ) as images,
      COALESCE((SELECT MIN(v.price) FROM product_variants v WHERE v.product_id = p.id), 0) as min_price,
      COALESCE((SELECT MAX(v.price) FROM product_variants v WHERE v.product_id = p.id), 0) as max_price,
      COALESCE((SELECT SUM(v.stock) FROM product_variants v WHERE v.product_id = p.id), 0) as total_stock,
      COALESCE(
        (SELECT json_agg(jsonb_build_object(
          'id', v.id, 'size', v.size, 'color', v.color,
          'price', v.price, 'original_price', v.original_price,
          'stock', v.stock, 'in_stock', v.in_stock
        )) FROM product_variants v WHERE v.product_id = p.id),
        '[]'::json
      ) as variants
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN vendors v ON v.id = p.vendor_id
    ${where}
    ORDER BY p.created_at DESC
  `, params);

  return data || [];
}

export async function getProductById(id: string) {
  if (!await isNeonConnected()) {
    return fallbackProducts.find((p) => p.id === Number(id)) || null;
  }

  const { data } = await neon.raw(`
    SELECT
      p.*, c.name as category_name, c.slug as category_slug,
      v.shop_name as vendor_name, v.shop_slug as vendor_slug,
      v.shop_logo as vendor_logo,
      COALESCE(
        (SELECT json_agg(jsonb_build_object('id', pi.id, 'url', pi.url, 'alt', pi.alt,
          'is_primary', pi.is_primary, 'sort_order', pi.sort_order)
         ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.id),
        '[]'::json
      ) as images,
      COALESCE(
        (SELECT json_agg(jsonb_build_object(
          'id', v.id, 'sku', v.sku, 'size', v.size, 'color', v.color,
          'price', v.price, 'original_price', v.original_price,
          'stock', v.stock, 'in_stock', v.in_stock, 'is_primary', v.is_primary
        )) FROM product_variants v WHERE v.product_id = p.id),
        '[]'::json
      ) as variants
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN vendors v ON v.id = p.vendor_id
    WHERE p.id = $1
  `, [id]);

  return data?.[0] || null;
}

export async function getProductsByVendor(vendorId: string) {
  return getProducts({ vendorId, status: undefined });
}

export async function searchProducts(query: string) {
  return getProducts({ search: query });
}
