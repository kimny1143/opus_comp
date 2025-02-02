import { describe, expect, it, vi } from 'vitest';
import { invoiceCreatedTemplate } from '../invoiceCreated';
import { createTestInvoice, createTestCompanyInfo } from '@/test/helpers/invoice';
import { MailTemplateValidationError } from '../../types';
import { convertToPdfInvoice } from '@/lib/pdf/utils';

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

// PDF変換のモック
vi.mock('@/lib/pdf/utils', () => ({
  convertToPdfInvoice: vi.fn()
}));

describe('invoiceCreatedTemplate', () => {
  const mockInvoice = createTestInvoice();
  const mockCompanyInfo = createTestCompanyInfo();

  beforeEach(() => {
    vi.clearAllMocks();
    (convertToPdfInvoice as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockInvoice,
      items: mockInvoice.items.map(item => ({
        ...item,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate
      }))
    });
  });

  describe('metadata', () => {
    it('should have correct metadata', () => {
      expect(invoiceCreatedTemplate.metadata).toEqual({
        name: '請求書作成通知',
        description: '請求書が作成されたことを通知するメール',
        subject: '請求書[{invoiceNumber}]が作成されました',
        variables: [
          'companyInfo.name',
          'invoice.invoiceNumber',
          'invoice.issueDate',
          'invoice.totalAmount'
        ]
      });
    });
  });

  describe('validate', () => {
    it('should pass validation with valid data', () => {
      expect(() =>
        invoiceCreatedTemplate.validate({
          invoice: mockInvoice,
          companyInfo: mockCompanyInfo
        })
      ).not.toThrow();
    });

    it('should throw MailTemplateValidationError when invoice number is missing', () => {
      const invalidInvoice = {
        ...mockInvoice,
        invoiceNumber: ''
      };

      expect(() =>
        invoiceCreatedTemplate.validate({
          invoice: invalidInvoice,
          companyInfo: mockCompanyInfo
        })
      ).toThrow(MailTemplateValidationError);
    });

    it('should throw MailTemplateValidationError when company info is invalid', () => {
      const invalidCompanyInfo = {
        ...mockCompanyInfo,
        name: '',
        email: ''
      };

      expect(() =>
        invoiceCreatedTemplate.validate({
          invoice: mockInvoice,
          companyInfo: invalidCompanyInfo
        })
      ).toThrow(MailTemplateValidationError);
    });
  });

  describe('render', () => {
    it('should render email with correct subject and body', async () => {
      const result = await invoiceCreatedTemplate.render({
        invoice: mockInvoice,
        companyInfo: mockCompanyInfo
      });

      expect(result.subject).toBe(`請求書[${mockInvoice.invoiceNumber}]が作成されました`);
      expect(result.body).toContain(mockCompanyInfo.name);
      expect(result.body).toContain(mockInvoice.invoiceNumber);
      expect(result.body).toContain(mockInvoice.issueDate.toLocaleDateString());
      expect(result.body).toContain(mockInvoice.totalAmount.toLocaleString());
    });

    it('should include PDF attachment', async () => {
      const result = await invoiceCreatedTemplate.render({
        invoice: mockInvoice,
        companyInfo: mockCompanyInfo
      });

      expect(result.attachments).toHaveLength(1);
      expect(result.attachments![0]).toMatchObject({
        filename: `invoice_${mockInvoice.invoiceNumber}.pdf`,
        contentType: 'application/pdf'
      });
      expect(result.attachments![0].content).toBeInstanceOf(Buffer);
    });

    it('should throw error when PDF conversion fails', async () => {
      (convertToPdfInvoice as unknown as ReturnType<typeof vi.fn>).mockReturnValue(null);

      await expect(
        invoiceCreatedTemplate.render({
          invoice: mockInvoice,
          companyInfo: mockCompanyInfo
        })
      ).rejects.toThrow('請求書データの変換に失敗しました');
    });
  });
});