import { prisma } from '@/lib/prisma';
import { InvoiceStatus, Notification } from '@prisma/client';
import { sendInvoiceEmail } from '@/infrastructure/mail/invoice';
import { InvoiceStatusType } from './types';

export interface StatusChangeParams {
  invoiceId: string;
  oldStatus: InvoiceStatusType;
  newStatus: InvoiceStatusType;
  userId: string;
  comment?: string;
}

export interface NotificationParams {
  title: string;
  message: string;
  type: string;
  recipientId: string;
  invoiceId: string;
}

export class InvoiceProgressManager {
  /**
   * メール通知が必要なステータス
   */
  private static readonly NOTIFICATION_STATUSES = [
    InvoiceStatus.APPROVED,
    InvoiceStatus.REJECTED,
    InvoiceStatus.OVERDUE
  ] as const;

  private static readonly EMAIL_NOTIFICATION_STATUSES = [
    'APPROVED',
    'REJECTED',
    'OVERDUE'
  ] as const;

  private static isEmailNotificationStatus(
    status: InvoiceStatus
  ): status is typeof InvoiceProgressManager.EMAIL_NOTIFICATION_STATUSES[number] {
    return (InvoiceProgressManager.EMAIL_NOTIFICATION_STATUSES as readonly string[]).includes(status);
  }

  /**
   * ステータス変更履歴を記録
   */
  static async recordStatusChange({
    invoiceId,
    oldStatus,
    newStatus,
    userId,
    comment
  }: StatusChangeParams): Promise<void> {
    await prisma.statusHistory.create({
      data: {
        type: 'INVOICE',
        status: newStatus,
        comment,
        userId,
        invoiceId
      }
    });

    // 関係者への通知を作成
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        vendor: {
          include: {
            users: true
          }
        },
        createdBy: true
      }
    });

    if (!invoice) return;

    // 通知対象者のリストを作成
    const notifyUserIds = new Set<string>([
      invoice.createdById,  // 作成者
      ...invoice.vendor.users.map(user => user.id)  // 取引先担当者
    ]);

    // ステータスに応じた通知メッセージを作成
    const notification = this.createStatusNotification(
      invoice.invoiceNumber,
      oldStatus,
      newStatus
    );

    // 各ユーザーへの通知を作成
    const notifications = Array.from(notifyUserIds).map(recipientId => ({
      ...notification,
      recipientId,
      invoiceId
    }));

    // 通知を一括作成
    await prisma.notification.createMany({
      data: notifications
    });

    // メール通知が必要な場合は送信
    if (this.isEmailNotificationStatus(newStatus)) {
      const emailRecipients = invoice.vendor.users
        .filter(user => user.email)
        .map(user => user.email!);

      if (emailRecipients.length > 0) {
        const { InvoiceService } = await import('./service');
        const qualifiedInvoice = await InvoiceService.getInvoiceById(invoiceId);
        
        if (qualifiedInvoice) {
          const { generateInvoicePDF } = await import('@/infrastructure/pdf/invoice');
          const pdfBuffer = await generateInvoicePDF(qualifiedInvoice);
          
          await sendInvoiceEmail({
            invoice: qualifiedInvoice,
            pdfBuffer,
            to: emailRecipients.join(',')
          });
        }
      }
    }
  }

  /**
   * ステータス変更履歴を取得
   */
  static async getStatusHistory(invoiceId: string) {
    return prisma.statusHistory.findMany({
      where: {
        invoiceId,
        type: 'INVOICE'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * 未読の通知を取得
   */
  static async getUnreadNotifications(userId: string) {
    return prisma.notification.findMany({
      where: {
        recipientId: userId,
        isRead: false
      },
      include: {
        invoice: {
          select: {
            invoiceNumber: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * 通知を既読に設定
   */
  static async markNotificationAsRead(notificationId: string) {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
  }

  /**
   * ステータスに応じた通知メッセージを作成
   */
  private static createStatusNotification(
    invoiceNumber: string,
    oldStatus: InvoiceStatusType,
    newStatus: InvoiceStatusType
  ): Omit<NotificationParams, 'recipientId' | 'invoiceId'> {
    const title = `請求書 ${invoiceNumber} のステータスが更新されました`;
    const message = `ステータスが ${oldStatus} から ${newStatus} に変更されました`;
    const type = this.getNotificationType(newStatus);

    return {
      title,
      message,
      type
    };
  }

  /**
   * ステータスに応じた通知タイプを取得
   */
  private static getNotificationType(status: InvoiceStatusType): string {
    switch (status) {
      case InvoiceStatus.APPROVED:
        return 'SUCCESS';
      case InvoiceStatus.REJECTED:
        return 'ERROR';
      case InvoiceStatus.OVERDUE:
        return 'WARNING';
      default:
        return 'INFO';
    }
  }
}