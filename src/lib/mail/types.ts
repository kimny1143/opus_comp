import { QualifiedInvoice } from '@/types/invoice';

/**
 * メールテンプレートの種類
 */
export type MailTemplateType = 'invoiceCreated' | 'paymentReminder';

/**
 * テンプレート固有のデータ型のマップ
 */
export interface MailTemplateDataMap {
  invoiceCreated: {
    invoice: QualifiedInvoice;
    companyInfo: {
      name: string;
      email: string;
      registrationNumber?: string;
    };
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
  }>;
}

/**
 * メールテンプレート
 */
export interface MailTemplate<T extends keyof MailTemplateDataMap> {
  type: T;
  render: (data: MailTemplateDataMap[T]) => Promise<MailRenderResult>;
}

/**
 * メール送信結果
 */
export interface MailSendResult {
  success: boolean;
  messageId?: string;
  error?: Error;
}

/**
 * メール送信オプション
 */
export interface MailSendOptions {
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}