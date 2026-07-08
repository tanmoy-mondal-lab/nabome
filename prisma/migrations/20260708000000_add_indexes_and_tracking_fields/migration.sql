-- Add tracking fields to orders table
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tracking_number" VARCHAR(200);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "carrier" VARCHAR(100);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tracking_url" TEXT;

-- Add missing composite indexes on orders
CREATE INDEX IF NOT EXISTS "orders_profile_id_status_created_at_idx" ON "orders" ("profile_id", "status", "created_at");

-- Add productId+isActive index on product_variants
CREATE INDEX IF NOT EXISTS "product_variants_product_id_is_active_idx" ON "product_variants" ("product_id", "is_active");

-- Add orderId+isReturned index on order_items
CREATE INDEX IF NOT EXISTS "order_items_order_id_is_returned_idx" ON "order_items" ("order_id", "is_returned");

-- Ensure analytics_events uses UUID (column already is UUID in schema, but needs migration if was BIGSERIAL)
-- This is a no-op if the column is already UUID; if it was BIGSERIAL in a prior migration,
-- uncomment and run manually:
-- ALTER TABLE analytics_events ALTER COLUMN id TYPE UUID USING gen_random_uuid();
