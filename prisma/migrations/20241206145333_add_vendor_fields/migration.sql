-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "contractStartDate" TIMESTAMP(3),
ADD COLUMN     "establishedDate" TIMESTAMP(3),
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "notes" TEXT;
