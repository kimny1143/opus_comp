import { Control, FieldValues, Path, useFieldArray, ArrayPath, FieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { InputField } from './InputField'
import { SelectField } from './SelectField'
import { type Item } from '@/types/validation/item'
import { commonValidation } from '@/types/validation/commonValidation'
import { Prisma } from '@prisma/client'

const TAX_RATE_OPTIONS = [
  { value: 0.08, label: '8%(軽減税率)' },
  { value: 0.10, label: '10%(標準税率)' }
] as const

export interface OrderItemsFormProps<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  disabled?: boolean
}

export function OrderItemsForm<T extends FieldValues>({
  name,
  control,
  disabled = false
}: OrderItemsFormProps<T>) {
  const { fields, append, remove } = useFieldArray<T>({
    name: name as ArrayPath<T>,
    control
  })

  const { setValue } = useFormContext<T>()

  const getFieldName = (index: number, field: keyof Item) => {
    return `${String(name)}.${index}.${String(field)}` as Path<T>
  }

  const handleAddItem = () => {
    const newItem: Item = {
      itemName: '',
      quantity: 1,
      unitPrice: new Prisma.Decimal(0),
      taxRate: new Prisma.Decimal(0.1),
      description: ''
    }
    
    append(newItem as FieldArray<T, ArrayPath<T>>)
  }

  const handleUnitPriceChange = (index: number, value: string) => {
    const fieldName = getFieldName(index, 'unitPrice');
    const parsed = parseFloat(value);
    setValue(fieldName, (isNaN(parsed) ? new Prisma.Decimal(0) : new Prisma.Decimal(parsed)) as any);
  }

  const handleQuantityChange = (index: number, value: string) => {
    const fieldName = getFieldName(index, 'quantity');
    const parsed = parseInt(value, 10);
    setValue(fieldName, (isNaN(parsed) ? 1 : Math.max(1, parsed)) as any);
  }

  const handleTaxRateChange = (index: number, value: number) => {
    const fieldName = getFieldName(index, 'taxRate');
    setValue(fieldName, new Prisma.Decimal(value) as any);
  }

  // 数値変換ユーティリティ
  const toNumber = (value: number | Prisma.Decimal): number => {
    return value instanceof Prisma.Decimal ? Number(value.toString()) : Number(value);
  }

  // 品目ごとの計算
  const calculateItemValues = (item: Item) => {
    const quantity = toNumber(item.quantity);
    const unitPrice = toNumber(item.unitPrice);
    const taxRate = toNumber(item.taxRate);

    if (isNaN(quantity) || isNaN(unitPrice) || isNaN(taxRate)) {
      return { subtotal: 0, tax: 0 };
    }

    const subtotal = quantity * unitPrice;
    const tax = subtotal * taxRate;

    return { subtotal, tax };
  }

  // 小計の計算
  const calculateSubtotal = () => {
    return fields.reduce((total, field) => {
      const { subtotal } = calculateItemValues(field as unknown as Item);
      return total + subtotal;
    }, 0).toLocaleString();
  }

  // 消費税の計算
  const calculateTax = () => {
    return fields.reduce((total, field) => {
      const { tax } = calculateItemValues(field as unknown as Item);
      return total + tax;
    }, 0).toLocaleString();
  }

  // 合計の計算
  const calculateTotal = () => {
    return fields.reduce((total, field) => {
      const { subtotal, tax } = calculateItemValues(field as unknown as Item);
      return total + subtotal + tax;
    }, 0).toLocaleString();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4" data-cy="items-container">
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-12 gap-4" data-cy="item-row">
            <div className="col-span-4">
              <InputField
                name={getFieldName(index, 'itemName')}
                label="品目名"
                control={control}
                required
                disabled={disabled}
                data-cy="item-name"
              />
            </div>
            <div className="col-span-2">
              <InputField
                name={getFieldName(index, 'quantity')}
                label="数量"
                control={control}
                type="number"
                required
                disabled={disabled}
                min={1}
                data-cy="item-quantity"
                onChange={(e) => handleQuantityChange(index, e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <InputField
                name={getFieldName(index, 'unitPrice')}
                label="単価"
                control={control}
                type="number"
                required
                disabled={disabled}
                min={0}
                data-cy="item-price"
                onChange={(e) => handleUnitPriceChange(index, e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <SelectField
                name={getFieldName(index, 'taxRate')}
                label="税率"
                control={control}
                options={TAX_RATE_OPTIONS}
                required
                disabled={disabled}
                data-cy="item-tax-rate"
                onChange={(value) => handleTaxRateChange(index, value as number)}
              />
              <div className="text-sm text-gray-500 mt-1 space-y-1">
                <p>※軽減税率(8%)の対象:</p>
                <ul className="list-disc pl-4 text-xs">
                  <li>飲食料品(酒類を除く)</li>
                  <li>週2回以上発行される新聞(定期購読)</li>
                </ul>
                <p className="text-xs">上記以外は標準税率(10%)が適用されます</p>
              </div>
            </div>
            <div className="col-span-2">
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                  className="mt-8"
                  data-cy="delete-item-button"
                >
                  削除
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      {!disabled && (
        <Button
          type="button"
          variant="outline"
          onClick={handleAddItem}
          data-cy="add-item-button"
        >
          品目を追加
        </Button>
      )}
      <div className="mt-6 space-y-3 border-t pt-4">
        <div className="flex justify-between items-center text-sm" data-cy="subtotal">
          <span className="text-gray-600">小計</span>
          <span className="font-medium">¥{calculateSubtotal()}</span>
        </div>
        <div className="flex justify-between items-center text-sm" data-cy="tax">
          <span className="text-gray-600">消費税</span>
          <span className="font-medium">¥{calculateTax()}</span>
        </div>
        <div className="flex justify-between items-center text-lg font-bold border-t pt-3" data-cy="total">
          <span>合計</span>
          <span>¥{calculateTotal()}</span>
        </div>
      </div>
    </div>
  )
}