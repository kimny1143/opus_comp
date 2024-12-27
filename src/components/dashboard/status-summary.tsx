'use client'

import { OrderStatus } from '@/types/order-status';
import { Order } from '@/types/order';

interface StatusCount {
  status: OrderStatus;
  count: number;
  label: string;
}

interface StatusSummaryProps {
  orders: Order[];
}

export const StatusSummary: React.FC<StatusSummaryProps> = ({ orders }) => {
  const getStatusCounts = (): StatusCount[] => {
    const counts = new Map<OrderStatus, number>();
    orders.forEach(order => {
      counts.set(order.status, (counts.get(order.status) || 0) + 1);
    });

    const statusLabels: Record<OrderStatus, string> = {
      [OrderStatus.DRAFT]: '下書き',
      [OrderStatus.PENDING]: '承認待ち',
      [OrderStatus.IN_PROGRESS]: '進行中',
      [OrderStatus.SENT]: '送信済み',
      [OrderStatus.COMPLETED]: '完了',
      [OrderStatus.REJECTED]: '却下',
      [OrderStatus.EXPIRED]: '期限切れ',
      [OrderStatus.OVERDUE]: '期限超過'
    };

    return (Object.keys(OrderStatus) as Array<keyof typeof OrderStatus>)
      .filter(key => isNaN(Number(key)))
      .map(key => ({
        status: OrderStatus[key],
        count: counts.get(OrderStatus[key]) || 0,
        label: statusLabels[OrderStatus[key]]
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