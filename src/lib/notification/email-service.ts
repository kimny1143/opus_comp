import { OrderStatus } from '@/types/order-status';
import { Order } from '@/types/order';
import { Invoice } from '@/types/invoice';
import { sendMail } from '@/lib/mail/sendMail';

interface EmailTemplate {
  subject: string;
  body: string;
}

export class EmailNotificationService {
  private static readonly TEMPLATES: Record<OrderStatus, EmailTemplate> = {
    [OrderStatus.DRAFT]: {
      subject: '発注書の下書きが作成されました',
      body: '発注書の下書きが作成されました。内容を確認してください。'
    },
    [OrderStatus.PENDING]: {
      subject: '発注書の承認待ち',
      body: '発注書が承認待ちの状態です。確認をお願いします。'
    },
    [OrderStatus.IN_PROGRESS]: {
      subject: '発注書の処理中',
      body: '発注書の処理が進行中です。'
    },
    [OrderStatus.SENT]: {
      subject: '発注書が送信されました',
      body: '発注書が送信されました。'
    },
    [OrderStatus.COMPLETED]: {
      subject: '発注書が完了しました',
      body: '発注書の処理が完了しました。'
    },
    [OrderStatus.REJECTED]: {
      subject: '発注書が却下されました',
      body: '発注書が却下されました。理由を確認してください。'
    },
    [OrderStatus.EXPIRED]: {
      subject: '発注書の期限が切れました',
      body: '発注書の期限が切れました。'
    },
    [OrderStatus.OVERDUE]: {
      subject: '発注書が期限を超過しています',
      body: '発注書が期限を超過しています。至急対応をお願いします。'
    }
  };

  private static readonly PAYMENT_REMINDER_TEMPLATES = {
    upcoming: {
      subject: '請求書の支払期限が近づいています',
      body: (invoice: Invoice) => `
        ${invoice.contractorName} 様

        請求書番号：${invoice.invoiceNumber}の支払期限が近づいています。

        支払期限：${invoice.dueDate.toLocaleDateString()}
        請求金額：¥${invoice.totalAmount?.toLocaleString() ?? '0'}

        お支払いがまだの場合は、期限内のお支払いをお願いいたします。
      `
    },
    overdue: {
      subject: '請求書の支払期限が過ぎています',
      body: (invoice: Invoice) => `
        ${invoice.contractorName} 様

        請求書番号：${invoice.invoiceNumber}の支払期限が過ぎています。

        支払期限：${invoice.dueDate.toLocaleDateString()}
        請求金額：¥${invoice.totalAmount?.toLocaleString() ?? '0'}

        至急お支払いをお願いいたします。
      `
    }
  };

  static async sendStatusUpdateNotification(
    purchaseOrder: {
      orderNumber: string;
      vendor: {
        email: string;
        name: string;
      };
    },
    newStatus: OrderStatus
  ): Promise<void> {
    const template = this.TEMPLATES[newStatus];
    await sendMail({
      to: purchaseOrder.vendor.email,
      subject: template.subject,
      text: template.body
    });
  }

  static async sendPaymentReminder(
    invoice: Invoice & {
      vendor: {
        email: string;
      };
    },
    type: 'upcoming' | 'overdue'
  ): Promise<void> {
    const template = this.PAYMENT_REMINDER_TEMPLATES[type];

    await sendMail({
      to: invoice.vendor.email,
      subject: template.subject,
      text: template.body(invoice)
    });
  }
} 