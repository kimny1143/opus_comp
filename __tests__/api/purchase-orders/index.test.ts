import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/purchase-orders/index';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

jest.mock('next-auth/next');
jest.mock('@/lib/prisma');

describe('/api/purchase-orders', () => {
  const mockSession = {
    user: { id: 'user-1', name: 'Test User' }
  };

  beforeEach(() => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('GET', () => {
    it('認証されていない場合は401を返す', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce(null);
      const { req, res } = createMocks({ method: 'GET' });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });

    it('発注書一覧を返す', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          orderNumber: 'PO20240101001',
          status: 'DRAFT'
        }
      ];

      (prisma.purchaseOrder.findMany as jest.Mock).mockResolvedValueOnce(mockOrders);
      (prisma.purchaseOrder.count as jest.Mock).mockResolvedValueOnce(1);

      const { req, res } = createMocks({
        method: 'GET',
        query: { page: '1', limit: '10' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        orders: mockOrders,
        total: 1,
        page: 1,
        totalPages: 1
      });
    });
  });

  describe('POST', () => {
    it('必須項目が欠けている場合は400を返す', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {}
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('発注書を作成する', async () => {
      const mockOrder = {
        id: 'order-1',
        orderNumber: 'PO20240101001',
        status: 'DRAFT'
      };

      (prisma.purchaseOrder.create as jest.Mock).mockResolvedValueOnce(mockOrder);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          vendorId: 'vendor-1',
          orderDate: new Date().toISOString(),
          items: [{
            itemName: 'Test Item',
            quantity: 1,
            unitPrice: 1000,
            taxRate: 10
          }]
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual(mockOrder);
    });
  });
}); 