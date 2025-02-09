/*
  Warnings:

  - The values [REJECTED,REVIEWING,SENT] on the enum `InvoiceStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `bankInfo` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseOrderId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `templateId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `InvoiceItem` table. All the data in the column will be lost.
  - You are about to drop the column `itemName` on the `InvoiceItem` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `contactPerson` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `registrationNumber` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `tradingName` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InvoiceTemplateItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemCategoryMaster` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseOrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StatusHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TagToInvoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TagToPurchaseOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TagToVendor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_VendorUsers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invoice_templates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reminder_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reminder_settings` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[invoiceNumber]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `InvoiceItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `InvoiceItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hashedPassword` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `type` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `Vendor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InvoiceStatus_new" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PAID', 'OVERDUE');
ALTER TABLE "Invoice" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Invoice" ALTER COLUMN "status" TYPE "InvoiceStatus_new" USING ("status"::text::"InvoiceStatus_new");
ALTER TYPE "InvoiceStatus" RENAME TO "InvoiceStatus_old";
ALTER TYPE "InvoiceStatus_new" RENAME TO "InvoiceStatus";
DROP TYPE "InvoiceStatus_old";
ALTER TABLE "Invoice" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_templateId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceTemplateItem" DROP CONSTRAINT "InvoiceTemplateItem_templateId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_recipientId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_createdById_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_projectId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrderItem" DROP CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "StatusHistory" DROP CONSTRAINT "StatusHistory_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "StatusHistory" DROP CONSTRAINT "StatusHistory_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "StatusHistory" DROP CONSTRAINT "StatusHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "_TagToInvoice" DROP CONSTRAINT "_TagToInvoice_A_fkey";

-- DropForeignKey
ALTER TABLE "_TagToInvoice" DROP CONSTRAINT "_TagToInvoice_B_fkey";

-- DropForeignKey
ALTER TABLE "_TagToPurchaseOrder" DROP CONSTRAINT "_TagToPurchaseOrder_A_fkey";

-- DropForeignKey
ALTER TABLE "_TagToPurchaseOrder" DROP CONSTRAINT "_TagToPurchaseOrder_B_fkey";

-- DropForeignKey
ALTER TABLE "_TagToVendor" DROP CONSTRAINT "_TagToVendor_A_fkey";

-- DropForeignKey
ALTER TABLE "_TagToVendor" DROP CONSTRAINT "_TagToVendor_B_fkey";

-- DropForeignKey
ALTER TABLE "_VendorUsers" DROP CONSTRAINT "_VendorUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_VendorUsers" DROP CONSTRAINT "_VendorUsers_B_fkey";

-- DropForeignKey
ALTER TABLE "invoice_templates" DROP CONSTRAINT "invoice_templates_userId_fkey";

-- DropForeignKey
ALTER TABLE "reminder_logs" DROP CONSTRAINT "reminder_logs_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "reminder_settings" DROP CONSTRAINT "reminder_settings_invoiceId_fkey";

-- DropIndex
DROP INDEX "Invoice_purchaseOrderId_idx";

-- DropIndex
DROP INDEX "Invoice_templateId_idx";

-- DropIndex
DROP INDEX "invoice_status_due_date_idx";

-- DropIndex
DROP INDEX "Vendor_updatedById_idx";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "bankInfo",
DROP COLUMN "purchaseOrderId",
DROP COLUMN "templateId",
DROP COLUMN "updatedById";

-- AlterTable
ALTER TABLE "InvoiceItem" DROP COLUMN "category",
DROP COLUMN "itemName",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
DROP COLUMN "image",
DROP COLUMN "name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "hashedPassword" SET NOT NULL;

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "category",
DROP COLUMN "code",
DROP COLUMN "contactPerson",
DROP COLUMN "registrationNumber",
DROP COLUMN "status",
DROP COLUMN "tradingName",
DROP COLUMN "updatedById",
ADD COLUMN     "corporateId" TEXT,
ADD COLUMN     "firstTag" TEXT,
ADD COLUMN     "individualId" TEXT,
ADD COLUMN     "invoiceNumber" TEXT,
ADD COLUMN     "secondTag" TEXT,
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "InvoiceTemplateItem";

-- DropTable
DROP TABLE "ItemCategoryMaster";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "ProjectMember";

-- DropTable
DROP TABLE "PurchaseOrder";

-- DropTable
DROP TABLE "PurchaseOrderItem";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "StatusHistory";

-- DropTable
DROP TABLE "Tag";

-- DropTable
DROP TABLE "TestLog";

-- DropTable
DROP TABLE "_TagToInvoice";

-- DropTable
DROP TABLE "_TagToPurchaseOrder";

-- DropTable
DROP TABLE "_TagToVendor";

-- DropTable
DROP TABLE "_VendorUsers";

-- DropTable
DROP TABLE "invoice_templates";

-- DropTable
DROP TABLE "reminder_logs";

-- DropTable
DROP TABLE "reminder_settings";

-- DropEnum
DROP TYPE "BusinessType";

-- DropEnum
DROP TYPE "ItemCategory";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "PurchaseOrderStatus";

-- DropEnum
DROP TYPE "ReminderType";

-- DropEnum
DROP TYPE "VendorCategory";

-- DropEnum
DROP TYPE "VendorStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_createdById_idx" ON "Invoice"("createdById");

-- RenameIndex
ALTER INDEX "invoice_items_invoice_id_idx" RENAME TO "InvoiceItem_invoiceId_idx";
