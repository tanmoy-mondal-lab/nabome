-- PreserveHistoricalRecords: Remove unsafe cascade deletes for financial and historical records
-- 
-- This migration changes referential actions from CASCADE to RESTRICT for:
-- 1. Payment.order - Payments are financial records that must not disappear with order deletion
-- 2. Address.user - Addresses are historical records that must not disappear with user deletion  
-- 3. ReturnRequest.order - Return history must not disappear with order deletion
--
-- These changes ensure data integrity and preservation of historical business records.
-- Order.user was already safe (no cascade), so it remains unchanged.

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_orderId_fkey";

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_userId_fkey";

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "return_requests" DROP CONSTRAINT "return_requests_orderId_fkey";

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
