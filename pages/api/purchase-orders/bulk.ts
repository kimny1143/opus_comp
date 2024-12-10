import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { validationMessages as msg } from '@/lib/validations/messages';
import { bulkActionSchema } from '@/lib/validations/purchase-order';
import { PurchaseOrderStatusEnum } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ message: msg.auth.required });
  }

  if (req.method === 'POST') {
    try {
      const validatedData = await bulkActionSchema.parseAsync(req.body);
      const { action, orderIds, status } = validatedData;

      // 権限チェック
      const orders = await prisma.purchaseOrder.findMany({
        where: {
          id: { in: orderIds },
          createdBy: session.user.id
        }
      });

      if (orders.length !== orderIds.length) {
        return res.status(403).json({ message: msg.auth.required });
      }

      if (action === 'delete') {
        // 一括削除
        await prisma.purchaseOrder.deleteMany({
          where: {
            id: { in: orderIds },
            createdBy: session.user.id
          }
        });

        return res.status(200).json({ message: msg.purchaseOrder.bulkDeleted });

      } else if (action === 'updateStatus' && status) {
        // 一括ステータス更新
        await prisma.$transaction(
          orderIds.map(id => 
            prisma.purchaseOrder.update({
              where: { id },
              data: {
                statusHistory: {
                  create: {
                    status,
                    comment: '一括更新により変更',
                    createdBy: session.user.id
                  }
                }
              }
            })
          )
        );

        return res.status(200).json({ message: msg.purchaseOrder.bulkStatusUpdated });
      }

      return res.status(400).json({ message: msg.validation.invalid });

    } catch (error) {
      return res.status(400).json({ message: msg.validation.invalid });
    }
  }

  return res.status(405).json({ message: msg.error.methodNotAllowed });
} 