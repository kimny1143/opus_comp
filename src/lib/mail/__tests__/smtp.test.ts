import { describe, expect, it, vi, beforeEach } from 'vitest'
import { sendEmail } from '../smtp'
import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

vi.mock('nodemailer')
vi.mock('@react-email/render')
vi.mock('@/lib/prisma', () => ({
  prisma: {
    vendor: {
      findUnique: vi.fn(),
    },
    invoiceItem: {
      findMany: vi.fn(),
    },
  },
}))
vi.mock('@/components/email/EmailTemplate', () => ({
  EmailTemplate: vi.fn(() => null)
}))

describe('sendEmail', () => {
  const mockTransporter = {
    sendMail: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(nodemailer.createTransport as any).mockReturnValue(mockTransporter)
    ;(render as any).mockResolvedValue('<div>Mocked Email</div>')

    // Prismaのモックを設定
    const mockVendor = {
      id: '1',
      name: 'テスト取引先',
      registrationNumber: 'T1234567890123',
    }
    const mockItems = [
      {
        itemName: '商品A',
        quantity: new Prisma.Decimal(2),
        unitPrice: new Prisma.Decimal(1000),
        taxRate: new Prisma.Decimal(0.1),
        description: '標準税率商品'
      },
      {
        itemName: '商品B',
        quantity: new Prisma.Decimal(1),
        unitPrice: new Prisma.Decimal(500),
        taxRate: new Prisma.Decimal(0.08),
        description: '軽減税率商品'
      }
    ]

    ;(prisma.vendor.findUnique as any).mockResolvedValue(mockVendor)
    ;(prisma.invoiceItem.findMany as any).mockResolvedValue(mockItems)
  })

  it('should send invoice created email with PDF attachment', async () => {
    // モックデータ
    const mockInvoice = {
      id: '1',
      invoiceNumber: 'INV-001',
      templateId: 'template-1',
      purchaseOrderId: 'po-1',
      status: 'DRAFT' as const,
      createdAt: new Date('2025-02-02'),
      updatedAt: new Date('2025-02-02'),
      issueDate: new Date('2025-02-02'),
      dueDate: new Date('2025-03-02'),
      totalAmount: new Prisma.Decimal(2740),
      vendorId: '1',
      notes: 'テスト用請求書',
      createdById: 'user-1',
      updatedById: 'user-1',
      bankInfo: {
        bankName: 'テスト銀行',
        branchName: 'テスト支店',
        accountType: 'SAVINGS' as const,
        accountNumber: '1234567',
        accountHolder: 'テスト太郎'
      }
    }

    // 環境変数の設定
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_PORT = '587'
    process.env.SMTP_SECURE = 'false'
    process.env.SMTP_USER = 'test@example.com'
    process.env.SMTP_PASS = 'password'
    process.env.SMTP_FROM = 'noreply@example.com'
    process.env.COMPANY_REGISTRATION_NUMBER = 'T9876543210987'
    process.env.COMPANY_NAME = 'テスト株式会社'
    process.env.COMPANY_POSTAL_CODE = '150-0001'
    process.env.COMPANY_ADDRESS = '東京都渋谷区...'
    process.env.COMPANY_TEL = '03-1234-5678'
    process.env.COMPANY_EMAIL = 'info@example.com'

    // メール送信
    await sendEmail(
      'test@example.com',
      'invoiceCreated',
      { invoice: mockInvoice }
    )

    // 検証
    expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1)
    const mailOptions = mockTransporter.sendMail.mock.calls[0][0]

    // 基本的なメール情報の検証
    expect(mailOptions.from).toBe('noreply@example.com')
    expect(mailOptions.to).toBe('test@example.com')
    expect(mailOptions.subject).toContain('INV-001')
    expect(mailOptions.html).toBe('<div>Mocked Email</div>')

    // 添付ファイルの検証
    expect(mailOptions.attachments).toBeDefined()
    expect(mailOptions.attachments?.[0]).toMatchObject({
      filename: 'invoice-INV-001.pdf',
      content: expect.any(Buffer)
    })
  })

  it('should handle errors during email sending', async () => {
    // Prismaのモックをエラーを返すように設定
    (prisma.vendor.findUnique as any).mockRejectedValue(new Error('Database error'))

    const mockInvoice = {
      id: '1',
      invoiceNumber: 'INV-001',
      templateId: 'template-1',
      purchaseOrderId: 'po-1',
      status: 'DRAFT' as const,
      createdAt: new Date('2025-02-02'),
      updatedAt: new Date('2025-02-02'),
      issueDate: new Date('2025-02-02'),
      dueDate: new Date('2025-03-02'),
      totalAmount: new Prisma.Decimal(0),
      vendorId: '1',
      notes: '',
      createdById: 'user-1',
      updatedById: 'user-1',
      bankInfo: {
        bankName: 'テスト銀行',
        branchName: 'テスト支店',
        accountType: 'SAVINGS' as const,
        accountNumber: '1234567',
        accountHolder: 'テスト太郎'
      }
    }

    await expect(
      sendEmail('test@example.com', 'invoiceCreated', {
        invoice: mockInvoice
      })
    ).rejects.toThrow('Database error')
  })
})