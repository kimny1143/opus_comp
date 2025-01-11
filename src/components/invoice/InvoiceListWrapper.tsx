'use client';

import { useState } from 'react';
import { InvoiceList } from './InvoiceList';
import { PurchaseOrder, Vendor, InvoiceStatus } from '@prisma/client';
import { ExtendedInvoice } from '@/types/invoice';
import { InvoiceStatusType } from '@/domains/invoice/types';

type ExtendedPurchaseOrder = PurchaseOrder & {
  vendor: Vendor;
};

interface InvoiceListWrapperProps {
  invoices: ExtendedInvoice[];
  completedPurchaseOrders: ExtendedPurchaseOrder[];
}

export function InvoiceListWrapper({ 
  invoices,
  completedPurchaseOrders 
}: InvoiceListWrapperProps) {
  const handleStatusChange = async (invoiceId: string, newStatus: InvoiceStatusType) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update invoice status');
      }

      // ページをリフレッシュして最新のデータを表示
      window.location.reload();
    } catch (error) {
      console.error('Error updating invoice status:', error);
      alert('請求書のステータス更新に失敗しました。');
    }
  };

  return (
    <InvoiceList 
      invoices={invoices} 
      completedPurchaseOrders={completedPurchaseOrders}
      onStatusChange={handleStatusChange}
    />
  );
}