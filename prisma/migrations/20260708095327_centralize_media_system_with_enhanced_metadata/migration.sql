/*
  Warnings:

  - The primary key for the `analytics_events` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `type` on the `media_assets` table. All the data in the column will be lost.
  - You are about to alter the column `url` on the `media_assets` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(1000)`.
  - You are about to drop the `shipping_rates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shipping_zones` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[asset_id]` on the table `media_assets` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,location]` on the table `navigation_menus` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[product_id,size,color]` on the table `product_variants` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `id` on the `analytics_events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `asset_id` to the `media_assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entity_id` to the `media_assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entity_type` to the `media_assets` table without a default value. This is not possible if the table is not empty.
  - Made the column `role` on table `profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('image', 'video', 'document');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('image', 'video', 'raw');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('settings', 'homepage', 'products', 'categories', 'collections', 'brands', 'labels', 'lookbooks', 'blogs', 'cms', 'sellers', 'users', 'temp');

-- AlterEnum
ALTER TYPE "CampaignType" ADD VALUE 'flash_sale';

-- AlterEnum
ALTER TYPE "SectionType" ADD VALUE 'video_banner';

-- DropForeignKey
ALTER TABLE "coupon_redemptions" DROP CONSTRAINT "coupon_redemptions_coupon_id_fkey";

-- DropForeignKey
ALTER TABLE "coupon_redemptions" DROP CONSTRAINT "coupon_redemptions_order_id_fkey";

-- DropForeignKey
ALTER TABLE "coupon_redemptions" DROP CONSTRAINT "coupon_redemptions_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "return_requests" DROP CONSTRAINT "return_requests_order_id_fkey";

-- DropForeignKey
ALTER TABLE "return_requests" DROP CONSTRAINT "return_requests_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_product_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "shipping_rates" DROP CONSTRAINT "shipping_rates_zone_id_fkey";

-- DropIndex
DROP INDEX "auth_sessions_access_token_idx";

-- DropIndex
DROP INDEX "auth_sessions_refresh_token_idx";

-- DropIndex
DROP INDEX "brands_slug_idx";

-- DropIndex
DROP INDEX "cart_items_cart_id_idx";

-- DropIndex
DROP INDEX "categories_slug_idx";

-- DropIndex
DROP INDEX "collections_slug_idx";

-- DropIndex
DROP INDEX "coupons_code_idx";

-- DropIndex
DROP INDEX "lookbooks_slug_idx";

-- DropIndex
DROP INDEX "media_assets_type_idx";

-- DropIndex
DROP INDEX "orders_order_number_idx";

-- DropIndex
DROP INDEX "orders_payment_status_idx";

-- DropIndex
DROP INDEX "orders_status_idx";

-- DropIndex
DROP INDEX "page_templates_slug_idx";

-- DropIndex
DROP INDEX "product_labels_slug_idx";

-- DropIndex
DROP INDEX "product_tags_slug_idx";

-- DropIndex
DROP INDEX "product_variants_is_active_idx";

-- DropIndex
DROP INDEX "product_variants_sku_idx";

-- DropIndex
DROP INDEX "products_base_price_idx";

-- DropIndex
DROP INDEX "products_gender_idx";

-- DropIndex
DROP INDEX "products_slug_idx";

-- DropIndex
DROP INDEX "profiles_email_idx";

-- DropIndex
DROP INDEX "size_guides_slug_idx";

-- DropIndex
DROP INDEX "static_pages_slug_idx";

-- DropIndex
DROP INDEX "subcategories_slug_idx";

-- DropIndex
DROP INDEX "wishlist_items_profile_id_idx";

-- AlterTable
ALTER TABLE "addresses" ADD COLUMN     "district" VARCHAR(200);

-- AlterTable
ALTER TABLE "analytics_events" DROP CONSTRAINT "analytics_events_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "homepage_sections" ADD COLUMN     "expire_at" TIMESTAMPTZ(6),
ADD COLUMN     "publish_at" TIMESTAMPTZ(6),
ADD COLUMN     "styles" JSONB;

-- AlterTable
ALTER TABLE "media_assets" DROP COLUMN "type",
ADD COLUMN     "asset_id" VARCHAR(100) NOT NULL,
ADD COLUMN     "caption" VARCHAR(1000),
ADD COLUMN     "display_name" VARCHAR(255),
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "entity_id" UUID NOT NULL,
ADD COLUMN     "entity_type" "EntityType" NOT NULL,
ADD COLUMN     "file_extension" VARCHAR(20),
ADD COLUMN     "is_primary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "media_type" "MediaType" NOT NULL DEFAULT 'image',
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "original_filename" VARCHAR(255),
ADD COLUMN     "public_id" VARCHAR(500),
ADD COLUMN     "resource_type" "ResourceType" NOT NULL DEFAULT 'image',
ADD COLUMN     "secure_url" VARCHAR(1000),
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "url" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "folder" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "product_images" ADD COLUMN     "public_id" VARCHAR(500);

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "video_public_id" VARCHAR(500),
ADD COLUMN     "video_url" TEXT;

-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "role" SET NOT NULL;

-- AlterTable
ALTER TABLE "refunds" ALTER COLUMN "return_request_id" DROP NOT NULL;

-- DropTable
DROP TABLE "shipping_rates";

-- DropTable
DROP TABLE "shipping_zones";

-- CreateTable
CREATE TABLE "verification_attempts" (
    "id" UUID NOT NULL,
    "profile_id" UUID,
    "email" VARCHAR(255) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "ip_address" VARCHAR(45) NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "locked_until" TIMESTAMPTZ(6),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "expires_at" TIMESTAMPTZ(6),
    "is_deprecated" BOOLEAN NOT NULL DEFAULT false,
    "deprecated_at" TIMESTAMPTZ(6),
    "last_used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_points" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "tier" VARCHAR(50) NOT NULL DEFAULT 'bronze',
    "lifetime_points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_transactions" (
    "id" UUID NOT NULL,
    "loyalty_points_id" UUID NOT NULL,
    "points" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "description" VARCHAR(500),
    "reference_id" VARCHAR(100),
    "reference_type" VARCHAR(50),
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_tiers" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "min_points" INTEGER NOT NULL DEFAULT 0,
    "discount_percent" INTEGER NOT NULL DEFAULT 0,
    "free_shipping" BOOLEAN NOT NULL DEFAULT false,
    "points_multiplier" DECIMAL(3,1) NOT NULL DEFAULT 1,
    "badge_color" VARCHAR(7),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_codes" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "total_referrals" INTEGER NOT NULL DEFAULT 0,
    "total_rewards" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" UUID NOT NULL,
    "referrer_code_id" UUID NOT NULL,
    "referred_email" VARCHAR(255) NOT NULL,
    "referred_profile_id" UUID,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "reward_amount" DECIMAL(10,2),
    "reward_given_at" TIMESTAMPTZ(6),
    "order_id" UUID,
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_cards" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "initial_balance" DECIMAL(10,2) NOT NULL,
    "current_balance" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "sender_name" VARCHAR(200),
    "sender_email" VARCHAR(255),
    "recipient_name" VARCHAR(200),
    "recipient_email" VARCHAR(255),
    "message" TEXT,
    "purchased_by_id" UUID,
    "redeemed_by_id" UUID,
    "order_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMPTZ(6),
    "redeemed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "interval" VARCHAR(50) NOT NULL DEFAULT 'monthly',
    "trial_period_days" INTEGER NOT NULL DEFAULT 0,
    "features" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "current_period_start" TIMESTAMPTZ(6),
    "current_period_end" TIMESTAMPTZ(6),
    "trial_ends_at" TIMESTAMPTZ(6),
    "cancelled_at" TIMESTAMPTZ(6),
    "razorpay_subscription_id" VARCHAR(100),
    "razorpay_plan_id" VARCHAR(100),
    "payment_method" VARCHAR(50),
    "next_billing_at" TIMESTAMPTZ(6),
    "last_payment_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_invoices" (
    "id" UUID NOT NULL,
    "subscription_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "razorpay_invoice_id" VARCHAR(100),
    "razorpay_payment_id" VARCHAR(100),
    "period_start" TIMESTAMPTZ(6),
    "period_end" TIMESTAMPTZ(6),
    "paid_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currencies" (
    "code" VARCHAR(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "exchange_rate" DECIMAL(12,6) NOT NULL DEFAULT 1,
    "is_base" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "decimal_places" INTEGER NOT NULL DEFAULT 2,
    "formatting_locale" VARCHAR(10) NOT NULL DEFAULT 'en-IN',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE INDEX "verification_attempts_email_code_idx" ON "verification_attempts"("email", "code");

-- CreateIndex
CREATE INDEX "verification_attempts_ip_address_created_at_idx" ON "verification_attempts"("ip_address", "created_at");

-- CreateIndex
CREATE INDEX "verification_attempts_profile_id_idx" ON "verification_attempts"("profile_id");

-- CreateIndex
CREATE INDEX "api_keys_is_deprecated_idx" ON "api_keys"("is_deprecated");

-- CreateIndex
CREATE INDEX "api_keys_expires_at_idx" ON "api_keys"("expires_at");

-- CreateIndex
CREATE INDEX "api_keys_created_at_idx" ON "api_keys"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_points_profile_id_key" ON "loyalty_points"("profile_id");

-- CreateIndex
CREATE INDEX "loyalty_points_tier_idx" ON "loyalty_points"("tier");

-- CreateIndex
CREATE INDEX "loyalty_transactions_loyalty_points_id_idx" ON "loyalty_transactions"("loyalty_points_id");

-- CreateIndex
CREATE INDEX "loyalty_transactions_type_idx" ON "loyalty_transactions"("type");

-- CreateIndex
CREATE INDEX "loyalty_transactions_created_at_idx" ON "loyalty_transactions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_tiers_name_key" ON "loyalty_tiers"("name");

-- CreateIndex
CREATE INDEX "loyalty_tiers_is_active_idx" ON "loyalty_tiers"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_profile_id_key" ON "referral_codes"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_code_key" ON "referral_codes"("code");

-- CreateIndex
CREATE INDEX "referral_codes_code_idx" ON "referral_codes"("code");

-- CreateIndex
CREATE INDEX "referrals_referrer_code_id_idx" ON "referrals"("referrer_code_id");

-- CreateIndex
CREATE INDEX "referrals_referred_email_idx" ON "referrals"("referred_email");

-- CreateIndex
CREATE INDEX "referrals_status_idx" ON "referrals"("status");

-- CreateIndex
CREATE INDEX "referrals_created_at_idx" ON "referrals"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "gift_cards_code_key" ON "gift_cards"("code");

-- CreateIndex
CREATE INDEX "gift_cards_code_idx" ON "gift_cards"("code");

-- CreateIndex
CREATE INDEX "gift_cards_is_active_idx" ON "gift_cards"("is_active");

-- CreateIndex
CREATE INDEX "gift_cards_expires_at_idx" ON "gift_cards"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_slug_key" ON "subscription_plans"("slug");

-- CreateIndex
CREATE INDEX "subscription_plans_is_active_idx" ON "subscription_plans"("is_active");

-- CreateIndex
CREATE INDEX "subscription_plans_slug_idx" ON "subscription_plans"("slug");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_next_billing_at_idx" ON "subscriptions"("next_billing_at");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_profile_id_plan_id_key" ON "subscriptions"("profile_id", "plan_id");

-- CreateIndex
CREATE INDEX "subscription_invoices_subscription_id_idx" ON "subscription_invoices"("subscription_id");

-- CreateIndex
CREATE INDEX "subscription_invoices_status_idx" ON "subscription_invoices"("status");

-- CreateIndex
CREATE INDEX "currencies_is_active_idx" ON "currencies"("is_active");

-- CreateIndex
CREATE INDEX "auth_sessions_rotated_from_session_id_idx" ON "auth_sessions"("rotated_from_session_id");

-- CreateIndex
CREATE INDEX "coupon_redemptions_coupon_id_profile_id_idx" ON "coupon_redemptions"("coupon_id", "profile_id");

-- CreateIndex
CREATE INDEX "homepage_sections_publish_at_expire_at_idx" ON "homepage_sections"("publish_at", "expire_at");

-- CreateIndex
CREATE INDEX "lookbook_items_product_id_idx" ON "lookbook_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_asset_id_key" ON "media_assets"("asset_id");

-- CreateIndex
CREATE INDEX "media_assets_entity_type_entity_id_idx" ON "media_assets"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "media_assets_entity_type_folder_idx" ON "media_assets"("entity_type", "folder");

-- CreateIndex
CREATE INDEX "media_assets_asset_id_idx" ON "media_assets"("asset_id");

-- CreateIndex
CREATE INDEX "media_assets_media_type_idx" ON "media_assets"("media_type");

-- CreateIndex
CREATE INDEX "media_assets_resource_type_idx" ON "media_assets"("resource_type");

-- CreateIndex
CREATE INDEX "media_assets_is_primary_idx" ON "media_assets"("is_primary");

-- CreateIndex
CREATE INDEX "media_assets_entity_type_entity_id_is_primary_idx" ON "media_assets"("entity_type", "entity_id", "is_primary");

-- CreateIndex
CREATE UNIQUE INDEX "navigation_menus_name_location_key" ON "navigation_menus"("name", "location");

-- CreateIndex
CREATE INDEX "order_items_variant_id_idx" ON "order_items"("variant_id");

-- CreateIndex
CREATE INDEX "order_items_order_id_product_id_idx" ON "order_items"("order_id", "product_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_variant_id_idx" ON "order_items"("product_id", "variant_id");

-- CreateIndex
CREATE INDEX "order_status_history_created_by_idx" ON "order_status_history"("created_by");

-- CreateIndex
CREATE INDEX "orders_status_created_at_idx" ON "orders"("status", "created_at");

-- CreateIndex
CREATE INDEX "orders_payment_status_created_at_idx" ON "orders"("payment_status", "created_at");

-- CreateIndex
CREATE INDEX "orders_profile_id_status_idx" ON "orders"("profile_id", "status");

-- CreateIndex
CREATE INDEX "orders_shipping_address_id_idx" ON "orders"("shipping_address_id");

-- CreateIndex
CREATE INDEX "orders_billing_address_id_idx" ON "orders"("billing_address_id");

-- CreateIndex
CREATE INDEX "orders_profile_id_created_at_idx" ON "orders"("profile_id", "created_at");

-- CreateIndex
CREATE INDEX "orders_status_payment_status_idx" ON "orders"("status", "payment_status");

-- CreateIndex
CREATE INDEX "product_labels_products_label_id_idx" ON "product_labels_products"("label_id");

-- CreateIndex
CREATE INDEX "product_tags_products_tag_id_idx" ON "product_tags_products"("tag_id");

-- CreateIndex
CREATE INDEX "product_variants_is_active_stock_idx" ON "product_variants"("is_active", "stock");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_product_id_size_color_key" ON "product_variants"("product_id", "size", "color");

-- CreateIndex
CREATE INDEX "products_subcategory_id_idx" ON "products"("subcategory_id");

-- CreateIndex
CREATE INDEX "products_is_active_gender_created_at_idx" ON "products"("is_active", "gender", "created_at");

-- CreateIndex
CREATE INDEX "products_is_active_category_id_sort_order_idx" ON "products"("is_active", "category_id", "sort_order");

-- CreateIndex
CREATE INDEX "products_is_active_brand_id_sort_order_idx" ON "products"("is_active", "brand_id", "sort_order");

-- CreateIndex
CREATE INDEX "products_is_active_collection_id_sort_order_idx" ON "products"("is_active", "collection_id", "sort_order");

-- CreateIndex
CREATE INDEX "products_is_active_collection_id_published_at_idx" ON "products"("is_active", "collection_id", "published_at");

-- CreateIndex
CREATE INDEX "products_is_active_base_price_idx" ON "products"("is_active", "base_price");

-- CreateIndex
CREATE INDEX "products_is_active_category_id_gender_idx" ON "products"("is_active", "category_id", "gender");

-- CreateIndex
CREATE INDEX "products_is_active_base_price_sort_order_idx" ON "products"("is_active", "base_price", "sort_order");

-- CreateIndex
CREATE INDEX "profiles_role_idx" ON "profiles"("role");

-- CreateIndex
CREATE INDEX "profiles_created_at_idx" ON "profiles"("created_at");

-- CreateIndex
CREATE INDEX "refunds_initiated_by_idx" ON "refunds"("initiated_by");

-- CreateIndex
CREATE INDEX "return_requests_status_created_at_idx" ON "return_requests"("status", "created_at");

-- CreateIndex
CREATE INDEX "support_ticket_replies_profile_id_idx" ON "support_ticket_replies"("profile_id");

-- CreateIndex
CREATE INDEX "support_tickets_assigned_to_idx" ON "support_tickets"("assigned_to");

-- CreateIndex
CREATE INDEX "support_tickets_status_priority_idx" ON "support_tickets"("status", "priority");

-- AddForeignKey
ALTER TABLE "verification_attempts" ADD CONSTRAINT "verification_attempts_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_points" ADD CONSTRAINT "loyalty_points_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_loyalty_points_id_fkey" FOREIGN KEY ("loyalty_points_id") REFERENCES "loyalty_points"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_profile_id_fkey" FOREIGN KEY ("referred_profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_code_id_fkey" FOREIGN KEY ("referrer_code_id") REFERENCES "referral_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_purchased_by_id_fkey" FOREIGN KEY ("purchased_by_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_redeemed_by_id_fkey" FOREIGN KEY ("redeemed_by_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
