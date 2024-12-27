/*
  Warnings:

  - The values [SENT,OVERDUE,CANCELLED] on the enum `InvoiceStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [OVERDUE] on the enum `PurchaseOrderStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InvoiceStatus_new" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PAID', 'REJECTED');
ALTER TABLE "Invoice" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Invoice" ALTER COLUMN "status" TYPE "InvoiceStatus_new" USING ("status"::text::"InvoiceStatus_new");
ALTER TYPE "InvoiceStatus" RENAME TO "InvoiceStatus_old";
ALTER TYPE "InvoiceStatus_new" RENAME TO "InvoiceStatus";
DROP TYPE "InvoiceStatus_old";
ALTER TABLE "Invoice" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PurchaseOrderStatus_new" AS ENUM ('DRAFT', 'PENDING', 'SENT', 'COMPLETED', 'REJECTED');
ALTER TABLE "PurchaseOrder" ALTER COLUMN "status" TYPE "PurchaseOrderStatus_new" USING ("status"::text::"PurchaseOrderStatus_new");
ALTER TABLE "PurchaseOrderStatusHistory" ALTER COLUMN "status" TYPE "PurchaseOrderStatus_new" USING ("status"::text::"PurchaseOrderStatus_new");
ALTER TYPE "PurchaseOrderStatus" RENAME TO "PurchaseOrderStatus_old";
ALTER TYPE "PurchaseOrderStatus_new" RENAME TO "PurchaseOrderStatus";
DROP TYPE "PurchaseOrderStatus_old";
COMMIT;
