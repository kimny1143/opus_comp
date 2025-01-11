'use client'

import { useState, useEffect } from 'react';
import { Order } from '@/types/order';
import { StatusSummary } from './status-summary';
import { ProgressTracker } from './progress-tracker';
import { useToast } from '@/components/ui/use-toast';

interface PurchaseOrdersResponse {
  purchaseOrders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const DashboardContent: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setError(null);
        const response = await fetch('/api/purchase-orders');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: PurchaseOrdersResponse = await response.json();
        setOrders(data.purchaseOrders || []);
      } catch (error) {
        const message = error instanceof Error ? error.message : '発注データの取得に失敗しました';
        console.error('Failed to fetch orders:', error);
        setError(message);
        toast({
          title: 'エラー',
          description: message,
          variant: 'destructive',
        });
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">エラーが発生しました</h3>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>
      <StatusSummary orders={orders} />
      
      <h2 className="text-xl font-semibold mb-4">最近の発注</h2>
      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.slice(0, 5).map(order => (
            <ProgressTracker
              key={order.id}
              orderId={order.id}
              currentStatus={order.status}
              history={order.statusHistory || []}
            />
          ))
        ) : (
          <p className="text-gray-500">発注データがありません</p>
        )}
      </div>
    </div>
  );
};