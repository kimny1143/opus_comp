import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { createMockRequest } from '@/test/helpers/mockApi'
import { InvoiceStatus } from '@prisma/client'
import { addDays } from 'date-fns'
import { createDecimalMock } from '@/test/helpers/mockDecimal'
import { ViewUpcomingPayment } from '@/types/view/payment'
import { DbUpcomingPayment } from '@/types/db/payment'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    invoice: {
      findMany: vi.fn()
    }
  }
}))

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn()
}))

describe('GET /api/dashboard/upcoming-payments', () => {
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

  it('認証済みユーザーが支払い予定を取得できる', async () => {
    const request = createMockRequest({
      method: 'GET'
    })

    const mockInvoices = [
      {
        id: '1',
        templateId: '1',
        purchaseOrderId: '1',
        vendorId: '1',
        createdById: '1',
        updatedById: '1',
        invoiceNumber: '0000000001',
        status: InvoiceStatus.APPROVED,
        createdAt: mockToday,
        updatedAt: mockToday,
        issueDate: mockToday,
        dueDate: addDays(mockToday, 5),
        description: '',
        notes: '',
        totalAmount: createDecimalMock(10000),
        vendor: { name: 'ベンダー1' },
        items: [],
        bankInfo: {
          bankName: '銀行1',
          branchName: '支店1',
          accountType: '普通',
          accountNumber: '1234567',
          accountName: '口座名義1'
        }
      },
      {
        id: '2',
        templateId: '2',
        purchaseOrderId: '2',
        vendorId: '2',
        createdById: '1',
        updatedById: '1',
        invoiceNumber: '0000000002',
        status: InvoiceStatus.APPROVED,
        createdAt: mockToday,
        updatedAt: mockToday,
        issueDate: mockToday,
        dueDate: addDays(mockToday, 15),
        description: '',
        notes: '',
        totalAmount: createDecimalMock(20000),
        vendor: { name: 'ベンダー2' },
        items: [],
        bankInfo: {
          bankName: '銀行2',
          branchName: '支店2',
          accountType: '普通',
          accountNumber: '7654321',
          accountName: '口座名義2'
        }
      }
    ]

    const expectedPayments: ViewUpcomingPayment[] = [
      {
        id: '1',
        dueDate: addDays(mockToday, 5).toISOString(),
        amount: 10000,
        vendorName: 'ベンダー1'
      },
      {
        id: '2',
        dueDate: addDays(mockToday, 15).toISOString(),
        amount: 20000,
        vendorName: 'ベンダー2'
      }
    ]

    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.invoice.findMany).mockResolvedValue(mockInvoices)

    const response = await GET(request)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data).toEqual(expectedPayments)

    // 検索条件を確認
    expect(prisma.invoice.findMany).toHaveBeenCalledWith({
      where: {
        status: InvoiceStatus.APPROVED,
        dueDate: {
          gte: mockToday,
          lte: addDays(mockToday, 30)
        }
      },
      include: {
        vendor: true,
        items: true
      },
      orderBy: {
        dueDate: 'asc'
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
    expect(prisma.invoice.findMany).not.toHaveBeenCalled()
  })

  it('データベースエラー時に500エラーが返される', async () => {
    const request = createMockRequest({
      method: 'GET'
    })

    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.invoice.findMany).mockRejectedValue(new Error('Database error'))

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? expect.any(String) : undefined
    })
  })

  it('支払い予定が0件の場合も正しく返される', async () => {
    const request = createMockRequest({
      method: 'GET'
    })

    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.invoice.findMany).mockResolvedValue([])

    const response = await GET(request)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data).toEqual([])
  })
})