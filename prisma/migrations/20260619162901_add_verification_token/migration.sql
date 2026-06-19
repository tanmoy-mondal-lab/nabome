-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "verification_token" VARCHAR(255),
ADD COLUMN     "verification_token_expires_at" TIMESTAMPTZ;
