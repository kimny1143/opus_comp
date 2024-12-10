/*
  Warnings:

  - The `status` column on the `Invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `paymentMethod` column on the `Invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `paymentMethod` column on the `InvoiceTemplate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `PurchaseOrder` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `status` on the `InvoiceStatus` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `PurchaseOrderStatus` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "InvoiceStatusEnum" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatusEnum" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CREDIT_CARD', 'DIRECT_DEBIT', 'CASH', 'OTHER');

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "status",
ADD COLUMN     "status" "InvoiceStatusEnum" NOT NULL DEFAULT 'DRAFT',
DROP COLUMN "paymentMethod",
ADD COLUMN     "paymentMethod" "PaymentMethod";

-- AlterTable
ALTER TABLE "InvoiceStatus" DROP COLUMN "status",
ADD COLUMN     "status" "InvoiceStatusEnum" NOT NULL;

-- AlterTable
ALTER TABLE "InvoiceTemplate" DROP COLUMN "paymentMethod",
ADD COLUMN     "paymentMethod" "PaymentMethod";

-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "status",
ADD COLUMN     "status" "PurchaseOrderStatusEnum" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "PurchaseOrderStatus" DROP COLUMN "status",
ADD COLUMN     "status" "PurchaseOrderStatusEnum" NOT NULL;
