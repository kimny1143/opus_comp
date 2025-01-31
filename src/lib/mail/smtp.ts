import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import { EmailTemplate } from '@/components/email/EmailTemplate'
import { ReactElement } from 'react'
import { MailTemplateType, MailContext } from './types'

export async function sendEmail<T extends MailTemplateType>(
  to: string,
  templateType: T,
  context: MailContext[T]
): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const emailTemplate = EmailTemplate({ templateType, ...context }) as ReactElement
  const emailHtml = await render(emailTemplate)

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: getSubject(templateType, context),
    html: emailHtml,
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

function getSubject<T extends MailTemplateType>(
  templateType: T,
  context: MailContext[T]
): string {
  switch (templateType) {
    case 'invoiceCreated':
      return `新しい請求書が作成されました - ${(context as MailContext['invoiceCreated']).invoice.invoiceNumber}`
    case 'invoiceStatusUpdated':
      return `請求書のステータスが更新されました - ${(context as MailContext['invoiceStatusUpdated']).invoice.invoiceNumber}`
    case 'purchaseOrderCreated':
      return `新しい発注書が作成されました - ${(context as MailContext['purchaseOrderCreated']).purchaseOrder.orderNumber}`
    case 'purchaseOrderStatusUpdated':
      return `発注書のステータスが更新されました - ${(context as MailContext['purchaseOrderStatusUpdated']).purchaseOrder.orderNumber}`
    case 'paymentReminder':
      return `支払い期限超過のお知らせ - ${(context as MailContext['paymentReminder']).invoice.invoiceNumber}`
    default:
      const _exhaustiveCheck: never = templateType
      return 'お知らせ'
  }
}