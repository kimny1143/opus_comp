import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addDays, subDays } from 'date-fns'
import { InvoiceStatus } from '@prisma/client'
import { sendReminder } from '../route'
import { prisma } from '@/lib/prisma'
import { mailService } from '@/lib/mail'

vi.mock('@/lib/prisma')
vi.mock('@/lib/mail', () => ({
  mailService: {
    sendMail: vi.fn()
  }
}))

describe('リマインダー機能', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('期限前リマインダー', () => {
    it('期限7日前の請求書に対してリマインダーを送信', async () => {
      const dueDate = addDays(new Date(), 7)
      const mockInvoices = [{
        id: '1',
        status: InvoiceStatus.SENT,
        dueDate,
        vendor: {
          name: 'テスト取引先',
          email: 'test@example.com'
        }
      }]

      // @ts-expect-error モックのため型を完全に合わせる必要はない
      prisma.invoice.findMany.mockResolvedValue(mockInvoices)

      await sendReminder()

      expect(mailService.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: '【リマインダー】支払期限が近づいています',
        text: expect.stringContaining('7日後')
      })
    })

    it('期限3日前の請求書に対してリマインダーを送信', async () => {
      const dueDate = addDays(new Date(), 3)
      const mockInvoices = [{
        id: '2',
        status: InvoiceStatus.SENT,
        dueDate,
        vendor: {
          name: 'テスト取引先2',
          email: 'test2@example.com'
        }
      }]

      // @ts-expect-error モックのため型を完全に合わせる必要はない
      prisma.invoice.findMany.mockResolvedValue(mockInvoices)

      await sendReminder()

      expect(mailService.sendMail).toHaveBeenCalledWith({
        to: 'test2@example.com',
        subject: '【リマインダー】支払期限が迫っています',
        text: expect.stringContaining('3日後')
      })
    })
  })

  describe('期限超過リマインダー', () => {
    it('期限超過の請求書のステータスをOVERDUEに更新', async () => {
      const dueDate = subDays(new Date(), 1)
      const mockInvoices = [{
        id: '3',
        status: InvoiceStatus.SENT,
        dueDate,
        vendor: {
          name: 'テスト取引先3',
          email: 'test3@example.com'
        }
      }]

      // @ts-expect-error モックのため型を完全に合わせる必要はない
      prisma.invoice.findMany.mockResolvedValue(mockInvoices)

      await sendReminder()

      expect(prisma.invoice.update).toHaveBeenCalledWith({
        where: { id: '3' },
        data: { status: InvoiceStatus.OVERDUE }
      })

      expect(mailService.sendMail).toHaveBeenCalledWith({
        to: 'test3@example.com',
        subject: '【重要】支払期限が超過しています',
        text: expect.stringContaining('支払期限を超過')
      })
    })
  })

  describe('特殊ケース', () => {
    it('メールアドレスが未設定の取引先はスキップ', async () => {
      const dueDate = addDays(new Date(), 7)
      const mockInvoices = [{
        id: '4',
        status: InvoiceStatus.SENT,
        dueDate,
        vendor: {
          name: 'テスト取引先4',
          email: null
        }
      }]

      // @ts-expect-error モックのため型を完全に合わせる必要はない
      prisma.invoice.findMany.mockResolvedValue(mockInvoices)

      await sendReminder()

      expect(mailService.sendMail).not.toHaveBeenCalled()
    })

    it('既にOVERDUEステータスの請求書はリマインダー対象外', async () => {
      const dueDate = subDays(new Date(), 1)
      const mockInvoices = [{
        id: '5',
        status: InvoiceStatus.OVERDUE,
        dueDate,
        vendor: {
          name: 'テスト取引先5',
          email: 'test5@example.com'
        }
      }]

      // @ts-expect-error モックのため型を完全に合わせる必要はない
      prisma.invoice.findMany.mockResolvedValue(mockInvoices)

      await sendReminder()

      expect(mailService.sendMail).not.toHaveBeenCalled()
      expect(prisma.invoice.update).not.toHaveBeenCalled()
    })
  })
}) 