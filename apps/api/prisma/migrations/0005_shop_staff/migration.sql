-- CreateEnum
CREATE TYPE "ShopMemberRole" AS ENUM ('manager', 'staff');
CREATE TYPE "ShopMemberStatus" AS ENUM ('invited', 'active', 'suspended', 'removed');
CREATE TYPE "ShopInviteStatus" AS ENUM ('pending', 'accepted', 'expired', 'revoked');
-- CreateTable
CREATE TABLE "shop_members" (
    "id" UUID NOT NULL,
    "shopId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "ShopMemberRole" NOT NULL DEFAULT 'staff',
    "status" "ShopMemberStatus" NOT NULL DEFAULT 'active',
    "invitedBy" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "shop_members_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "shop_invites" (
    "id" UUID NOT NULL,
    "shopId" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "role" "ShopMemberRole" NOT NULL DEFAULT 'staff',
    "tokenHash" VARCHAR(64) NOT NULL,
    "status" "ShopInviteStatus" NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "invitedBy" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "shop_invites_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "shop_members_shopId_userId_key" ON "shop_members"("shopId", "userId");
CREATE INDEX "shop_members_shopId_status_idx" ON "shop_members"("shopId", "status");
CREATE INDEX "shop_members_userId_idx" ON "shop_members"("userId");
CREATE UNIQUE INDEX "shop_invites_tokenHash_key" ON "shop_invites"("tokenHash");
CREATE INDEX "shop_invites_shopId_status_idx" ON "shop_invites"("shopId", "status");
CREATE INDEX "shop_invites_tokenHash_idx" ON "shop_invites"("tokenHash");
CREATE INDEX "shop_invites_expiresAt_idx" ON "shop_invites"("expiresAt");
-- AddForeignKey
ALTER TABLE "shop_members" ADD CONSTRAINT "shop_members_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shop_members" ADD CONSTRAINT "shop_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shop_invites" ADD CONSTRAINT "shop_invites_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
