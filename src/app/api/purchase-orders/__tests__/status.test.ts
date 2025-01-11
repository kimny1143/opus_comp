import { NextRequest } from 'next/server'
import { POST } from '../[id]/status/route'
import { prisma } from '@/lib/prisma'
import { PurchaseOrderStatus } from '@prisma/client'
import { PurchaseOrderStatusTransitions } from '@/types/enums'

// Prismaのモック
jest.mock('@/lib/prisma', () => ({
  prisma: {
    purchaseOrder: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    statusHistory: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}))

describe('Purchase Order Status API', () => {
  const mockPurchaseOrder = {
    id: '1',
    status: PurchaseOrderStatus.DRAFT,
    vendorId: '1',
    orderNumber: 'PO-001',
    // ... その他の必要なフィールド
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('正常なステータス更新が処理される', async () => {
    // モックの設定
    ;(prisma.purchaseOrder.findUnique as jest.Mock).mockResolvedValue(mockPurchaseOrder)
    ;(prisma.purchaseOrder.update as jest.Mock).mockResolvedValue({
      ...mockPurchaseOrder,
      status: PurchaseOrderStatus.PENDING,
    })
    ;(prisma.statusHistory.create as jest.Mock).mockResolvedValue({
      id: '1',
      purchaseOrderId: '1',
      status: PurchaseOrderStatus.PENDING,
      createdAt: new Date(),
    })

    const request = new NextRequest('http://localhost:3000/api/purchase-orders/1/status', {
      method: 'POST',
      body: JSON.stringify({
        status: PurchaseOrderStatus.PENDING,
      }),
    })

    const response = await POST(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.status).toBe(PurchaseOrderStatus.PENDING)
  })

  it('無効なステータス遷移がエラーを返す', async () => {
    ;(prisma.purchaseOrder.findUnique as jest.Mock).mockResolvedValue({
      ...mockPurchaseOrder,
      status: PurchaseOrderStatus.COMPLETED,
    })

    const request = new NextRequest('http://localhost:3000/api/purchase-orders/1/status', {
      method: 'POST',
      body: JSON.stringify({
        status: PurchaseOrderStatus.PENDING,
      }),
    })

    const response = await POST(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('無効なステータス遷移')
  })

  it('存在しない発注書IDに対してエラーを返す', async () => {
    ;(prisma.purchaseOrder.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/purchase-orders/999/status', {
      method: 'POST',
      body: JSON.stringify({
        status: PurchaseOrderStatus.PENDING,
      }),
    })

    const response = await POST(request, { params: { id: '999' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toContain('発注書が見つかりません')
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
    ;(prisma.purchaseOrder.findUnique as jest.Mock).mockResolvedValue(mockPurchaseOrder)
    ;(prisma.purchaseOrder.update as jest.Mock).mockResolvedValue({
      ...mockPurchaseOrder,
      status: PurchaseOrderStatus.PENDING,
    })
    ;(prisma.statusHistory.create as jest.Mock).mockResolvedValue({
      id: '1',
      purchaseOrderId: '1',
      status: PurchaseOrderStatus.PENDING,
      comment: 'テストコメント',
      createdAt: new Date(),
    })

    const request = new NextRequest('http://localhost:3000/api/purchase-orders/1/status', {
      method: 'POST',
      body: JSON.stringify({
        status: PurchaseOrderStatus.PENDING,
        comment: 'テストコメント',
      }),
    })

    const response = await POST(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(prisma.statusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          comment: 'テストコメント',
        }),
      })
    )
  })
}) 