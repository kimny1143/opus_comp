'use client'

import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { InputField, TextareaField } from '@/components/shared/form'
import { PurchaseOrderFormDataRHF } from '@/types/validation/purchaseOrder'

export function PurchaseOrderItemsForm({ readOnly = false }: { readOnly?: boolean }) {
  const { control } = useFormContext<PurchaseOrderFormDataRHF>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  })

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-col gap-4 p-4 border rounded-lg">
          <InputField
            control={control}
            name={`items.${index}.name`}
            label="品目名"
            readOnly={readOnly}
          />
          <div className="grid grid-cols-3 gap-4">
            <InputField
              control={control}
              name={`items.${index}.quantity`}
              label="数量"
              type="number"
              readOnly={readOnly}
            />
            <InputField
              control={control}
              name={`items.${index}.unitPrice`}
              label="単価"
              type="number"
              readOnly={readOnly}
            />
            <InputField
              control={control}
              name={`items.${index}.taxRate`}
              label="税率"
              type="number"
              readOnly={readOnly}
            />
          </div>
          <TextareaField
            control={control}
            name={`items.${index}.description`}
            label="備考"
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
              quantity: 0,
              unitPrice: 0,
              taxRate: 10,
              description: ''
            })
          }
        >
          品目を追加
        </Button>
      )}
    </div>
  )
} 