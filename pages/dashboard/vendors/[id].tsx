import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Vendor } from '@prisma/client';

export default function VendorDetail() {
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

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">取引先詳細</h1>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {vendor && (
            <div className="space-y-8">
              {/* 基本情報 */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">基本情報</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">会社名</label>
                    <p className="mt-1 text-sm text-gray-900">{vendor.name}</p>
                  </div>
                  {vendor.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                      <p className="mt-1 text-sm text-gray-900">{vendor.email}</p>
                    </div>
                  )}
                  {vendor.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">電話番号</label>
                      <p className="mt-1 text-sm text-gray-900">{vendor.phone}</p>
                    </div>
                  )}
                  {vendor.contactPerson && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">担当者</label>
                      <p className="mt-1 text-sm text-gray-900">{vendor.contactPerson}</p>
                    </div>
                  )}
                  {vendor.address && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">住所</label>
                      <p className="mt-1 text-sm text-gray-900">{vendor.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 取引状況と分類 */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">取引状況と分類</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">取引状況</label>
                    <p className="mt-1 text-sm text-gray-900">{vendor.status}</p>
                  </div>
                  {vendor.industry && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">業種</label>
                      <p className="mt-1 text-sm text-gray-900">{vendor.industry}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 法的要件 */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">法的要件</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">事業者区分</label>
                    <p className="mt-1 text-sm text-gray-900">{vendor.entityType}</p>
                  </div>
                  {vendor.registrationNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">登録番号</label>
                      <p className="mt-1 text-sm text-gray-900">{vendor.registrationNumber}</p>
                    </div>
                  )}
                  {vendor.invoiceNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">インボイス番号</label>
                      <p className="mt-1 text-sm text-gray-900">{vendor.invoiceNumber}</p>
                    </div>
                  )}
                  {vendor.myNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">マイナンバー</label>
                      <p className="mt-1 text-sm text-gray-900">{vendor.myNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 日付情報 */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">日付情報</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {vendor.establishedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">設立日</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(vendor.establishedDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {vendor.contractStartDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">取引開始日</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(vendor.contractStartDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* その他 */}
              {vendor.notes && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">その他</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">備考</label>
                    <p className="mt-1 text-sm text-gray-900">{vendor.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  戻る
                </button>
                <Link href={`/dashboard/vendors/${vendor.id}/edit`}>
                  <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    編集
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}