import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { createMockRequest } from '@/test/helpers/mockApi'
import { PurchaseOrderStatus } from '@prisma/client'
import { subDays } from 'date-fns'
import { createDecimalMock } from '@/test/helpers/mockDecimal'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    purchaseOrder: {
      findMany: vi.fn()
    }
  }
}))

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn()
}))

describe('GET /api/dashboard/recent-orders', () => {
  const mockToday = new Date('2025-01-30')
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
    vi.useFakeTimers()
    vi.setSystemTime(mockToday)
  })

  it('認証済みユーザーが最近の注文を取得できる', async () => {
    const request = createMockRequest({
      method: 'GET'
    })

    const mockOrders = [
      {
        id: '1',
        vendorId: '1',
        createdById: '1',
        updatedById: '1',
        orderNumber: '0000000001',
        status: PurchaseOrderStatus.PENDING,
        createdAt: subDays(mockToday, 1),
        updatedAt: subDays(mockToday, 1),
        orderDate: subDays(mockToday, 1),
        deliveryDate: mockToday,
        description: '',
        notes: '',
        totalAmount: createDecimalMock(10000),
        taxAmount: createDecimalMock(1000),
        vendor: { name: 'ベンダー1' },
        items: [],
        projectId: '1',
        terms: ''
      },
      {
        id: '2',
        vendorId: '2',
        createdById: '1',
        updatedById: '1',
        orderNumber: '0000000002',
        status: PurchaseOrderStatus.COMPLETED,
        createdAt: subDays(mockToday, 2),
        updatedAt: subDays(mockToday, 2),
        orderDate: subDays(mockToday, 2),
        deliveryDate: mockToday,
        description: '',
        notes: '',
        totalAmount: createDecimalMock(20000),
        taxAmount: createDecimalMock(2000),
        vendor: { name: 'ベンダー2' },
        items: [],
        projectId: '2',
        terms: ''
      }
    ]

    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.purchaseOrder.findMany).mockResolvedValue(mockOrders)

    const response = await GET(request)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data).toEqual(mockOrders)

    // 検索条件を確認
    expect(prisma.purchaseOrder.findMany).toHaveBeenCalledWith({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        vendor: true
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
    expect(prisma.purchaseOrder.findMany).not.toHaveBeenCalled()
  })

  it('データベースエラー時に500エラーが返される', async () => {
    const request = createMockRequest({
      method: 'GET'
    })

    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.purchaseOrder.findMany).mockRejectedValue(new Error('Database error'))

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({
      success: false,
      error: 'Internal server error'
    })
  })

  it('注文が0件の場合も正しく返される', async () => {
    const request = createMockRequest({
      method: 'GET'
    })

    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.purchaseOrder.findMany).mockResolvedValue([])

    const response = await GET(request)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data).toEqual([])
  })
}) 