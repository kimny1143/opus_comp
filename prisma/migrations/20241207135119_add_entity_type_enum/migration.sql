/*
  Warnings:

  - The values [active,inactive,pending,suspended] on the enum `VendorStatus` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `entityType` on table `Vendor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VendorStatus_new" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED');
ALTER TABLE "Vendor" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Vendor" ALTER COLUMN "status" TYPE "VendorStatus_new" USING ("status"::text::"VendorStatus_new");
ALTER TYPE "VendorStatus" RENAME TO "VendorStatus_old";
ALTER TYPE "VendorStatus_new" RENAME TO "VendorStatus";
DROP TYPE "VendorStatus_old";
ALTER TABLE "Vendor" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "Vendor" ALTER COLUMN "status" SET DEFAULT 'ACTIVE',
ALTER COLUMN "entityType" SET NOT NULL,
ALTER COLUMN "entityType" SET DEFAULT 'other';
