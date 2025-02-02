import { Prisma } from '@prisma/client';
import { ItemCategory } from '@/types/itemCategory';

export type MailTemplateType = 'invoiceCreated' | 'paymentReminder';

export interface MailContext<T = Record<string, unknown>> {
  to: string;
  subject: string;
  data: T;
}

export interface MailRenderResult {
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
}

export interface MailTemplate<T = Record<string, unknown>> {
  type: MailTemplateType;
  render: (data: T) => Promise<MailRenderResult>;
}

// メールテンプレート固有の型
export interface InvoiceCreatedContext {
  invoice: MailInvoice;
  companyInfo: {
    name: string;
    email: string;
  };
}

export interface PaymentReminderContext {
  invoice: MailInvoice;
  daysOverdue: number;
}

export interface MailInvoiceItem {
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

export interface MailInvoice {
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
  items: MailInvoiceItem[];
  subtotal: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
}