'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { calculateItemTax, TaxableItem } from '@/domains/invoice/tax'
import { InvoiceItem } from '@/types/invoice'

interface InvoiceFormProps {
  invoice?: {
    id: string
    invoiceNumber: string | null
    status: string
    issueDate: string | Date
    dueDate: string | Date
    totalAmount: string
    notes: string | null
    items: Array<{
      id: string
      itemName: string
      quantity: number
      unitPrice: string
      taxRate: string
      description: string | null
    }>
    vendor: {
      id: string
      name: string
      registrationNumber: string | null
      address: string | null
    }
  }
  mode?: 'create' | 'edit'
}

export function InvoiceForm({ invoice, mode = 'edit' }: InvoiceFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const formatDateForInput = (date?: string | Date) => {
    if (!date) return ''
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d.getTime())) return ''
    return d.toISOString().split('T')[0]
  }

  const calculateItemTotal = (item: NonNullable<InvoiceFormProps['invoice']>['items'][0]) => {
    const taxableItem: TaxableItem = {
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      taxRate: Number(item.taxRate)
    };
    const { taxableAmount, taxAmount } = calculateItemTax(taxableItem);
    return taxableAmount + taxAmount;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    try {
      const response = await fetch(mode === 'create' ? '/api/invoices' : `/api/invoices/${invoice?.id}`, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceNumber: formData.get('invoiceNumber'),
          status: formData.get('status'),
          issueDate: new Date(formData.get('issueDate') as string).toISOString(),
          dueDate: new Date(formData.get('dueDate') as string).toISOString(),
          notes: formData.get('notes'),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'エラーが発生しました')
      }

      router.push('/invoices')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="invoice-form">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            請求書番号
          </label>
          <input
            type="text"
            name="invoiceNumber"
            defaultValue={invoice?.invoiceNumber || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            data-testid="invoice-number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            金額
          </label>
          <input
            type="number"
            name="amount"
            defaultValue={invoice?.totalAmount || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            data-testid="amount"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            税率 (%)
          </label>
          <input
            type="number"
            name="taxRate"
            defaultValue="10"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            data-testid="tax-rate"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            ステータス
          </label>
          <select
            name="status"
            defaultValue={invoice?.status || 'DRAFT'}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            data-testid="status"
          >
            <option value="DRAFT">下書き</option>
            <option value="PENDING">保留中</option>
            <option value="APPROVED">承認済み</option>
            <option value="REJECTED">却下</option>
            <option value="PAID">支払済み</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            発行日
          </label>
          <input
            type="date"
            name="issueDate"
            defaultValue={formatDateForInput(invoice?.issueDate)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            支払期限
          </label>
          <input
            type="date"
            name="dueDate"
            defaultValue={formatDateForInput(invoice?.dueDate)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          備考
        </label>
        <textarea
          name="notes"
          defaultValue={invoice?.notes || ''}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {invoice && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-medium mb-6">請求項目</h3>
          <div className="space-y-4">
            {invoice.items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">品目名</label>
                  <div className="mt-1 text-sm">{item.itemName}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">数量</label>
                  <div className="mt-1 text-sm">{item.quantity}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">単価</label>
                  <div className="mt-1 text-sm">{Number(item.unitPrice).toLocaleString()}円</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">税率</label>
                  <div className="mt-1 text-sm">{item.taxRate}%</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">小計</label>
                  <div className="mt-1 text-sm">
                    {(Number(item.unitPrice) * item.quantity).toLocaleString()}円
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-right">
              <div className="text-lg font-medium text-gray-900">
                合計金額: {Number(invoice.totalAmount).toLocaleString()}円
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          data-testid="cancel-button"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
          data-testid="submit"
        >
          保存
        </button>
      </div>

      {invoice && (
        <div className="mt-6">
          <div className="text-right space-y-2">
            <div data-testid="invoice-subtotal">
              小計: {Number(invoice.totalAmount).toLocaleString()}円
            </div>
            <div data-testid="invoice-tax">
              消費税: {(Number(invoice.totalAmount) * 0.1).toLocaleString()}円
            </div>
            <div data-testid="invoice-total" className="text-lg font-bold">
              合計: {(Number(invoice.totalAmount) * 1.1).toLocaleString()}円
            </div>
          </div>
        </div>
      )}
    </form>
  )
}