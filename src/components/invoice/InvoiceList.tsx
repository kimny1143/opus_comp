'use client'

import { useState, useMemo } from 'react';
import { SerializedInvoice } from '@/types/invoice';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InvoicePreview } from './InvoicePreview';
import { InvoiceFilters } from './InvoiceFilters';
import type { InvoiceFiltersData } from './InvoiceFilters';
import { InvoiceStatusType } from '@/domains/invoice/types';
import { SerializedPurchaseOrder } from '@/types/purchase-order';
import { InvoiceListItem } from './InvoiceListItem';
import { CreateInvoiceButton } from './CreateInvoiceButton';
import React from 'react';

interface InvoiceListProps {
  invoices: SerializedInvoice[];
  completedPurchaseOrders: SerializedPurchaseOrder[];
  onStatusChange: (invoiceId: string, newStatus: InvoiceStatusType) => Promise<void>;
  isUpdating?: boolean;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  completedPurchaseOrders,
  onStatusChange,
  isUpdating = false,
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<SerializedInvoice | null>(null);
  const [filters, setFilters] = useState<InvoiceFiltersData>({
    search: '',
    status: 'ALL',
    dateFrom: null,
    dateTo: null,
  });

  // フィルタリングされた請求書のリスト
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      // 検索フィルター
      if (filters.search && !invoice.vendor.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // ステータスフィルター
      if (filters.status !== 'ALL' && invoice.status !== filters.status) {
        return false;
      }

      // 日付フィルター
      if (filters.dateFrom && new Date(invoice.issueDate) < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && new Date(invoice.issueDate) > filters.dateTo) {
        return false;
      }

      return true;
    });
  }, [invoices, filters]);

  return (
    <div className="space-y-4">
      <InvoiceFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>請求書番号</TableHead>
              <TableHead>取引先</TableHead>
              <TableHead>発行日</TableHead>
              <TableHead>期日</TableHead>
              <TableHead>金額</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>アクション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map(invoice => (
              <InvoiceListItem
                key={invoice.id}
                invoice={invoice}
                onStatusChange={onStatusChange}
                onPreviewClick={() => setSelectedInvoice(invoice)}
                isUpdating={isUpdating}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {completedPurchaseOrders.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">請求書未作成の完了済み発注書</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedPurchaseOrders.map(order => (
              <CreateInvoiceButton
                key={order.id}
                purchaseOrder={order}
              />
            ))}
          </div>
        </div>
      )}

      {selectedInvoice && (
        <InvoicePreview
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};
