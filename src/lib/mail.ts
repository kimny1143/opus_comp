import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import { EmailTemplate } from '@/components/email/EmailTemplate'
import { ReactElement } from 'react'

interface MailService {
  sendEmail: (to: string, subject: string, props: Record<string, any>) => Promise<{ success: boolean; error?: any }>;
}

const mailService: MailService = {
  async sendEmail(to: string, subject: string, props: Record<string, any>) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const emailTemplate = EmailTemplate({ ...props }) as ReactElement
    const emailHtml = await render(emailTemplate)

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      html: emailHtml,
    }

    try {
      await transporter.sendMail(mailOptions)
      return { success: true }
    } catch (error) {
      console.error('Failed to send email:', error)
      return { success: false, error }
    }
  }
}

export { mailService };
