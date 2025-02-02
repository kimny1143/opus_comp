import { describe, expect, it, vi } from 'vitest';
import PDFDocument from 'pdfkit';
import { generateInvoicePDF } from '../templates/invoice';
import { Prisma } from '@prisma/client';

describe('generateInvoicePDF', () => {
  const mockDoc = {
    registerFont: vi.fn(),
    font: vi.fn(),
    fontSize: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    moveDown: vi.fn().mockReturnThis(),
    image: vi.fn(),
    moveTo: vi.fn().mockReturnThis(),
    lineTo: vi.fn().mockReturnThis(),
    stroke: vi.fn(),
    rect: vi.fn().mockReturnThis(),
    y: 0,
  } as unknown as PDFKit.PDFDocument;

  beforeEach(() => {
    vi.clearAllMocks();
    // フォントのモック
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  const mockInvoice = {
    invoiceNumber: 'INV-001',
    issueDate: new Date('2025-02-02'),
    dueDate: new Date('2025-03-02'),
    notes: 'テスト用請求書',
    vendor: {
      name: 'テスト取引先',
      address: '東京都渋谷区...',
      registrationNumber: 'T1234567890123',
    },
    items: [
      {
        itemName: '商品A',
        quantity: new Prisma.Decimal(2),
        unitPrice: new Prisma.Decimal(1000),
        taxRate: new Prisma.Decimal(0.1),
        description: '標準税率商品',
      },
      {
        itemName: '商品B',
        quantity: new Prisma.Decimal(1),
        unitPrice: new Prisma.Decimal(500),
        taxRate: new Prisma.Decimal(0.08),
        description: '軽減税率商品',
      },
    ],
  };

  const mockCompanyInfo = {
    name: 'テスト株式会社',
    postalCode: '150-0001',
    address: '東京都渋谷区...',
    tel: '03-1234-5678',
    email: 'test@example.com',
    registrationNumber: 'T9876543210987',
  };

  it('should generate PDF with registration numbers', async () => {
    await generateInvoicePDF(mockDoc, mockInvoice as any, mockCompanyInfo);

    // 適格請求書等の表示確認
    expect(mockDoc.text).toHaveBeenCalledWith('※適格請求書等', { align: 'center' });

    // 登録番号の表示確認
    expect(mockDoc.text).toHaveBeenCalledWith(
      `登録番号: ${mockCompanyInfo.registrationNumber}`,
      { align: 'right' }
    );

    // 取引先の登録番号の表示確認
    const textFn = mockDoc.text as unknown as ReturnType<typeof vi.fn>;
    const vendorRegCall = textFn.mock.calls.find(
      call => call[0] === `登録番号: ${mockInvoice.vendor.registrationNumber}`
    );
    expect(vendorRegCall).toBeTruthy();
  });

  it('should handle different tax rates correctly', async () => {
    await generateInvoicePDF(mockDoc, mockInvoice as any, mockCompanyInfo);

    // 税率区分の表示確認
    expect(mockDoc.text).toHaveBeenCalledWith('税率', 380, 80);
    expect(mockDoc.text).toHaveBeenCalledWith('標準税率(10%)', 380, 100);
    expect(mockDoc.text).toHaveBeenCalledWith('軽減税率(8%)', 380, 140);

    // 軽減税率の注記確認
    expect(mockDoc.text).toHaveBeenCalledWith(
      '※ 軽減税率対象品目には軽減税率(8%)が適用されています。',
      { align: 'right' }
    );
  });

  it('should calculate tax amounts correctly', async () => {
    await generateInvoicePDF(mockDoc, mockInvoice as any, mockCompanyInfo);

    // 標準税率(10%)の商品: 2000円 × 0.1 = 200円
    expect(mockDoc.text).toHaveBeenCalledWith('¥200', 450);
    // 軽減税率(8%)の商品: 500円 × 0.08 = 40円
    expect(mockDoc.text).toHaveBeenCalledWith('¥40', 450);
  });
});