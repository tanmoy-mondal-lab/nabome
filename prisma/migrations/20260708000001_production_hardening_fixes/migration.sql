-- Add expiration to carts
ALTER TABLE "carts" ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS "carts_expires_at_idx" ON "carts" ("expires_at");

-- Add indexes on razorpay_order_id and razorpay_payment_id for faster webhook lookups
CREATE INDEX IF NOT EXISTS "orders_razorpay_order_id_idx" ON "orders" ("razorpay_order_id");
CREATE INDEX IF NOT EXISTS "orders_razorpay_payment_id_idx" ON "orders" ("razorpay_payment_id");

-- Add unique constraint on coupon_redemptions to prevent race conditions
-- First, clean up any duplicate redemptions (keep one per coupon+profile+order)
DELETE FROM "coupon_redemptions" a
WHERE a.id <> (
  SELECT b.id FROM "coupon_redemptions" b
  WHERE b.coupon_id = a.coupon_id
    AND b.profile_id = a.profile_id
    AND b.order_id = a.order_id
  ORDER BY b.created_at ASC
  LIMIT 1
);

-- Remove existing order_id unique constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'coupon_redemptions_order_id_key'
  ) THEN
    ALTER TABLE "coupon_redemptions" DROP CONSTRAINT "coupon_redemptions_order_id_key";
  END IF;
END $$;

-- Create composite unique index
CREATE UNIQUE INDEX IF NOT EXISTS "coupon_redemptions_coupon_id_profile_id_order_id_key"
  ON "coupon_redemptions" ("coupon_id", "profile_id", "order_id");
