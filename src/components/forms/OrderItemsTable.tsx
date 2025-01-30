'use client'

import { OrderItem } from './schemas/orderSchema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash2 } from 'lucide-react'

interface OrderItemsTableProps {
  items: OrderItem[]
  onAddItem: () => void
  onRemoveItem: (index: number) => void
  onUpdateItem: (index: number, item: OrderItem) => void
  calculateSubtotal: () => number
  calculateTaxAmount: () => number
  calculateTotal: () => number
  readOnly?: boolean
}

export function OrderItemsTable({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  calculateSubtotal,
  calculateTaxAmount,
  calculateTotal,
  readOnly = false
}: OrderItemsTableProps) {
  const handleFieldChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const item = items[index]
    const updatedItem: OrderItem = {
      ...item,
      [field]: field === 'quantity' || field === 'unitPrice' || field === 'taxRate'
        ? Number(value)
        : value
    }
    onUpdateItem(index, updatedItem)
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>品目</TableHead>
            <TableHead>説明</TableHead>
            <TableHead className="text-right">数量</TableHead>
            <TableHead className="text-right">単価</TableHead>
            <TableHead className="text-right">税率</TableHead>
            <TableHead className="text-right">小計</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <Input
                  value={item.itemName}
                  onChange={(e) => handleFieldChange(index, 'itemName', e.target.value)}
                  disabled={readOnly}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={item.description || ''}
                  onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                  disabled={readOnly}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleFieldChange(index, 'quantity', e.target.value)}
                  className="text-right"
                  disabled={readOnly}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => handleFieldChange(index, 'unitPrice', e.target.value)}
                  className="text-right"
                  disabled={readOnly}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={item.taxRate}
                  onChange={(e) => handleFieldChange(index, 'taxRate', e.target.value)}
                  className="text-right"
                  disabled={readOnly}
                />
              </TableCell>
              <TableCell className="text-right">
                ¥{(item.quantity * item.unitPrice).toLocaleString()}
              </TableCell>
              {!readOnly && (
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between">
        {!readOnly && (
          <Button type="button" variant="outline" onClick={onAddItem}>
            <Plus className="h-4 w-4 mr-2" />
            項目を追加
          </Button>
        )}
        <div className="space-y-2 text-right">
          <div>
            <Label className="mr-4">小計:</Label>
            <span>¥{calculateSubtotal().toLocaleString()}</span>
          </div>
          <div>
            <Label className="mr-4">消費税:</Label>
            <span>¥{calculateTaxAmount().toLocaleString()}</span>
          </div>
          <div className="font-bold">
            <Label className="mr-4">合計:</Label>
            <span>¥{calculateTotal().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 