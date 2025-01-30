'use client'

import { PurchaseOrderStatus } from '@prisma/client';
import { Order } from '@/types/order';

interface StatusCount {
  status: PurchaseOrderStatus;
  count: number;
  label: string;
}

interface StatusSummaryProps {
  orders: Order[];
}

export const StatusSummary: React.FC<StatusSummaryProps> = ({ orders }) => {
  const getStatusCounts = (): StatusCount[] => {
    const counts = new Map<PurchaseOrderStatus, number>();
    orders.forEach(order => {
      counts.set(order.status, (counts.get(order.status) || 0) + 1);
    });

    const statusLabels: Record<PurchaseOrderStatus, string> = {
      'DRAFT': '下書き',
      'PENDING': '承認待ち',
      'SENT': '送信済み',
      'COMPLETED': '完了',
      'REJECTED': '却下',
      'OVERDUE': '期限超過'
    };

    return Object.values(PurchaseOrderStatus)
      .map(status => ({
        status,
        count: counts.get(status) || 0,
        label: statusLabels[status] || status
      }));
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {statusCounts.map(({ status, count, label }) => (
        <div 
          key={status}
          className="p-4 rounded-lg bg-white shadow-sm border border-gray-200"
        >
          <div className="text-sm text-gray-500">{label}</div>
          <div className="mt-1 text-2xl font-semibold">{count}</div>
        </div>
      ))}
    </div>
  );
}; 