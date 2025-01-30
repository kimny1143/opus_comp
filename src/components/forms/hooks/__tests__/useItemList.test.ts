import { renderHook, act } from '@testing-library/react'
import { useItemList } from '../useItemList'
import { OrderItem } from '@/components/forms/schemas/orderSchema'

describe('useItemList', () => {
  const mockItem: OrderItem = {
    itemName: '商品A',
    quantity: 2,
    unitPrice: 1000,
    taxRate: 0.1,
    description: 'テスト商品A'
  }

  const mockItems: OrderItem[] = [
    mockItem,
    {
      itemName: '商品B',
      quantity: 1,
      unitPrice: 500,
      taxRate: 0.1,
      description: 'テスト商品B'
    }
  ]

  it('初期アイテムを正しく設定できること', () => {
    const onItemsChange = jest.fn()
    const { result } = renderHook(() => useItemList({
      initialItems: mockItems,
      onItemsChange
    }))

    expect(result.current.items).toEqual(mockItems)
  })

  it('新しいアイテムを追加できること', () => {
    const onItemsChange = jest.fn()
    const { result } = renderHook(() => useItemList({
      initialItems: [],
      onItemsChange
    }))

    act(() => {
      result.current.addItem(mockItem)
    })

    expect(result.current.items).toEqual([mockItem])
    expect(onItemsChange).toHaveBeenCalledWith([mockItem])
  })

  it('アイテムを削除できること', () => {
    const onItemsChange = jest.fn()
    const { result } = renderHook(() => useItemList({
      initialItems: mockItems,
      onItemsChange
    }))

    act(() => {
      result.current.removeItem(0)
    })

    expect(result.current.items).toEqual([mockItems[1]])
    expect(onItemsChange).toHaveBeenCalledWith([mockItems[1]])
  })

  it('アイテムを更新できること', () => {
    const onItemsChange = jest.fn()
    const { result } = renderHook(() => useItemList({
      initialItems: mockItems,
      onItemsChange
    }))

    const updatedItem = { ...mockItem, quantity: 3 }

    act(() => {
      result.current.updateItem(0, updatedItem)
    })

    expect(result.current.items[0]).toEqual(updatedItem)
    expect(onItemsChange).toHaveBeenCalledWith([updatedItem, mockItems[1]])
  })

  it('新しいアイテムを作成できること', () => {
    const { result } = renderHook(() => useItemList({
      initialItems: [],
      onItemsChange: jest.fn()
    }))

    const newItem = result.current.createNewItem()

    expect(newItem).toEqual({
      itemName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0.1
    })
  })

  it('金額計算が正しく動作すること', () => {
    const { result } = renderHook(() => useItemList({
      initialItems: mockItems,
      onItemsChange: jest.fn()
    }))

    // 小計: (2 * 1000) + (1 * 500) = 2500
    expect(result.current.calculateSubtotal()).toBe(2500)

    // 税額: (2000 * 0.1) + (500 * 0.1) = 250
    expect(result.current.calculateTaxAmount()).toBe(250)

    // 合計: 2500 + 250 = 2750
    expect(result.current.calculateTotal()).toBe(2750)
  })
}) 