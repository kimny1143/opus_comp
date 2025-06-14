import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Invoice, InvoiceStatus, Vendor, PaymentMethod, Prisma } from '@prisma/client';
import { InvoiceStatusDisplay, InvoiceStatusStyles } from '@/types/enums';
import { RegisterPaymentModal } from '@/components/RegisterPaymentModal';
import { ReminderSettings } from '@/components/ReminderSettings';

interface ExtendedInvoice extends Omit<Invoice, 'vendor' | 'items' | 'statusHistory' | 'payment'> {
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  totalAmount: Prisma.Decimal;
  payment?: {
    paymentDate: Date;
    amount: Prisma.Decimal;
    method: PaymentMethod;
    note?: string;
  };
  vendor: Pick<Vendor, 'name' | 'email'>;
  items: {
    id: string;
    itemName: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
    taxRate: Prisma.Decimal;
    amount: Prisma.Decimal;
  }[];
  statusHistory: {
    id: string;
    status: InvoiceStatus;
    comment: string | null;
    createdAt: Date;
    createdBy: {
      name: string | null;
    };
  }[];
}

interface PaymentData {
  paymentDate: string;
  paymentMethod: PaymentMethod;
  amount: number;
  notes?: string;
}

export default function PaymentDetail() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id as string;
  const [invoice, setInvoice] = useState<ExtendedInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchInvoiceDetails = async () => {
    try {
      const response = await fetch(`/api/invoices/${paymentId}`);
      if (!response.ok) throw new Error('請求書の取得に失敗しました');
      const data = await response.json();
      setInvoice(data);
    } catch (error) {
      console.error('Error:', error);
      setError('請求書の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceDetails();
  }, [paymentId]);

  const handleRegisterPayment = async (paymentData: PaymentData) => {
    try {
      const response = await fetch(`/api/invoices/${paymentId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'PAID',
          comment: paymentData.notes,
          paymentData: {
            paymentDate: paymentData.paymentDate,
            amount: paymentData.amount,
            method: paymentData.paymentMethod,
            note: paymentData.notes,
          },
        }),
      });

      if (!response.ok) throw new Error('支払記録の登録に失敗しました');
      const data = await response.json();
      // 請求書情報を更新
      setInvoice(data);
      setIsPaymentModalOpen(false);
    } catch (error) {
      console.error('Error:', error);
      setError('支払記録の登録に失敗しました');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!invoice) return <div>請求書が見つかりません</div>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">請求書詳細</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
          >
            戻る
          </button>
        </div>

        {/* 基本情報 */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">請求書番号</dt>
                <dd className="mt-1 text-sm text-gray-900">{invoice.invoiceNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">取引先</dt>
                <dd className="mt-1 text-sm text-gray-900">{invoice.vendor.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">発行日</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(invoice.issueDate), 'yyyy/MM/dd', { locale: ja })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">支払期限</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(invoice.dueDate), 'yyyy/MM/dd', { locale: ja })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">ステータス</dt>
                <dd className="mt-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status as InvoiceStatus)}`}>
                    {invoice.status}
                  </span>
                </dd>
              </div>
              {invoice.payment?.paymentDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">支払日</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(invoice.payment?.paymentDate), 'yyyy/MM/dd', { locale: ja })}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* 明細 */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium mb-4">明細</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    品目
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    数量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    単価
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金額
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.itemName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{item.unitPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ステータス履歴 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium mb-4">ステータス履歴</h2>
            <div className="flow-root">
              <ul className="-mb-8">
                {invoice.statusHistory.map((status, index) => (
                  <li key={status.id}>
                    <div className="relative pb-8">
                      {index < invoice.statusHistory.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getStatusIconColor(status.status)}`}>
                            {/* ステータスに応じたアイコン */}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              {status.comment || getStatusText(status.status)}
                              {status.createdBy.name && (
                                <span className="font-medium text-gray-900">
                                  {' '}by {status.createdBy.name}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {format(new Date(status.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ステータス履歴の後にリマインダー設定を追加 */}
        <div className="bg-white shadow rounded-lg mt-6">
          <div className="px-4 py-5 sm:p-6">
            <ReminderSettings invoiceId={invoice.id} />
          </div>
        </div>

        {/* 支払登録ボタンを追加 */}
        {invoice.status !== 'PAID' && (
          <div className="mt-6">
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              支払記録を登録
            </button>
          </div>
        )}

        {/* 支払登録モーダル */}
        <RegisterPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSubmit={handleRegisterPayment}
          invoiceId={invoice?.id}
          totalAmount={Number(invoice?.totalAmount)}
        />
      </div>
    </Layout>
  );
}

function getStatusColor(status: InvoiceStatus): string {
  return InvoiceStatusStyles[status];
}

function getStatusIconColor(status: InvoiceStatus): string {
  switch (status) {
    case 'PAID':
      return 'bg-green-500';
    case 'OVERDUE':
      return 'bg-red-500';
    case 'PENDING':
      return 'bg-blue-500';
    case 'REVIEWING':
      return 'bg-purple-500';
    case 'APPROVED':
      return 'bg-indigo-500';
    case 'REJECTED':
      return 'bg-red-500';
    case 'DRAFT':
    default:
      return 'bg-gray-500';
  }
}

function getStatusText(status: InvoiceStatus): string {
  return InvoiceStatusDisplay[status];
} 