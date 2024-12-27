import { OrderStatus } from '@/types/order-status';
import { StatusHistory } from '@/types/status-history';
import { StatusIndicator } from '@/components/status/StatusIndicator';
import { TimelineView } from '@/components/status/TimelineView';

interface ProgressTrackerProps {
  orderId: string;
  currentStatus: OrderStatus;
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