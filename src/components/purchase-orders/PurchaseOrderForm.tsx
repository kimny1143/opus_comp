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

interface PurchaseOrderFormProps {
  id?: string
  initialData?: Partial<PurchaseOrderFormDataWithRHF>
  onSubmit: (data: PurchaseOrderFormData) => Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
  readOnly?: boolean
}

// PurchaseOrderFormDataを拡張して、itemsをItem[]として定義
type PurchaseOrderFormDataWithRHF = Omit<PurchaseOrderFormData, 'items'> & {
  items: Item[]
}

export function PurchaseOrderForm({
  id,
  initialData,
  onSubmit,
  isSubmitting = false,
  onCancel,
  readOnly = false
}: PurchaseOrderFormProps) {
  const defaultValues: PurchaseOrderFormDataWithRHF = {
    status: 'DRAFT',
    orderDate: new Date(),
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1週間後をデフォルトに
    items: [{
      itemName: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0.1,
      description: ''
    }],
    notes: '',
    tags: [],
    ...initialData
  }

  const form = useForm<PurchaseOrderFormDataWithRHF>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues
  })

  const handleSubmit = async (data: PurchaseOrderFormDataWithRHF) => {
    await onSubmit(data)
  }

  return (
    <BaseFormWrapper
      form={form}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      onCancel={onCancel}
      data-testid="purchase-order-form"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            name="status"
            label="ステータス"
            control={form.control}
            options={PURCHASE_ORDER_STATUS_OPTIONS}
            required
            disabled={readOnly}
          />

          <DateField
            name="orderDate"
            label="発注日"
            control={form.control}
            required
            disabled={readOnly}
          />

          <DateField
            name="deliveryDate"
            label="納期"
            control={form.control}
            required
            disabled={readOnly}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">明細</h3>
          <OrderItemsForm
            name="items"
            control={form.control}
            disabled={readOnly}
          />
        </div>

        <TagField
          name="tags"
          label="タグ"
          control={form.control}
          entityType="purchaseOrder"
          entityId={id || ''}
          readOnly={readOnly}
        />

        <InputField
          name="notes"
          label="備考"
          control={form.control}
          placeholder="備考を入力"
          disabled={readOnly}
        />
      </div>
    </BaseFormWrapper>
  )
}