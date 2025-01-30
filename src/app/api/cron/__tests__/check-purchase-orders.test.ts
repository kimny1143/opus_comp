import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PrismaClient, PurchaseOrderStatus } from '@prisma/client'
import { sendEmail } from '@/lib/mail'
import { checkPurchaseOrders } from '../check-purchase-orders'

vi.mock('@prisma/client')
vi.mock('@/lib/mail')

describe('発注書ステータスチェック', () => {
  let mockPrisma: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma = {
      purchaseOrder: {
        findMany: vi.fn(),
        update: vi.fn()
      },
      statusHistory: {
        create: vi.fn()
      },
      $transaction: vi.fn(callback => callback(mockPrisma))
    }
    vi.mocked(PrismaClient).mockImplementation(() => mockPrisma)
  })

  describe('期限切れ発注書のチェック', () => {
    it('期限切れの発注書を検出して更新する', async () => {
      const mockOrders = [
        {
          id: '1',
          orderNumber: 'PO-001',
          status: PurchaseOrderStatus.PENDING,
          deliveryDate: new Date('2024-01-01'),
          vendor: {
            id: '1',
            name: 'テストベンダー',
            email: 'vendor@example.com'
          },
          items: [
            {
              id: '1',
              itemName: 'テスト商品',
              quantity: 1,
              unitPrice: '1000',
              taxRate: '0.1'
            }
          ]
        }
      ]

      mockPrisma.purchaseOrder.findMany.mockResolvedValue(mockOrders)
      mockPrisma.purchaseOrder.update.mockImplementation(({ data }) => ({
        ...mockOrders[0],
        ...data
      }))
      mockPrisma.statusHistory.create.mockResolvedValue({
        id: '1',
        purchaseOrderId: '1',
        userId: 'SYSTEM',
        status: PurchaseOrderStatus.COMPLETED,
        type: 'PURCHASE_ORDER',
        comment: '納期超過による自動更新'
      })

      const response = await checkPurchaseOrders()
      const data = await response.json()

      expect(data).toEqual({ success: true })

      // 発注書の検索
      expect(mockPrisma.purchaseOrder.findMany).toHaveBeenCalledWith({
        where: {
          status: PurchaseOrderStatus.PENDING,
          deliveryDate: {
            lt: expect.any(Date)
          }
        },
        include: {
          vendor: true,
          items: true
        }
      })

      // ステータスの更新
      expect(mockPrisma.purchaseOrder.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          status: PurchaseOrderStatus.COMPLETED,
          updatedById: 'SYSTEM'
        },
        include: {
          vendor: true,
          items: true
        }
      })

      // ステータス履歴の作成
      expect(mockPrisma.statusHistory.create).toHaveBeenCalledWith({
        data: {
          purchaseOrderId: '1',
          userId: 'SYSTEM',
          status: String(PurchaseOrderStatus.COMPLETED),
          type: 'PURCHASE_ORDER',
          comment: '納期超過による自動更新'
        }
      })

      // メール通知
      expect(sendEmail).toHaveBeenCalledWith(
        'vendor@example.com',
        'statusUpdated',
        {
          documentNumber: 'PO-001',
          vendorName: 'テストベンダー',
          status: PurchaseOrderStatus.COMPLETED
        }
      )
    })

    it('期限切れの発注書が存在しない場合は何もしない', async () => {
      mockPrisma.purchaseOrder.findMany.mockResolvedValue([])

      const response = await checkPurchaseOrders()
      const data = await response.json()

      expect(data).toEqual({ success: true })
      expect(mockPrisma.purchaseOrder.update).not.toHaveBeenCalled()
      expect(mockPrisma.statusHistory.create).not.toHaveBeenCalled()
      expect(sendEmail).not.toHaveBeenCalled()
    })

    it('データベースエラー時は500エラーを返す', async () => {
      mockPrisma.purchaseOrder.findMany.mockRejectedValue(new Error('Database error'))

      const response = await checkPurchaseOrders()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        success: false,
        error: 'Failed to check purchase orders'
      })
    })

    it('メール送信エラー時もステータス更新は完了する', async () => {
      const mockOrders = [
        {
          id: '1',
          orderNumber: 'PO-001',
          status: PurchaseOrderStatus.PENDING,
          deliveryDate: new Date('2024-01-01'),
          vendor: {
            id: '1',
            name: 'テストベンダー',
            email: 'vendor@example.com'
          },
          items: []
        }
      ]

      mockPrisma.purchaseOrder.findMany.mockResolvedValue(mockOrders)
      mockPrisma.purchaseOrder.update.mockImplementation(({ data }) => ({
        ...mockOrders[0],
        ...data
      }))
      vi.mocked(sendEmail).mockRejectedValue(new Error('Mail error'))

      const response = await checkPurchaseOrders()
      const data = await response.json()

      expect(data).toEqual({ success: true })
      expect(mockPrisma.purchaseOrder.update).toHaveBeenCalled()
      expect(mockPrisma.statusHistory.create).toHaveBeenCalled()
    })
  })
}) 