import { QualifiedInvoice } from '@/domains/invoice/types';

export interface SendInvoiceEmailParams {
  invoice: QualifiedInvoice;
  pdfBuffer: Buffer;
  to: string;
  cc?: string;
  bcc?: string;
}

export async function sendInvoiceEmail(params: SendInvoiceEmailParams): Promise<void> {
  // メール送信の実装
  // TODO: 実際のメール送信ロジックを実装
  console.log('Sending invoice email:', params);
} 