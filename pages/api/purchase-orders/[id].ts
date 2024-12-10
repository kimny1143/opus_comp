import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { validationMessages as msg } from '@/lib/validations/messages';
import { purchaseOrderSchema } from '@/lib/validations/purchase-order';
import { PurchaseOrderStatusEnum } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ message: msg.auth.required });
  }

  const { id } = req.query;

  // 発注書の存在と権限チェック
  const order = await prisma.purchaseOrder.findFirst({
    where: {
      id: id as string,
      createdBy: session.user.id
    },
    include: {
      vendor: true,
      items: true,
      statusHistory: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!order) {
    return res.status(404).json({ message: msg.purchaseOrder.notFound });
  }

  // GET: 詳細取得
  if (req.method === 'GET') {
    return res.status(200).json(order);
  }

  // PUT: 更新
  if (req.method === 'PUT') {
    try {
      const validatedData = await purchaseOrderSchema.parseAsync(req.body);

      // 金額計算を含むアイテムデータの作成
      const itemsWithAmount = validatedData.items.map(item => ({
        ...item,
        amount: new Decimal(item.quantity).mul(item.unitPrice),
      }));

      const subtotal = itemsWithAmount.reduce(
        (sum, item) => sum.plus(item.amount),
        new Decimal(0)
      );
      const taxAmount = itemsWithAmount.reduce(
        (sum, item) => sum.plus(item.amount.mul(item.taxRate)),
        new Decimal(0)
      );

      const updatedOrder = await prisma.purchaseOrder.update({
        where: { id: id as string },
        data: {
          vendorId: validatedData.vendorId,
          orderNumber: validatedData.orderNumber,
          orderDate: validatedData.orderDate,
          deliveryDate: validatedData.deliveryDate,
          status: validatedData.status,
          description: validatedData.notes,
          totalAmount: subtotal,
          taxAmount: taxAmount,
          updatedAt: new Date(),
          items: {
            deleteMany: {},  // 既存のアイテムを削除
            create: itemsWithAmount  // 新しいアイテムを作成
          }
        },
        include: {
          vendor: true,
          items: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      return res.status(200).json(updatedOrder);
    } catch (error) {
      return res.status(400).json({ message: msg.validation.invalid });
    }
  }

  // DELETE: 削除
  if (req.method === 'DELETE') {
    try {
      await prisma.purchaseOrder.delete({
        where: { id: id as string }
      });

      return res.status(200).json({ message: msg.purchaseOrder.deleted });

    } catch (error) {
      return res.status(500).json({ message: msg.error.deletion });
    }
  }

  return res.status(405).json({ message: msg.error.methodNotAllowed });
} 