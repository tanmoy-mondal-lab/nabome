-- Add GIN indexes for pg_trgm fuzzy search performance
-- These indexes significantly improve search performance on text fields

-- Enable pg_trgm extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Products table GIN indexes for search
CREATE INDEX IF NOT EXISTS products_name_trgm_idx ON products USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS products_short_description_trgm_idx ON products USING GIN (short_description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS products_description_trgm_idx ON products USING GIN (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS products_material_trgm_idx ON products USING GIN (material gin_trgm_ops);

-- Categories table GIN indexes
CREATE INDEX IF NOT EXISTS categories_name_trgm_idx ON categories USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS categories_description_trgm_idx ON categories USING GIN (description gin_trgm_ops);

-- Collections table GIN indexes
CREATE INDEX IF NOT EXISTS collections_name_trgm_idx ON collections USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS collections_description_trgm_idx ON collections USING GIN (description gin_trgm_ops);

-- Brands table GIN indexes
CREATE INDEX IF NOT EXISTS brands_name_trgm_idx ON brands USING GIN (name gin_trgm_ops);

-- Static pages GIN indexes
CREATE INDEX IF NOT EXISTS static_pages_title_trgm_idx ON static_pages USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS static_pages_meta_desc_trgm_idx ON static_pages USING GIN (meta_desc gin_trgm_ops);

-- Product SKUs for variant search
CREATE INDEX IF NOT EXISTS product_variants_sku_trgm_idx ON product_variants USING GIN (sku gin_trgm_ops);

-- Product tags for tag search
CREATE INDEX IF NOT EXISTS product_tags_name_trgm_idx ON product_tags USING GIN (name gin_trgm_ops);
