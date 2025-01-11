import { QualifiedInvoice } from '@/domains/invoice/types';

export async function generateInvoicePDF(invoice: QualifiedInvoice): Promise<Buffer> {
  // PDF生成の実装
  // TODO: 実際のPDF生成ロジックを実装
  return Buffer.from('Dummy PDF content');
} 