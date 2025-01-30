'use client'

import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/shared/form'
import { VendorFormDataRHF } from '@/types/validation/vendor'

export function VendorContactsForm({ readOnly = false }: { readOnly?: boolean }) {
  const { control } = useFormContext<VendorFormDataRHF>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contacts'
  })

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-col gap-4 p-4 border rounded-lg">
          <InputField
            control={control}
            name={`contacts.${index}.name`}
            label="担当者名"
            readOnly={readOnly}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField
              control={control}
              name={`contacts.${index}.email`}
              label="メールアドレス"
              type="email"
              readOnly={readOnly}
            />
            <InputField
              control={control}
              name={`contacts.${index}.phone`}
              label="電話番号"
              readOnly={readOnly}
            />
          </div>
          <InputField
            control={control}
            name={`contacts.${index}.department`}
            label="部署"
            readOnly={readOnly}
          />
          {!readOnly && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => remove(index)}
            >
              削除
            </Button>
          )}
        </div>
      ))}
      {!readOnly && (
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              name: '',
              email: '',
              phone: '',
              department: ''
            })
          }
        >
          担当者を追加
        </Button>
      )}
    </div>
  )
} 