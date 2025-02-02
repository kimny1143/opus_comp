import { describe, expect, it, vi, beforeEach } from 'vitest';
import PDFDocument from 'pdfkit';
import { generateInvoicePDF } from '../templates/invoice';
import { Prisma } from '@prisma/client';
import { ItemCategory } from '@/types/itemCategory';

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
    fillColor: vi.fn().mockReturnThis(),
    y: 0,
  } as unknown as PDFKit.PDFDocument;

  beforeEach(() => {
    vi.clearAllMocks();
    // フォントのモック
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('should generate PDF with invoice data', async () => {
    const mockInvoice = {
      id: '1',
      invoiceNumber: 'INV-001',
      issueDate: new Date('2025-02-01'),
      dueDate: new Date('2025-02-28'),
      notes: 'テスト用請求書',
      vendor: {
        name: 'テスト取引先',
        address: '東京都渋谷区...',
        registrationNumber: 'T1234567890123'
      },
      items: [
        {
          id: '1',
          itemName: 'テスト商品1',
          quantity: 2,
          unitPrice: new Prisma.Decimal(1000),
          taxRate: new Prisma.Decimal(0.1),
          description: '商品の説明1',
          category: ItemCategory.ELECTRONICS
        },
        {
          id: '2',
          itemName: 'テスト商品2',
          quantity: 1,
          unitPrice: new Prisma.Decimal(800),
          taxRate: new Prisma.Decimal(0.08),
          description: '商品の説明2',
          category: ItemCategory.FOOD
        }
      ]
    };

    const mockCompanyInfo = {
      name: 'テスト株式会社',
      postalCode: '123-4567',
      address: '東京都千代田区...',
      tel: '03-1234-5678',
      email: 'test@example.com',
      registrationNumber: 'T9876543210123'
    };

    await generateInvoicePDF(mockDoc, mockInvoice as any, mockCompanyInfo);

    // ヘッダー情報の検証
    expect(mockDoc.text).toHaveBeenCalledWith('請求書', expect.any(Object));
    expect(mockDoc.text).toHaveBeenCalledWith('※適格請求書等', expect.any(Object));
    expect(mockDoc.text).toHaveBeenCalledWith(`請求書番号: ${mockInvoice.invoiceNumber}`, expect.any(Object));

    // 登録番号の検証
    expect(mockDoc.text).toHaveBeenCalledWith(`登録番号: ${mockCompanyInfo.registrationNumber}`, expect.any(Object));
    expect(mockDoc.text).toHaveBeenCalledWith(`登録番号: ${mockInvoice.vendor.registrationNumber}`, expect.any(Object));

    // 明細行の検証
    mockInvoice.items.forEach(item => {
      expect(mockDoc.text).toHaveBeenCalledWith(item.itemName, expect.any(Number), expect.any(Number), expect.any(Object));
      expect(mockDoc.text).toHaveBeenCalledWith(item.quantity.toString(), expect.any(Number), expect.any(Number));
    });

    // 軽減税率の注記の検証
    expect(mockDoc.text).toHaveBeenCalledWith(
      '※ 軽減税率対象品目には軽減税率(8%)が適用されています。',
      expect.any(Object)
    );

    // インボイス制度対応の注記の検証
    expect(mockDoc.text).toHaveBeenCalledWith(
      '※ この請求書は「適格請求書等保存方式」に対応した請求書です。',
      expect.any(Object)
    );
  });

  it('should handle missing optional data', async () => {
    const mockInvoice = {
      id: '1',
      invoiceNumber: 'INV-001',
      issueDate: new Date('2025-02-01'),
      dueDate: new Date('2025-02-28'),
      vendor: {
        name: 'テスト取引先'
      },
      items: [
        {
          id: '1',
          itemName: 'テスト商品1',
          quantity: 1,
          unitPrice: new Prisma.Decimal(1000),
          taxRate: new Prisma.Decimal(0.1)
        }
      ]
    };

    const mockCompanyInfo = {
      name: 'テスト株式会社',
      postalCode: '123-4567',
      address: '東京都千代田区...',
      tel: '03-1234-5678',
      email: 'test@example.com'
    };

    await generateInvoicePDF(mockDoc, mockInvoice as any, mockCompanyInfo);

    // 基本情報の検証
    expect(mockDoc.text).toHaveBeenCalledWith('請求書', expect.any(Object));
    expect(mockDoc.text).toHaveBeenCalledWith(`請求書番号: ${mockInvoice.invoiceNumber}`, expect.any(Object));

    // オプショナルな情報が省略されていることの検証
    expect(mockDoc.text).not.toHaveBeenCalledWith('※適格請求書等', expect.any(Object));
    expect(mockDoc.text).not.toHaveBeenCalledWith('登録番号:', expect.any(Object));
  });
});