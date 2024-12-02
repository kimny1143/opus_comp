import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Vendor = {
  id: string;
  name: string;
  email: string | null;
  address: string | null;
  phone: string | null;
  registrationNumber: string | null;
  contactPerson: string | null;
  status: string;
  tags: string[];
};

export default function VendorEdit() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const isNew = id === 'new';
  const [vendor, setVendor] = useState<Vendor>({
    id: '',
    name: '',
    email: '',
    address: '',
    phone: '',
    registrationNumber: '',
    contactPerson: '',
    status: 'active',
    tags: [],
  });
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!isNew && id) {
      fetchVendor();
    }
  }, [id, isNew]);

  async function fetchVendor() {
    try {
      const res = await fetch(`/api/vendors/${id}`);
      if (!res.ok) throw new Error('取引先の取得に失敗しました');
      const data = await res.json();
      setVendor(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '取引先の取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/vendors${isNew ? '' : `/${id}`}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendor),
      });

      if (!res.ok) throw new Error(isNew ? '取引先の作成に失敗しました' : '取引先の更新に失敗しました');

      router.push(isNew ? '/dashboard' : `/dashboard/vendors/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '処理中にエラーが発生しました');
    }
  }

  function handleTagAdd(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!vendor.tags.includes(tagInput.trim())) {
        setVendor({ ...vendor, tags: [...vendor.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  }

  function handleTagRemove(tagToRemove: string) {
    setVendor({
      ...vendor,
      tags: vendor.tags.filter((tag) => tag !== tagToRemove),
    });
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
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {isNew ? '取引先登録' : '取引先編集'}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                取引先の情報を{isNew ? '登録' : '編集'}します
              </p>
            </div>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="border-t border-gray-200">
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      会社名
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={vendor.name}
                      onChange={(e) => setVendor({ ...vendor, name: e.target.value })}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      メールアドレス
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={vendor.email || ''}
                      onChange={(e) => setVendor({ ...vendor, email: e.target.value })}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      住所
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={vendor.address || ''}
                      onChange={(e) => setVendor({ ...vendor, address: e.target.value })}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      電話番号
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={vendor.phone || ''}
                      onChange={(e) => setVendor({ ...vendor, phone: e.target.value })}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                      登録番号
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      id="registrationNumber"
                      value={vendor.registrationNumber || ''}
                      onChange={(e) => setVendor({ ...vendor, registrationNumber: e.target.value })}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">
                      担当者
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      id="contactPerson"
                      value={vendor.contactPerson || ''}
                      onChange={(e) => setVendor({ ...vendor, contactPerson: e.target.value })}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      ステータス
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={vendor.status}
                      onChange={(e) => setVendor({ ...vendor, status: e.target.value })}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="active">有効</option>
                      <option value="inactive">無効</option>
                    </select>
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                      タグ
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagAdd}
                        placeholder="Enterで追加"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      <div className="mt-2 flex flex-wrap gap-2">
                        {vendor.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleTagRemove(tag)}
                              className="ml-1 text-indigo-600 hover:text-indigo-500"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-3">
                <Link
                  href={isNew ? '/dashboard' : `/dashboard/vendors/${id}`}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  キャンセル
                </Link>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {isNew ? '登録' : '更新'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 