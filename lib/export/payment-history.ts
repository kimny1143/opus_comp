import { Invoice, Vendor } from '@prisma/client';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface ExportInvoice extends Invoice {
  vendor: Pick<Vendor, 'name'>;
}

export function generatePaymentHistoryCSV(invoices: ExportInvoice[]): string {
  const headers = [
    '請求書番号',
    '取引先名',
    '発行日',
    '支払期限',
    '支払日',
    '支払方法',
    '金額（税抜）',
    '消費税',
    '合計金額',
    'ステータス',
  ].join(',');

  const rows = invoices.map(invoice => [
    invoice.invoiceNumber,
    invoice.vendor.name,
    format(new Date(invoice.issueDate), 'yyyy/MM/dd', { locale: ja }),
    format(new Date(invoice.dueDate), 'yyyy/MM/dd', { locale: ja }),
    invoice.paymentDate ? format(new Date(invoice.paymentDate), 'yyyy/MM/dd', { locale: ja }) : '',
    invoice.paymentMethod || '',
    invoice.totalAmount.toString(),
    invoice.taxAmount.toString(),
    (Number(invoice.totalAmount) + Number(invoice.taxAmount)).toString(),
    invoice.status,
  ].join(','));

  return [headers, ...rows].join('\n');
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
} 