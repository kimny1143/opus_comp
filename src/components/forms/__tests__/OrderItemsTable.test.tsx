import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OrderItemsTable } from '../OrderItemsTable'
import { OrderItem } from '../schemas/orderSchema'

describe('OrderItemsTable', () => {
  const mockItems: OrderItem[] = [
    {
      itemName: '商品A',
      quantity: 2,
      unitPrice: 1000,
      taxRate: 0.1,
      description: 'テスト商品A'
    }
  ]

  const mockHandlers = {
    onAddItem: vi.fn(),
    onRemoveItem: vi.fn(),
    onUpdateItem: vi.fn(),
    calculateSubtotal: () => 2000,
    calculateTaxAmount: () => 200,
    calculateTotal: () => 2200
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('明細項目が正しく表示されること', () => {
    render(
      <OrderItemsTable
        items={mockItems}
        {...mockHandlers}
      />
    )

    // ヘッダーの確認
    expect(screen.getByText('品目')).toBeInTheDocument()
    expect(screen.getByText('説明')).toBeInTheDocument()
    expect(screen.getByText('数量')).toBeInTheDocument()
    expect(screen.getByText('単価')).toBeInTheDocument()
    expect(screen.getByText('税率')).toBeInTheDocument()

    // 明細データの確認
    expect(screen.getByDisplayValue('商品A')).toBeInTheDocument()
    expect(screen.getByDisplayValue('テスト商品A')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument()
    expect(screen.getByDisplayValue('0.1')).toBeInTheDocument()
  })

  it('金額が正しく表示されること', () => {
    render(
      <OrderItemsTable
        items={mockItems}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('¥2,000')).toBeInTheDocument() // 小計
    expect(screen.getByText('¥200')).toBeInTheDocument() // 消費税
    expect(screen.getByText('¥2,200')).toBeInTheDocument() // 合計
  })

  it('項目を追加できること', () => {
    render(
      <OrderItemsTable
        items={mockItems}
        {...mockHandlers}
      />
    )

    fireEvent.click(screen.getByText('項目を追加'))
    expect(mockHandlers.onAddItem).toHaveBeenCalled()
  })

  it('項目を削除できること', () => {
    render(
      <OrderItemsTable
        items={mockItems}
        {...mockHandlers}
      />
    )

    // 削除ボタンをクリック
    const deleteButtons = screen.getAllByRole('button', { name: '' }) // Trash2アイコンのため、名前は空
    fireEvent.click(deleteButtons[deleteButtons.length - 1])
    expect(mockHandlers.onRemoveItem).toHaveBeenCalledWith(0)
  })

  it('項目を更新できること', () => {
    render(
      <OrderItemsTable
        items={mockItems}
        {...mockHandlers}
      />
    )

    // 品目名を更新
    const itemNameInput = screen.getByDisplayValue('商品A')
    fireEvent.change(itemNameInput, { target: { value: '商品A(更新)' } })
    expect(mockHandlers.onUpdateItem).toHaveBeenCalledWith(0, {
      ...mockItems[0],
      itemName: '商品A(更新)'
    })

    // 数量を更新
    const quantityInput = screen.getByDisplayValue('2')
    fireEvent.change(quantityInput, { target: { value: '3' } })
    expect(mockHandlers.onUpdateItem).toHaveBeenCalledWith(0, {
      ...mockItems[0],
      quantity: 3
    })
  })

  it('読み取り専用モードで表示できること', () => {
    render(
      <OrderItemsTable
        items={mockItems}
        {...mockHandlers}
        readOnly={true}
      />
    )

    // 入力フィールドが無効化されていることを確認
    const inputs = screen.getAllByRole('textbox')
    inputs.forEach(input => {
      expect(input).toBeDisabled()
    })

    // 追加・削除ボタンが表示されないことを確認
    expect(screen.queryByText('項目を追加')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '' })).not.toBeInTheDocument()
  })
})