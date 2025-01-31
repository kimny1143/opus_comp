import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { StatusNotification } from '../StatusNotification'
import { PurchaseOrderStatus } from '@prisma/client'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

describe('StatusNotification', () => {
  const mockNotifications = [
    {
      id: '1',
      title: 'テスト通知',
      message: 'これはテスト通知です',
      type: 'PURCHASE_ORDER',
      createdAt: new Date('2024-01-01T10:00:00'),
      isRead: false,
      recipientId: '1',
      recipient: {
        name: 'テストユーザー',
        email: 'test@example.com'
      }
    }
  ]

  const mockRecipients = [
    {
      id: '1',
      name: 'テストユーザー',
      email: 'test@example.com',
      role: '承認者'
    },
    {
      id: '2',
      name: '管理者',
      email: 'admin@example.com',
      role: '管理者'
    }
  ]

  const mockHandlers = {
    onSendNotification: vi.fn(),
    onMarkAsRead: vi.fn()
  }

  it('通知履歴が正しく表示される', () => {
    render(
      <StatusNotification
        notifications={mockNotifications}
        onSendNotification={mockHandlers.onSendNotification}
        onMarkAsRead={mockHandlers.onMarkAsRead}
        recipients={mockRecipients}
        currentStatus={PurchaseOrderStatus.DRAFT}
      />
    )

    expect(screen.getByText('テスト通知')).toBeInTheDocument()
    expect(screen.getByText('これはテスト通知です')).toBeInTheDocument()
    expect(screen.getByText('送信先: テストユーザー')).toBeInTheDocument()
    expect(screen.getByText(format(new Date('2024-01-01T10:00:00'), 'yyyy/MM/dd HH:mm', { locale: ja }))).toBeInTheDocument()
  })

  it('受信者が選択できる', () => {
    render(
      <StatusNotification
        notifications={mockNotifications}
        onSendNotification={mockHandlers.onSendNotification}
        onMarkAsRead={mockHandlers.onMarkAsRead}
        recipients={mockRecipients}
        currentStatus={PurchaseOrderStatus.DRAFT}
      />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])
    fireEvent.click(checkboxes[1])

    const sendButton = screen.getByText('通知を送信')
    expect(sendButton).not.toBeDisabled()
  })

  it('通知を送信できる', async () => {
    render(
      <StatusNotification
        notifications={mockNotifications}
        onSendNotification={mockHandlers.onSendNotification}
        onMarkAsRead={mockHandlers.onMarkAsRead}
        recipients={mockRecipients}
        currentStatus={PurchaseOrderStatus.PENDING}
      />
    )

    // 受信者を選択
    const checkbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(checkbox)

    // メッセージを入力
    const messageInput = screen.getByPlaceholderText('通知メッセージを入力')
    fireEvent.change(messageInput, { target: { value: 'テストメッセージ' } })

    // 送信ボタンをクリック
    const sendButton = screen.getByText('通知を送信')
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(mockHandlers.onSendNotification).toHaveBeenCalledWith(
        ['1'],
        'テストメッセージ'
      )
    })
  })

  it('通知を既読にできる', async () => {
    render(
      <StatusNotification
        notifications={mockNotifications}
        onSendNotification={mockHandlers.onSendNotification}
        onMarkAsRead={mockHandlers.onMarkAsRead}
        recipients={mockRecipients}
        currentStatus={PurchaseOrderStatus.DRAFT}
      />
    )

    const readButton = screen.getByText('既読にする')
    fireEvent.click(readButton)

    await waitFor(() => {
      expect(mockHandlers.onMarkAsRead).toHaveBeenCalledWith('1')
    })
  })

  it('更新中は送信ボタンが無効化される', () => {
    render(
      <StatusNotification
        notifications={mockNotifications}
        onSendNotification={mockHandlers.onSendNotification}
        onMarkAsRead={mockHandlers.onMarkAsRead}
        recipients={mockRecipients}
        currentStatus={PurchaseOrderStatus.DRAFT}
        isUpdating={true}
      />
    )

    const sendButton = screen.getByText('通知を送信')
    expect(sendButton).toBeDisabled()
  })

  it('ステータスに応じたテンプレートメッセージが表示される', () => {
    render(
      <StatusNotification
        notifications={mockNotifications}
        onSendNotification={mockHandlers.onSendNotification}
        onMarkAsRead={mockHandlers.onMarkAsRead}
        recipients={mockRecipients}
        currentStatus={PurchaseOrderStatus.PENDING}
      />
    )

    const messageInput = screen.getByPlaceholderText('通知メッセージを入力')
    expect(messageInput).toHaveValue('承認待ちの発注書があります。確認をお願いします。')
  })

  it('通知履歴が空の場合、適切なメッセージが表示される', () => {
    render(
      <StatusNotification
        notifications={[]}
        onSendNotification={mockHandlers.onSendNotification}
        onMarkAsRead={mockHandlers.onMarkAsRead}
        recipients={mockRecipients}
        currentStatus={PurchaseOrderStatus.DRAFT}
      />
    )

    expect(screen.getByText('通知履歴はありません')).toBeInTheDocument()
  })
})