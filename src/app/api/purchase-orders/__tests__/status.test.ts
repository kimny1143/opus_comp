import { NextRequest } from 'next/server'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from '../[id]/status/route'
import { prisma } from '@/lib/prisma'
import { PurchaseOrderStatus, Prisma } from '@prisma/client'
import { PurchaseOrderStatusTransitions } from '@/types/enums'

// Prismaのモック
vi.mock('@/lib/prisma', () => ({
  prisma: {
    purchaseOrder: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    statusHistory: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}))

describe('Purchase Order Status API', () => {
  const mockPurchaseOrder = {
    id: '1',
    status: PurchaseOrderStatus.DRAFT,
    vendorId: '1',
    orderNumber: 'PO-001',
    orderDate: new Date(),
    deliveryDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    issueDate: new Date(),
    dueDate: new Date(),
    description: '',
    items: [],
    totalAmount: new Prisma.Decimal(0),
    taxAmount: new Prisma.Decimal(0),
    terms: '',
    createdById: '1',
    updatedById: '1',
    notes: '',
    projectId: '1',
  } as const

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('正常なステータス更新が処理される', async () => {
    // モックの設定
    vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue(mockPurchaseOrder)
    vi.mocked(prisma.purchaseOrder.update).mockResolvedValue({
      ...mockPurchaseOrder,
      status: PurchaseOrderStatus.PENDING,
    })
    vi.mocked(prisma.statusHistory.create).mockResolvedValue({
      id: '1',
      purchaseOrderId: '1',
      status: PurchaseOrderStatus.PENDING,
      createdAt: new Date(),
      userId: '1',
      type: 'STATUS_CHANGE',
      invoiceId: null,
      comment: '',
    })

    const request = new NextRequest('http://localhost:3000/api/purchase-orders/1/status', {
      method: 'POST',
      body: JSON.stringify({
        status: PurchaseOrderStatus.PENDING,
      }),
    })

    const response = await POST(request, { params: { id: '1' } })
    expect(response.status).toBe(200)

    const responseData = await response.json()
    expect(responseData.status).toBe(PurchaseOrderStatus.PENDING)

    // モックの呼び出しを検証
    expect(prisma.purchaseOrder.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    })
    expect(prisma.purchaseOrder.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { status: PurchaseOrderStatus.PENDING },
    })
    expect(prisma.statusHistory.create).toHaveBeenCalledWith({
      data: {
        purchaseOrderId: '1',
        status: PurchaseOrderStatus.PENDING,
        type: 'STATUS_CHANGE',
        userId: expect.any(String),
      },
    })
  })

  it('無効なステータス遷移がエラーになる', async () => {
    vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue({
      ...mockPurchaseOrder,
      status: PurchaseOrderStatus.COMPLETED,
    })

    const request = new NextRequest('http://localhost:3000/api/purchase-orders/1/status', {
      method: 'POST',
      body: JSON.stringify({
        status: PurchaseOrderStatus.DRAFT,
      }),
    })

    const response = await POST(request, { params: { id: '1' } })
    expect(response.status).toBe(400)

    const responseData = await response.json()
    expect(responseData.error).toBe('Invalid status transition')
  })

  it('存在しない発注書IDの場合エラーになる', async () => {
    vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/purchase-orders/999/status', {
      method: 'POST',
      body: JSON.stringify({
        status: PurchaseOrderStatus.PENDING,
      }),
    })

    const response = await POST(request, { params: { id: '999' } })
    expect(response.status).toBe(404)

    const responseData = await response.json()
    expect(responseData.error).toBe('Purchase order not found')
  })

  it('全てのステータス遷移パターンが正しく定義されている', () => {
    // 全てのステータスに対して遷移定義が存在することを確認
    Object.values(PurchaseOrderStatus).forEach(status => {
      expect(PurchaseOrderStatusTransitions[status]).toBeDefined()
    })

    // 各遷移が有効なステータスを指していることを確認
    Object.entries(PurchaseOrderStatusTransitions).forEach(([fromStatus, toStatuses]) => {
      toStatuses.forEach(toStatus => {
        expect(Object.values(PurchaseOrderStatus)).toContain(toStatus)
      })
    })
  })

  it('コメント付きのステータス更新が正しく処理される', async () => {
    vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue(mockPurchaseOrder)
    vi.mocked(prisma.purchaseOrder.update).mockResolvedValue({
      ...mockPurchaseOrder,
      status: PurchaseOrderStatus.PENDING,
    })
    vi.mocked(prisma.statusHistory.create).mockResolvedValue({
      id: '1',
      purchaseOrderId: '1',
      status: PurchaseOrderStatus.PENDING,
      createdAt: new Date(),
      userId: '1',
      type: 'STATUS_CHANGE',
      invoiceId: null,
      comment: 'ステータスを更新しました',
    })

    const request = new NextRequest('http://localhost:3000/api/purchase-orders/1/status', {
      method: 'POST',
      body: JSON.stringify({
        status: PurchaseOrderStatus.PENDING,
        comment: 'ステータスを更新しました',
      }),
    })

    const response = await POST(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(prisma.statusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          comment: 'ステータスを更新しました',
        }),
      })
    )
  })
}) 