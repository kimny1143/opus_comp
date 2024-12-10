import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/purchase-orders/[id]/pdf';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { PurchaseOrderStatusEnum } from '@prisma/client';
import PDFDocument from 'pdfkit';

jest.mock('next-auth/next');
jest.mock('@/lib/prisma');

// PDFKitのモックインターフェース
interface MockPDFDocument {
  pipe: jest.Mock;
  fontSize: jest.Mock;
  text: jest.Mock;
  moveDown: jest.Mock;
  moveTo: jest.Mock;
  lineTo: jest.Mock;
  stroke: jest.Mock;
  end: jest.Mock;
}

// PDFKitのモック実装
jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => ({
    pipe: jest.fn().mockReturnThis(),
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    moveTo: jest.fn().mockReturnThis(),
    lineTo: jest.fn().mockReturnThis(),
    stroke: jest.fn().mockReturnThis(),
    end: jest.fn()
  }));
});

describe('/api/purchase-orders/[id]/pdf', () => {
  const mockSession = {
    user: { id: 'user-1', name: 'Test User' }
  };

  const mockOrder = {
    id: 'order-1',
    orderNumber: 'PO20240101001',
    status: PurchaseOrderStatusEnum.DRAFT,
    vendorId: 'vendor-1',
    createdBy: 'user-1',
    orderDate: new Date('2024-01-01'),
    totalAmount: 1000,
    taxAmount: 100,
    vendor: {
      id: 'vendor-1',
      name: 'Test Vendor'
    },
    items: [
      {
        id: 'item-1',
        itemName: 'Test Item',
        quantity: 1,
        unitPrice: 1000,
        taxRate: 10,
        amount: 1000
      }
    ]
  };

  beforeEach(() => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.purchaseOrder.findFirst as jest.Mock).mockResolvedValue(mockOrder);
    jest.clearAllMocks();
  });

  it('認証されていない場合は401を返す', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce(null);
    const { req, res } = createMocks({
      method: 'GET',
      query: { id: 'order-1' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });

  it('発注書が存在しない場合は404を返す', async () => {
    (prisma.purchaseOrder.findFirst as jest.Mock).mockResolvedValueOnce(null);
    const { req, res } = createMocks({
      method: 'GET',
      query: { id: 'order-1' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
  });

  it('不正なメソッドの場合は405を返す', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      query: { id: 'order-1' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  describe('PDF生成', () => {
    let mockPdfDoc: MockPDFDocument;

    beforeEach(() => {
      mockPdfDoc = new (PDFDocument as jest.MockedClass<typeof PDFDocument>)() as unknown as MockPDFDocument;
    });

    it('PDFを生成して返す', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: 'order-1' }
      });

      await handler(req, res);

      // レスポンスヘッダーの検証
      expect(res.getHeader('Content-Type')).toBe('application/pdf');
      expect(res.getHeader('Content-Disposition')).toBe(
        `attachment; filename=purchase-order-${mockOrder.orderNumber}.pdf`
      );

      // PDFドキュメントの生成を検証
      expect(PDFDocument).toHaveBeenCalledWith({
        size: 'A4',
        margin: 50
      });

      // PDFのパイピングを検証
      expect(mockPdfDoc.pipe).toHaveBeenCalledWith(res);
    });

    it('PDFに発注書の基本情報を含める', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: 'order-1' }
      });

      await handler(req, res);

      // ヘッダー
      expect(mockPdfDoc.text).toHaveBeenCalledWith('発注書', { align: 'center' });

      // 発注番号と日付
      expect(mockPdfDoc.text).toHaveBeenCalledWith(
        `発注番号: ${mockOrder.orderNumber}`,
        { align: 'right' }
      );

      // 取引先情報
      expect(mockPdfDoc.text).toHaveBeenCalledWith(
        `${mockOrder.vendor.name} 御中`,
        { align: 'left' }
      );
    });

    it('PDFに明細テーブルを含める', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: 'order-1' }
      });

      await handler(req, res);

      // テーブルヘッダー
      expect(mockPdfDoc.text).toHaveBeenCalledWith('品目', 50, expect.any(Number));
      expect(mockPdfDoc.text).toHaveBeenCalledWith('数量', 250, expect.any(Number));
      expect(mockPdfDoc.text).toHaveBeenCalledWith('単価', 300, expect.any(Number));
      expect(mockPdfDoc.text).toHaveBeenCalledWith('税率', 380, expect.any(Number));
      expect(mockPdfDoc.text).toHaveBeenCalledWith('金額', 450, expect.any(Number));

      // 罫線
      expect(mockPdfDoc.moveTo).toHaveBeenCalled();
      expect(mockPdfDoc.lineTo).toHaveBeenCalled();
      expect(mockPdfDoc.stroke).toHaveBeenCalled();

      // 明細行
      mockOrder.items.forEach(item => {
        expect(mockPdfDoc.text).toHaveBeenCalledWith(
          item.itemName,
          50,
          expect.any(Number)
        );
        expect(mockPdfDoc.text).toHaveBeenCalledWith(
          item.quantity.toString(),
          250,
          expect.any(Number)
        );
        expect(mockPdfDoc.text).toHaveBeenCalledWith(
          `¥${item.unitPrice.toLocaleString()}`,
          300,
          expect.any(Number)
        );
        expect(mockPdfDoc.text).toHaveBeenCalledWith(
          `${item.taxRate}%`,
          380,
          expect.any(Number)
        );
        expect(mockPdfDoc.text).toHaveBeenCalledWith(
          `¥${item.amount.toLocaleString()}`,
          450,
          expect.any(Number)
        );
      });
    });

    it('PDFに合計金額情報を含める', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: 'order-1' }
      });

      await handler(req, res);

      // 小計
      expect(mockPdfDoc.text).toHaveBeenCalledWith(
        `小計: ¥${mockOrder.totalAmount.toLocaleString()}`,
        { align: 'right' }
      );

      // 消費税
      expect(mockPdfDoc.text).toHaveBeenCalledWith(
        `消費税: ¥${mockOrder.taxAmount.toLocaleString()}`,
        { align: 'right' }
      );

      // 合計金額
      expect(mockPdfDoc.text).toHaveBeenCalledWith(
        `合計金額: ¥${(mockOrder.totalAmount + mockOrder.taxAmount).toLocaleString()}`,
        { align: 'right' }
      );
    });

    it('PDFに備考と取引条件を含める', async () => {
      const orderWithNotes = {
        ...mockOrder,
        description: 'テスト備考',
        terms: 'テスト取引条件'
      };
      (prisma.purchaseOrder.findFirst as jest.Mock).mockResolvedValueOnce(orderWithNotes);

      const { req, res } = createMocks({
        method: 'GET',
        query: { id: 'order-1' }
      });

      await handler(req, res);

      // 備考
      expect(mockPdfDoc.text).toHaveBeenCalledWith('備考:', { underline: true });
      expect(mockPdfDoc.text).toHaveBeenCalledWith(orderWithNotes.description);

      // 取引条件
      expect(mockPdfDoc.text).toHaveBeenCalledWith('取引条件:', { underline: true });
      expect(mockPdfDoc.text).toHaveBeenCalledWith(orderWithNotes.terms);
    });
  });
}); 