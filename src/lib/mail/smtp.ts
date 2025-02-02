import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import { EmailTemplate } from '@/components/email/EmailTemplate'
import { ReactElement } from 'react'
import { MailTemplateType, MailContext } from './types'
import { templates } from './templates'

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

  // テンプレートからメール内容を生成
  const template = await templates[templateType](context)
  const emailTemplate = EmailTemplate({ templateType, ...context }) as ReactElement
  const emailHtml = await render(emailTemplate)

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: template.subject,
    html: emailHtml,
    attachments: template.attachments?.map(attachment => ({
      filename: attachment.filename,
      content: attachment.content,
      contentType: attachment.contentType
    }))
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}