import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { PurchaseOrder, Vendor, PurchaseOrderStatusEnum } from '@prisma/client';
import { StatusBadge } from '@/components/purchase-orders/StatusBadge';
import { debounce } from 'lodash';

type ExtendedPurchaseOrder = PurchaseOrder & {
  vendor: Vendor;
  statusHistory: {
    status: PurchaseOrderStatusEnum;
    createdAt: Date;
  }[];
};

interface FilterState {
  startDate: string;
  endDate: string;
  status: PurchaseOrderStatusEnum | '';
  vendorId: string;
  searchQuery: string;
}

interface PaginationInfo {
  total: number;
  pages: number;
  currentPage: number;
  itemsPerPage: number;
}

export default function PurchaseOrders() {
  const router = useRouter();
  const { data: session } = useSession();
  const [orders, setOrders] = useState<ExtendedPurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 0,
    currentPage: 1,
    itemsPerPage: 10,
  });

  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    status: '',
    vendorId: '',
    searchQuery: '',
  });

  // 発注書一覧の取得
  const fetchOrders = useCallback(async (filters: FilterState, page: number) => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status !== '') params.append('status', filters.status);
      if (filters.vendorId) params.append('vendorId', filters.vendorId);
      if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);
      params.append('page', page.toString());
      params.append('limit', pagination.itemsPerPage.toString());

      const response = await fetch(`/api/purchase-orders?${params.toString()}`);
      if (!response.ok) throw new Error('発注書の取得に失敗しました');
      const data = await response.json();
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      setError(error instanceof Error ? error.message : '発注書の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [pagination.itemsPerPage]);

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

  // 検索処理
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setFilters(prev => ({ ...prev, searchQuery: query }));
    }, 500),
    []
  );

  // フィルター適用
  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // ページネーション
  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.pages) return;
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  return (
    <>
      <Head>
        <title>発注書一覧 - OPUS</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">発注書一覧</h1>
          <button
            onClick={() => router.push('/purchase-orders/new')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規作成
          </button>
        </div>

        {/* フィルター */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                発注日（開始）
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                発注日（終了）
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">すべて</option>
                {Object.values(PurchaseOrderStatusEnum).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                取引先
              </label>
              <select
                value={filters.vendorId}
                onChange={(e) => handleFilterChange('vendorId', e.target.value)}
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
          <div className="mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="発注番号、取引先名で検索"
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-md"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* ��注書一覧 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  発注番号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  取引先
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  発注日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  納期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => router.push(`/purchase-orders/${order.id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.vendor.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.deliveryDate
                      ? new Date(order.deliveryDate).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ¥{order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.statusHistory[0]?.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              ≪
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              ＜
            </button>
            {/* ページ番号 */}
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
              (pageNum) => {
                if (
                  pageNum === 1 ||
                  pageNum === pagination.pages ||
                  (pageNum >= pagination.currentPage - 2 &&
                    pageNum <= pagination.currentPage + 2)
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
              }
            )}
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.pages}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              ＞
            </button>
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