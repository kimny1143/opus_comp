import nodemailer from 'nodemailer';
import { PDFDocument } from 'pdf-lib';
import { 
  generateReminderMailSubject, 
  generateReminderMailBody 
} from './templates/reminder';
import { Invoice, Vendor, ReminderType } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: {
    filename: string;
    content: Buffer;
  }[];
}

// メール送信用のトランスポーター設定
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendMail(options: MailOptions) {
  try {
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      ...options,
    });
    return result;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

export async function sendPurchaseOrderMail(
  to: string,
  orderNumber: string,
  pdfDoc: PDFDocument,
  options: Partial<MailOptions> = {}
) {
  const pdfBytes = await pdfDoc.save();

  const mailOptions: MailOptions = {
    to,
    subject: options.subject || `発注書 ${orderNumber} のお知らせ`,
    text: options.text || `
発注書番号: ${orderNumber}

添付の発注書をご確認ください。

ご不明な点がございましたら、お気軽にお問い合わせください。
`,
    html: options.html,
    attachments: [
      {
        filename: `purchase-order-${orderNumber}.pdf`,
        content: Buffer.from(pdfBytes),
      },
      ...(options.attachments || []),
    ],
  };

  return sendMail(mailOptions);
}

export async function sendReminderMail(
  invoice: Invoice & {
    vendor: Pick<Vendor, 'name' | 'email'>;
  },
  type: ReminderType,
  daysBeforeOrAfter: number
) {
  if (!invoice.vendor.email) {
    throw new Error('取引先のメールアドレスが設定されていません');
  }

  const mailData = {
    invoice,
    type,
    daysBeforeOrAfter,
  };

  const mailOptions: MailOptions = {
    to: invoice.vendor.email,
    subject: generateReminderMailSubject(mailData),
    text: generateReminderMailBody(mailData),
  };

  try {
    const result = await sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Failed to send reminder email:', error);
    throw error;
  }
}

// リマインダー送信履歴を記録する関数
export async function recordReminderHistory(
  prisma: PrismaClient,
  invoiceId: string,
  type: 'upcoming' | 'overdue'
) {
  return prisma.reminderLog.create({
    data: {
      invoiceId,
      type,
      sentAt: new Date()
    },
  });
} 