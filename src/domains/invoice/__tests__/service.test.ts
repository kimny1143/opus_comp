import { describe, expect, it, vi, beforeEach } from 'vitest';
import { InvoiceService } from '../service';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { UserRole } from '../status';
import { generateInvoicePDF } from '@/infrastructure/pdf/invoice';
import { sendInvoiceEmail } from '@/infrastructure/mail/invoice';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    invoice: {
      findUnique: vi.fn(),
      update: vi.fn(),
    }
  }
}));

vi.mock('@/infrastructure/pdf/invoice', () => ({
  generateInvoicePDF: vi.fn()
}));

vi.mock('@/infrastructure/mail/invoice', () => ({
  sendInvoiceEmail: vi.fn()
}));

describe('InvoiceService', () => {
  const mockInvoice = {
    id: '1',
    templateId: 'template-1',
    purchaseOrderId: 'po-1',
    invoiceNumber: 'INV-001',
    status: InvoiceStatus.DRAFT,
    issueDate: new Date(),
    dueDate: new Date(),
    notes: '',
    bankInfo: {
      bankName: 'テスト銀行',
      branchName: 'テスト支店',
      accountType: 'SAVINGS',
      accountNumber: '1234567',
      accountName: 'テスト太郎'
    },
    vendorId: '1',
    totalAmount: new Prisma.Decimal(2200), // 1000 * 2 * (1 + 0.1)
    vendor: {
      id: '1',
      name: 'テスト取引先',
      registrationNumber: 'T1234567890123',
      address: '東京都渋谷区...',
      phone: '03-1234-5678',
      email: 'test@example.com'
    },
    template: {
      id: 'template-1',
      bankInfo: {
        bankName: 'テスト銀行',
        branchName: 'テスト支店',
        accountType: 'SAVINGS',
        accountNumber: '1234567',
        accountName: 'テスト太郎'
      },
      contractorName: 'テスト太郎',
      contractorAddress: '東京都渋谷区...',
      registrationNumber: 'T1234567890123',
      paymentTerms: '請求書発行から30日以内'
    },
    items: [
      {
        id: '1',
        invoiceId: '1',
        itemName: '商品A',
        description: '説明',
        quantity: 2,
        unitPrice: new Prisma.Decimal(1000),
        taxRate: new Prisma.Decimal(0.1)
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: 'user-1',
    updatedById: 'user-1'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(prisma.invoice, 'findUnique').mockResolvedValue(mockInvoice);
    vi.spyOn(prisma.invoice, 'update').mockResolvedValue({
      ...mockInvoice,
      status: InvoiceStatus.PENDING
    });
    vi.mocked(generateInvoicePDF).mockResolvedValue(Buffer.from('dummy pdf'));
    vi.mocked(sendInvoiceEmail).mockResolvedValue(undefined);
  });

  describe('updateStatus', () => {
    it('should update status for valid transition', async () => {
      const result = await InvoiceService.updateStatus(
        '1',
        InvoiceStatus.PENDING,
        ['user' as UserRole]
      );

      expect(result.status).toBe(InvoiceStatus.PENDING);
      expect(prisma.invoice.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: InvoiceStatus.PENDING },
        include: expect.any(Object)
      });
    });

    it('should send notification email for specific statuses', async () => {
      const emailData = {
        to: 'test@example.com'
      };

      // DRAFTからPENDINGへ
      await InvoiceService.updateStatus(
        '1',
        InvoiceStatus.PENDING,
        ['user' as UserRole]
      );

      // PENDINGからREVIEWINGへ
      vi.spyOn(prisma.invoice, 'findUnique').mockResolvedValue({
        ...mockInvoice,
        status: InvoiceStatus.PENDING
      });
      await InvoiceService.updateStatus(
        '1',
        InvoiceStatus.REVIEWING,
        ['admin' as UserRole]
      );

      // REVIEWINGからAPPROVEDへ
      vi.spyOn(prisma.invoice, 'findUnique').mockResolvedValue({
        ...mockInvoice,
        status: InvoiceStatus.REVIEWING
      });
      await InvoiceService.updateStatus(
        '1',
        InvoiceStatus.APPROVED,
        ['admin' as UserRole],
        emailData
      );

      expect(generateInvoicePDF).toHaveBeenCalled();
      expect(sendInvoiceEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          invoice: expect.any(Object),
          pdfBuffer: expect.any(Buffer),
          to: emailData.to
        })
      );
    });

    it('should throw error for invalid transition', async () => {
      await expect(
        InvoiceService.updateStatus(
          '1',
          InvoiceStatus.PAID,
          ['admin' as UserRole]
        )
      ).rejects.toThrow('Invalid status transition');
    });

    it('should throw error for insufficient permissions', async () => {
      await expect(
        InvoiceService.updateStatus(
          '1',
          InvoiceStatus.APPROVED,
          ['user' as UserRole]
        )
      ).rejects.toThrow('Permission denied');
    });

    it('should throw error when invoice not found', async () => {
      vi.spyOn(prisma.invoice, 'findUnique').mockResolvedValue(null);

      await expect(
        InvoiceService.updateStatus(
          '1',
          InvoiceStatus.PENDING,
          ['user' as UserRole]
        )
      ).rejects.toThrow('Invoice not found');
    });
  });
});