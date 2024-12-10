import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';

// ステータスの定義
const VendorStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
} as const;

// 事業者区分の定義
const EntityType = {
  CORPORATION: 'corporation',
  INDIVIDUAL: 'individual',
  OTHER: 'other',
} as const;

// バリデーションスキーマ
const vendorSchema = z.object({
  // 基本情報
  name: z.string().min(1, { message: '会社名は必須です' }),
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }).nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  contactPerson: z.string().nullable().optional(),
  
  // 取引状況と分類
  status: z.enum([
    VendorStatus.ACTIVE,
    VendorStatus.INACTIVE,
    VendorStatus.PENDING,
    VendorStatus.SUSPENDED
  ]).default(VendorStatus.ACTIVE),
  industry: z.string().optional(),
  
  // 法的要件
  entityType: z.enum([
    EntityType.CORPORATION,
    EntityType.INDIVIDUAL,
    EntityType.OTHER
  ]),
  registrationNumber: z.string().nullable().optional(),
  invoiceNumber: z.string().nullable().optional(),
  myNumber: z.string().nullable().optional(),
  
  // 日付情報
  establishedDate: z.string().nullable().optional(),
  contractStartDate: z.string().nullable().optional(),
  
  // その他
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
});

type VendorFormData = z.infer<typeof vendorSchema>;

export default function VendorCreate() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(router.asPath));
    },
  });

  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      status: VendorStatus.ACTIVE,
      entityType: EntityType.CORPORATION,
      tags: [],
    },
  });

  // セッション状態の監視
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(router.asPath));
    }
  }, [status, session, router]);

  // ローディング状態の表示
  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  async function onSubmit(data: VendorFormData) {
    try {
      console.log('Form data:', data);
  
      const formData = {
        ...data,
        establishedDate: data.establishedDate ? new Date(data.establishedDate).toISOString() : null,
        contractStartDate: data.contractStartDate ? new Date(data.contractStartDate).toISOString() : null,
      };
  
      console.log('Processed form data:', formData);
  
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (!res.ok) {
        let errorMessage = '取引先の作成に失敗しました';
        const contentType = res.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await res.json();
          console.log('Error response:', errorData);
          errorMessage = errorData.message || errorMessage;
        } else {
          const errorText = await res.text();
          console.log('Error response:', errorText);
        }
        throw new Error(errorMessage);
      }
  
      const result = await res.json();
      console.log('Success response:', result);
      router.push('/dashboard/vendors');
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : '取引先の作成中にエラーが発生しました');
    }
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">新規取引先登録</h1>
            <p className="mt-2 text-sm text-gray-600">
              取引先の基本情報を入力してください。<span className="text-red-500">*</span> は必須項目です。
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* 基本情報 */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">基本情報</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    会社名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    担当者名
                  </label>
                  <input
                    type="text"
                    {...register('contactPerson')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    住所
                  </label>
                  <input
                    type="text"
                    {...register('address')}
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
                    {...register('status')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value={VendorStatus.ACTIVE}>有効</option>
                    <option value={VendorStatus.INACTIVE}>無効</option>
                    <option value={VendorStatus.PENDING}>保留</option>
                    <option value={VendorStatus.SUSPENDED}>停止</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    業種
                  </label>
                  <input
                    type="text"
                    {...register('industry')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="例: IT、製造業、サービス業"
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
                    事業者区分 <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('entityType')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value={EntityType.CORPORATION}>法人</option>
                    <option value={EntityType.INDIVIDUAL}>個人事業主</option>
                    <option value={EntityType.OTHER}>その他</option>
                  </select>
                  {errors.entityType && (
                    <p className="mt-1 text-sm text-red-600">{errors.entityType.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    登録番号
                  </label>
                  <input
                    type="text"
                    {...register('registrationNumber')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="法人番号を入力"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    インボイス番号
                  </label>
                  <input
                    type="text"
                    {...register('invoiceNumber')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="適格請求書発行事業者登録番号"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    マイナンバー
                  </label>
                  <input
                    type="text"
                    {...register('myNumber')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="個人事業主の場合のみ"
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
                    {...register('establishedDate')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    取引開始日
                  </label>
                  <input
                    type="date"
                    {...register('contractStartDate')}
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
                  {...register('notes')}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="追加情報や特記事項があれば入力してください"
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
                登録
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
