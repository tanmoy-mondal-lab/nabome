-- Migration: Remove unwanted features (Loyalty, Referrals, Gift Cards, Subscriptions)
-- This migration removes all tables and relations related to unwanted features

-- Drop loyalty tables
DROP TABLE IF EXISTS "loyalty_transactions" CASCADE;
DROP TABLE IF EXISTS "loyalty_tiers" CASCADE;
DROP TABLE IF EXISTS "loyalty_points" CASCADE;

-- Drop referral tables
DROP TABLE IF EXISTS "referrals" CASCADE;
DROP TABLE IF EXISTS "referral_codes" CASCADE;

-- Drop gift cards table
DROP TABLE IF EXISTS "gift_cards" CASCADE;

-- Drop subscription tables
DROP TABLE IF EXISTS "subscription_invoices" CASCADE;
DROP TABLE IF EXISTS "subscriptions" CASCADE;
DROP TABLE IF EXISTS "subscription_plans" CASCADE;

-- Remove relations from profiles table
-- These are handled automatically by CASCADE drops above, but we'll ensure columns are removed
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "loyalty_points_id";
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "referral_code_id";

-- Remove relations from orders table
ALTER TABLE "orders" DROP COLUMN IF EXISTS "referral_code_id";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "gift_card_id";
