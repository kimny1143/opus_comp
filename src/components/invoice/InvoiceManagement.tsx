'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { InvoiceStatus } from '@prisma/client'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { invoiceSchema, type InvoiceFormData, INVOICE_STATUS_OPTIONS } from '@/components/shared/form/schemas/invoiceSchema'
import { AccountType, ACCOUNT_TYPE_LABELS } from '@/types/bankAccount'
import { convertToFormData, convertFromPurchaseOrder } from '@/utils/formDataConverter'
import { TagManager } from '@/components/shared/TagManager'
import { useTags } from '@/hooks/useTags'
import { TagFormData } from '@/types/tag'
import { SelectField } from '@/components/shared/form/SelectField'
import { InputField } from '@/components/shared/form/InputField'
import { DateField } from '@/components/shared/form/DateField'
import { OrderItemsForm } from '@/components/shared/form/OrderItemsForm'
import { Item } from '@/components/shared/form/schemas/commonSchema'

interface InvoiceManagementProps {
  isNew?: boolean
  initialData?: {
    id?: string
    tags?: Array<{ id: string; name: string }>
    [key: string]: any
  }
  purchaseOrder?: any
}

type InvoiceFormDataWithRHF = Omit<InvoiceFormData, 'items'> & {
  items: Item[]
}

const defaultFormValues: InvoiceFormDataWithRHF = {
  status: 'DRAFT' as InvoiceStatus,
  issueDate: new Date(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  items: [],
  bankInfo: {
    accountType: 'ORDINARY',
    bankName: '',
    branchName: '',
    accountNumber: '',
    accountHolder: ''
  },
  notes: '',
  vendorId: '',
  purchaseOrderId: '',
  tags: []
}

export default function InvoiceManagement({ isNew = true, initialData, purchaseOrder }: InvoiceManagementProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<InvoiceFormDataWithRHF>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initialData ? { ...defaultFormValues, ...initialData } : defaultFormValues
  })

  const { tags } = useTags({
    entityType: 'invoice',
    entityId: initialData?.id,
    initialTags: initialData?.tags || []
  })

  // 初期データの設定
  useEffect(() => {
    if (initialData) {
      const formData = convertToFormData(initialData)
      form.reset(formData as InvoiceFormDataWithRHF)
    }
  }, [initialData, form])

  // 発注書情報の反映
  useEffect(() => {
    if (purchaseOrder && isNew) {
      const formData = convertFromPurchaseOrder(purchaseOrder)
      Object.entries(formData).forEach(([key, value]) => {
        form.setValue(key as keyof InvoiceFormDataWithRHF, value)
      })
    }
  }, [purchaseOrder, isNew, form])

  const handleSubmit = async (data: InvoiceFormDataWithRHF) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(isNew ? '/api/invoices' : `/api/invoices/${initialData?.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '請求書の処理に失敗しました')
      }

      const result = await response.json()
      
      toast({
        title: isNew ? '請求書を作成しました' : '請求書を更新しました',
        description: '正常に処理が完了しました。',
      })

      router.push(`/invoices/${result.data.id}`)
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

  const handleCancel = () => {
    router.back()
  }

  const handleTagsChange = (newTags: TagFormData[]) => {
    form.setValue('tags', newTags)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isNew ? '新規請求書の作成' : '請求書の編集'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CardContent className="space-y-4">
          <SelectField
            name="status"
            label="ステータス"
            control={form.control}
            options={INVOICE_STATUS_OPTIONS}
            required
          />

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

          <InputField
            name="notes"
            label="備考"
            control={form.control}
          />

          <OrderItemsForm
            name="items"
            control={form.control}
            disabled={false}
          />
          {form.formState.errors.items && (
            <p className="text-sm text-red-500">{form.formState.errors.items.message}</p>
          )}

          <div className="space-y-4">
            <Label>銀行情報</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>銀行名</Label>
                <Input {...form.register('bankInfo.bankName')} />
                {form.formState.errors.bankInfo?.bankName && (
                  <p className="text-sm text-red-500">{form.formState.errors.bankInfo.bankName.message}</p>
                )}
              </div>
              <div>
                <Label>支店名</Label>
                <Input {...form.register('bankInfo.branchName')} />
                {form.formState.errors.bankInfo?.branchName && (
                  <p className="text-sm text-red-500">{form.formState.errors.bankInfo.branchName.message}</p>
                )}
              </div>
              <div>
                <Label>口座種別</Label>
                <Select
                  defaultValue={form.watch('bankInfo.accountType')}
                  onValueChange={(value: AccountType) => form.setValue('bankInfo.accountType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.bankInfo?.accountType && (
                  <p className="text-sm text-red-500">{form.formState.errors.bankInfo.accountType.message}</p>
                )}
              </div>
              <div>
                <Label>口座番号</Label>
                <Input {...form.register('bankInfo.accountNumber')} />
                {form.formState.errors.bankInfo?.accountNumber && (
                  <p className="text-sm text-red-500">{form.formState.errors.bankInfo.accountNumber.message}</p>
                )}
              </div>
              <div className="col-span-2">
                <Label>口座名義</Label>
                <Input {...form.register('bankInfo.accountHolder')} />
                {form.formState.errors.bankInfo?.accountHolder && (
                  <p className="text-sm text-red-500">{form.formState.errors.bankInfo.accountHolder.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>タグ</Label>
            <TagManager
              selectedTags={tags}
              onTagsChange={handleTagsChange}
              entityType="invoice"
              entityId={initialData?.id}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : '保存'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
