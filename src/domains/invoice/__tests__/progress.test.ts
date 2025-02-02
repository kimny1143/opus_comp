import { describe, expect, it, vi, beforeEach } from 'vitest';
import { InvoiceProgressManager } from '../progress';
import { prisma } from '@/lib/prisma';
import { InvoiceStatus } from '@prisma/client';
import { generateInvoicePDF } from '@/infrastructure/pdf/invoice';
import { sendInvoiceEmail } from '@/infrastructure/mail/invoice';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    statusHistory: {
      create: vi.fn(),
      findMany: vi.fn()
    },
    invoice: {
      findUnique: vi.fn()
    },
    notification: {
      createMany: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn()
    }
  }
}));

vi.mock('@/infrastructure/pdf/invoice', () => ({
  generateInvoicePDF: vi.fn()
}));

vi.mock('@/infrastructure/mail/invoice', () => ({
  sendInvoiceEmail: vi.fn()
}));

vi.mock('../service', () => ({
  InvoiceService: {
    getInvoiceById: vi.fn().mockResolvedValue({
      id: '1',
      invoiceNumber: 'INV-001',
      status: InvoiceStatus.APPROVED,
      template: {
        id: 'template-1',
        bankInfo: {},
        contractorName: 'テスト太郎',
        contractorAddress: '東京都渋谷区...',
        registrationNumber: 'T1234567890123'
      },
      vendor: {
        id: '1',
        name: 'テスト取引先',
        registrationNumber: 'T1234567890123',
        address: '東京都渋谷区...'
      },
      items: [],
      bankInfo: {},
      totalAmount: 1000
    })
  }
}));

describe('InvoiceProgressManager', () => {
  const mockInvoice = {
    id: '1',
    invoiceNumber: 'INV-001',
    status: InvoiceStatus.DRAFT,
    createdById: 'user-1',
    vendor: {
      id: '1',
      name: 'テスト取引先',
      users: [
        {
          id: 'vendor-user-1',
          email: 'vendor@example.com'
        }
      ]
    },
    createdBy: {
      id: 'user-1',
      email: 'admin@example.com'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(prisma.invoice, 'findUnique').mockResolvedValue(mockInvoice as any);
    vi.spyOn(prisma.statusHistory, 'create').mockResolvedValue({} as any);
    vi.spyOn(prisma.notification, 'createMany').mockResolvedValue({ count: 1 });
    vi.mocked(generateInvoicePDF).mockResolvedValue(Buffer.from('dummy pdf'));
    vi.mocked(sendInvoiceEmail).mockResolvedValue(undefined);
  });

  describe('recordStatusChange', () => {
    it('should record status change history', async () => {
      await InvoiceProgressManager.recordStatusChange({
        invoiceId: '1',
        oldStatus: InvoiceStatus.DRAFT,
        newStatus: InvoiceStatus.PENDING,
        userId: 'user-1',
        comment: 'テスト用コメント'
      });

      expect(prisma.statusHistory.create).toHaveBeenCalledWith({
        data: {
          type: 'INVOICE',
          status: InvoiceStatus.PENDING,
          comment: 'テスト用コメント',
          userId: 'user-1',
          invoiceId: '1'
        }
      });
    });

    it('should create notifications for relevant users', async () => {
      await InvoiceProgressManager.recordStatusChange({
        invoiceId: '1',
        oldStatus: InvoiceStatus.DRAFT,
        newStatus: InvoiceStatus.PENDING,
        userId: 'user-1'
      });

      expect(prisma.notification.createMany).toHaveBeenCalled();
      const createManyCall = vi.mocked(prisma.notification.createMany).mock.calls[0][0];
      expect(createManyCall.data).toHaveLength(2); // 作成者と取引先担当者
    });

    it('should send email notification for specific statuses', async () => {
      await InvoiceProgressManager.recordStatusChange({
        invoiceId: '1',
        oldStatus: InvoiceStatus.REVIEWING,
        newStatus: InvoiceStatus.APPROVED,
        userId: 'user-1'
      });

      expect(generateInvoicePDF).toHaveBeenCalled();
      expect(sendInvoiceEmail).toHaveBeenCalled();
    });
  });

  describe('getStatusHistory', () => {
    it('should return status history with user details', async () => {
      const mockHistory = [
        {
          id: '1',
          type: 'INVOICE',
          status: InvoiceStatus.PENDING,
          comment: 'テスト用コメント',
          createdAt: new Date(),
          user: {
            name: 'テストユーザー',
            email: 'test@example.com'
          }
        }
      ];

      vi.spyOn(prisma.statusHistory, 'findMany').mockResolvedValue(mockHistory as any);

      const result = await InvoiceProgressManager.getStatusHistory('1');

      expect(result).toEqual(mockHistory);
      expect(prisma.statusHistory.findMany).toHaveBeenCalledWith({
        where: {
          invoiceId: '1',
          type: 'INVOICE'
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    });
  });

  describe('getUnreadNotifications', () => {
    it('should return unread notifications with invoice details', async () => {
      const mockNotifications = [
        {
          id: '1',
          title: 'テスト通知',
          message: 'テストメッセージ',
          isRead: false,
          invoice: {
            invoiceNumber: 'INV-001',
            status: InvoiceStatus.PENDING
          }
        }
      ];

      vi.spyOn(prisma.notification, 'findMany').mockResolvedValue(mockNotifications as any);

      const result = await InvoiceProgressManager.getUnreadNotifications('user-1');

      expect(result).toEqual(mockNotifications);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: {
          recipientId: 'user-1',
          isRead: false
        },
        include: {
          invoice: {
            select: {
              invoiceNumber: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read', async () => {
      await InvoiceProgressManager.markNotificationAsRead('1');

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isRead: true }
      });
    });
  });
});
