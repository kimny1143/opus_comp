'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { InvoiceStatus, Prisma } from '@prisma/client'
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
import type { Item } from '@/types/validation/item'
import type { InvoiceCreateInput } from '@/types/invoice'
import { AccountType } from '@/types/bankAccount'

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

export type InvoiceFormData = z.infer<typeof invoiceSchema>

interface InvoiceFormProps {
  id?: string
  initialData?: Partial<InvoiceFormDataWithRHF>
  onSubmit: (data: InvoiceCreateInput) => Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
  readOnly?: boolean
}

// フォームデータの型（すべてオプショナル）
type InvoiceFormDataWithRHF = {
  status?: InvoiceStatus;
  issueDate?: Date;
  dueDate?: Date;
  items: Item[];
  bankInfo: {
    accountType: AccountType;
    bankName: string;
    branchName: string;
    accountNumber: string;
    accountHolder: string;
  };
  notes?: string;
  vendorId?: string;
  purchaseOrderId?: string;
  tags?: { id?: string; name: string }[];
  registrationNumber?: string;
  invoiceNumber?: string;
};

// フォームデータをAPIの型に変換する関数
const toInvoiceCreateInput = (data: InvoiceFormDataWithRHF): InvoiceCreateInput => {
  if (!data.items.length) {
    throw new Error('品目は1つ以上必要です');
  }

  return {
    status: data.status || InvoiceStatus.DRAFT,
    issueDate: data.issueDate || new Date(),
    dueDate: data.dueDate || new Date(),
    items: data.items.map(item => ({
      id: item.id,
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
      description: item.description
    })),
    bankInfo: data.bankInfo,
    notes: data.notes,
    vendorId: data.vendorId,
    purchaseOrderId: data.purchaseOrderId,
    invoiceNumber: data.invoiceNumber
  };
};

export function InvoiceForm({
  id,
  initialData,
  onSubmit,
  isSubmitting = false,
  onCancel,
  readOnly = false
}: InvoiceFormProps) {
  const defaultValues: InvoiceFormDataWithRHF = {
    status: InvoiceStatus.DRAFT,
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    items: [],
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
    tags: [],
    registrationNumber: '',
    invoiceNumber: '',
    ...initialData
  }

  const form = useForm<InvoiceFormDataWithRHF>({
    resolver: zodResolver(invoiceSchema),
    defaultValues
  })

  const handleSubmit = async () => {
    const formData = form.getValues();
    const apiData = toInvoiceCreateInput(formData);
    await onSubmit(apiData);
  }

  return (
    <BaseFormWrapper
      form={form}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      onCancel={onCancel}
    >
      <div className="space-y-4">
        <SelectField
          name="status"
          label="ステータス"
          control={form.control}
          options={INVOICE_STATUS_OPTIONS}
          required
          disabled={readOnly}
        />

        <DateField
          name="issueDate"
          label="発行日"
          control={form.control}
          required
          disabled={readOnly}
        />

        <DateField
          name="dueDate"
          label="支払期限"
          control={form.control}
          required
          disabled={readOnly}
        />

        <InputField
          name="notes"
          label="備考"
          control={form.control}
          disabled={readOnly}
        />

        <OrderItemsForm
          name="items"
          control={form.control}
          disabled={readOnly}
        />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            name="bankInfo.accountType"
            label="口座種別"
            control={form.control}
            options={[
              { value: 'ORDINARY', label: '普通' },
              { value: 'CURRENT', label: '当座' },
              { value: 'SAVINGS', label: '貯蓄' }
            ]}
            required
            disabled={readOnly}
          />

          <InputField
            name="bankInfo.bankName"
            label="銀行名"
            control={form.control}
            required
            disabled={readOnly}
          />

          <InputField
            name="bankInfo.branchName"
            label="支店名"
            control={form.control}
            required
            disabled={readOnly}
          />

          <InputField
            name="bankInfo.accountNumber"
            label="口座番号"
            control={form.control}
            required
            disabled={readOnly}
          />

          <InputField
            name="bankInfo.accountHolder"
            label="口座名義"
            control={form.control}
            required
            disabled={readOnly}
            className="col-span-2"
          />
        </div>

        <TagField
          name="tags"
          label="タグ"
          control={form.control}
          entityType="invoice"
          entityId={id || ''}
          placeholder="タグを追加..."
          readOnly={readOnly || isSubmitting}
        />

        <InputField
          name="registrationNumber"
          label="登録番号"
          control={form.control}
          placeholder="T1234567890123"
          description="適格請求書発行事業者の登録番号（T+13桁数字）"
          required
          disabled={readOnly}
        />
      </div>
    </BaseFormWrapper>
  )
}
