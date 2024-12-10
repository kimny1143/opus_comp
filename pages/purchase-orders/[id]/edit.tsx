import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { ArrowLeft, Plus } from 'lucide-react';
import { PurchaseOrder, Vendor, PurchaseOrderItem, PurchaseOrderStatusEnum } from '@prisma/client';
import { ItemsTable } from '@/components/purchase-orders/ItemsTable';
import { OrderSummary } from '@/components/purchase-orders/OrderSummary';
import { Decimal } from '@prisma/client/runtime/library';

type ExtendedPurchaseOrder = PurchaseOrder & {
  vendor: Vendor;
  items: PurchaseOrderItem[];
};

export default function EditPurchaseOrder() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<ExtendedPurchaseOrder>({
    id: '',
    orderNumber: '',
    vendorId: '',
    orderDate: new Date(),
    deliveryDate: null,
    description: '',
    terms: '',
    totalAmount: new Decimal(0),
    taxAmount: new Decimal(0),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '',
    status: PurchaseOrderStatusEnum.DRAFT,
    vendor: {} as Vendor,
    items: [],
  });

  // 発注書データの取得
  useEffect(() => {
    if (id) {
      fetchOrder();
      fetchVendors();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/purchase-orders/${id}`);
      if (!response.ok) throw new Error('発注書の取得に失敗しました');
      const data: ExtendedPurchaseOrder = await response.json();
      
      setFormData({
        ...data,
        orderDate: new Date(data.orderDate),
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : '発注書の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

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

  // 明細行の追加
  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: '',
          purchaseOrderId: prev.id,
          itemName: '',
          description: '',
          quantity: 1,
          unitPrice: new Decimal(0),
          taxRate: new Decimal(0.1),
          amount: new Decimal(0),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    }));
  };

  // 明細行の削除
  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // 明細行の更新と額計算
  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]:
          field === 'quantity'
            ? Number(value)
            : field === 'unitPrice' || field === 'taxRate'
            ? new Decimal(value)
            : value,
      };
      // 金額の自動計算
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].amount = new Decimal(newItems[index].quantity).mul(newItems[index].unitPrice);
      }

      // 合計金額の計算
      const subtotal = newItems.reduce((sum, item) => sum.plus(item.amount), new Decimal(0));
      const taxAmount = newItems.reduce(
        (sum, item) => sum.plus(item.amount.mul(item.taxRate)),
        new Decimal(0)
      );

      return {
        ...prev,
        items: newItems,
        totalAmount: subtotal,
        taxAmount: taxAmount,
      };
    });
  };

  // 発注書の更新
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/purchase-orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '発注書の更新に失敗しました');
      }

      router.push(`/purchase-orders/${id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : '発注書の更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>発注書編集 - OPUS</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">発注書編集</h1>
          </div>

          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
            {/* 基本情報 */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  取引先
                </label>
                <select
                  value={formData.vendorId}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendorId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">選択してください</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  発注日
                </label>
                <input
                  type="date"
                  value={new Date(formData.orderDate).toISOString().split('T')[0]}
                  onChange={(e) => setFormData(prev => ({ ...prev, orderDate: new Date(e.target.value) }))}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  納期
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate ? new Date(formData.deliveryDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value ? new Date(e.target.value) : null }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            {/* 明細 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">明細</h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  明細を追加
                </button>
              </div>

              <ItemsTable
                items={formData.items}
                editable={true}
                onItemChange={handleItemChange}
                onItemRemove={handleRemoveItem}
              />

              <OrderSummary
                className="mt-4"
                subtotal={formData.totalAmount.toNumber()}
                taxAmount={formData.taxAmount.toNumber()}
              />
            </div>

            {/* 備考・取引条件 */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備考
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  取引条件
                </label>
                <textarea
                  value={formData.terms || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 