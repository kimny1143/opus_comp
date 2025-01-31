'use client'

import { useCallback, useMemo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { OrderItem, orderItemSchema } from './schemas/orderSchema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash2 } from 'lucide-react'
import debounce from 'lodash/debounce'
import { cn } from '@/lib/utils'

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
  const parentRef = useRef<HTMLDivElement>(null)

  // 仮想スクロールの設定
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // 各行の推定高さ
    overscan: 5, // 表示範囲外に事前レンダリングする行数
  })

  // バリデーション状態の管理
  const validationErrors = useMemo(() => {
    return items.map(item => {
      const result = orderItemSchema.safeParse(item)
      return result.success ? null : result.error.format()
    })
  }, [items])

  // 入力値の変更をdebounce処理
  const debouncedHandleFieldChange = useMemo(
    () =>
      debounce((index: number, field: keyof OrderItem, value: string | number) => {
        const item = items[index]
        const updatedItem: OrderItem = {
          ...item,
          [field]: field === 'quantity' || field === 'unitPrice' || field === 'taxRate'
            ? Number(value)
            : value
        }
        onUpdateItem(index, updatedItem)
      }, 300),
    [items, onUpdateItem]
  )

  const handleFieldChange = (index: number, field: keyof OrderItem, value: string | number) => {
    debouncedHandleFieldChange(index, field, value)
  }

  // 数値入力のバリデーション
  const validateNumberInput = (value: string, min: number, max?: number): boolean => {
    const num = Number(value)
    if (isNaN(num)) return false
    if (num < min) return false
    if (max !== undefined && num > max) return false
    return true
  }

  const totalSize = virtualizer.getTotalSize()
  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div className="space-y-4">
      <div
        ref={parentRef}
        className="max-h-[500px] overflow-auto"
        style={{
          height: `${Math.min(totalSize, 500)}px`,
        }}
      >
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
            <div
              style={{
                height: `${totalSize}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualItems.map(virtualRow => {
                const item = items[virtualRow.index]
                const error = validationErrors[virtualRow.index]
                return (
                  <TableRow
                    key={virtualRow.index}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <TableCell>
                      <Input
                        value={item.itemName}
                        onChange={(e) => handleFieldChange(virtualRow.index, 'itemName', e.target.value)}
                        disabled={readOnly}
                        className={cn(error?.itemName && 'border-red-500')}
                      />
                      {error?.itemName?._errors && (
                        <span className="text-xs text-red-500">{error.itemName._errors.join(', ')}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.description || ''}
                        onChange={(e) => handleFieldChange(virtualRow.index, 'description', e.target.value)}
                        disabled={readOnly}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          if (validateNumberInput(e.target.value, 1)) {
                            handleFieldChange(virtualRow.index, 'quantity', e.target.value)
                          }
                        }}
                        className={cn('text-right', error?.quantity && 'border-red-500')}
                        disabled={readOnly}
                      />
                      {error?.quantity?._errors && (
                        <span className="text-xs text-red-500">{error.quantity._errors.join(', ')}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => {
                          if (validateNumberInput(e.target.value, 0)) {
                            handleFieldChange(virtualRow.index, 'unitPrice', e.target.value)
                          }
                        }}
                        className={cn('text-right', error?.unitPrice && 'border-red-500')}
                        disabled={readOnly}
                      />
                      {error?.unitPrice?._errors && (
                        <span className="text-xs text-red-500">{error.unitPrice._errors.join(', ')}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={item.taxRate}
                        onChange={(e) => {
                          if (validateNumberInput(e.target.value, 0, 1)) {
                            handleFieldChange(virtualRow.index, 'taxRate', e.target.value)
                          }
                        }}
                        className={cn('text-right', error?.taxRate && 'border-red-500')}
                        disabled={readOnly}
                      />
                      {error?.taxRate?._errors && (
                        <span className="text-xs text-red-500">{error.taxRate._errors.join(', ')}</span>
                      )}
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
                          onClick={() => onRemoveItem(virtualRow.index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </div>
          </TableBody>
        </Table>
      </div>

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