/*
  Warnings:

  - You are about to drop the `PurchaseOrderStatusHistory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `bankInfo` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceNumber` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('MANUFACTURER', 'WHOLESALER', 'RETAILER', 'SERVICE_PROVIDER', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InvoiceStatus" ADD VALUE 'REVIEWING';
ALTER TYPE "InvoiceStatus" ADD VALUE 'OVERDUE';

-- AlterEnum
ALTER TYPE "PurchaseOrderStatus" ADD VALUE 'OVERDUE';

-- DropForeignKey
ALTER TABLE "PurchaseOrderStatusHistory" DROP CONSTRAINT "PurchaseOrderStatusHistory_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrderStatusHistory" DROP CONSTRAINT "PurchaseOrderStatusHistory_userId_fkey";

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "bankInfo" JSONB NOT NULL,
ADD COLUMN     "invoiceNumber" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "totalAmount" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "businessType" "BusinessType";

-- DropTable
DROP TABLE "PurchaseOrderStatusHistory";

-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "purchaseOrderId" TEXT,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StatusHistory_invoiceId_idx" ON "StatusHistory"("invoiceId");

-- CreateIndex
CREATE INDEX "StatusHistory_purchaseOrderId_idx" ON "StatusHistory"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "StatusHistory_userId_idx" ON "StatusHistory"("userId");

-- CreateIndex
CREATE INDEX "Invoice_purchaseOrderId_idx" ON "Invoice"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "Invoice_vendorId_idx" ON "Invoice"("vendorId");

-- CreateIndex
CREATE INDEX "Invoice_templateId_idx" ON "Invoice"("templateId");

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
