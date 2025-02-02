import nodemailer from 'nodemailer';
import { MailContext, MailSendOptions, MailSendResult, MailTemplateDataMap } from './types';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * メール送信処理
 */
export const sendMail = async <T extends keyof MailTemplateDataMap>(
  context: MailContext<T>,
  options: MailSendOptions = {}
): Promise<MailSendResult> => {
  try {
    const info = await transporter.sendMail({
      from: options.from || process.env.MAIL_FROM,
      to: context.to,
      subject: context.subject,
      html: typeof context.data === 'string' ? context.data : JSON.stringify(context.data),
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc
    });

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    };
  }
};

/**
 * メール送信のモック(テスト環境用)
 */
export const mockSendMail = async <T extends keyof MailTemplateDataMap>(
  context: MailContext<T>,
  _options: MailSendOptions = {}
): Promise<MailSendResult> => {
  console.log('Mock email sent:', {
    to: context.to,
    subject: context.subject,
    data: context.data
  });

  return {
    success: true,
    messageId: `mock-${Date.now()}`
  };
};

/**
 * 環境に応じたメール送信関数を取得
 */
export const getMailSender = () => {
  if (process.env.NODE_ENV === 'test') {
    return mockSendMail;
  }
  return sendMail;
};