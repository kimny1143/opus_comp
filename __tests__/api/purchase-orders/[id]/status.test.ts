import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/purchase-orders/[id]/status';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { PurchaseOrderStatusEnum } from '@prisma/client';
import { sendEmail } from '@/lib/email';

jest.mock('next-auth/next');
jest.mock('@/lib/prisma');
jest.mock('@/lib/email');

describe('/api/purchase-orders/[id]/status', () => {
  const mockSession = {
    user: { id: 'user-1', name: 'Test User' }
  };

  const mockOrder = {
    id: 'order-1',
    orderNumber: 'PO20240101001',
    status: PurchaseOrderStatusEnum.DRAFT,
    vendorId: 'vendor-1',
    createdBy: 'user-1',
    vendor: {
      id: 'vendor-1',
      name: 'Test Vendor',
      email: 'vendor@example.com'
    },
    items: [],
    statusHistory: [
      {
        id: 'status-1',
        status: PurchaseOrderStatusEnum.DRAFT,
        comment: 'Initial status',
        createdAt: new Date(),
        user: {
          name: 'Test User'
        }
      }
    ]
  };

  beforeEach(() => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.purchaseOrder.update as jest.Mock).mockResolvedValue(mockOrder);
    jest.clearAllMocks();
  });

  it('認証されていない場合は401を返す', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce(null);
    const { req, res } = createMocks({
      method: 'POST',
      query: { id: 'order-1' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });

  it('ステータスを更新する', async () => {
    const newStatus = PurchaseOrderStatusEnum.SENT;
    const comment = '発注書を送信しました';

    const { req, res } = createMocks({
      method: 'POST',
      query: { id: 'order-1' },
      body: {
        status: newStatus,
        comment
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(prisma.purchaseOrder.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: {
        statusHistory: {
          create: {
            status: newStatus,
            comment,
            createdBy: mockSession.user.id
          }
        }
      },
      include: expect.any(Object)
    });
  });

  it('ステータス更新時にメールを送信する', async () => {
    const newStatus = PurchaseOrderStatusEnum.SENT;
    const comment = '発注書を送信しました';

    const { req, res } = createMocks({
      method: 'POST',
      query: { id: 'order-1' },
      body: {
        status: newStatus,
        comment
      }
    });

    await handler(req, res);

    expect(sendEmail).toHaveBeenCalledWith(
      mockOrder.vendor.email,
      'statusUpdated',
      {
        orderNumber: mockOrder.orderNumber,
        vendorName: mockOrder.vendor.name,
        status: expect.any(String)
      }
    );
  });

  it('不正なメソッドの場合は405を返す', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { id: 'order-1' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
}); 