import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Invoice, InvoiceStatusEnum, Vendor } from '@prisma/client';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { RegisterPaymentModal } from '@/components/RegisterPaymentModal';
import { PaymentData } from '@/components/RegisterPaymentModal';
import { PaymentMethod } from '@prisma/client';
import { generatePaymentHistoryCSV, downloadCSV } from '@/lib/export/payment-history';

interface ExtendedInvoice extends Omit<Invoice, 'vendor'> {
  vendor: Pick<Vendor, 'name' | 'email'>;
}

interface PaymentStats {
  totalUnpaid: number;
  totalOverdue: number;
  totalPaid: number;
  upcomingPayments: number;
}

interface FilterOptions {
  status: InvoiceStatusEnum | 'ALL';
  dateRange: 'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR';
  vendorId: string | 'ALL';
  searchQuery: string;
}

export default function PaymentsDashboard() {
  const [invoices, setInvoices] = useState<ExtendedInvoice[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalUnpaid: 0,
    totalOverdue: 0,
    totalPaid: 0,
    upcomingPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: 'ALL',
    dateRange: 'ALL',
    vendorId: 'ALL',
    searchQuery: '',
  });
  const [vendors, setVendors] = useState<Pick<Vendor, 'id' | 'name'>[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [isBulkPaymentModalOpen, setIsBulkPaymentModalOpen] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [filterOptions]);

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/vendors');
      if (!response.ok) throw new Error('取引先の取得に失敗しました');
      const data = await response.json();
      setVendors(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filterOptions.status !== 'ALL') {
        queryParams.append('status', filterOptions.status);
      }
      if (filterOptions.dateRange !== 'ALL') {
        queryParams.append('dateRange', filterOptions.dateRange);
      }
      if (filterOptions.vendorId !== 'ALL') {
        queryParams.append('vendorId', filterOptions.vendorId);
      }
      if (filterOptions.searchQuery) {
        queryParams.append('search', filterOptions.searchQuery);
      }

      const response = await fetch(`/api/invoices/summary?${queryParams}`);
      if (!response.ok) throw new Error('データの取得に失敗しました');
      const data = await response.json();
      setInvoices(data.invoices);
      setStats(data.stats);
    } catch (error) {
      console.error('Error:', error);
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: InvoiceStatusEnum) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBulkRegisterPayment = async (paymentData: PaymentData) => {
    try {
      const response = await fetch('/api/invoices/bulk-register-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceIds: selectedInvoices,
          ...paymentData,
        }),
      });

      if (!response.ok) throw new Error('一括支払記録の登録に失敗しました');

      // データを再取得
      await fetchInvoices();
      setSelectedInvoices([]);
    } catch (error) {
      console.error('Error:', error);
      setError('一括支払記録の登録に失敗しました');
    }
  };

  const handleExport = async () => {
    try {
      // フィルター条件を含めて全データを取得
      const queryParams = new URLSearchParams();
      if (filterOptions.status !== 'ALL') {
        queryParams.append('status', filterOptions.status);
      }
      if (filterOptions.dateRange !== 'ALL') {
        queryParams.append('dateRange', filterOptions.dateRange);
      }
      if (filterOptions.vendorId !== 'ALL') {
        queryParams.append('vendorId', filterOptions.vendorId);
      }
      if (filterOptions.searchQuery) {
        queryParams.append('search', filterOptions.searchQuery);
      }
      queryParams.append('export', 'true'); // 全件取得フラグ

      const response = await fetch(`/api/invoices/summary?${queryParams}`);
      if (!response.ok) throw new Error('データの取得に失敗しました');
      const data = await response.json();

      const csv = generatePaymentHistoryCSV(data.invoices);
      const filename = `payment-history-${format(new Date(), 'yyyyMMdd')}.csv`;
      downloadCSV(csv, filename);
    } catch (error) {
      console.error('Error:', error);
      setError('エクスポートに失敗しました');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">支払管理ダッシュボード</h1>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            CSVエクスポート
          </button>
        </div>

        {/* フィルターセクション */}
        <div className="bg-white shadow rounded-lg mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <select
                value={filterOptions.status}
                onChange={(e) => setFilterOptions({
                  ...filterOptions,
                  status: e.target.value as InvoiceStatusEnum | 'ALL'
                })}
                className="w-full border rounded-md p-2"
              >
                <option value="ALL">すべて</option>
                <option value="SENT">送信済み</option>
                <option value="PAID">支払済み</option>
                <option value="OVERDUE">期限超過</option>
                <option value="CANCELLED">キャンセル</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                期間
              </label>
              <select
                value={filterOptions.dateRange}
                onChange={(e) => setFilterOptions({
                  ...filterOptions,
                  dateRange: e.target.value as FilterOptions['dateRange']
                })}
                className="w-full border rounded-md p-2"
              >
                <option value="ALL">すべて</option>
                <option value="THIS_MONTH">今月</option>
                <option value="LAST_MONTH">先月</option>
                <option value="THIS_YEAR">今年</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                取引先
              </label>
              <select
                value={filterOptions.vendorId}
                onChange={(e) => setFilterOptions({
                  ...filterOptions,
                  vendorId: e.target.value
                })}
                className="w-full border rounded-md p-2"
              >
                <option value="ALL">すべて</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                検���
              </label>
              <input
                type="text"
                value={filterOptions.searchQuery}
                onChange={(e) => setFilterOptions({
                  ...filterOptions,
                  searchQuery: e.target.value
                })}
                placeholder="請求書番号、取引先名など"
                className="w-full border rounded-md p-2"
              />
            </div>
          </div>
        </div>

        {/* 一括支払ボタン */}
        {selectedInvoices.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setIsBulkPaymentModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              選択した請求書の支払を登録 ({selectedInvoices.length}件)
            </button>
          </div>
        )}

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">未払い合計</h3>
            <p className="text-2xl font-bold text-gray-900">
              ¥{stats.totalUnpaid.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">支払期限超過</h3>
            <p className="text-2xl font-bold text-red-600">
              ¥{stats.totalOverdue.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">支払済み（今月）</h3>
            <p className="text-2xl font-bold text-green-600">
              ¥{stats.totalPaid.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">今週の支払予定</h3>
            <p className="text-2xl font-bold text-blue-600">
              ¥{stats.upcomingPayments.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 請求書一覧 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium mb-4">請求書一覧</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          const newSelected = e.target.checked
                            ? invoices
                                .filter(invoice => invoice.status !== 'PAID')
                                .map(invoice => invoice.id)
                            : [];
                          setSelectedInvoices(newSelected);
                        }}
                        checked={
                          selectedInvoices.length > 0 &&
                          selectedInvoices.length === invoices.filter(i => i.status !== 'PAID').length
                        }
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      請求書番号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      取引先
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      金額
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      支払期限
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4">
                        {invoice.status !== 'PAID' && (
                          <input
                            type="checkbox"
                            checked={selectedInvoices.includes(invoice.id)}
                            onChange={(e) => {
                              setSelectedInvoices(
                                e.target.checked
                                  ? [...selectedInvoices, invoice.id]
                                  : selectedInvoices.filter(id => id !== invoice.id)
                              );
                            }}
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.vendor.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥{invoice.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(invoice.dueDate), 'yyyy/MM/dd', { locale: ja })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => {/* 詳細表示処理 */}}
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 一括支払モーダル */}
        <RegisterPaymentModal
          isOpen={isBulkPaymentModalOpen}
          onClose={() => setIsBulkPaymentModalOpen(false)}
          onSubmit={handleBulkRegisterPayment}
          totalAmount={
            invoices
              .filter(invoice => selectedInvoices.includes(invoice.id))
              .reduce((sum, invoice) => sum + Number(invoice.totalAmount), 0)
          }
          isBulkPayment={true}
          selectedCount={selectedInvoices.length}
        />
      </div>
    </Layout>
  );
} 