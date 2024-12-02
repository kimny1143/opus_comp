import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Vendor } from '@prisma/client';
import Link from 'next/link';
import { Pencil as PencilIcon, ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import { GetServerSideProps } from 'next';
import { prisma } from '@/lib/prisma';

export default function VendorDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchVendor();
    }
  }, [id]);

  const fetchVendor = async () => {
    try {
      const response = await fetch(`/api/vendors/${id}`);
      if (response.ok) {
        const data = await response.json();
        setVendor(data);
      } else {
        throw new Error('取引先の取得に失敗しました');
      }
    } catch (error) {
      console.error('Error fetching vendor:', error);
      alert('取引先の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!vendor) {
    return <div className="flex justify-center items-center h-screen">取引先が見つかりません</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">{vendor.name}</h1>
        </div>
        <Link
          href={`/vendors/edit/${vendor.id}`}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <PencilIcon className="w-4 h-4 mr-2" />
          編集
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">会社情報</h3>
            <dl className="mt-3 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">会社名</dt>
                <dd className="mt-1 text-sm text-gray-900">{vendor.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">登録番号</dt>
                <dd className="mt-1 text-sm text-gray-900">{vendor.registrationNumber || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">ステータス</dt>
                <dd className="mt-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    vendor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {vendor.status === 'active' ? '有効' : '無効'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">連絡先情報</h3>
            <dl className="mt-3 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">担当者名</dt>
                <dd className="mt-1 text-sm text-gray-900">{vendor.contactPerson || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
                <dd className="mt-1 text-sm text-gray-900">{vendor.email || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">電話番号</dt>
                <dd className="mt-1 text-sm text-gray-900">{vendor.phone || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">住所</dt>
                <dd className="mt-1 text-sm text-gray-900">{vendor.address || '-'}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-500">システム情報</h3>
          <dl className="mt-3 space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">作成日時</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(vendor.createdAt).toLocaleString('ja-JP')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">最終更新日時</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(vendor.updatedAt).toLocaleString('ja-JP')}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
} 