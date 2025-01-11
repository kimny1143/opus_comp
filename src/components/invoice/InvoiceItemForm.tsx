'use client'

import { InvoiceItem } from '@/types/invoice'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { convertTaxRateToDecimal, convertTaxRateToPercent } from '@/domains/invoice/tax'

interface InvoiceItemFormProps {
  items: InvoiceItem[]
  onChange: (items: InvoiceItem[]) => void
}

export function InvoiceItemForm({ items, onChange }: InvoiceItemFormProps) {
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      itemName: '',
      quantity: 1,
      unitPrice: '0',
      taxRate: '0.1',
      description: null,
    }
    onChange([...items, newItem])
  }

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    onChange(newItems)
  }

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = items.map((item, i) => {
      if (i === index) {
        if (field === 'unitPrice') {
          return {
            ...item,
            [field]: value.toString(),
          }
        }
        if (field === 'taxRate') {
          return {
            ...item,
            [field]: convertTaxRateToDecimal(parseFloat(value)).toString(),
          }
        }
        return {
          ...item,
          [field]: value,
        }
      }
      return item
    })
    onChange(newItems)
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="space-y-4 p-4 border rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>項目名</Label>
              <Input
                value={item.itemName}
                onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>説明</Label>
              <Input
                value={item.description || ''}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>数量</Label>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value, 10))}
                min="1"
                required
              />
            </div>
            <div>
              <Label>単価</Label>
              <Input
                type="number"
                value={parseFloat(item.unitPrice)}
                onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                min="0"
                required
              />
            </div>
            <div>
              <Label>税率 (%)</Label>
              <Input
                type="number"
                value={convertTaxRateToPercent(parseFloat(item.taxRate))}
                onChange={(e) => handleItemChange(index, 'taxRate', e.target.value)}
                min="0"
                max="100"
                required
              />
            </div>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={() => handleRemoveItem(index)}
          >
            削除
          </Button>
        </div>
      ))}
      <Button type="button" onClick={handleAddItem}>
        項目を追加
      </Button>
    </div>
  )
}