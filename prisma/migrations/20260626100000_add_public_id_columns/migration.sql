-- Add public_id columns for Cloudinary asset tracking
ALTER TABLE "categories" ADD COLUMN "image_public_id" VARCHAR(500);
ALTER TABLE "subcategories" ADD COLUMN "image_public_id" VARCHAR(500);
ALTER TABLE "collections" ADD COLUMN "hero_image_public_id" VARCHAR(500);
ALTER TABLE "brands" ADD COLUMN "logo_public_id" VARCHAR(500);
ALTER TABLE "size_guides" ADD COLUMN "image_public_id" VARCHAR(500);
ALTER TABLE "site_settings" ADD COLUMN "logo_public_id" VARCHAR(500);
ALTER TABLE "site_settings" ADD COLUMN "favicon_public_id" VARCHAR(500);
ALTER TABLE "site_settings" ADD COLUMN "og_image_public_id" VARCHAR(500);
ALTER TABLE "brand_story" ADD COLUMN "hero_image_public_id" VARCHAR(500);
ALTER TABLE "lookbooks" ADD COLUMN "cover_image_public_id" VARCHAR(500);
ALTER TABLE "lookbook_items" ADD COLUMN "image_public_id" VARCHAR(500);
ALTER TABLE "products" ADD COLUMN "size_chart_public_id" VARCHAR(500);
ALTER TABLE "page_templates" ADD COLUMN "thumbnail_public_id" VARCHAR(500);
ALTER TABLE "brand_story" ADD COLUMN "video_url" TEXT;
ALTER TABLE "brand_story" ADD COLUMN "video_public_id" VARCHAR(500);
