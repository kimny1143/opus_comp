import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { createMockRequest } from '@/test/helpers/mockApi'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    invoice: {
      count: vi.fn()
    },
    purchaseOrder: {
      count: vi.fn()
    },
    vendor: {
      count: vi.fn()
    },
    $transaction: vi.fn()
  }
}))

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn()
}))

describe('GET /api/dashboard/stats', () => {
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

  it('認証済みユーザーが統計情報を取得できる', async () => {
    const request = createMockRequest({
      method: 'GET'
    })

    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.$transaction).mockResolvedValue([10, 5, 3])

    const response = await GET(request)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data).toEqual({
      totalInvoices: 10,
      totalOrders: 5,
      totalVendors: 3
    })
    expect(prisma.$transaction).toHaveBeenCalledWith([
      expect.any(Function),
      expect.any(Function),
      expect.any(Function)
    ])
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
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('データベースエラー時に500エラーが返される', async () => {
    const request = createMockRequest({
      method: 'GET'
    })

    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.$transaction).mockRejectedValue(new Error('Database error'))

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({
      success: false,
      error: 'Internal server error'
    })
  })

  it('統計情報が0の場合も正しく返される', async () => {
    const request = createMockRequest({
      method: 'GET'
    })

    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.$transaction).mockResolvedValue([0, 0, 0])

    const response = await GET(request)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data).toEqual({
      totalInvoices: 0,
      totalOrders: 0,
      totalVendors: 0
    })
  })
}) 