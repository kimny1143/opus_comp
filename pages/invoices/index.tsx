import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { Plus, Search, Trash2, RefreshCw } from 'lucide-react';
import type { Invoice, Vendor } from '@prisma/client';
import { debounce } from 'lodash';
import { statusOptions } from '@/lib/utils/status';

type ExtendedInvoice = Invoice & {
  vendor: Vendor;
  statusHistory: {
    status: string;
    createdAt: Date;
  }[];
};

interface FilterState {
  startDate: string;
  endDate: string;
  status: string;
  vendorId: string;
  searchQuery: string;
}

interface PaginationInfo {
  total: number;
  pages: number;
  currentPage: number;
  itemsPerPage: number;
}

// ステータス表示用のユーティリティ関数
const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'cancelled':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'draft': return '下書き';
    case 'sent': return '送信済み';
    case 'paid': return '支払済み';
    case 'overdue': return '支払期限超過';
    case 'cancelled': return 'キャンセル';
    default: return status;
  }
};

export default function Invoices() {
  const router = useRouter();
  const { data: session } = useSession();
  const [invoices, setInvoices] = useState<ExtendedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // フィルター状態
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    status: 'all',
    vendorId: '',
    searchQuery: '',
  });

  // ページネーション状態
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 0,
    currentPage: 1,
    itemsPerPage: 10,
  });

  // 請求書一覧の取得
  const fetchInvoices = useCallback(async (filters: FilterState, page: number) => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.vendorId) params.append('vendorId', filters.vendorId);
      if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);
      params.append('page', page.toString());
      params.append('limit', pagination.itemsPerPage.toString());

      const response = await fetch(`/api/invoices?${params.toString()}`);
      if (!response.ok) throw new Error('請求書の取得に失敗しました');
      const data = await response.json();
      setInvoices(data.invoices);
      setPagination(data.pagination);
    } catch (error) {
      setError(error instanceof Error ? error.message : '請求書の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [pagination.itemsPerPage]);

  // 検索の実行（デバウンス処理）
  const debouncedFetch = useCallback(
    debounce((filters: FilterState) => {
      fetchInvoices(filters, pagination.currentPage);
    }, 300),
    [fetchInvoices, pagination.currentPage]
  );

  // フィルター変更時の処理
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
    debouncedFetch(filters);
  }, [filters, debouncedFetch]);

  // 取引先一覧の取得
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('/api/vendors');
        if (!response.ok) throw new Error('取引先の取得に失敗しました');
        const data = await response.json();
        setVendors(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : '取引先の取得に失敗しました');
      }
    };
    fetchVendors();
  }, []);

  // ページ変更ハンドラー
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
    fetchInvoices(filters, newPage);
  };

  // 一括処理の実行
  const handleBulkAction = async () => {
    if (!selectedInvoices.length || !bulkAction) return;
    
    setBulkProcessing(true);
    try {
      const response = await fetch('/api/invoices/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceIds: selectedInvoices,
          action: bulkAction,
          status: bulkStatus,
        }),
      });

      if (!response.ok) throw new Error('一括処理に失敗しました');

      // 一覧を再取得
      await fetchInvoices(filters, pagination.currentPage);
      
      // 選択をリセット
      setSelectedInvoices([]);
      setBulkAction('');
      setBulkStatus('');
    } catch (error) {
      setError(error instanceof Error ? error.message : '一括処理に失敗しました');
    } finally {
      setBulkProcessing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>請求書一覧 - OPUS</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">請求書一覧</h1>
          <button
            onClick={() => router.push('/invoices/new')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規作成
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* フィルターセクション */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="all">すべて</option>
                <option value="draft">下書き</option>
                <option value="sent">送信済み</option>
                <option value="paid">支払済み</option>
                <option value="overdue">支払期限超過</option>
                <option value="cancelled">キャンセル</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                検索
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  placeholder="請求書番号または取引先名で検索"
                  className="w-full px-3 py-2 pl-10 border rounded-md"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                発行日（開始）
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                発行日（終了）
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                取引先
              </label>
              <select
                value={filters.vendorId}
                onChange={(e) => setFilters(prev => ({ ...prev, vendorId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">すべて</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 一括処理コントロール */}
        {selectedInvoices.length > 0 && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {selectedInvoices.length}件選択中
            </span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">アクションを選択</option>
              <option value="updateStatus">ステータス一括更新</option>
              <option value="delete">一括削除</option>
            </select>
            {bulkAction === 'updateStatus' && (
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">ステータスを選択</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || bulkProcessing}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {bulkProcessing ? '処理中...' : '実行'}
            </button>
          </div>
        )}

        {/* 請求書一覧テーブル */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedInvoices.length === invoices.length}
                    onChange={(e) => {
                      setSelectedInvoices(
                        e.target.checked ? invoices.map(invoice => invoice.id) : []
                      );
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  請求書番号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  取引先
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  発行日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  支払期限
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  onClick={() => router.push(`/invoices/${invoice.id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={(e) => {
                        setSelectedInvoices(prev =>
                          e.target.checked
                            ? [...prev, invoice.id]
                            : prev.filter(id => id !== invoice.id)
                        );
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {invoice.vendor.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(invoice.issueDate).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(invoice.dueDate).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    ¥{(invoice.totalAmount + invoice.taxAmount).toLocaleString()}
                    <div className="text-xs text-gray-500">
                      (税込)
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      getStatusBadgeColor(invoice.status)
                    }`}>
                      {getStatusLabel(invoice.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            全{pagination.total}件中 {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
            -{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.total)}件を表示
          </div>
          <div className="flex space-x-2">
            {/* 最初のページへ */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              ≪
            </button>
            {/* 前のページへ */}
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              ＜
            </button>
            
            {/* ページ番号 */}
            {[...Array(pagination.pages)].map((_, i) => {
              const pageNum = i + 1;
              if (
                pageNum === 1 ||
                pageNum === pagination.pages ||
                Math.abs(pageNum - pagination.currentPage) <= 2
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 border rounded-md ${
                      pageNum === pagination.currentPage
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              if (
                pageNum === pagination.currentPage - 3 ||
                pageNum === pagination.currentPage + 3
              ) {
                return <span key={pageNum}>...</span>;
              }
              return null;
            })}

            {/* 次のページへ */}
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.pages}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              ＞
            </button>
            {/* 最後のページへ */}
            <button
              onClick={() => handlePageChange(pagination.pages)}
              disabled={pagination.currentPage === pagination.pages}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              ≫
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 