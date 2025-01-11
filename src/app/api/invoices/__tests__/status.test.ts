import { NextRequest } from 'next/server'
import { POST } from '../[id]/status/route'
import { prisma } from '@/lib/prisma'
import { InvoiceStatus } from '@prisma/client'
import { InvoiceStatusTransitions } from '@/types/enums'

// Prismaのモック
jest.mock('@/lib/prisma', () => ({
  prisma: {
    invoice: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    statusHistory: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}))

describe('Invoice Status API', () => {
  const mockInvoice = {
    id: '1',
    status: InvoiceStatus.DRAFT,
    vendorId: '1',
    // ... その他の必要なフィールド
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('正常なステータス更新が処理される', async () => {
    // モックの設定
    ;(prisma.invoice.findUnique as jest.Mock).mockResolvedValue(mockInvoice)
    ;(prisma.invoice.update as jest.Mock).mockResolvedValue({
      ...mockInvoice,
      status: InvoiceStatus.PENDING,
    })
    ;(prisma.statusHistory.create as jest.Mock).mockResolvedValue({
      id: '1',
      invoiceId: '1',
      status: InvoiceStatus.PENDING,
      createdAt: new Date(),
    })

    const request = new NextRequest('http://localhost:3000/api/invoices/1/status', {
      method: 'POST',
      body: JSON.stringify({
        status: InvoiceStatus.PENDING,
      }),
    })

    const response = await POST(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.status).toBe(InvoiceStatus.PENDING)
  })

  it('無効なステータス遷移がエラーを返す', async () => {
    ;(prisma.invoice.findUnique as jest.Mock).mockResolvedValue({
      ...mockInvoice,
      status: InvoiceStatus.PAID,
    })

    const request = new NextRequest('http://localhost:3000/api/invoices/1/status', {
      method: 'POST',
      body: JSON.stringify({
        status: InvoiceStatus.PENDING,
      }),
    })

    const response = await POST(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('無効なステータス遷移')
  })

  it('存在しない請求書IDに対してエラーを返す', async () => {
    ;(prisma.invoice.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/invoices/999/status', {
      method: 'POST',
      body: JSON.stringify({
        status: InvoiceStatus.PENDING,
      }),
    })

    const response = await POST(request, { params: { id: '999' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toContain('請求書が見つかりません')
  })

  it('全てのステータス遷移パターンが正しく定義されている', () => {
    // 全てのステータスに対して遷移定義が存在することを確認
    Object.values(InvoiceStatus).forEach(status => {
      expect(InvoiceStatusTransitions[status]).toBeDefined()
    })

    // 各遷移が有効なステータスを指していることを確認
    Object.entries(InvoiceStatusTransitions).forEach(([fromStatus, toStatuses]) => {
      toStatuses.forEach(toStatus => {
        expect(Object.values(InvoiceStatus)).toContain(toStatus)
      })
    })
  })
}) 