import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mail';

// API Routeを保護するためのシークレットキー
const CRON_SECRET = process.env.CRON_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // シークレットキーによる認証
  if (req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ message: '認証が必要です' });
  }

  try {
    // 1. 期限切れ発注書のチェック
    const today = new Date();
    const overdueOrders = await prisma.purchaseOrder.findMany({
      where: {
        deliveryDate: {
          lt: today,
        },
        statusHistory: {
          some: {
            status: {
              notIn: ['completed', 'rejected'],
            },
          },
        },
      },
      include: {
        vendor: true,
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    // 期限切れ発注書の処理
    for (const order of overdueOrders) {
      // ステータス履歴に警告を追加
      await prisma.purchaseOrderStatus.create({
        data: {
          purchaseOrderId: order.id,
          status: order.statusHistory[0].status, // 現在のステータスを維持
          comment: '納期が過ぎています',
          createdBy: order.createdBy,
        },
      });

      // メール通知を更新
      if (order.vendor.email) {
        await sendEmail(order.vendor.email, 'overdueWarning', {
          orderNumber: order.orderNumber,
          vendorName: order.vendor.name,
        });
      }
    }

    // 2. 長期未更新の発注書のチェック
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const staleOrders = await prisma.purchaseOrder.findMany({
      where: {
        updatedAt: {
          lt: thirtyDaysAgo,
        },
        statusHistory: {
          some: {
            status: {
              notIn: ['completed', 'rejected'],
            },
          },
        },
      },
      include: {
        vendor: true,
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    // 長期未更新発注書の処理
    for (const order of staleOrders) {
      // ステータス履歴に警告を追加
      await prisma.purchaseOrderStatus.create({
        data: {
          purchaseOrderId: order.id,
          status: order.statusHistory[0].status,
          comment: '30日以上更新がありません',
          createdBy: order.createdBy,
        },
      });

      // メール通知を更新
      if (order.vendor.email) {
        await sendEmail(order.vendor.email, 'staleWarning', {
          orderNumber: order.orderNumber,
          vendorName: order.vendor.name,
        });
      }
    }

    return res.status(200).json({
      message: 'バッチ処理が完了しました',
      overdueCount: overdueOrders.length,
      staleCount: staleOrders.length,
    });
  } catch (error) {
    console.error('Batch processing error:', error);
    return res.status(500).json({ message: 'バッチ処理中にエラーが発生しました' });
  }
} 