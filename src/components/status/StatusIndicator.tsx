import { OrderStatus } from '@/types/order-status';

interface StatusIndicatorProps {
  status: OrderStatus;
}

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: 'bg-gray-200 text-gray-800',
  [OrderStatus.PENDING]: 'bg-yellow-200 text-yellow-800',
  [OrderStatus.IN_PROGRESS]: 'bg-blue-200 text-blue-800',
  [OrderStatus.SENT]: 'bg-indigo-200 text-indigo-800',
  [OrderStatus.COMPLETED]: 'bg-green-200 text-green-800',
  [OrderStatus.REJECTED]: 'bg-red-200 text-red-800',
  [OrderStatus.EXPIRED]: 'bg-orange-200 text-orange-800',
  [OrderStatus.OVERDUE]: 'bg-purple-200 text-purple-800'
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  return (
    <div className={`px-3 py-1 rounded-full ${statusColors[status]}`}>
      {status}
    </div>
  );
}; 