'use client';

import { format } from 'date-fns';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { InvoiceStatus } from '@prisma/client';

interface StatusHistoryItem {
  id: string;
  status: InvoiceStatus;
  createdAt: Date;
  user: {
    name: string | null;
  } | null;
}

interface InvoiceStatusHistoryProps {
  history: StatusHistoryItem[];
}

export function InvoiceStatusHistory({ history }: InvoiceStatusHistoryProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">ステータス履歴</h3>
      <div className="border rounded-lg divide-y">
        {history.map((item) => (
          <div key={item.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <InvoiceStatusBadge status={item.status} />
                <span className="text-sm text-gray-500">
                  {item.user?.name || '自動更新'}
                </span>
              </div>
              <time className="text-sm text-gray-500">
                {format(new Date(item.createdAt), 'yyyy/MM/dd HH:mm')}
              </time>
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            履歴がありません
          </div>
        )}
      </div>
    </div>
  );
} 