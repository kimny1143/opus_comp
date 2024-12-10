import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import Layout from '@/components/Layout';
import { VendorSelect } from '@/components/VendorSelect';
import { PurchaseOrderItems } from '@/components/PurchaseOrderItems';
import { PurchaseOrderForm } from '@/types/purchaseOrder';
import { useRouter } from 'next/router';
import { TaxCalculator } from '@/components/TaxCalculator';

export default function NewPurchaseOrder() {
  const router = useRouter();
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null);
  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<PurchaseOrderForm>({
    defaultValues: {
      items: [],
      taxRate: 0.10,
      taxAmount: 0,
      totalAmount: 0
    }
  });

  const items = useWatch({
    control,
    name: "items"
  });

  const amount = watch('amount');

  useEffect(() => {
    const total = items?.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0) || 0;
    setValue('amount', total);
    
    const taxRate = watch('taxRate');
    const taxAmount = Math.floor(total * taxRate);
    setValue('taxAmount', taxAmount);
    setValue('totalAmount', total + taxAmount);
  }, [items, setValue, watch]);

  const onSubmit = async (data: PurchaseOrderForm) => {
    if (!selectedVendor) {
      alert('取引先を選択してください');
      return;
    }

    try {
      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          vendorId: selectedVendor,
        }),
      });

      if (!response.ok) {
        throw new Error('発注書の作成に失敗しました');
      }

      const result = await response.json();
      router.push(`/purchase-orders/${result.id}`);
    } catch (error) {
      console.error('Error:', error);
      alert('発注書の作成に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">新規発注書作成</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block mb-2">取引先選択</label>
            <VendorSelect
              onSelect={(vendorId) => setSelectedVendor(vendorId)}
            />
          </div>

          <div>
            <label className="block mb-2">発注日</label>
            <input
              type="date"
              {...register('orderDate', { required: '発注日は必須です' })}
              className="w-full border rounded-md p-2"
            />
            {errors.orderDate && (
              <p className="text-red-500 text-sm">{errors.orderDate.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-2">納期</label>
            <input
              type="date"
              {...register('deliveryDate', { required: '納期は必須です' })}
              className="w-full border rounded-md p-2"
            />
            {errors.deliveryDate && (
              <p className="text-red-500 text-sm">{errors.deliveryDate.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-2">発注内容</label>
            <textarea
              {...register('description', { required: '発注内容は必須です' })}
              className="w-full border rounded-md p-2 h-32"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description.message}</p>
            )}
          </div>

          <PurchaseOrderItems
            register={register}
            control={control}
            errors={errors}
            setValue={setValue}
          />

          <div>
            <label className="block mb-2">合計金額（税抜）</label>
            <input
              type="number"
              {...register('amount')}
              className="w-full border rounded-md p-2 bg-gray-100"
              readOnly
            />
          </div>

          <TaxCalculator
            register={register}
            control={control}
            amount={amount}
            setValue={setValue}
          />

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
              onClick={() => window.history.back()}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              発注書を作成
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 