-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('BEFORE_DUE', 'AFTER_DUE', 'AFTER_ISSUE');

-- CreateTable
CREATE TABLE "reminder_settings" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "type" "ReminderType" NOT NULL,
    "daysBeforeOrAfter" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminder_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reminder_settings_invoiceId_idx" ON "reminder_settings"("invoiceId");

-- AddForeignKey
ALTER TABLE "reminder_settings" ADD CONSTRAINT "reminder_settings_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
