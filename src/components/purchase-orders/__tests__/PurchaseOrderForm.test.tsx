import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PurchaseOrderForm } from '../PurchaseOrderForm'
import { useSession } from 'next-auth/react'
import { Prisma } from '@prisma/client'

// next-authのモック
vi.mock('next-auth/react')
const mockUseSession = useSession as unknown as ReturnType<typeof vi.fn>

// fetchのモック
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('PurchaseOrderForm', () => {
  beforeEach(() => {
    // セッションのモック
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com'
        }
      },
      status: 'authenticated'
    })

    // fetchのモックをリセット
    mockFetch.mockReset()
  })

  it('正常に発注書を作成できる', async () => {
    // fetchのモック設定
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    })

    const mockVendors = [
      { id: 'vendor1', name: 'テスト取引先1', code: 'V001' }
    ]

    render(
      <PurchaseOrderForm
        mode="create"
        initialVendors={mockVendors}
      />
    )

    // フォームの入力
    fireEvent.change(screen.getByLabelText('取引先'), {
      target: { value: 'vendor1' }
    })

    fireEvent.change(screen.getByLabelText('品目名'), {
      target: { value: 'テスト商品' }
    })

    fireEvent.change(screen.getByLabelText('数量'), {
      target: { value: '1' }
    })

    fireEvent.change(screen.getByLabelText('単価'), {
      target: { value: '1000' }
    })

    // フォームの送信
    fireEvent.click(screen.getByText('保存'))

    // APIリクエストの検証
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/purchase-orders',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: expect.stringContaining('"itemName":"テスト商品"')
        })
      )
    })
  })

  it('Decimal型の値が正しく変換される', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    })

    const mockVendors = [
      { id: 'vendor1', name: 'テスト取引先1', code: 'V001' }
    ]

    render(
      <PurchaseOrderForm
        mode="create"
        initialVendors={mockVendors}
      />
    )

    // 数値の入力
    fireEvent.change(screen.getByLabelText('数量'), {
      target: { value: '1.5' }
    })

    fireEvent.change(screen.getByLabelText('単価'), {
      target: { value: '1000.50' }
    })

    fireEvent.click(screen.getByText('保存'))

    // APIリクエストのボディを検証
    await waitFor(() => {
      const calls = mockFetch.mock.calls
      const lastCall = calls[calls.length - 1]
      const requestBody = JSON.parse(lastCall[1].body)

      // Decimal型に正しく変換されていることを確認
      expect(requestBody.items[0].quantity).toBeInstanceOf(Prisma.Decimal)
      expect(requestBody.items[0].unitPrice).toBeInstanceOf(Prisma.Decimal)
      expect(requestBody.items[0].quantity.toString()).toBe('1.5')
      expect(requestBody.items[0].unitPrice.toString()).toBe('1000.50')
    })
  })

  it('セッションが無効な場合はエラーを表示する', async () => {
    // セッションを無効に設定
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated'
    })

    const mockVendors = [
      { id: 'vendor1', name: 'テスト取引先1', code: 'V001' }
    ]

    render(
      <PurchaseOrderForm
        mode="create"
        initialVendors={mockVendors}
      />
    )

    fireEvent.click(screen.getByText('保存'))

    // エラーメッセージの表示を確認
    await waitFor(() => {
      expect(screen.getByText('セッションが無効です。再度ログインしてください。')).toBeInTheDocument()
    })

    // APIリクエストが送信されていないことを確認
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('APIエラー時に適切なエラーメッセージを表示する', async () => {
    // APIエラーをモック
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'データの検証エラーが発生しました',
        details: 'テストエラー'
      })
    })

    const mockVendors = [
      { id: 'vendor1', name: 'テスト取引先1', code: 'V001' }
    ]

    render(
      <PurchaseOrderForm
        mode="create"
        initialVendors={mockVendors}
      />
    )

    fireEvent.click(screen.getByText('保存'))

    // エラーメッセージの表示を確認
    await waitFor(() => {
      expect(screen.getByText('データの検証エラーが発生しました')).toBeInTheDocument()
    })
  })
})