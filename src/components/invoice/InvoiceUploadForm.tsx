import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { useToast } from '@/components/ui/use-toast'
import { InvoiceItemsForm } from './InvoiceItemsForm'

// バリデーションスキーマ
const invoiceItemSchema = z.object({
  itemName: z.string().min(1, '品目名は必須です'),
  quantity: z.number().positive('数量は0より大きい値を入力してください'),
  unitPrice: z.number().positive('単価は0より大きい値を入力してください'),
  taxRate: z.number().min(0, '税率は0以上の値を入力してください'),
  description: z.string().optional()
})

const invoiceUploadSchema = z.object({
  purchaseOrderId: z.string().uuid(),
  templateId: z.string().uuid(),
  issueDate: z.date(),
  dueDate: z.date(),
  items: z.array(invoiceItemSchema).min(1, '品目は1つ以上必要です')
})

export type InvoiceUploadFormData = z.infer<typeof invoiceUploadSchema>

interface InvoiceUploadFormProps {
  purchaseOrderId: string
  onSuccess?: () => void
}

export function InvoiceUploadForm({ purchaseOrderId, onSuccess }: InvoiceUploadFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors }, control } = useForm<InvoiceUploadFormData>({
    resolver: zodResolver(invoiceUploadSchema),
    defaultValues: {
      purchaseOrderId,
      items: [{ itemName: '', quantity: 1, unitPrice: 0, taxRate: 10 }]
    }
  })

  const onSubmit = async (data: InvoiceUploadFormData) => {
    try {
      setIsSubmitting(true)
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
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : '予期せぬエラーが発生しました',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>発行日</Label>
          <DatePicker
            control={control}
            name="issueDate"
            error={errors.issueDate?.message}
          />
        </div>

        <div>
          <Label>支払期限</Label>
          <DatePicker
            control={control}
            name="dueDate"
            error={errors.dueDate?.message}
          />
        </div>

        {/* 品目フォーム */}
        <div className="space-y-4">
          <Label>品目</Label>
          <InvoiceItemsForm
            control={control}
            register={register}
            errors={errors}
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '送信中...' : '請求書を登録'}
      </Button>
    </form>
  )
} 