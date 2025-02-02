import { Prisma } from '@prisma/client';
import { ItemCategory } from '@/types/itemCategory';

export interface PdfInvoiceItem {
  id: string;
  invoiceId: string;
  itemName: string;
  quantity: number;
  unitPrice: Prisma.Decimal;
  taxRate: Prisma.Decimal;
  description?: string | null;
  category?: ItemCategory;
  taxAmount: Prisma.Decimal;
  taxableAmount: Prisma.Decimal;
}

export interface PdfInvoice {
  id: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate?: Date | null;
  notes?: string | null;
  status: string;
  vendor: {
    id: string;
    name: string;
    address?: string;
    registrationNumber?: string;
  };
  items: PdfInvoiceItem[];
  subtotal: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
}