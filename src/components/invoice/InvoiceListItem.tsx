'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExtendedInvoice, SerializedInvoice } from '@/types/invoice';
import { InvoiceStatusType } from '@/domains/invoice/types';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import InvoicePdfButton from './InvoicePdfButton';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils/format';

interface InvoiceListItemProps {
  invoice: SerializedInvoice;
  onStatusChange: (invoiceId: string, newStatus: InvoiceStatusType) => Promise<void>;
  onPreviewClick: () => void;
  isUpdating: boolean;
}

export function InvoiceListItem({ invoice, onStatusChange, onPreviewClick, isUpdating }: InvoiceListItemProps) {
  return (
    <tr>
      <td>{invoice.invoiceNumber || '-'}</td>
      <td>{invoice.vendor.name}</td>
      <td>{format(new Date(invoice.issueDate), 'yyyy/MM/dd')}</td>
      <td>{format(new Date(invoice.dueDate), 'yyyy/MM/dd')}</td>
      <td>{formatCurrency(invoice.totalAmount)}</td>
      <td>
        <InvoiceStatusBadge status={invoice.status} />
      </td>
      <td>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPreviewClick}
          >
            プレビュー
          </Button>
          <InvoicePdfButton invoice={invoice} />
          <Link href={`/invoices/${invoice.id}/edit`}>
            <Button variant="ghost" size="sm">
              編集
            </Button>
          </Link>
          {invoice.status === 'APPROVED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(invoice.id, 'PAID')}
              disabled={isUpdating}
            >
              {isUpdating ? '更新中...' : '支払済みにする'}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
} 