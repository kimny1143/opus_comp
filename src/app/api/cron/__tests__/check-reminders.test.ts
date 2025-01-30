import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkReminders } from '../check-reminders'
import { prisma } from '@/lib/prisma'
import { EmailNotificationService } from '@/lib/notification/email-service'
import { InvoiceStatus, ReminderType } from '@prisma/client'
import { addDays } from 'date-fns'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    reminderSetting: {
      findMany: vi.fn(),
      update: vi.fn()
    }
  }
}))

vi.mock('@/lib/notification/email-service', () => ({
  EmailNotificationService: {
    sendPaymentReminder: vi.fn()
  }
}))

describe('checkReminders', () => {
  const mockToday = new Date('2025-01-30')
  const mockInvoice = {
    id: '1',
    status: InvoiceStatus.PENDING,
    issueDate: addDays(mockToday, -5),
    dueDate: addDays(mockToday, 5),
    bankInfo: { accountNumber: '1234567' },
    template: {
      bankInfo: { accountNumber: '1234567' }
    },
    vendor: {
      id: '1',
      name: 'Test Vendor',
      email: 'vendor@example.com'
    },
    items: []
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(mockToday)
  })

  it('期限前のリマインダーが正しく送信される', async () => {
    const mockReminder = {
      id: '1',
      enabled: true,
      type: ReminderType.BEFORE_DUE,
      daysBeforeOrAfter: 5,
      invoiceId: '1',
      lastSentAt: new Date('2025-01-25'),
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      invoice: mockInvoice
    }

    vi.mocked(prisma.reminderSetting.findMany).mockResolvedValue([mockReminder])
    vi.mocked(prisma.reminderSetting.update).mockResolvedValue(mockReminder)

    const response = await checkReminders()
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(EmailNotificationService.sendPaymentReminder).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockInvoice.id,
        vendor: expect.objectContaining({
          email: mockInvoice.vendor.email
        })
      }),
      'upcoming'
    )
    expect(prisma.reminderSetting.update).toHaveBeenCalledWith({
      where: { id: mockReminder.id },
      data: { lastSentAt: mockToday }
    })
  })

  it('期限後のリマインダーが正しく送信される', async () => {
    const mockOverdueInvoice = {
      ...mockInvoice,
      dueDate: addDays(mockToday, -3)
    }
    const mockReminder = {
      id: '2',
      enabled: true,
      type: ReminderType.AFTER_DUE,
      daysBeforeOrAfter: 3,
      invoiceId: '1',
      lastSentAt: new Date('2025-01-25'),
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      invoice: mockOverdueInvoice
    }

    vi.mocked(prisma.reminderSetting.findMany).mockResolvedValue([mockReminder])
    vi.mocked(prisma.reminderSetting.update).mockResolvedValue(mockReminder)

    const response = await checkReminders()
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(EmailNotificationService.sendPaymentReminder).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockOverdueInvoice.id,
        vendor: expect.objectContaining({
          email: mockOverdueInvoice.vendor.email
        })
      }),
      'overdue'
    )
  })

  it('発行後のリマインダーが正しく送信される', async () => {
    const mockReminder = {
      id: '3',
      enabled: true,
      type: ReminderType.AFTER_ISSUE,
      daysBeforeOrAfter: 5,
      invoiceId: '1',
      lastSentAt: new Date('2025-01-25'),
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      invoice: mockInvoice
    }

    vi.mocked(prisma.reminderSetting.findMany).mockResolvedValue([mockReminder])
    vi.mocked(prisma.reminderSetting.update).mockResolvedValue(mockReminder)

    const response = await checkReminders()
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(EmailNotificationService.sendPaymentReminder).toHaveBeenCalled()
  })

  it('無効化されているリマインダーは送信されない', async () => {
    const mockReminder = {
      id: '4',
      enabled: false,
      type: ReminderType.BEFORE_DUE,
      daysBeforeOrAfter: 5,
      invoiceId: '1',
      lastSentAt: new Date('2025-01-25'),
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      invoice: mockInvoice
    }

    vi.mocked(prisma.reminderSetting.findMany).mockResolvedValue([mockReminder])

    const response = await checkReminders()
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(EmailNotificationService.sendPaymentReminder).not.toHaveBeenCalled()
    expect(prisma.reminderSetting.update).not.toHaveBeenCalled()
  })

  it('データベースエラー時に500エラーが返される', async () => {
    vi.mocked(prisma.reminderSetting.findMany).mockRejectedValue(new Error('Database error'))

    const response = await checkReminders()
    const data = await response.json()

    expect(data.success).toBe(false)
    expect(data.error).toBe('Failed to check reminders')
    expect(response.status).toBe(500)
  })

  it('メール送信エラー時でもリマインダー更新は完了する', async () => {
    const mockReminder = {
      id: '5',
      enabled: true,
      type: ReminderType.BEFORE_DUE,
      daysBeforeOrAfter: 5,
      invoiceId: '1',
      lastSentAt: new Date('2025-01-25'),
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      invoice: mockInvoice
    }

    vi.mocked(prisma.reminderSetting.findMany).mockResolvedValue([mockReminder])
    vi.mocked(prisma.reminderSetting.update).mockResolvedValue(mockReminder)
    vi.mocked(EmailNotificationService.sendPaymentReminder).mockRejectedValue(new Error('Email error'))

    const response = await checkReminders()
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(prisma.reminderSetting.update).toHaveBeenCalled()
  })
}) 