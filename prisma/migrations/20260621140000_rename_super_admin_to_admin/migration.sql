-- Rename enum value 'super_admin' to 'admin'
CREATE TYPE "UserRole_new" AS ENUM ('customer', 'admin');

-- Add a temporary column with the new type, migrate data, then swap
ALTER TABLE "profiles" ADD COLUMN "role_new" "UserRole_new";
UPDATE "profiles" SET "role_new" = CASE WHEN "role" = 'super_admin' THEN 'admin'::"UserRole_new" ELSE 'customer'::"UserRole_new" END;
ALTER TABLE "profiles" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "profiles" DROP COLUMN "role";
ALTER TABLE "profiles" RENAME COLUMN "role_new" TO "role";
ALTER TABLE "profiles" ALTER COLUMN "role" SET DEFAULT 'customer';
DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
