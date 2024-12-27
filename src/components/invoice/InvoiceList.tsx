'use client'

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Invoice, InvoiceStatus, InvoiceStatusDisplay } from '@/types/invoice';
import { getStatusBadgeColor } from '@/lib/utils/status';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { InvoicePreview } from './InvoicePreview';
import { InvoiceEmailDialog } from './InvoiceEmailDialog';
import { InvoiceFilters, type InvoiceFilters as IInvoiceFilters } from './InvoiceFilters';

interface InvoiceListProps {
  invoices: Invoice[];
  onStatusChange: (invoiceId: string, newStatus: InvoiceStatus) => Promise<void>;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  onStatusChange,
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filters, setFilters] = useState<IInvoiceFilters>({
    search: '',
    status: 'ALL',
    dateFrom: null,
    dateTo: null,
    minAmount: null,
    maxAmount: null,
  });

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      // 検索フィルター
      if (filters.search && invoice.invoiceNumber) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
          invoice.vendor.name.toLowerCase().includes(searchLower) ||
          (invoice.purchaseOrder?.orderNumber?.toLowerCase().includes(searchLower) ?? false);
        if (!matchesSearch) return false;
      }

      // 日付フィルター
      if (filters.dateFrom && invoice.issueDate && 
          new Date(invoice.issueDate) < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && invoice.issueDate && 
          new Date(invoice.issueDate) > filters.dateTo) {
        return false;
      }

      // 金額フィルター
      if (filters.minAmount && invoice.totalAmount && 
          Number(invoice.totalAmount) < filters.minAmount) {
        return false;
      }
      if (filters.maxAmount && invoice.totalAmount && 
          Number(invoice.totalAmount) > filters.maxAmount) {
        return false;
      }

      return true;
    });
  }, [invoices, filters]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">請求書一覧</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => {}}>
            一括ダウンロード
          </Button>
          <Button variant="outline" onClick={() => {}}>
            一括メール送信
          </Button>
        </div>
      </div>

      <InvoiceFilters onFilterChange={setFilters} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>請求書番号</TableHead>
            <TableHead>発行日</TableHead>
            <TableHead>支払期限</TableHead>
            <TableHead>取引先</TableHead>
            <TableHead>発注書番号</TableHead>
            <TableHead className="text-right">金額</TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead>アクション</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>
                {invoice.invoiceNumber || '-'}
              </TableCell>
              <TableCell>
                {invoice.issueDate ? 
                  new Date(invoice.issueDate).toLocaleDateString() : 
                  '-'
                }
              </TableCell>
              <TableCell>
                {invoice.dueDate ? 
                  new Date(invoice.dueDate).toLocaleDateString() : 
                  '-'
                }
              </TableCell>
              <TableCell>
                {invoice.vendor.name || '-'}
              </TableCell>
              <TableCell>
                {invoice.purchaseOrder ? (
                  <Link
                    href={`/purchase-orders/${invoice.purchaseOrder.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {invoice.purchaseOrder.orderNumber}
                  </Link>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell className="text-right">
                {invoice.totalAmount ? 
                  `¥${Number(invoice.totalAmount).toLocaleString()}` : 
                  '-'
                }
              </TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(invoice.status)}>
                  {InvoiceStatusDisplay[invoice.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <InvoicePreview invoice={invoice} />
                  <InvoiceEmailDialog invoice={invoice} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedInvoice(invoice)}
                  >
                    編集
                  </Button>
                  {invoice.status === 'APPROVED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusChange(invoice.id, 'PAID')}
                    >
                      支払済みにする
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 