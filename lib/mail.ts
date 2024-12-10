import nodemailer from 'nodemailer';

// メール送信用のトランスポーター設定
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// メールテンプレート
const emailTemplates = {
  orderCreated: (documentNumber: string, vendorName: string, _status?: string) => ({
    subject: `【OPUS】発注書${documentNumber}が作成されました`,
    text: `${vendorName} 様

発注書番号：${documentNumber}が作成されました。
以下のリンクから内容をご確認ください。

${process.env.NEXT_PUBLIC_BASE_URL}/purchase-orders/${documentNumber}

ご確認よろしくお願いいたします。`,
  }),

  statusUpdated: (documentNumber: string, vendorName: string, status: string) => ({
    subject: `【OPUS】発注書${documentNumber}のステータスが更新されました`,
    text: `${vendorName} 様

発注書番号：${documentNumber}のステータスが「${status}」に更新されました。
以下のリンクから内容をご確認ください。

${process.env.NEXT_PUBLIC_BASE_URL}/purchase-orders/${documentNumber}

ご確認よろしくお願いいたします。`,
  }),

  overdueWarning: (documentNumber: string, vendorName: string, _status?: string) => ({
    subject: `【OPUS】【警告】発注書${documentNumber}の納期が過ぎています`,
    text: `${vendorName} 様

発注書番号：${documentNumber}の納期が過ぎています。
至急ご対応をお願いいたします。

以下のリンクから内容をご確認ください。
${process.env.NEXT_PUBLIC_BASE_URL}/purchase-orders/${documentNumber}

ご確認よろしくお願いいたします。`,
  }),

  staleWarning: (documentNumber: string, vendorName: string, _status?: string) => ({
    subject: `【OPUS】【通知】発注書${documentNumber}の進捗確認`,
    text: `${vendorName} 様

発注書番号：${documentNumber}について、30日以上更新がありません。
進捗状況のご確認をお願いいたします。

以下のリンクから内容をご確認ください。
${process.env.NEXT_PUBLIC_BASE_URL}/purchase-orders/${documentNumber}

ご確認よろしくお願いいたします。`,
  }),

  invoiceCreated: (documentNumber: string, vendorName: string, _status?: string) => ({
    subject: `【OPUS】請求書${documentNumber}が作成されました`,
    text: `${vendorName} 様

請求書番号：${documentNumber}が作成されました。
以下のリンクから内容をご確認ください。

${process.env.NEXT_PUBLIC_BASE_URL}/invoices/${documentNumber}

ご確認よろしくお願いいたします。`,
  }),

  invoiceStatusUpdated: (documentNumber: string, vendorName: string, status: string) => ({
    subject: `【OPUS】請求書${documentNumber}のステータスが更新されました`,
    text: `${vendorName} 様

請求書番号：${documentNumber}のステータスが「${status}」に更新されました。
以下のリンクから内容をご確認ください。

${process.env.NEXT_PUBLIC_BASE_URL}/invoices/${documentNumber}

ご確認よろしくお願いいたします。`,
  }),

  invoiceOverdueWarning: (documentNumber: string, vendorName: string, dueDate: string) => ({
    subject: `【OPUS】【警告】請求書${documentNumber}の支払期限が過ぎています`,
    text: `${vendorName} 様

請求書番号：${documentNumber}の支払期限(${dueDate})が過ぎています。
至急お支払いのご対応をお願いいたします。

以下のリンクから内容をご確認ください。
${process.env.NEXT_PUBLIC_BASE_URL}/invoices/${documentNumber}

ご確認よろしくお願いいたします。`,
  }),

  invoicePaymentReminder: (documentNumber: string, vendorName: string, dueDate: string) => ({
    subject: `【OPUS】【リマインダー】請求書${documentNumber}の支払期限が近づいています`,
    text: `${vendorName} 様

請求書番号：${documentNumber}の支払期限(${dueDate})が近づいています。
お支払いの準備をお願いいたします。

以下のリンクから内容をご確認ください。
${process.env.NEXT_PUBLIC_BASE_URL}/invoices/${documentNumber}

ご確認よろしくお願いいたします。`,
  }),
};

// 型定義を更新
type EmailTemplate = keyof typeof emailTemplates;

// メール送信関数の型も更新
export async function sendEmail(
  to: string,
  template: EmailTemplate,
  params: { [key: string]: string }
) {
  try {
    const { subject, text } = emailTemplates[template](
      params.orderNumber || params.invoiceNumber,
      params.vendorName,
      params.status
    );

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
    });

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
} 