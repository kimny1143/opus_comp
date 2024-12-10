/*
  Warnings:

  - The `status` column on the `Vendor` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `entityType` column on the `Vendor` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('corporation', 'individual', 'other');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('active', 'inactive', 'pending', 'suspended');

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "status",
ADD COLUMN     "status" "VendorStatus" NOT NULL DEFAULT 'active',
DROP COLUMN "entityType",
ADD COLUMN     "entityType" "EntityType";
