/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the `_VendorTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tags` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `createdById` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Made the column `entityType` on table `Vendor` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "_VendorTags" DROP CONSTRAINT "_VendorTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_VendorTags" DROP CONSTRAINT "_VendorTags_B_fkey";

-- DropIndex
DROP INDEX "Vendor_createdBy_idx";

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "createdBy",
ADD COLUMN     "createdById" TEXT NOT NULL,
ALTER COLUMN "entityType" SET NOT NULL;

-- DropTable
DROP TABLE "_VendorTags";

-- DropTable
DROP TABLE "tags";

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorTag" (
    "vendorId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "VendorTag_pkey" PRIMARY KEY ("vendorId","tagId")
);

-- CreateIndex
CREATE INDEX "Vendor_createdById_idx" ON "Vendor"("createdById");

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorTag" ADD CONSTRAINT "VendorTag_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorTag" ADD CONSTRAINT "VendorTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
