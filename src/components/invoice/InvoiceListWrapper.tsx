'use client';

import { useState, useTransition, useOptimistic } from 'react';
import { InvoiceList } from './InvoiceList';
import { InvoiceStatus } from '@prisma/client';
import { ExtendedInvoice, SerializedInvoice } from '@/types/invoice';
import { InvoiceStatusType } from '@/domains/invoice/types';
import { updateInvoiceStatus } from '@/app/actions/invoice';
import { useToast } from '@/components/ui/use-toast';
import { SerializedPurchaseOrder } from '@/types/purchase-order';

interface InvoiceListWrapperProps {
  invoices: SerializedInvoice[];
  completedPurchaseOrders: SerializedPurchaseOrder[];
}

export function InvoiceListWrapper({ 
  invoices: initialInvoices,
  completedPurchaseOrders 
}: InvoiceListWrapperProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [optimisticInvoices, updateOptimisticInvoices] = useOptimistic(
    initialInvoices,
    (state, { id, status }: { id: string, status: InvoiceStatusType }) =>
      state.map(invoice =>
        invoice.id === id ? { ...invoice, status } : invoice
      )
  );

  const handleStatusChange = async (invoiceId: string, newStatus: InvoiceStatusType) => {
    try {
      // 楽観的更新
      updateOptimisticInvoices({ id: invoiceId, status: newStatus });

      // Server Actionを使用したステータス更新
      startTransition(async () => {
        const result = await updateInvoiceStatus(invoiceId, newStatus);
        
        if (result.error) {
          toast({
            title: 'エラー',
            description: '請求書のステータス更新に失敗しました。',
            variant: 'destructive',
          });
          // 楽観的更新を元に戻す
          updateOptimisticInvoices({ 
            id: invoiceId, 
            status: result.previousStatus 
          });
        } else {
          toast({
            title: '成功',
            description: '請求書のステータスを更新しました。',
          });
        }
      });
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast({
        title: 'エラー',
        description: '請求書のステータス更新に失敗しました。',
        variant: 'destructive',
      });
    }
  };

  return (
    <InvoiceList
      invoices={optimisticInvoices}
      completedPurchaseOrders={completedPurchaseOrders}
      onStatusChange={handleStatusChange}
      isUpdating={isPending}
    />
  );
}
