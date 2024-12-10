import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/purchase-orders/[id]';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { PurchaseOrderStatusEnum } from '@prisma/client';

jest.mock('next-auth/next');
jest.mock('@/lib/prisma');

describe('/api/purchase-orders/[id]', () => {
  const mockSession = {
    user: { id: 'user-1', name: 'Test User' }
  };

  const mockOrder = {
    id: 'order-1',
    orderNumber: 'PO20240101001',
    status: PurchaseOrderStatusEnum.DRAFT,
    vendorId: 'vendor-1',
    createdBy: 'user-1',
    items: [
      {
        id: 'item-1',
        itemName: 'Test Item',
        quantity: 1,
        unitPrice: 1000,
        taxRate: 10,
        amount: 1000
      }
    ],
    vendor: {
      id: 'vendor-1',
      name: 'Test Vendor'
    },
    statusHistory: [
      {
        id: 'status-1',
        status: PurchaseOrderStatusEnum.DRAFT,
        createdAt: new Date()
      }
    ]
  };

  beforeEach(() => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.purchaseOrder.findFirst as jest.Mock).mockResolvedValue(mockOrder);
  });

  describe('GET', () => {
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
        query: { id: 'non-existent' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });

    it('発注書の詳細を返す', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: 'order-1' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockOrder);
    });
  });

  describe('PUT', () => {
    it('発注書を更新する', async () => {
      const updatedOrder = {
        ...mockOrder,
        description: '更新テスト'
      };

      (prisma.purchaseOrder.update as jest.Mock).mockResolvedValueOnce(updatedOrder);

      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: 'order-1' },
        body: {
          vendorId: 'vendor-1',
          orderDate: new Date().toISOString(),
          description: '更新テスト',
          items: [{
            itemName: 'Updated Item',
            quantity: 2,
            unitPrice: 1000,
            taxRate: 10
          }]
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(updatedOrder);
    });
  });

  describe('DELETE', () => {
    it('発注書を削除する', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: 'order-1' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(prisma.purchaseOrder.delete).toHaveBeenCalledWith({
        where: { id: 'order-1' }
      });
    });
  });
}); 