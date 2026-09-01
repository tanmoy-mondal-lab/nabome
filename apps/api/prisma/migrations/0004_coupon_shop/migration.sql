-- AlterTable: add shopId to coupons for shop isolation (V1.5 coupon wiring)
ALTER TABLE "coupons" ADD COLUMN "shopId" UUID;
CREATE INDEX "coupons_shopId_idx" ON "coupons"("shopId");
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;
