import { useState, useCallback } from 'react'
import { OrderItem } from '@/components/forms/schemas/orderSchema'
import { calculateSubtotal, calculateTaxAmount, calculateTotal } from '@/utils/calculations'

interface UseItemListProps {
  initialItems: OrderItem[]
  onItemsChange: (items: OrderItem[]) => void
}

export function useItemList({ initialItems, onItemsChange }: UseItemListProps) {
  const [items, setItems] = useState<OrderItem[]>(initialItems)

  const addItem = useCallback((item: OrderItem) => {
    const newItems = [...items, item]
    setItems(newItems)
    onItemsChange(newItems)
  }, [items, onItemsChange])

  const removeItem = useCallback((index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    onItemsChange(newItems)
  }, [items, onItemsChange])

  const updateItem = useCallback((index: number, item: OrderItem) => {
    const newItems = [...items]
    newItems[index] = item
    setItems(newItems)
    onItemsChange(newItems)
  }, [items, onItemsChange])

  const createNewItem = useCallback((): OrderItem => {
    return {
      itemName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0.1,
    }
  }, [])

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    createNewItem,
    calculateSubtotal: () => calculateSubtotal(items),
    calculateTaxAmount: () => calculateTaxAmount(items),
    calculateTotal: () => calculateTotal(items)
  }
} 