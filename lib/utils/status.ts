import { InvoiceStatusEnum } from '@prisma/client';

export function getStatusBadgeColor(status: InvoiceStatusEnum): string {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800';
    case 'OVERDUE':
      return 'bg-red-100 text-red-800';
    case 'SENT':
      return 'bg-blue-100 text-blue-800';
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800';
    case 'CANCELLED':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusLabel(status: InvoiceStatusEnum): string {
  switch (status) {
    case 'PAID':
      return '支払済み';
    case 'OVERDUE':
      return '支払期限超過';
    case 'SENT':
      return '送信済み';
    case 'DRAFT':
      return '下書き';
    case 'CANCELLED':
      return 'キャンセル';
    default:
      return status;
  }
} 