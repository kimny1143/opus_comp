import { Invoice, Vendor, InvoiceItem, InvoiceStatusEnum } from '@prisma/client';

export interface ExtendedInvoice extends Omit<Invoice, 'vendor'> {
  vendor: Pick<Vendor, 'name' | 'email'>;
  items: InvoiceItem[];
  statusHistory: {
    id: string;
    status: InvoiceStatusEnum;
    comment: string | null;
    createdAt: Date;
    user: {
      name: string | null;
    };
  }[];
} 