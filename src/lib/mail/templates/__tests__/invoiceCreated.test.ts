import { describe, expect, it, vi } from 'vitest';
import { invoiceCreatedTemplate } from '../invoiceCreated';
import { Prisma, InvoiceStatus } from '@prisma/client';

// PDFKitのモック
vi.mock('pdfkit', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      on: vi.fn().mockReturnThis(),
      registerFont: vi.fn().mockReturnThis(),
      font: vi.fn().mockReturnThis(),
      fontSize: vi.fn().mockReturnThis(),
      text: vi.fn().mockReturnThis(),
      moveDown: vi.fn().mockReturnThis(),
      image: vi.fn().mockReturnThis(),
      moveTo: vi.fn().mockReturnThis(),
      lineTo: vi.fn().mockReturnThis(),
      stroke: vi.fn().mockReturnThis(),
      rect: vi.fn().mockReturnThis(),
      fillColor: vi.fn().mockReturnThis(),
      end: vi.fn(),
      y: 0
    }))
  };
});

describe('invoiceCreatedTemplate', () => {
  const mockInvoice = {
    id: '1',
    invoiceNumber: 'INV-001',
    issueDate: new Date('2025-02-01'),
    status: InvoiceStatus.DRAFT,
    dueDate: new Date('2025-02-28'),
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
    totalAmount: new Prisma.Decimal('2200'),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: '1',
    updatedById: '1'
  };

  const mockCompanyInfo = {
    name: 'Test Company',
    email: 'company@example.com',
    registrationNumber: 'T9876543210123'
  };

  it('should render email template with correct subject', async () => {
    const result = await invoiceCreatedTemplate.render({
      invoice: mockInvoice,
      companyInfo: mockCompanyInfo
    });

    expect(result.subject).toBe('請求書[INV-001]が作成されました');
  });

  it('should include invoice details in email body', async () => {
    const result = await invoiceCreatedTemplate.render({
      invoice: mockInvoice,
      companyInfo: mockCompanyInfo
    });

    expect(result.body).toContain('Test Company');
    expect(result.body).toContain('INV-001');
    expect(result.body).toContain('2025/2/1');
    expect(result.body).toContain('¥2,200');
  });

  it('should attach PDF file', async () => {
    const result = await invoiceCreatedTemplate.render({
      invoice: mockInvoice,
      companyInfo: mockCompanyInfo
    });

    expect(result.attachments).toHaveLength(1);
    expect(result.attachments?.[0].filename).toBe('invoice_INV-001.pdf');
    expect(Buffer.isBuffer(result.attachments?.[0].content)).toBe(true);
  });
});