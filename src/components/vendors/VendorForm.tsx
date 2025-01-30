'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  vendorSchema, 
  type VendorFormData,
  VENDOR_CATEGORY_OPTIONS,
  VENDOR_STATUS_OPTIONS
} from './schemas/vendorSchema'
import { BaseFormWrapper } from '@/components/shared/form/BaseFormWrapper'
import { InputField } from '@/components/shared/form/InputField'
import { SelectField } from '@/components/shared/form/SelectField'
import { TagField } from '@/components/shared/form/TagField'
import { ACCOUNT_TYPE_OPTIONS } from '@/types/bankAccount'

interface VendorFormProps {
  id?: string
  initialData?: Partial<VendorFormData>
  onSubmit: (data: VendorFormData) => Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
  readOnly?: boolean
}

export function VendorForm({
  id,
  initialData,
  onSubmit,
  isSubmitting = false,
  onCancel,
  readOnly = false
}: VendorFormProps) {
  const defaultValues: VendorFormData = {
    name: '',
    category: 'CORPORATION',
    status: 'ACTIVE',
    email: '',
    phone: '',
    address: '',
    bankInfo: {
      bankName: '',
      branchName: '',
      accountType: 'ORDINARY',
      accountNumber: '',
      accountHolder: ''
    },
    notes: '',
    tags: [],
    ...initialData
  }

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues
  })

  return (
    <BaseFormWrapper
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      onCancel={onCancel}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">基本情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              name="category"
              label="取引先区分"
              control={form.control}
              options={VENDOR_CATEGORY_OPTIONS}
              required
              disabled={readOnly}
            />

            <SelectField
              name="status"
              label="ステータス"
              control={form.control}
              options={VENDOR_STATUS_OPTIONS}
              required
              disabled={readOnly}
            />

            <InputField
              name="name"
              label="取引先名"
              control={form.control}
              placeholder="例: 株式会社〇〇"
              required
              disabled={readOnly}
            />

            <InputField
              name="email"
              label="メールアドレス"
              control={form.control}
              placeholder="例: contact@example.com"
              disabled={readOnly}
            />

            <InputField
              name="phone"
              label="電話番号"
              control={form.control}
              placeholder="例: 03-1234-5678"
              disabled={readOnly}
            />

            <InputField
              name="address"
              label="住所"
              control={form.control}
              placeholder="例: 東京都千代田区..."
              required
              disabled={readOnly}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">銀行情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              name="bankInfo.bankName"
              label="銀行名"
              control={form.control}
              placeholder="例: 〇〇銀行"
              required
              disabled={readOnly}
            />

            <InputField
              name="bankInfo.branchName"
              label="支店名"
              control={form.control}
              placeholder="例: 〇〇支店"
              required
              disabled={readOnly}
            />

            <SelectField
              name="bankInfo.accountType"
              label="口座種別"
              control={form.control}
              options={ACCOUNT_TYPE_OPTIONS}
              required
              disabled={readOnly}
            />

            <InputField
              name="bankInfo.accountNumber"
              label="口座番号"
              control={form.control}
              placeholder="例: 1234567"
              required
              disabled={readOnly}
            />

            <InputField
              name="bankInfo.accountHolder"
              label="口座名義"
              control={form.control}
              placeholder="例: カブシキガイシャ〇〇"
              required
              disabled={readOnly}
              className="col-span-2"
            />
          </div>
        </div>

        <TagField
          name="tags"
          label="タグ"
          control={form.control}
          entityType="vendor"
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