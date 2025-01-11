import { StatusHistory } from '@/types/status-history';

interface TimelineViewProps {
  history: StatusHistory[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ history }) => {
  return (
    <div className="flex flex-col space-y-2">
      {history.map((entry) => (
        <div key={entry.id} className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <div className="text-sm">
            <span className="font-medium">{entry.status}</span>
            <span className="text-gray-500">
              {` - ${new Date(entry.createdAt).toLocaleString()}`}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}; 