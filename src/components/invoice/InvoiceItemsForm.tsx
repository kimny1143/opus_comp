'use client'

import { Control, useFieldArray, UseFormRegister, FieldErrors } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { FormField } from '@/components/shared/form/FormField'
import { Input } from '@/components/ui/input'
import {
  numberValidation,
  validationMessages,
  type Item
} from '@/types/validation/commonValidation'

interface InvoiceItemsFormProps {
  control: Control<any>
  register: UseFormRegister<any>
  errors: FieldErrors<any>
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
        <div key={field.id} className="flex gap-4 items-start">
          <div className="flex-1 space-y-2">
            <FormField
              name={`items.${index}.itemName`}
              label="品目名"
              control={control}
              required
            >
              <Input 
                placeholder="品目名を入力" 
                disabled={readOnly}
              />
            </FormField>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                name={`items.${index}.quantity`}
                label="数量"
                control={control}
                required
              >
                <Input
                  type="number"
                  placeholder="数量"
                  {...register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                    min: { value: 1, message: validationMessages.positiveNumber }
                  })}
                  disabled={readOnly}
                  min={1}
                />
              </FormField>

              <FormField
                name={`items.${index}.unitPrice`}
                label="単価"
                control={control}
                required
              >
                <Input
                  type="number"
                  placeholder="単価"
                  {...register(`items.${index}.unitPrice`, {
                    valueAsNumber: true,
                    min: { value: 0, message: validationMessages.nonNegativeNumber }
                  })}
                  disabled={readOnly}
                  min={0}
                />
              </FormField>

              <FormField
                name={`items.${index}.taxRate`}
                label="税率"
                control={control}
                required
              >
                <Input
                  type="number"
                  placeholder="税率"
                  {...register(`items.${index}.taxRate`, {
                    valueAsNumber: true,
                    min: { value: 0.1, message: validationMessages.taxRateMin },
                    max: { value: 1, message: validationMessages.taxRateMax }
                  })}
                  disabled={readOnly}
                  min={0.1}
                  max={1}
                  step={0.01}
                />
              </FormField>
            </div>

            <FormField
              name={`items.${index}.description`}
              label="説明"
              control={control}
            >
              <Input 
                placeholder="説明を入力（任意）" 
                disabled={readOnly}
              />
            </FormField>
          </div>

          {!readOnly && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}

      {!readOnly && (
        <Button
          type="button"
          variant="outline"
          onClick={() => append({
            itemName: '',
            quantity: 1,
            unitPrice: 0,
            taxRate: 0.1,
            description: ''
          })}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          品目を追加
        </Button>
      )}
    </div>
  )
}
