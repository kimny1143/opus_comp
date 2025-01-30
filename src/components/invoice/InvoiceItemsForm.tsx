'use client'

import { Control, UseFormRegister, FieldErrors, useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/shared/form/InputField'
import { SelectField } from '@/components/shared/form/SelectField'
import { InvoiceUploadFormData } from './InvoiceUploadForm'
import { defaultItem } from '@/types/validation/item'

const TAX_RATE_OPTIONS = [
  { value: '0.08', label: '8%（軽減税率）' },
  { value: '0.10', label: '10%（標準税率）' }
] as const

interface InvoiceItemsFormProps {
  control: Control<InvoiceUploadFormData>
  register: UseFormRegister<InvoiceUploadFormData>
  errors: FieldErrors<InvoiceUploadFormData>
  readOnly?: boolean
}

export function InvoiceItemsForm({
  control,
  register,
  errors,
  readOnly = false
}: InvoiceItemsFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  })

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-12 gap-4 p-4 border rounded-lg">
          <div className="col-span-4">
            <InputField
              name={`items.${index}.itemName`}
              label="品目名"
              control={control}
              required
              disabled={readOnly}
            />
          </div>
          <div className="col-span-2">
            <InputField
              name={`items.${index}.quantity`}
              label="数量"
              control={control}
              type="number"
              required
              disabled={readOnly}
              min={1}
            />
          </div>
          <div className="col-span-2">
            <InputField
              name={`items.${index}.unitPrice`}
              label="単価"
              control={control}
              type="number"
              required
              disabled={readOnly}
              min={0}
            />
          </div>
          <div className="col-span-2">
            <SelectField
              name={`items.${index}.taxRate`}
              label="税率"
              control={control}
              options={TAX_RATE_OPTIONS}
              required
              disabled={readOnly}
            />
          </div>
          <div className="col-span-2">
            {!readOnly && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => remove(index)}
                className="mt-8"
              >
                削除
              </Button>
            )}
          </div>
        </div>
      ))}
      {!readOnly && (
        <Button
          type="button"
          variant="outline"
          onClick={() => append(defaultItem)}
        >
          品目を追加
        </Button>
      )}
    </div>
  )
}
