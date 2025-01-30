import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { ArrowLeft, Download } from 'lucide-react';
import { ExtendedInvoice, InvoiceItem } from '@/types/invoice';
import { getStatusBadgeColor, getStatusLabel } from '@/lib/utils/status';
import Layout from '@/components/Layout';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function InvoiceDetail() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [invoice, setInvoice] = useState<ExtendedInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const invoiceId = params.id as string;

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId || !session) return;

      try {
        const response = await fetch(`/api/invoices/${invoiceId}`);
        if (!response.ok) throw new Error('請求書の取得に失敗しました');
        const data = await response.json();
        setInvoice(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : '請求書の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, session]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  if (!invoice) {
    return <div>請求書が見つかりません</div>;
  }

  return (
    <Layout>
      <Head>
        <title>{`請求書 ${invoice.invoiceNumber} - OPUS`}</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold">請求書詳細</h1>
            </div>

            <button
              onClick={async () => {
                try {
                  const response = await fetch(`/api/invoices/${invoice.id}/pdf`);
                  if (!response.ok) throw new Error('PDFの生成に失敗しました');
                  
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `invoice-${invoice.invoiceNumber}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                } catch (error) {
                  console.error('PDF download error:', error);
                  setError('PDFのダウンロードに失敗しました');
                }
              }}
              className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF出力
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <dl className="grid grid-cols-2 gap-4">
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
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(invoice.status)}`}>
                    {getStatusLabel(invoice.status)}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">明細</h2>
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">品目</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">数量</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">単価</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">金額</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items.map((item: InvoiceItem) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ¥{Number(item.unitPrice).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ¥{(Number(item.unitPrice) * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-500">小計</td>
                    <td className="px-6 py-3 text-right text-sm text-gray-900">
                      ¥{Number(invoice.totalAmount).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-500">消費税</td>
                    <td className="px-6 py-3 text-right text-sm text-gray-900">
                      ¥{Number(invoice.taxAmount).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-sm font-bold text-gray-900">合計</td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                      ¥{(Number(invoice.totalAmount) + Number(invoice.taxAmount)).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 