import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Vendor } from '@prisma/client';

export default function VendorEdit() {
  const router = useRouter();
  const { id } = router.query;
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchVendor();
    }
  }, [id]);

  async function fetchVendor() {
    try {
      const res = await fetch(`/api/vendors/${id}`);
      if (!res.ok) throw new Error('取引先の取得に失敗しました');
      const data = await res.json();
      setVendor(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vendor) return;
    try {
      const res = await fetch(`/api/vendors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendor),
      });
      if (!res.ok) throw new Error('取引先の更新に失敗しました');
      router.push(`/dashboard/vendors/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">取引先編集</h1>
            <p className="mt-2 text-sm text-gray-600">
              取引先の情報を編集できます。
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {vendor && (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 基本情報 */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">基本情報</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      会社名
                    </label>
                    <input
                      type="text"
                      value={vendor.name}
                      onChange={(e) => setVendor({ ...vendor, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      メールアドレス
                    </label>
                    <input
                      type="email"
                      value={vendor.email || ''}
                      onChange={(e) => setVendor({ ...vendor, email: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      電話番号
                    </label>
                    <input
                      type="tel"
                      value={vendor.phone || ''}
                      onChange={(e) => setVendor({ ...vendor, phone: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      担当者名
                    </label>
                    <input
                      type="text"
                      value={vendor.contactPerson || ''}
                      onChange={(e) => setVendor({ ...vendor, contactPerson: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      住所
                    </label>
                    <input
                      type="text"
                      value={vendor.address || ''}
                      onChange={(e) => setVendor({ ...vendor, address: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* 取引状況と分類 */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">取引状況と分類</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      取引状況
                    </label>
                    <select
                      value={vendor.status}
                      onChange={(e) => setVendor({ ...vendor, status: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="active">有効</option>
                      <option value="inactive">無効</option>
                      <option value="pending">保留</option>
                      <option value="suspended">停止</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      業種
                    </label>
                    <input
                      type="text"
                      value={vendor.industry || ''}
                      onChange={(e) => setVendor({ ...vendor, industry: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* 法的要件 */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">法的要件</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      事業者区分
                    </label>
                    <select
                      value={vendor.entityType}
                      onChange={(e) => setVendor({ ...vendor, entityType: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="corporation">法人</option>
                      <option value="individual">個人</option>
                      <option value="other">その他</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      登録番号
                    </label>
                    <input
                      type="text"
                      value={vendor.registrationNumber || ''}
                      onChange={(e) => setVendor({ ...vendor, registrationNumber: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      インボイス番号
                    </label>
                    <input
                      type="text"
                      value={vendor.invoiceNumber || ''}
                      onChange={(e) => setVendor({ ...vendor, invoiceNumber: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      マイナンバー
                    </label>
                    <input
                      type="text"
                      value={vendor.myNumber || ''}
                      onChange={(e) => setVendor({ ...vendor, myNumber: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* 日付情報 */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">日付情報</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      設立日
                    </label>
                    <input
                      type="date"
                      value={vendor.establishedDate ? new Date(vendor.establishedDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setVendor({ ...vendor, establishedDate: e.target.value ? new Date(e.target.value) : null })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      取引開始日
                    </label>
                    <input
                      type="date"
                      value={vendor.contractStartDate ? new Date(vendor.contractStartDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setVendor({ ...vendor, contractStartDate: e.target.value ? new Date(e.target.value) : null })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* その他 */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">その他</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    備考
                  </label>
                  <textarea
                    value={vendor.notes || ''}
                    onChange={(e) => setVendor({ ...vendor, notes: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  更新
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}