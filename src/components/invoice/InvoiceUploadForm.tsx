'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BaseFormWrapper } from '@/components/shared/form/BaseFormWrapper'
import { DateField } from '@/components/shared/form/DateField'
import { useToast } from '@/components/ui/toast/use-toast'
import { InvoiceItemsForm } from './InvoiceItemsForm'
import { itemSchema } from '@/types/validation/item'
import { dateValidation } from '@/types/validation/commonValidation'

const invoiceUploadSchema = z.object({
  purchaseOrderId: z.string().uuid('無効な発注書IDです'),
  templateId: z.string().uuid('無効なテンプレートIDです'),
  issueDate: dateValidation.required,
  dueDate: dateValidation.required,
  items: z.array(itemSchema).min(1, '品目は1つ以上必要です')
})

export type InvoiceUploadFormData = z.infer<typeof invoiceUploadSchema>

interface InvoiceUploadFormProps {
  purchaseOrderId: string
  onSuccess?: () => void
  isSubmitting?: boolean
  onCancel?: () => void
}

export function InvoiceUploadForm({
  purchaseOrderId,
  onSuccess,
  isSubmitting = false,
  onCancel
}: InvoiceUploadFormProps) {
  const { toast } = useToast()
  const form = useForm<InvoiceUploadFormData>({
    resolver: zodResolver(invoiceUploadSchema),
    defaultValues: {
      purchaseOrderId,
      templateId: '', // 必要に応じて適切な値を設定
      items: [{
        itemName: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 0.1,
        description: ''
      }]
    }
  })

  const handleSubmit = async (data: InvoiceUploadFormData) => {
    try {
      const response = await fetch('/api/invoices/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('請求書のアップロードに失敗しました')
      }

      toast({
        title: '請求書をアップロードしました',
        description: '管理者が内容を確認します',
      })

      onSuccess?.()
    } catch (error) {
      throw error
    }
  }

  return (
    <BaseFormWrapper
      form={form}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      onCancel={onCancel}
    >
      <div className="space-y-4">
        <DateField
          name="issueDate"
          label="発行日"
          control={form.control}
          required
        />
        <DateField
          name="dueDate"
          label="支払期限"
          control={form.control}
          required
        />
        <InvoiceItemsForm
          control={form.control}
          register={form.register}
          errors={form.formState.errors}
          readOnly={isSubmitting}
        />
      </div>
    </BaseFormWrapper>
  )
} 