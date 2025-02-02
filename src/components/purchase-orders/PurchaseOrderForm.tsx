'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  purchaseOrderSchema, 
  type PurchaseOrderFormData, 
  PURCHASE_ORDER_STATUS_OPTIONS 
} from './schemas/purchaseOrderSchema'
import { BaseFormWrapper } from '@/components/shared/form/BaseFormWrapper'
import { SelectField } from '@/components/shared/form/SelectField'
import { InputField } from '@/components/shared/form/InputField'
import { DateField } from '@/components/shared/form/DateField'
import { TagField } from '@/components/shared/form/TagField'
import { OrderItemsForm } from '@/components/shared/form/OrderItemsForm'
import { type Item } from '@/types/validation/commonValidation'
import { useToast } from '@/components/ui/toast/use-toast'
import { useEffect, useState } from 'react'
import { Prisma } from '@prisma/client'

interface Vendor {
  id: string
  name: string
  code: string
}

interface PurchaseOrderFormProps {
  mode: 'create' | 'edit'
  id?: string
  initialData?: Partial<PurchaseOrderFormDataWithRHF>
  initialVendors?: Vendor[]
  onSubmit?: (data: PurchaseOrderFormData) => Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
  readOnly?: boolean
}

// PurchaseOrderFormDataを拡張して、itemsをItem[]として定義
type PurchaseOrderFormDataWithRHF = Omit<PurchaseOrderFormData, 'items'> & {
  items: Array<Omit<Item, 'quantity' | 'unitPrice' | 'taxRate' | 'amount'> & {
    quantity: number
    unitPrice: number
    taxRate: number
    amount?: number
  }>
}

const baseDefaultValues: PurchaseOrderFormDataWithRHF = {
  status: 'DRAFT',
  orderDate: new Date(),
  deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  items: [{
    itemName: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 0.1,
    description: ''
  }],
  notes: '',
  tags: [],
  vendorId: ''
}

export function PurchaseOrderForm({
  mode,
  id,
  initialData,
  initialVendors = [],
  onSubmit,
  isSubmitting = false,
  onCancel,
  readOnly = false
}: PurchaseOrderFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const defaultValues = {
    ...baseDefaultValues,
    ...initialData
  }

  const form = useForm<PurchaseOrderFormDataWithRHF>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues
  })

  // フォームの状態変更を監視
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // vendorIdが変更された場合の処理
      if (name === 'vendorId' && value.vendorId) {
        // 取引先情報の取得など
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const handleSubmit = async (data: PurchaseOrderFormDataWithRHF) => {
    try {
      setIsLoading(true)

      // フォームデータをAPIに送信する形式に変換
      const apiData: PurchaseOrderFormData = {
        ...data,
        items: data.items.map(item => ({
          ...item,
          quantity: new Prisma.Decimal(item.quantity),
          unitPrice: new Prisma.Decimal(item.unitPrice),
          taxRate: new Prisma.Decimal(item.taxRate),
          amount: item.amount ? new Prisma.Decimal(item.amount) : undefined
        }))
      }

      if (!onSubmit) {
        // create modeの場合は、APIに直接送信
        const response = await fetch('/api/purchase-orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(apiData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || '発注書の作成に失敗しました')
        }

        toast({
          title: '成功',
          description: '発注書を作成しました',
        })

        // 一覧ページにリダイレクト
        window.location.href = '/purchase-orders'
      } else {
        await onSubmit(apiData)
      }
    } catch (error) {
      console.error('発注書作成エラー:', error)
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : '予期せぬエラーが発生しました',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isDisabled = isLoading || isSubmitting || readOnly

  return (
    <BaseFormWrapper
      form={form}
      onSubmit={handleSubmit}
      isSubmitting={isDisabled}
      onCancel={onCancel}
      data-testid="purchase-order-form"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            name="vendorId"
            label="取引先"
            control={form.control}
            options={initialVendors.map(vendor => ({
              value: vendor.id,
              label: `${vendor.name} (${vendor.code})`
            }))}
            required
            disabled={isDisabled}
          />

          <SelectField
            name="status"
            label="ステータス"
            control={form.control}
            options={PURCHASE_ORDER_STATUS_OPTIONS}
            required
            disabled={isDisabled}
          />

          <DateField
            name="orderDate"
            label="発注日"
            control={form.control}
            required
            disabled={isDisabled}
          />

          <DateField
            name="deliveryDate"
            label="納期"
            control={form.control}
            required
            disabled={isDisabled}
            minDate={form.watch('orderDate')}
            maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">明細</h3>
          <OrderItemsForm
            name="items"
            control={form.control}
            disabled={isDisabled}
          />
        </div>

        <TagField
          name="tags"
          label="タグ"
          control={form.control}
          entityType="purchaseOrder"
          entityId={id || ''}
          readOnly={isDisabled}
        />

        <InputField
          name="notes"
          label="備考"
          control={form.control}
          placeholder="備考を入力"
          disabled={isDisabled}
        />
      </div>
    </BaseFormWrapper>
  )
}