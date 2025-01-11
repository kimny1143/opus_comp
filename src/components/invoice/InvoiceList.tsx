'use client'

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ExtendedInvoice } from '@/types/invoice';
import { PurchaseOrder, Vendor, InvoiceStatus } from '@prisma/client';
import { getStatusBadgeColor } from '@/lib/utils/status';
import { formatDate, isValidDate } from '@/lib/utils/date';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InvoicePreview } from './InvoicePreview';
import { InvoiceEmailDialog } from './InvoiceEmailDialog';
import { InvoicePdfButton } from './InvoicePdfButton';
import { InvoiceFilters, type InvoiceFilters as IInvoiceFilters } from './InvoiceFilters';
import { InvoiceStatusDisplay } from '@/types/enums';

type ExtendedPurchaseOrder = PurchaseOrder & {
  vendor: Vendor;
};

interface InvoiceListProps {
  invoices: ExtendedInvoice[];
  completedPurchaseOrders: ExtendedPurchaseOrder[];
  onStatusChange: (invoiceId: string, newStatus: InvoiceStatus) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  completedPurchaseOrders,
  onStatusChange,
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<ExtendedInvoice | null>(null);
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
      if (filters.dateFrom && invoice.issueDate) {
        const issueDate = new Date(invoice.issueDate);
        if (isValidDate(issueDate) && issueDate < filters.dateFrom) {
          return false;
        }
      }
      if (filters.dateTo && invoice.issueDate) {
        const issueDate = new Date(invoice.issueDate);
        if (isValidDate(issueDate) && issueDate > filters.dateTo) {
          return false;
        }
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
    <div className="space-y-4" data-testid="invoices-list">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">請求書一覧</h2>
        <div className="flex space-x-2">
          <Link
            href="/invoices/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            data-testid="create-invoice-button"
          >
            新規作成
          </Link>
          <Button variant="outline" onClick={() => {}}>
            一括ダウンロード
          </Button>
          <Button variant="outline" onClick={() => {}}>
            一括メール送信
          </Button>
        </div>
      </div>

      <InvoiceFilters onFilterChange={setFilters} />

      {/* 完了済みの発注書セクション */}
      {completedPurchaseOrders.length > 0 && (
        <div className="bg-white shadow rounded-lg p-4 mb-4">
          <h3 className="text-lg font-medium mb-4">請求書未作成の完了済み発注書</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>発注番号</TableHead>
                <TableHead>取引先</TableHead>
                <TableHead>発注日</TableHead>
                <TableHead>納期</TableHead>
                <TableHead className="text-right">金額</TableHead>
                <TableHead>アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedPurchaseOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.vendor.name}</TableCell>
                  <TableCell>{order.orderDate ? formatDate(new Date(order.orderDate)) : '-'}</TableCell>
                  <TableCell>{order.deliveryDate ? formatDate(new Date(order.deliveryDate)) : '-'}</TableCell>
                  <TableCell className="text-right">
                    ¥{Number(order.totalAmount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/invoices/new?purchaseOrderId=${order.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      請求書作成
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 既存の請求書一覧 */}
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
                {invoice.issueDate ? formatDate(new Date(invoice.issueDate)) : '-'}
              </TableCell>
              <TableCell>
                {invoice.dueDate ? formatDate(new Date(invoice.dueDate)) : '-'}
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
                <Badge className={getStatusBadgeColor(invoice.status)} data-testid={`status-${invoice.status}`}>
                  {InvoiceStatusDisplay[invoice.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <InvoicePreview invoice={invoice} />
                  <InvoicePdfButton invoice={invoice} />
                  <InvoiceEmailDialog invoice={invoice} />
                  <Link
                    href={`/invoices/${invoice.id}/edit`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    編集
                  </Link>
                  {invoice.status === 'APPROVED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusChange(invoice.id, 'PAID')}
                      data-testid="update-status"
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