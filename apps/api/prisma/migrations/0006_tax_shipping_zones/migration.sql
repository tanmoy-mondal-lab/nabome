-- CreateTable TaxZone
CREATE TABLE "tax_zones" (
    "id" UUID NOT NULL,
    "shopId" UUID,
    "name" VARCHAR(120) NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL,
    "stateCode" VARCHAR(10),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "tax_zones_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "tax_zones_shopId_isActive_idx" ON "tax_zones"("shopId", "isActive");
CREATE INDEX "tax_zones_countryCode_stateCode_idx" ON "tax_zones"("countryCode", "stateCode");
-- Alter TaxRule add zone
ALTER TABLE "tax_rules" ADD COLUMN "taxZoneId" UUID;
ALTER TABLE "tax_rules" ADD COLUMN "priority" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "tax_rules" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
CREATE INDEX "tax_rules_taxZoneId_idx" ON "tax_rules"("taxZoneId");
ALTER TABLE "tax_rules" ADD CONSTRAINT "tax_rules_taxZoneId_fkey" FOREIGN KEY ("taxZoneId") REFERENCES "tax_zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- CreateTable ShippingZone
CREATE TABLE "shipping_zones" (
    "id" UUID NOT NULL,
    "shopId" UUID,
    "name" VARCHAR(120) NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL,
    "stateCode" VARCHAR(10),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "shipping_zones_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "shipping_zones_shopId_isActive_idx" ON "shipping_zones"("shopId", "isActive");
CREATE INDEX "shipping_zones_countryCode_stateCode_idx" ON "shipping_zones"("countryCode", "stateCode");
-- Alter ShippingRate add zone
ALTER TABLE "shipping_rates" ADD COLUMN "shippingZoneId" UUID;
ALTER TABLE "shipping_rates" ADD COLUMN "priority" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX "shipping_rates_shippingZoneId_idx" ON "shipping_rates"("shippingZoneId");
ALTER TABLE "shipping_rates" ADD CONSTRAINT "shipping_rates_shippingZoneId_fkey" FOREIGN KEY ("shippingZoneId") REFERENCES "shipping_zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- Add FK for Shop relations (already via shopId)
ALTER TABLE "tax_zones" ADD CONSTRAINT "tax_zones_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shipping_zones" ADD CONSTRAINT "shipping_zones_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
