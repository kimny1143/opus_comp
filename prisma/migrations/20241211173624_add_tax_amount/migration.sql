/*
  Warnings:

  - You are about to alter the column `totalAmount` on the `PurchaseOrder` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `taxAmount` on the `PurchaseOrder` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `unitPrice` on the `PurchaseOrderItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `taxRate` on the `PurchaseOrderItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,2)`.
  - You are about to alter the column `amount` on the `PurchaseOrderItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - Made the column `taxAmount` on table `PurchaseOrder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `amount` on table `PurchaseOrderItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PurchaseOrder" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "taxAmount" SET NOT NULL,
ALTER COLUMN "taxAmount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "PurchaseOrderItem" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "taxRate" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "amount" SET NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);
