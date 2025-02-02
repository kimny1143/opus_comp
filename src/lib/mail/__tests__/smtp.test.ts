import { describe, expect, it, vi } from 'vitest';
import { sendMail, mockSendMail } from '../smtp';
import { MailContext, MailTemplateDataMap } from '../types';
import { Prisma, InvoiceStatus } from '@prisma/client';

const createTestInvoice = () => ({
  id: '1',
  invoiceNumber: 'INV-001',
  issueDate: new Date(),
  status: InvoiceStatus.DRAFT,
  dueDate: new Date(),
  notes: 'Test Notes',
  templateId: null,
  purchaseOrderId: null,
  bankInfo: null,
  template: null,
  vendor: {
    id: '1',
    name: 'Test Vendor',
    address: 'Test Address',
    registrationNumber: 'T1234567890123'
  },
  vendorId: '1',
  issuer: {
    name: 'Test Issuer',
    email: 'issuer@example.com',
    registrationNumber: 'T9876543210123',
    address: 'Test Address'
  },
  items: [],
  taxSummary: {
    byRate: [],
    totalTaxableAmount: new Prisma.Decimal('0'),
    totalTaxAmount: new Prisma.Decimal('0')
  },
  totalAmount: new Prisma.Decimal('0'),
  createdAt: new Date(),
  updatedAt: new Date(),
  createdById: '1',
  updatedById: '1'
});

const createTestContext = (): MailContext<'invoiceCreated'> => ({
  to: 'test@example.com',
  subject: 'Test Email',
  data: {
    invoice: createTestInvoice(),
    companyInfo: {
      name: 'Test Company',
      email: 'company@example.com'
    }
  }
});

describe('smtp', () => {
  describe('sendMail', () => {
    it('should send email successfully', async () => {
      const context = createTestContext();
      const result = await sendMail(context);
      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should handle errors', async () => {
      const context = createTestContext();
      context.to = 'invalid-email';
      const result = await sendMail(context);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('mockSendMail', () => {
    it('should mock email sending', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const context = createTestContext();
      const result = await mockSendMail(context);
      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^mock-/);
      expect(consoleSpy).toHaveBeenCalledWith('Mock email sent:', expect.any(Object));
    });
  });
});