/*
  Warnings:

  - You are about to alter the column `totalAmount` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `taxAmount` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `unitPrice` on the `InvoiceItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `amount` on the `InvoiceItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `taxRate` on the `InvoiceItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(4,2)`.
  - You are about to drop the column `createdBy` on the `InvoiceStatus` table. All the data in the column will be lost.
  - You are about to alter the column `unitPrice` on the `InvoiceTemplateItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `taxRate` on the `InvoiceTemplateItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(4,2)`.
  - You are about to alter the column `totalAmount` on the `PurchaseOrder` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `taxAmount` on the `PurchaseOrder` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `unitPrice` on the `PurchaseOrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `amount` on the `PurchaseOrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `taxRate` on the `PurchaseOrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(4,2)`.
  - Added the required column `updatedAt` to the `InvoiceStatus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `InvoiceStatus` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('BEFORE_DUE', 'AFTER_DUE', 'AFTER_ISSUE');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('SUCCESS', 'FAILED');

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceStatus" DROP CONSTRAINT "InvoiceStatus_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_vendorId_fkey";

-- DropIndex
DROP INDEX "InvoiceStatus_createdBy_idx";

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "taxAmount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "InvoiceItem" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "taxRate" SET DATA TYPE DECIMAL(4,2);

-- AlterTable
ALTER TABLE "InvoiceStatus" DROP COLUMN "createdBy",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InvoiceTemplateItem" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "taxRate" SET DATA TYPE DECIMAL(4,2);

-- AlterTable
ALTER TABLE "PurchaseOrder" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "taxAmount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "PurchaseOrderItem" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "taxRate" SET DATA TYPE DECIMAL(4,2);

-- CreateTable
CREATE TABLE "itemTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itemTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templateItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "description" TEXT,
    "templateId" TEXT NOT NULL,

    CONSTRAINT "templateItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReminderSetting" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "type" "ReminderType" NOT NULL,
    "daysBeforeOrAfter" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReminderSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReminderHistory" (
    "id" TEXT NOT NULL,
    "reminderId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ReminderStatus" NOT NULL,
    "error" TEXT,

    CONSTRAINT "ReminderHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "templateItem_templateId_idx" ON "templateItem"("templateId");

-- CreateIndex
CREATE INDEX "ReminderSetting_invoiceId_idx" ON "ReminderSetting"("invoiceId");

-- CreateIndex
CREATE INDEX "ReminderSetting_type_idx" ON "ReminderSetting"("type");

-- CreateIndex
CREATE INDEX "ReminderHistory_reminderId_idx" ON "ReminderHistory"("reminderId");

-- CreateIndex
CREATE INDEX "ReminderHistory_sentAt_idx" ON "ReminderHistory"("sentAt");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_issueDate_idx" ON "Invoice"("issueDate");

-- CreateIndex
CREATE INDEX "Invoice_dueDate_idx" ON "Invoice"("dueDate");

-- CreateIndex
CREATE INDEX "Invoice_createdAt_idx" ON "Invoice"("createdAt");

-- CreateIndex
CREATE INDEX "InvoiceStatus_userId_idx" ON "InvoiceStatus"("userId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_status_idx" ON "PurchaseOrder"("status");

-- CreateIndex
CREATE INDEX "PurchaseOrder_orderDate_idx" ON "PurchaseOrder"("orderDate");

-- CreateIndex
CREATE INDEX "PurchaseOrder_deliveryDate_idx" ON "PurchaseOrder"("deliveryDate");

-- CreateIndex
CREATE INDEX "PurchaseOrder_createdAt_idx" ON "PurchaseOrder"("createdAt");

-- CreateIndex
CREATE INDEX "Vendor_status_idx" ON "Vendor"("status");

-- CreateIndex
CREATE INDEX "Vendor_entityType_idx" ON "Vendor"("entityType");

-- CreateIndex
CREATE INDEX "Vendor_registrationNumber_idx" ON "Vendor"("registrationNumber");

-- CreateIndex
CREATE INDEX "Vendor_createdAt_idx" ON "Vendor"("createdAt");

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceStatus" ADD CONSTRAINT "InvoiceStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templateItem" ADD CONSTRAINT "templateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "itemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderSetting" ADD CONSTRAINT "ReminderSetting_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderHistory" ADD CONSTRAINT "ReminderHistory_reminderId_fkey" FOREIGN KEY ("reminderId") REFERENCES "ReminderSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
