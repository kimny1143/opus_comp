/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - Added the required column `entityType` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
DROP COLUMN "role",
DROP COLUMN "updatedAt",
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "entityType" TEXT NOT NULL,
ADD COLUMN     "invoiceNumber" TEXT;
