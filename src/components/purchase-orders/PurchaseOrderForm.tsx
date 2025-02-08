'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  purchaseOrderSchema, 
  type PurchaseOrderFormData, 
  PURCHASE_ORDER_STATUS_OPTIONS 
} from './schemas/purchaseOrderSchema'
import { SelectField } from '@/components/shared/form/SelectField'
import { InputField } from '@/components/shared/form/InputField'
import { DateField } from '@/components/shared/form/DateField'
import { TagField } from '@/components/shared/form/TagField'
import { OrderItemsForm } from '@/components/shared/form/OrderItemsForm'
import { useToast } from '@/components/ui/toast/use-toast'
import { useState } from 'react'
import { Prisma } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { BaseFormWrapper } from '@/components/shared/form/BaseFormWrapper'

interface Vendor {
  id: string
  name: string
  code: string
}

interface PurchaseOrderFormProps {
  mode: 'create' | 'edit'
  id?: string
  initialData?: Partial<PurchaseOrderFormData>
  initialVendors?: Vendor[]
  onSubmit?: (data: PurchaseOrderFormData) => Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
  readOnly?: boolean
}

const baseDefaultValues: PurchaseOrderFormData = {
  orderNumber: '',
  status: 'DRAFT',
  orderDate: new Date(),
  deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  items: [{
    itemName: '',
    quantity: new Prisma.Decimal(1),
    unitPrice: new Prisma.Decimal(0),
    taxRate: new Prisma.Decimal(0.1),
    description: '',
    category: 'GOODS'
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
  onSubmit: propOnSubmit,
  isSubmitting = false,
  onCancel,
  readOnly = false
}: PurchaseOrderFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()

  const defaultValues = {
    ...baseDefaultValues,
    ...initialData,
    orderNumber: initialData?.orderNumber || `PO-${Date.now()}`
  }

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues
  })

  const handleSubmit = async (formData: PurchaseOrderFormData) => {
    if (!session?.user?.id) {
      toast({
        title: 'エラー',
        description: 'セッションが無効です。再度ログインしてください。',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsLoading(true)

      // APIに送信するデータを整形
      const apiData = {
        ...formData,
        items: formData.items.map(item => ({
          ...(item.id && { id: item.id }),
          itemName: item.itemName,
          quantity: new Prisma.Decimal(item.quantity),
          unitPrice: new Prisma.Decimal(item.unitPrice),
          taxRate: new Prisma.Decimal(item.taxRate),
          description: item.description,
          category: item.category
        }))
      }

      if (!propOnSubmit) {
        // create modeの場合は、APIに直接送信
        const response = await fetch('/api/purchase-orders', {
          method: mode === 'create' ? 'POST' : 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mode === 'edit' ? { id, ...apiData } : apiData)
        })

        const responseData = await response.json()

        if (!response.ok) {
          console.error('APIエラーレスポンス:', responseData)
          throw new Error(responseData.error || responseData.message || '発注書の保存に失敗しました')
        }

        if (responseData.error || !responseData.success) {
          throw new Error(responseData.error || '発注書の保存に失敗しました')
        }

        toast({
          title: '成功',
          description: `発注書を${mode === 'create' ? '作成' : '更新'}しました`,
        })

        // 一覧ページにリダイレクト
        window.location.href = '/purchase-orders'
      } else {
        await propOnSubmit(formData)
      }
    } catch (error) {
      console.error('発注書保存エラー:', error)
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
      onCancel={onCancel}
      isSubmitting={isDisabled}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            name="orderNumber"
            label="発注番号"
            control={form.control}
            disabled={isDisabled || mode === 'edit'}
          />

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