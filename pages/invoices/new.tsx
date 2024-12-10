import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Vendor, PurchaseOrder } from '@prisma/client';

interface InvoiceItem {
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

interface InvoiceFormData {
  purchaseOrderId: string;
  vendorId: string;
  issueDate: string;
  dueDate: string;
  paymentMethod: string;
  bankAccount: string;
  notes: string;
  items: InvoiceItem[];
}

export default function NewInvoice() {
  const router = useRouter();
  const { data: session } = useSession();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<InvoiceFormData>({
    purchaseOrderId: '',
    vendorId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentMethod: '',
    bankAccount: '',
    notes: '',
    items: [],
  });

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

  // 選択された取引先の発注書一覧を取得
  useEffect(() => {
    if (formData.vendorId) {
      const fetchPurchaseOrders = async () => {
        try {
          const response = await fetch(`/api/purchase-orders?vendorId=${formData.vendorId}&status=accepted`);
          if (!response.ok) throw new Error('発注書の取得に失敗しました');
          const data = await response.json();
          setPurchaseOrders(data.orders);
        } catch (error) {
          setError(error instanceof Error ? error.message : '発注書の取得に失敗しました');
        }
      };
      fetchPurchaseOrders();
    }
  }, [formData.vendorId]);

  // 発注書が選択された時の処理
  const handlePurchaseOrderSelect = async (purchaseOrderId: string) => {
    try {
      const response = await fetch(`/api/purchase-orders/${purchaseOrderId}`);
      if (!response.ok) throw new Error('発注書の取得に失敗しました');
      const order = await response.json();

      // 発注書の明細から請求書の明細を生成
      setFormData(prev => ({
        ...prev,
        purchaseOrderId,
        items: order.items.map((item: any) => ({
          itemName: item.itemName,
          description: item.description || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          amount: item.amount,
        })),
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : '発注書の取得に失敗しました');
    }
  };

  // 請求書の保存
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '請求書の作成に失敗しました');
      }

      const data = await response.json();
      router.push(`/invoices/${data.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : '請求書の作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>新規請求書作成 - OPUS</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">新規請求書作成</h1>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
            {/* 基本情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  取引先
                </label>
                <select
                  required
                  value={formData.vendorId}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendorId: e.target.value }))}
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

              {formData.vendorId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    関連発注書
                  </label>
                  <select
                    value={formData.purchaseOrderId}
                    onChange={(e) => handlePurchaseOrderSelect(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">選択してください</option>
                    {purchaseOrders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.orderNumber}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  発行日
                </label>
                <input
                  type="date"
                  required
                  value={formData.issueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  支払期限
                </label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  支払方法
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">選択してください</option>
                  <option value="bank_transfer">銀行振込</option>
                  <option value="credit_card">クレジットカード</option>
                  <option value="cash">現金</option>
                </select>
              </div>

              {formData.paymentMethod === 'bank_transfer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    振込先口座情報
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccount}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankAccount: e.target.value }))}
                    placeholder="例：〇〇銀行 △△支店 普通 1234567"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              )}
            </div>

            {/* 明細行 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">明細</h3>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    items: [
                      ...prev.items,
                      {
                        itemName: '',
                        description: '',
                        quantity: 1,
                        unitPrice: 0,
                        taxRate: 0.1,
                        amount: 0,
                      },
                    ],
                  }))}
                  className="flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  明細を追加
                </button>
              </div>

              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 mb-4 items-start">
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="品目名"
                      required
                      value={item.itemName}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index] = { ...newItems[index], itemName: e.target.value };
                        setFormData(prev => ({ ...prev, items: newItems }));
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="数量"
                      required
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        const quantity = parseInt(e.target.value);
                        newItems[index] = {
                          ...newItems[index],
                          quantity,
                          amount: quantity * item.unitPrice,
                        };
                        setFormData(prev => ({ ...prev, items: newItems }));
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="単価"
                      required
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        const unitPrice = parseInt(e.target.value);
                        newItems[index] = {
                          ...newItems[index],
                          unitPrice,
                          amount: item.quantity * unitPrice,
                        };
                        setFormData(prev => ({ ...prev, items: newItems }));
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      value={item.taxRate}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index] = { ...newItems[index], taxRate: parseFloat(e.target.value) };
                        setFormData(prev => ({ ...prev, items: newItems }));
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="0.1">10%</option>
                      <option value="0.08">8%</option>
                      <option value="0">0%</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <span className="block px-3 py-2">
                      ¥{item.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => {
                        const newItems = formData.items.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, items: newItems }));
                      }}
                      className="p-2 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 合計金額 */}
            <div className="mb-6 border-t pt-4">
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between mb-2">
                    <span>小計:</span>
                    <span>¥{formData.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>消費税:</span>
                    <span>
                      ¥{formData.items
                        .reduce((sum, item) => sum + (item.amount * item.taxRate), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>合計:</span>
                    <span>
                      ¥{formData.items
                        .reduce((sum, item) => sum + (item.amount * (1 + item.taxRate)), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 備考 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                備考
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
              />
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
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '保存中...' : '請求書を作成'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 