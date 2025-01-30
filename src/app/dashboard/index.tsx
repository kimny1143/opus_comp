import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ExportModal from '@/components/ExportModal';

type Vendor = {
  id: string;
  name: string;
  email: string | null;
  registrationNumber: string | null;
  status: string;
  tags: string[];
  updatedAt: string;
};

type PaginationInfo = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [newTag, setNewTag] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchParams, setSearchParams] = useState({
    search: '',
    status: '',
    tags: [] as string[],
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, [searchParams]);

  async function fetchVendors() {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else if (value) {
          queryParams.append(key, value.toString());
        }
      });

      const res = await fetch(`/api/vendors?${queryParams.toString()}`);
      if (!res.ok) throw new Error('取引先の取得に失敗しました');
      const data = await res.json();
      setVendors(data.vendors);
      setPagination(data.pagination);
      setAvailableTags(data.availableTags);
    } catch (err) {
      setError(err instanceof Error ? err.message : '取引先の取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchParams(prev => ({ ...prev, page: 1 }));
  }

  function handleSort(field: string) {
    setSearchParams(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  }

  function handlePageChange(newPage: number) {
    setSearchParams(prev => ({ ...prev, page: newPage }));
  }

  async function handleBulkAction() {
    if (!bulkAction || selectedVendors.length === 0) return;

    setProcessing(true);
    try {
      const payload: any = {
        action: bulkAction,
        vendorIds: selectedVendors,
      };

      if (['addTag', 'removeTag'].includes(bulkAction) && !newTag) {
        throw new Error('タグを入力してください');
      }

      if (['addTag', 'removeTag'].includes(bulkAction)) {
        payload.tag = newTag;
      }

      const res = await fetch('/api/vendors/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('一括操作に失敗しました');

      await fetchVendors();
      setSelectedVendors([]);
      setBulkAction('');
      setNewTag('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '一括操作中にエラーが発生しました');
    } finally {
      setProcessing(false);
    }
  }

  function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelectedVendors(vendors.map(v => v.id));
    } else {
      setSelectedVendors([]);
    }
  }

  function handleSelectVendor(vendorId: string) {
    if (selectedVendors.includes(vendorId)) {
      setSelectedVendors(selectedVendors.filter(id => id !== vendorId));
    } else {
      setSelectedVendors([...selectedVendors, vendorId]);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">OPUS</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{session?.user?.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="text-sm text-red-600 hover:text-red-500"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">取引先一覧</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                className="bg-white px-4 py-2 rounded-md border hover:bg-gray-50"
              >
                フィルター
              </button>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="bg-white px-4 py-2 rounded-md border hover:bg-gray-50"
              >
                エクスポート
              </button>
              <Link
                href="/dashboard/vendors/new"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                新規登録
              </Link>
            </div>
          </div>

          {/* 検索・フィルターパネル */}
          {isFiltersVisible && (
            <div className="bg-white p-4 rounded-md shadow mb-4">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">キーワード検索</label>
                    <input
                      type="text"
                      value={searchParams.search}
                      onChange={e => setSearchParams(prev => ({ ...prev, search: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="会社名、メール、電話番号など"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ステータス</label>
                    <select
                      value={searchParams.status}
                      onChange={e => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">すべて</option>
                      <option value="active">有効</option>
                      <option value="inactive">無効</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">タグ</label>
                    <select
                      multiple
                      value={searchParams.tags}
                      onChange={e => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        setSearchParams(prev => ({ ...prev, tags: selected }));
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      {availableTags.map(tag => (
                        <option key={tag} value={tag}>
                          {tag}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchParams({
                        search: '',
                        status: '',
                        tags: [],
                        sortBy: 'updatedAt',
                        sortOrder: 'desc',
                        page: 1,
                        limit: 10,
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    リセット
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    検索
                  </button>
                </div>
              </form>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* 一括操作セクション */}
          {selectedVendors.length > 0 && (
            <div className="bg-white p-4 rounded-md shadow mb-4">
              <div className="flex items-center space-x-4">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="rounded-md border-gray-300"
                >
                  <option value="">一括操作を選択</option>
                  <option value="activate">有効化</option>
                  <option value="deactivate">無効化</option>
                  <option value="addTag">タグ追加</option>
                  <option value="removeTag">タグ削除</option>
                </select>

                {['addTag', 'removeTag'].includes(bulkAction) && (
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="タグを入力"
                    className="rounded-md border-gray-300"
                  />
                )}

                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction || processing}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {processing ? '処理中...' : '実行'}
                </button>

                <span className="text-sm text-gray-600">
                  {selectedVendors.length}件選択中
                </span>
              </div>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedVendors.length === vendors.length && vendors.length > 0}
                    />
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    会社名
                    {searchParams.sortBy === 'name' && (
                      <span className="ml-1">
                        {searchParams.sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メールアドレス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    タグ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    更新日
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedVendors.includes(vendor.id)}
                        onChange={() => handleSelectVendor(vendor.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/dashboard/vendors/${vendor.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {vendor.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.registrationNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          vendor.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {vendor.status === 'active' ? '有効' : '無効'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {vendor.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vendor.updatedAt).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                ))}
                {vendors.length === 0 && !error && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      取引先が登録されていません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          {pagination.totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === pagination.page
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {/* エクスポートモーダル */}
          <ExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            currentFilters={{
              search: searchParams.search,
              status: searchParams.status,
              tags: searchParams.tags,
            }}
          />
        </div>
      </main>
    </div>
  );
} 