import { Invoice, Vendor, ReminderType } from '@prisma/client';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface ReminderMailData {
  invoice: Invoice & {
    vendor: Pick<Vendor, 'name' | 'email'>;
  };
  type: ReminderType;
  daysBeforeOrAfter: number;
}

export function generateReminderMailSubject({ invoice, type }: ReminderMailData): string {
  switch (type) {
    case 'BEFORE_DUE':
      return `【支払期限のお知らせ】請求書 ${invoice.invoiceNumber} の支払期限が近づいています`;
    case 'AFTER_DUE':
      return `【支払期限超過】請求書 ${invoice.invoiceNumber} の支払期限が過ぎています`;
    case 'AFTER_ISSUE':
      return `【ご確認のお願い】請求書 ${invoice.invoiceNumber} を送付いたしました`;
    default:
      return `請求書 ${invoice.invoiceNumber} に関するお知らせ`;
  }
}

export function generateReminderMailBody({ invoice, type, daysBeforeOrAfter }: ReminderMailData): string {
  const companyName = process.env.COMPANY_NAME || '当社';
  const formattedDueDate = format(new Date(invoice.dueDate), 'yyyy年MM月dd日', { locale: ja });
  const formattedAmount = invoice.totalAmount.toLocaleString();

  const commonFooter = `
ご不明な点がございましたら、お気軽にお問い合わせください。

${companyName}
`;

  switch (type) {
    case 'BEFORE_DUE':
      return `${invoice.vendor.name} 様

平素より大変お世話になっております。

請求書番号 ${invoice.invoiceNumber} の支払期限が${daysBeforeOrAfter}日後に迫っておりますので、
ご確認をお願いいたします。

請求書詳細：
支払期限：${formattedDueDate}
請求金額：${formattedAmount}円（税込）

お支払いがお済みの場合は、本メールを破棄していただけますようお願いいたします。
${commonFooter}`;

    case 'AFTER_DUE':
      return `${invoice.vendor.name} 様

平素より大変お世話になっております。

請求書番号 ${invoice.invoiceNumber} の支払期限が${daysBeforeOrAfter}日経過しておりますので、
至急ご確認をお願いいたします。

請求書詳細：
支払期限：${formattedDueDate}
請求金額：${formattedAmount}円（税込）

お支払いがお済みの場合は、ご一報いただけますと幸いです。
${commonFooter}`;

    case 'AFTER_ISSUE':
      return `${invoice.vendor.name} 様

平素より大変お世話になっております。

先日送付させていただきました請求書のご確認をお願いいたします。

請求書詳細：
請求書番号：${invoice.invoiceNumber}
支払期限：${formattedDueDate}
請求金額：${formattedAmount}円（税込）

請求書の内容にご不明な点がございましたら、お気軽にお問い合わせください。
${commonFooter}`;

    default:
      return '';
  }
} 