import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { createMockRequest } from '@/test/helpers/mockApi'
import { InvoiceStatus } from '@prisma/client'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    invoice: {
      count: vi.fn()
    }
  }
}))

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn()
}))

describe('GET /api/dashboard/alerts', () => {
  const mockSession = {
    user: {
      id: '1',
      email: 'test@example.com',
      role: 'USER'
    },
    expires: new Date().toISOString()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('認証済みユーザーがアラート情報を取得できる', async () => {
    const request = createMockRequest({
      method: 'GET'
    })

    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.invoice.count)
      .mockResolvedValueOnce(3) // 期限切れの請求書
      .mockResolvedValueOnce(2) // 未送信の請求書

    const response = await GET(request)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data).toEqual({
      overdueInvoices: 3,
      pendingInvoices: 2,
      totalAlerts: 5
    })

    // 期限切れの請求書の検索条件を確認
    expect(prisma.invoice.count).toHaveBeenCalledWith({
      where: {
        status: InvoiceStatus.OVERDUE,
        dueDate: {
          lt: expect.any(Date)
        }
      }
    })

    // 未送信の請求書の検索条件を確認
    expect(prisma.invoice.count).toHaveBeenCalledWith({
      where: {
        status: InvoiceStatus.PENDING
      }
    })
  })

  it('未認証の場合は401エラーが返される', async () => {
    const request = createMockRequest({
      method: 'GET'
    })

    vi.mocked(getServerSession).mockResolvedValue(null)

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({
      success: false,
      error: '認証が必要です'
    })
    expect(prisma.invoice.count).not.toHaveBeenCalled()
  })

  it('データベースエラー時に500エラーが返される', async () => {
    const request = createMockRequest({
      method: 'GET'
    })

    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.invoice.count).mockRejectedValue(new Error('Database error'))

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({
      success: false,
      error: 'Internal server error'
    })
  })

  it('アラートが0件の場合も正しく返される', async () => {
    const request = createMockRequest({
      method: 'GET'
    })

    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.invoice.count)
      .mockResolvedValueOnce(0) // 期限切れの請求書
      .mockResolvedValueOnce(0) // 未送信の請求書

    const response = await GET(request)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data).toEqual({
      overdueInvoices: 0,
      pendingInvoices: 0,
      totalAlerts: 0
    })
  })
}) 