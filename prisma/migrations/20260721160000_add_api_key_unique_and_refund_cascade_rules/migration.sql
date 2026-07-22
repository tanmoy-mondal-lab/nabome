-- AlterTable: Add unique constraint to api_keys.key
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_key_key" UNIQUE ("key");

-- AlterTable: Change refunds.order from Cascade to Restrict
ALTER TABLE "refunds" DROP CONSTRAINT "refunds_order_id_fkey";
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: Change refunds.returnRequest from Cascade to SetNull
ALTER TABLE "refunds" DROP CONSTRAINT "refunds_return_request_id_fkey";
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_return_request_id_fkey" FOREIGN KEY ("return_request_id") REFERENCES "return_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
