import { NextRequest } from 'next/server'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from '../[id]/status/route'
import { prisma } from '@/lib/prisma'
import { InvoiceStatus, Prisma } from '@prisma/client'
import { InvoiceStatusTransitions } from '@/types/enums'

// Prismaのモック
vi.mock('@/lib/prisma', () => ({
  prisma: {
    invoice: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    statusHistory: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}))

describe('Invoice Status API', () => {
  const mockInvoice = {
    id: '1',
    templateId: '',
    purchaseOrderId: '',
    status: InvoiceStatus.DRAFT,
    createdAt: new Date(),
    updatedAt: new Date(),
    issueDate: new Date(),
    dueDate: new Date(),
    description: '',
    vendorId: '1',
    items: [],
    bankInfo: null,
    totalAmount: new Prisma.Decimal(0),
    createdById: '1',
    updatedById: '1',
    invoiceNumber: '0000000001',
    notes: '',
  } as const

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('正常なステータス更新が処理される', async () => {
    // モックの設定
    vi.mocked(prisma.invoice.findUnique).mockResolvedValue(mockInvoice)
    vi.mocked(prisma.invoice.update).mockResolvedValue({
      ...mockInvoice,
      status: InvoiceStatus.PENDING,
    })
    vi.mocked(prisma.statusHistory.create).mockResolvedValue({
      id: '1',
      purchaseOrderId: '',
      status: 'PENDING',
      createdAt: new Date(),
      userId: '1',
      type: 'STATUS_CHANGE',
      invoiceId: '1',
      comment: '',
    })

    const request = new NextRequest('http://localhost:3000/api/invoices/1/status', {
      method: 'POST',
      body: JSON.stringify({
        status: InvoiceStatus.PENDING,
      }),
    })

    const response = await POST(request, { params: { id: '1' } })
    expect(response.status).toBe(200)

    const responseData = await response.json()
    expect(responseData.status).toBe(InvoiceStatus.PENDING)

    // モックの呼び出しを検証
    expect(prisma.invoice.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    })
    expect(prisma.invoice.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { status: InvoiceStatus.PENDING },
    })
    expect(prisma.statusHistory.create).toHaveBeenCalledWith({
      data: {
        invoiceId: '1',
        status: InvoiceStatus.PENDING,
        type: 'STATUS_CHANGE',
        userId: expect.any(String),
      },
    })
  })

  it('無効なステータス遷移がエラーになる', async () => {
    vi.mocked(prisma.invoice.findUnique).mockResolvedValue({
      ...mockInvoice,
      status: InvoiceStatus.APPROVED,
    })

    const request = new NextRequest('http://localhost:3000/api/invoices/1/status', {
      method: 'POST',
      body: JSON.stringify({
        status: InvoiceStatus.DRAFT,
      }),
    })

    const response = await POST(request, { params: { id: '1' } })
    expect(response.status).toBe(400)

    const responseData = await response.json()
    expect(responseData.error).toBe('Invalid status transition')
  })

  it('存在しない請求書IDの場合エラーになる', async () => {
    vi.mocked(prisma.invoice.findUnique).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/invoices/999/status', {
      method: 'POST',
      body: JSON.stringify({
        status: InvoiceStatus.PENDING,
      }),
    })

    const response = await POST(request, { params: { id: '999' } })
    expect(response.status).toBe(404)

    const responseData = await response.json()
    expect(responseData.error).toBe('Invoice not found')
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