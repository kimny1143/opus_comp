'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SerializedPurchaseOrder } from '@/types/purchase-order';
import { format } from 'date-fns';

interface CreateInvoiceButtonProps {
  purchaseOrder: SerializedPurchaseOrder;
}

export function CreateInvoiceButton({ purchaseOrder }: CreateInvoiceButtonProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="mb-4">
        <h3 className="font-semibold">発注番号: {purchaseOrder.orderNumber}</h3>
        <p className="text-sm text-gray-600">発注日: {format(new Date(purchaseOrder.orderDate), 'yyyy/MM/dd')}</p>
        <p className="text-sm text-gray-600">取引先: {purchaseOrder.vendor.name}</p>
        <p className="text-sm text-gray-600">金額: ¥{Number(purchaseOrder.totalAmount).toLocaleString()}</p>
      </div>
      <Link 
        href={`/invoices/new?purchaseOrderId=${purchaseOrder.id}`}
        className="w-full"
      >
        <Button className="w-full">
          請求書を作成
        </Button>
      </Link>
    </div>
  );
} 