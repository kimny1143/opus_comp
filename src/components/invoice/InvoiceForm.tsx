'use client'

import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { InvoiceStatus } from '@prisma/client'
import { BaseFormWrapper } from '@/components/shared/form/BaseFormWrapper'
import { SelectField } from '@/components/shared/form/SelectField'
import { InputField } from '@/components/shared/form/InputField'
import { DateField } from '@/components/shared/form/DateField'
import { TagField } from '@/components/shared/form/TagField'
import { OrderItemsForm } from '@/components/shared/form/OrderItemsForm'
import {
  commonSchemas,
  dateValidation,
  stringValidation
} from '@/types/validation/commonValidation'
import { invoiceItemSchema } from '@/types/validation/invoice'
import { AccountType, ACCOUNT_TYPE_OPTIONS } from '@/types/bankAccount'
import { useToast } from '@/components/ui/toast/use-toast'
import { ViewInvoiceForm, ViewInvoiceFormInput } from '@/types/view/invoice'

// 請求書のステータス選択肢
export const INVOICE_STATUS_OPTIONS = [
  { value: InvoiceStatus.DRAFT, label: '下書き' },
  { value: InvoiceStatus.REVIEWING, label: '確認中' },
  { value: InvoiceStatus.APPROVED, label: '承認済み' },
  { value: InvoiceStatus.REJECTED, label: '却下' },
  { value: InvoiceStatus.PAID, label: '支払済み' }
]

// 請求書のスキーマ
export const invoiceSchema = z.object({
  status: z.nativeEnum(InvoiceStatus),
  issueDate: dateValidation.required,
  dueDate: dateValidation.required,
  items: z.array(invoiceItemSchema).min(1, '品目は1つ以上必要です'),
  bankInfo: commonSchemas.bankInfo,
  notes: stringValidation.optional,
  vendorId: z.string().optional(),
  purchaseOrderId: z.string().optional(),
  tags: z.array(commonSchemas.tag).optional(),
  registrationNumber: stringValidation.registrationNumber
})

interface InvoiceFormProps {
  id?: string
  initialData?: Partial<ViewInvoiceForm>
  onSubmit: (data: ViewInvoiceFormInput) => Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
  readOnly?: boolean
}

// フォームデータの初期値
const baseDefaultValues: Required<ViewInvoiceFormInput> = {
  status: InvoiceStatus.DRAFT,
  issueDate: new Date(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  items: [{
    itemName: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 0.1,
    description: ''
  }],
  bankInfo: {
    accountType: AccountType.ORDINARY,
    bankName: '',
    branchName: '',
    accountNumber: '',
    accountHolder: ''
  },
  notes: '',
  vendorId: '',
  purchaseOrderId: '',
  tags: [{ name: 'タグを入力' }],
  registrationNumber: 'T0000000000000',
  invoiceNumber: ''
}

export function InvoiceForm({
  id,
  initialData,
  onSubmit,
  isSubmitting = false,
  onCancel,
  readOnly = false
}: InvoiceFormProps) {
  const { toast } = useToast()

  // initialDataの値で上書き
  const defaultValues: Required<ViewInvoiceFormInput> = {
    ...baseDefaultValues,
    ...initialData,
    items: initialData?.items?.length ? initialData.items.map(item => ({
      ...item,
      itemName: item.itemName || baseDefaultValues.items[0].itemName,
      quantity: item.quantity || baseDefaultValues.items[0].quantity,
      unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : baseDefaultValues.items[0].unitPrice,
      taxRate: typeof item.taxRate === 'number' ? item.taxRate : baseDefaultValues.items[0].taxRate,
      description: item.description || baseDefaultValues.items[0].description
    })) : baseDefaultValues.items,
    bankInfo: {
      accountType: initialData?.bankInfo?.accountType || baseDefaultValues.bankInfo.accountType,
      bankName: initialData?.bankInfo?.bankName || baseDefaultValues.bankInfo.bankName,
      branchName: initialData?.bankInfo?.branchName || baseDefaultValues.bankInfo.branchName,
      accountNumber: initialData?.bankInfo?.accountNumber || baseDefaultValues.bankInfo.accountNumber,
      accountHolder: initialData?.bankInfo?.accountHolder || baseDefaultValues.bankInfo.accountHolder
    },
    tags: initialData?.tags?.length ? initialData.tags.map(tag => ({
      ...tag,
      name: tag.name || baseDefaultValues.tags[0].name
    })) : baseDefaultValues.tags
  }

  const methods = useForm<ViewInvoiceFormInput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues
  })

  const handleSubmit = async (data: ViewInvoiceFormInput) => {
    try {
      await onSubmit(data)
    } catch (error) {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : '予期せぬエラーが発生しました',
        variant: 'destructive'
      })
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <SelectField
            name="status"
            label="ステータス"
            control={methods.control}
            options={INVOICE_STATUS_OPTIONS}
            required
            disabled={readOnly}
          />

          <DateField
            name="issueDate"
            label="発行日"
            control={methods.control}
            required
            disabled={readOnly}
          />

          <DateField
            name="dueDate"
            label="支払期限"
            control={methods.control}
            required
            disabled={readOnly}
          />

          <InputField
            name="registrationNumber"
            label="登録番号"
            control={methods.control}
            required
            disabled={readOnly}
          />

          <InputField
            name="notes"
            label="備考"
            control={methods.control}
            disabled={readOnly}
          />

          <OrderItemsForm
            name="items"
            control={methods.control}
            disabled={readOnly}
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              name="bankInfo.accountType"
              label="口座種別"
              control={methods.control}
              options={ACCOUNT_TYPE_OPTIONS}
              required
              disabled={readOnly}
            />

            <InputField
              name="bankInfo.bankName"
              label="銀行名"
              control={methods.control}
              required
              disabled={readOnly}
            />

            <InputField
              name="bankInfo.branchName"
              label="支店名"
              control={methods.control}
              required
              disabled={readOnly}
            />

            <InputField
              name="bankInfo.accountNumber"
              label="口座番号"
              control={methods.control}
              required
              disabled={readOnly}
            />

            <InputField
              name="bankInfo.accountHolder"
              label="口座名義"
              control={methods.control}
              required
              disabled={readOnly}
              className="col-span-2"
            />
          </div>

          <TagField
            name="tags"
            label="タグ"
            control={methods.control}
            entityType="invoice"
            entityId={id || ''}
            placeholder="タグを追加..."
            readOnly={readOnly || isSubmitting}
          />
        </div>

        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </FormProvider>
  )
}
