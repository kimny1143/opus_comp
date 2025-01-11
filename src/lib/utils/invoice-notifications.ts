import { Invoice, InvoiceStatus } from '@prisma/client';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export type NotificationType = 'STATUS_CHANGE' | 'OVERDUE' | 'PAYMENT_REMINDER';

interface NotificationConfig {
  title: string;
  message: string;
  type: NotificationType;
}

export async function createInvoiceNotification(
  invoice: Invoice,
  type: NotificationType,
  recipientId: string
) {
  const cookieStore = await cookies();
  const config = getNotificationConfig(invoice, type);
  
  try {
    // 通知の作成処理
    const notification = await prisma.notification.create({
      data: {
        title: config.title,
        message: config.message,
        type: config.type,
        recipient: {
          connect: { id: recipientId }
        },
        invoice: invoice.id ? {
          connect: { id: invoice.id }
        } : undefined,
        isRead: false,
      },
    });

    // Webhookなどの外部通知処理があれば実行
    await sendExternalNotification(notification);

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

function getNotificationConfig(
  invoice: Invoice,
  type: NotificationType
): NotificationConfig {
  const configs: Record<NotificationType, (invoice: Invoice) => NotificationConfig> = {
    STATUS_CHANGE: (invoice) => ({
      title: `請求書のステータスが更新されました: ${invoice.status}`,
      message: `請求書 #${invoice.invoiceNumber} のステータスが ${invoice.status} に更新されました。`,
      type: 'STATUS_CHANGE',
    }),
    OVERDUE: (invoice) => ({
      title: '請求書が期限切れになりました',
      message: `請求書 #${invoice.invoiceNumber} が期限切れになりました。至急対応をお願いします。`,
      type: 'OVERDUE',
    }),
    PAYMENT_REMINDER: (invoice) => ({
      title: '支払い期限が近づいています',
      message: `請求書 #${invoice.invoiceNumber} の支払い期限が近づいています。`,
      type: 'PAYMENT_REMINDER',
    }),
  };

  return configs[type](invoice);
}

async function sendExternalNotification(notification: any): Promise<void> {
  // Webhook、メール、Slack等の外部通知処理を実装
  // 実装は別途行う
} 