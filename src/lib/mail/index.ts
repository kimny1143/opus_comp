import { createTransport } from 'nodemailer'
import { templates } from './templates'
import type { MailTemplateType, MailContext } from './types'

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export class MailService {
  static async sendEmail<T extends MailTemplateType>(
    to: string,
    templateType: T,
    context: MailContext[T]
  ): Promise<void> {
    const template = templates[templateType]
    const { subject, body } = await template(context)

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text: body,
      html: body.replace(/\n/g, '<br>')
    })
  }
}

export const mailService = new MailService() 