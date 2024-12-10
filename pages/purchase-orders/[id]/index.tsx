import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { ArrowLeft, Download, Clock, Send } from 'lucide-react';
import {
  PurchaseOrder,
  Vendor,
  PurchaseOrderItem,
  PurchaseOrderStatusEnum,
} from '@prisma/client';
import { StatusBadge } from '@/components/purchase-orders/StatusBadge';
import { ItemsTable } from '@/components/purchase-orders/ItemsTable';
import { OrderSummary } from '@/components/purchase-orders/OrderSummary';
import { Decimal } from '@prisma/client/runtime/library';

type ExtendedPurchaseOrder = PurchaseOrder & {
  vendor: Vendor;
  items: PurchaseOrderItem[];
  statusHistory: {
    id: string;
    status: PurchaseOrderStatusEnum;
    comment: string;
    createdAt: Date;
    user: {
      name: string;
    };
  }[];
};

export default function PurchaseOrderDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [order, setOrder] = useState<ExtendedPurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/purchase-orders/${id}`);
      if (!response.ok) throw new Error('発注書の取得に失敗しました');
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : '発注書の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: PurchaseOrderStatusEnum) => {
    if (!order || updating) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/purchase-orders/${id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          comment: statusComment,
        }),
      });

      if (!response.ok) throw new Error('ステータスの更新に失敗しました');
      
      await fetchOrder();
      setStatusComment('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ステータスの更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!order) return;
    
    try {
      const response = await fetch(`/api/purchase-orders/${id}/pdf`);
      if (!response.ok) throw new Error('PDFの生成に失敗しました');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `purchase-order-${order.orderNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'PDFの生成に失敗しました');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!order) {
    return <div className="flex justify-center items-center h-screen">発注書が見つかりません</div>;
  }

  return (
    <>
      <Head>
        <title>{order.orderNumber} - 発注書詳細 - OPUS</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* ヘッダー */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">発注書詳細</h1>
          </div>

          {/* エラーメッセージ */}
          {error && <div className="mb-4 text-red-600">{error}</div>}

          {/* 発注書情報 */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">発注書情報</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">取引先</dt>
                <dd className="mt-1">{order.vendor.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">発注日</dt>
                <dd className="mt-1">
                  {new Date(order.orderDate).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">納期</dt>
                <dd className="mt-1">
                  {order.deliveryDate
                    ? new Date(order.deliveryDate).toLocaleDateString()
                    : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">ステータス</dt>
                <dd className="mt-1">
                  <StatusBadge status={order.status} />
                </dd>
              </div>
            </dl>
          </div>

          {/* アイテムテーブル */}
          <ItemsTable items={order.items} />

          {/* 注文概要 */}
          <OrderSummary
            subtotal={(order.totalAmount as unknown as Decimal).toNumber()}
            taxAmount={(order.taxAmount as unknown as Decimal).toNumber()}
          />

          {/* ステータス履歴 */}
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-lg font-medium mb-4">ステータス履歴</h2>
            <div className="space-y-4">
              {order.statusHistory.map((history) => (
                <div key={history.id} className="border-l-2 border-gray-200 pl-4">
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <time className="text-gray-500">
                      {new Date(history.createdAt).toLocaleString()}
                    </time>
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={history.status} />
                  </div>
                  {history.comment && (
                    <p className="mt-1 text-sm text-gray-600">{history.comment}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">更新者: {history.user.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 