import { useFieldArray, Control } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import { InvoiceUploadFormData } from './InvoiceUploadForm'

interface InvoiceItemsFormProps {
  control: Control<InvoiceUploadFormData>
  register: any
  errors: any
}

export function InvoiceItemsForm({
  control,
  register,
  errors
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
            <div>
              <Label>品目名</Label>
              <Input
                {...register(`items.${index}.itemName`)}
                placeholder="品目名を入力"
                className={errors.items?.[index]?.itemName ? 'border-red-500' : ''}
              />
              {errors.items?.[index]?.itemName && (
                <p className="text-sm text-red-500">
                  {errors.items[index].itemName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>数量</Label>
                <Input
                  type="number"
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  placeholder="数量"
                  className={errors.items?.[index]?.quantity ? 'border-red-500' : ''}
                />
                {errors.items?.[index]?.quantity && (
                  <p className="text-sm text-red-500">
                    {errors.items[index].quantity.message}
                  </p>
                )}
              </div>

              <div>
                <Label>単価</Label>
                <Input
                  type="number"
                  {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                  placeholder="単価"
                  className={errors.items?.[index]?.unitPrice ? 'border-red-500' : ''}
                />
                {errors.items?.[index]?.unitPrice && (
                  <p className="text-sm text-red-500">
                    {errors.items[index].unitPrice.message}
                  </p>
                )}
              </div>

              <div>
                <Label>税率 (%)</Label>
                <Input
                  type="number"
                  {...register(`items.${index}.taxRate`, { valueAsNumber: true })}
                  placeholder="税率"
                  className={errors.items?.[index]?.taxRate ? 'border-red-500' : ''}
                />
                {errors.items?.[index]?.taxRate && (
                  <p className="text-sm text-red-500">
                    {errors.items[index].taxRate.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>説明</Label>
              <Input
                {...register(`items.${index}.description`)}
                placeholder="説明を入力（任意）"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(index)}
            disabled={fields.length === 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ 
          itemName: '', 
          quantity: 1, 
          unitPrice: 0, 
          taxRate: 10 
        })}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        品目を追加
      </Button>
    </div>
  )
} 