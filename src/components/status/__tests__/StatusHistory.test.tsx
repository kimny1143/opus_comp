import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { StatusHistory } from '../StatusHistory'
import { PurchaseOrderStatus } from '@prisma/client'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

describe('StatusHistory', () => {
  const mockStatusHistory = [
    {
      id: '1',
      type: 'PURCHASE_ORDER',
      status: PurchaseOrderStatus.DRAFT,
      comment: 'テストコメント',
      createdAt: new Date('2024-01-01T10:00:00'),
      user: {
        name: 'テストユーザー'
      }
    }
  ]

  const mockHandlers = {
    onStatusChange: vi.fn()
  }

  it('現在のステータスが正しく表示される', () => {
    render(
      <StatusHistory
        currentStatus={PurchaseOrderStatus.DRAFT}
        statusHistory={mockStatusHistory}
        onStatusChange={mockHandlers.onStatusChange}
      />
    )

    expect(screen.getByText('下書き')).toBeInTheDocument()
  })

  it('ステータス履歴が正しく表示される', () => {
    render(
      <StatusHistory
        currentStatus={PurchaseOrderStatus.DRAFT}
        statusHistory={mockStatusHistory}
        onStatusChange={mockHandlers.onStatusChange}
      />
    )

    expect(screen.getByText('テストコメント')).toBeInTheDocument()
    expect(screen.getByText('更新者: テストユーザー')).toBeInTheDocument()
    expect(screen.getByText(format(new Date('2024-01-01T10:00:00'), 'yyyy/MM/dd HH:mm', { locale: ja }))).toBeInTheDocument()
  })

  it('読み取り専用モードでは更新フォームが表示されない', () => {
    render(
      <StatusHistory
        currentStatus={PurchaseOrderStatus.DRAFT}
        statusHistory={mockStatusHistory}
        onStatusChange={mockHandlers.onStatusChange}
        readOnly={true}
      />
    )

    expect(screen.queryByText('新しいステータスを選択')).not.toBeInTheDocument()
    expect(screen.queryByText('ステータスを更新')).not.toBeInTheDocument()
  })

  it('ステータス更新が正しく動作する', async () => {
    render(
      <StatusHistory
        currentStatus={PurchaseOrderStatus.DRAFT}
        statusHistory={mockStatusHistory}
        onStatusChange={mockHandlers.onStatusChange}
      />
    )

    // ステータスの選択
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('承認待ち'))

    // コメントの入力
    const commentInput = screen.getByPlaceholderText('コメントを入力(任意)')
    fireEvent.change(commentInput, { target: { value: '承認依頼します' } })

    // 更新ボタンのクリック
    fireEvent.click(screen.getByText('ステータスを更新'))

    await waitFor(() => {
      expect(mockHandlers.onStatusChange).toHaveBeenCalledWith(
        PurchaseOrderStatus.PENDING,
        '承認依頼します'
      )
    })
  })

  it('許可されたステータス遷移のみが選択可能', () => {
    render(
      <StatusHistory
        currentStatus={PurchaseOrderStatus.DRAFT}
        statusHistory={mockStatusHistory}
        onStatusChange={mockHandlers.onStatusChange}
      />
    )

    // ドロップダウンを開く
    fireEvent.click(screen.getByRole('combobox'))

    // DRAFTからは PENDINGのみ選択可能
    expect(screen.getByText('承認待ち')).toBeInTheDocument()
    expect(screen.queryByText('送信済み')).not.toBeInTheDocument()
    expect(screen.queryByText('完了')).not.toBeInTheDocument()
  })

  it('更新中は更新ボタンが無効化される', () => {
    render(
      <StatusHistory
        currentStatus={PurchaseOrderStatus.DRAFT}
        statusHistory={mockStatusHistory}
        onStatusChange={mockHandlers.onStatusChange}
        isUpdating={true}
      />
    )

    const updateButton = screen.getByText('ステータスを更新')
    expect(updateButton).toBeDisabled()
  })

  it('最終ステータスでは更新フォームが表示されない', () => {
    render(
      <StatusHistory
        currentStatus={PurchaseOrderStatus.COMPLETED}
        statusHistory={mockStatusHistory}
        onStatusChange={mockHandlers.onStatusChange}
      />
    )

    expect(screen.queryByText('新しいステータスを選択')).not.toBeInTheDocument()
    expect(screen.queryByText('ステータスを更新')).not.toBeInTheDocument()
  })
})