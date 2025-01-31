-- CreateTable
CREATE TABLE "_VendorUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_VendorUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_VendorUsers_B_index" ON "_VendorUsers"("B");

-- AddForeignKey
ALTER TABLE "_VendorUsers" ADD CONSTRAINT "_VendorUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VendorUsers" ADD CONSTRAINT "_VendorUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
