-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_templateId_fkey";

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "templateId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "invoice_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
