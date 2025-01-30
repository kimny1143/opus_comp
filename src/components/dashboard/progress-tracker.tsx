import { PurchaseOrderStatus } from '@prisma/client';
import { StatusHistory } from '@/types/status-history';
import { StatusIndicator } from '@/components/status/StatusIndicator';
import { TimelineView } from '@/components/status/TimelineView';

interface ProgressTrackerProps {
  orderId: string;
  currentStatus: PurchaseOrderStatus;
  history: StatusHistory[];
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  orderId,
  currentStatus,
  history
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <StatusIndicator status={currentStatus} />
        <TimelineView history={history} />
      </div>
    </div>
  );
}; 