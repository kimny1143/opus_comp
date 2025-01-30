import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PrismaClient, InvoiceStatus } from '@prisma/client'
import { sendEmail } from '@/lib/mail'
import { checkOverdueInvoices } from '../check-invoices'

vi.mock('@prisma/client')
vi.mock('@/lib/mail')

describe('請求書ステータスチェック', () => {
  let mockPrisma: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma = {
      invoice: {
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

  describe('期限切れ請求書のチェック', () => {
    it('期限切れの請求書を検出して更新する', async () => {
      const mockInvoices = [
        {
          id: '1',
          invoiceNumber: 'INV-001',
          status: InvoiceStatus.PENDING,
          dueDate: new Date('2024-01-01'),
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
          ],
          template: {
            id: '1',
            name: 'テストテンプレート'
          }
        }
      ]

      mockPrisma.invoice.findMany.mockResolvedValue(mockInvoices)
      mockPrisma.invoice.update.mockImplementation(({ data }) => ({
        ...mockInvoices[0],
        ...data
      }))
      mockPrisma.statusHistory.create.mockResolvedValue({
        id: '1',
        invoiceId: '1',
        userId: 'SYSTEM',
        status: InvoiceStatus.OVERDUE,
        type: 'INVOICE',
        comment: '支払期限超過による自動更新'
      })

      const response = await checkOverdueInvoices()
      const data = await response.json()

      expect(data).toEqual({ success: true })

      // 請求書の検索
      expect(mockPrisma.invoice.findMany).toHaveBeenCalledWith({
        where: {
          status: InvoiceStatus.PENDING,
          dueDate: {
            lt: expect.any(Date)
          }
        },
        include: {
          vendor: true,
          items: true,
          template: true
        }
      })

      // ステータスの更新
      expect(mockPrisma.invoice.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          status: InvoiceStatus.OVERDUE,
          updatedById: 'SYSTEM'
        },
        include: {
          vendor: true,
          items: true,
          template: true
        }
      })

      // ステータス履歴の作成
      expect(mockPrisma.statusHistory.create).toHaveBeenCalledWith({
        data: {
          invoiceId: '1',
          userId: 'SYSTEM',
          status: String(InvoiceStatus.OVERDUE),
          type: 'INVOICE',
          comment: '支払期限超過による自動更新'
        }
      })

      // メール通知
      expect(sendEmail).toHaveBeenCalledWith(
        'vendor@example.com',
        'invoiceStatusUpdated',
        {
          invoiceNumber: 'INV-001',
          vendorName: 'テストベンダー',
          oldStatus: InvoiceStatus.PENDING,
          newStatus: InvoiceStatus.OVERDUE
        }
      )
    })

    it('期限切れの請求書が存在しない場合は何もしない', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([])

      const response = await checkOverdueInvoices()
      const data = await response.json()

      expect(data).toEqual({ success: true })
      expect(mockPrisma.invoice.update).not.toHaveBeenCalled()
      expect(mockPrisma.statusHistory.create).not.toHaveBeenCalled()
      expect(sendEmail).not.toHaveBeenCalled()
    })

    it('データベースエラー時は500エラーを返す', async () => {
      mockPrisma.invoice.findMany.mockRejectedValue(new Error('Database error'))

      const response = await checkOverdueInvoices()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        success: false,
        error: 'Failed to check overdue invoices'
      })
    })

    it('メール送信エラー時もステータス更新は完了する', async () => {
      const mockInvoices = [
        {
          id: '1',
          invoiceNumber: 'INV-001',
          status: InvoiceStatus.PENDING,
          dueDate: new Date('2024-01-01'),
          vendor: {
            id: '1',
            name: 'テストベンダー',
            email: 'vendor@example.com'
          },
          items: [],
          template: null
        }
      ]

      mockPrisma.invoice.findMany.mockResolvedValue(mockInvoices)
      mockPrisma.invoice.update.mockImplementation(({ data }) => ({
        ...mockInvoices[0],
        ...data
      }))
      vi.mocked(sendEmail).mockRejectedValue(new Error('Mail error'))

      const response = await checkOverdueInvoices()
      const data = await response.json()

      expect(data).toEqual({ success: true })
      expect(mockPrisma.invoice.update).toHaveBeenCalled()
      expect(mockPrisma.statusHistory.create).toHaveBeenCalled()
    })
  })
}) 