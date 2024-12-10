import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mail';
import { InvoiceStatus } from '@/lib/utils/status';

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
    const today = new Date();
    
    // 1. 支払期限切れの請求書をチェック
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: 'sent',
        dueDate: {
          lt: today,
        },
      },
      include: {
        vendor: true,
      },
    });

    // 支払期限切れの請求書を処理
    for (const invoice of overdueInvoices) {
      // ステータスを'overdue'に更新
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'overdue' as InvoiceStatus,
          statusHistory: {
            create: {
              status: 'overdue',
              comment: '支払期限が過ぎたため、自動的にステータスを更新しました',
              createdBy: invoice.createdBy,
            },
          },
        },
      });

      // メール通知
      if (invoice.vendor.email) {
        await sendEmail(invoice.vendor.email, 'invoiceOverdueWarning', {
          invoiceNumber: invoice.invoiceNumber,
          vendorName: invoice.vendor.name,
          dueDate: invoice.dueDate.toLocaleDateString('ja-JP'),
        });
      }
    }

    // 2. 支払期限が近い請求書のリマインダー
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 7); // 7日前にリマインダー

    const upcomingInvoices = await prisma.invoice.findMany({
      where: {
        status: 'sent',
        dueDate: {
          gte: today,
          lte: reminderDate,
        },
        // リマインダーが未送信の請求書のみを対象
        NOT: {
          statusHistory: {
            some: {
              comment: {
                contains: 'リマインダーを送信しました',
              },
              createdAt: {
                gte: new Date(new Date().setDate(new Date().getDate() - 7)), // 過去7日以内
              },
            },
          },
        },
      },
      include: {
        vendor: true,
      },
    });

    // 支払期限が近い請求書にリマインダーを送信
    for (const invoice of upcomingInvoices) {
      // ステータス履歴にリマインダー送信記録を追加
      await prisma.invoiceStatus.create({
        data: {
          invoiceId: invoice.id,
          status: invoice.status,
          comment: 'リマインダーを送信しました',
          createdBy: invoice.createdBy,
        },
      });

      // メール通知
      if (invoice.vendor.email) {
        await sendEmail(invoice.vendor.email, 'invoicePaymentReminder', {
          invoiceNumber: invoice.invoiceNumber,
          vendorName: invoice.vendor.name,
          dueDate: invoice.dueDate.toLocaleDateString('ja-JP'),
        });
      }
    }

    return res.status(200).json({
      message: 'バッチ処理が完了しました',
      overdueCount: overdueInvoices.length,
      reminderCount: upcomingInvoices.length,
    });
  } catch (error) {
    console.error('Batch processing error:', error);
    return res.status(500).json({ message: 'バッチ処理中にエラーが発生しました' });
  }
} 