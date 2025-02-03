import { Prisma } from '@prisma/client';
import { QualifiedInvoice } from '@/types/invoice';
import { InvoiceStatus } from '@/domains/invoice/status';

/**
 * メール送信者情報
 */
export interface MailSenderInfo {
  name: string;
  email: string;
  registrationNumber?: string;
}

/**
 * メール送信用の請求書明細項目
 */
export interface MailInvoiceItem {
  id: string;
  invoiceId: string;
  itemName: string;
  description?: string | null;
  quantity: number;
  unitPrice: Prisma.Decimal;
  taxRate: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  taxableAmount: Prisma.Decimal;
}

/**
 * メール送信用の請求書
 */
export interface MailInvoice {
  id: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate?: Date | null;
  notes?: string | null;
  status: InvoiceStatus;
  vendor: {
    id: string;
    name: string;
    address: string;
    registrationNumber: string;
  };
  items: MailInvoiceItem[];
  subtotal: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
}

/**
 * メールテンプレートの種類
 */
export type MailTemplateType = 'invoiceCreated' | 'paymentReminder';

/**
 * テンプレートのメタデータ
 */
export interface MailTemplateMetadata {
  name: string;
  description: string;
  subject: string;
  variables: string[];
}

/**
 * テンプレート固有のデータ型のマップ
 */
export interface MailTemplateDataMap {
  invoiceCreated: {
    invoice: QualifiedInvoice;
    companyInfo: MailSenderInfo;
  };
  paymentReminder: {
    invoice: QualifiedInvoice;
    daysOverdue: number;
  };
}

/**
 * メール送信のコンテキスト
 */
export interface MailContext<T extends keyof MailTemplateDataMap> {
  to: string;
  subject: string;
  data: MailTemplateDataMap[T];
  metadata?: MailTemplateMetadata;
}

/**
 * メールレンダリング結果
 */
export interface MailRenderResult {
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}

/**
 * メールテンプレート
 */
export interface MailTemplate<T extends keyof MailTemplateDataMap> {
  type: T;
  metadata: MailTemplateMetadata;
  validate: (data: MailTemplateDataMap[T]) => boolean | Promise<boolean>;
  render: (data: MailTemplateDataMap[T]) => Promise<MailRenderResult>;
}

/**
 * メール送信結果
 */
export interface MailSendResult {
  success: boolean;
  messageId?: string;
  error?: Error;
  timestamp?: Date;
}

/**
 * メール送信オプション
 */
export interface MailSendOptions {
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  priority?: 'high' | 'normal' | 'low';
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}

/**
 * メールテンプレートのバリデーションエラー
 */
export class MailTemplateValidationError extends Error {
  constructor(
    message: string,
    public templateType: MailTemplateType,
    public errors: string[]
  ) {
    super(message);
    this.name = 'MailTemplateValidationError';
  }
}