import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/purchase-orders/bulk';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { PurchaseOrderStatusEnum } from '@prisma/client';

jest.mock('next-auth/next');
jest.mock('@/lib/prisma');

describe('/api/purchase-orders/bulk', () => {
  const mockSession = {
    user: { id: 'user-1', name: 'Test User' }
  };

  beforeEach(() => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    jest.clearAllMocks();
  });

  it('認証されていない場合は401を返す', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce(null);
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        action: 'delete',
        orderIds: ['order-1', 'order-2']
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });

  describe('一括削除', () => {
    it('選択された発注書を一括削除する', async () => {
      const orderIds = ['order-1', 'order-2'];
      (prisma.purchaseOrder.findMany as jest.Mock).mockResolvedValueOnce(
        orderIds.map(id => ({ id, createdBy: mockSession.user.id }))
      );

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          action: 'delete',
          orderIds
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(prisma.purchaseOrder.deleteMany).toHaveBeenCalledWith({
        where: {
          id: { in: orderIds },
          createdBy: mockSession.user.id
        }
      });
    });

    it('権限のない発注書が含まれる場合は403を返す', async () => {
      const orderIds = ['order-1', 'order-2'];
      (prisma.purchaseOrder.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 'order-1', createdBy: mockSession.user.id }
      ]);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          action: 'delete',
          orderIds
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(403);
      expect(prisma.purchaseOrder.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('一括ステータス更新', () => {
    it('選択された発注書のステータスを一括更新する', async () => {
      const orderIds = ['order-1', 'order-2'];
      const newStatus = PurchaseOrderStatusEnum.SENT;
      
      (prisma.purchaseOrder.findMany as jest.Mock).mockResolvedValueOnce(
        orderIds.map(id => ({ id, createdBy: mockSession.user.id }))
      );

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          action: 'updateStatus',
          orderIds,
          status: newStatus
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(prisma.$transaction).toHaveBeenCalledWith(
        orderIds.map(id => 
          expect.objectContaining({
            where: { id },
            data: {
              statusHistory: {
                create: {
                  status: newStatus,
                  comment: expect.any(String),
                  createdBy: mockSession.user.id
                }
              }
            }
          })
        )
      );
    });
  });

  it('不正なメソッドの場合は405を返す', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
}); 