-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "myNumber" TEXT,
ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[];
