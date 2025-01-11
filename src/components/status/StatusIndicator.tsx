import { PurchaseOrderStatus, PurchaseOrderStatusStyles, PurchaseOrderStatusDisplay } from '@/types/enums';

interface StatusIndicatorProps {
  status: PurchaseOrderStatus;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  return (
    <div className={`px-3 py-1 rounded-full ${PurchaseOrderStatusStyles[status]}`}>
      {PurchaseOrderStatusDisplay[status]}
    </div>
  );
}; 