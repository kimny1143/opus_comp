import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { addDays, subDays, isAfter, isBefore } from 'date-fns';
import { sendReminderMail, recordReminderHistory } from '@/lib/mail/sendMail';

// Vercelの場合、Cron Jobからのリクエストを認証するためのシークレット
const CRON_SECRET = process.env.CRON_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CRONジョブからのリクエストを認証
  if (req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  try {
    const now = new Date();
    
    // 有効なリマインダー設定を全て取得
    const reminderSettings = await prisma.reminderSetting.findMany({
      where: {
        enabled: true,
        invoice: {
          status: {
            notIn: ['PAID', 'CANCELLED']
          }
        }
      },
      include: {
        invoice: {
          include: {
            vendor: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });

    const results = await Promise.all(
      reminderSettings.map(async (setting) => {
        try {
          let shouldSendReminder = false;
          const { invoice, type, daysBeforeOrAfter } = setting;

          switch (type) {
            case 'BEFORE_DUE':
              // 支払期限の指定日前
              const reminderDate = subDays(new Date(invoice.dueDate), daysBeforeOrAfter);
              shouldSendReminder = isBefore(now, new Date(invoice.dueDate)) && 
                                 isAfter(now, reminderDate);
              break;

            case 'AFTER_DUE':
              // 支払期限の指定日後
              const overdueDate = addDays(new Date(invoice.dueDate), daysBeforeOrAfter);
              shouldSendReminder = isAfter(now, overdueDate);
              break;

            case 'AFTER_ISSUE':
              // 発行後の指定日後
              const afterIssueDate = addDays(new Date(invoice.issueDate), daysBeforeOrAfter);
              shouldSendReminder = isAfter(now, afterIssueDate);
              break;
          }

          if (shouldSendReminder) {
            // 最終送信日をチェック（24時間以内に送信済みの場合はスキップ）
            if (setting.lastSentAt && 
                isAfter(setting.lastSentAt, subDays(now, 1))) {
              return {
                id: setting.id,
                status: 'SKIPPED',
                message: '24時間以内に送信済み'
              };
            }

            // メール送信
            await sendReminderMail(invoice, type, daysBeforeOrAfter);

            // 送信履歴を記録
            await recordReminderHistory(prisma, setting.id, true);

            // 最終送信日を更新
            await prisma.reminderSetting.update({
              where: { id: setting.id },
              data: { lastSentAt: now }
            });

            return {
              id: setting.id,
              status: 'SUCCESS',
              message: 'リマインダーを送信しました'
            };
          }

          return {
            id: setting.id,
            status: 'SKIPPED',
            message: '送信条件を満たしていません'
          };
        } catch (error) {
          console.error('Error processing reminder:', error);
          
          // エラー履歴を記録
          await recordReminderHistory(
            prisma, 
            setting.id, 
            false, 
            error instanceof Error ? error.message : '不明なエラー'
          );

          return {
            id: setting.id,
            status: 'ERROR',
            message: error instanceof Error ? error.message : '不明なエラー'
          };
        }
      })
    );

    res.status(200).json({
      processed: results.length,
      results
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'リマインダーの処理に失敗しました' });
  }
} 