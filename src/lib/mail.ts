import nodemailer from 'nodemailer'
import { vi } from 'vitest'

interface MailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

class MailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  }

  async sendMail(options: MailOptions) {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      ...options
    }

    try {
      await this.transporter.sendMail(mailOptions)
    } catch (error) {
      console.error('メール送信に失敗しました:', error)
      throw error
    }
  }
}

export const mailService = new MailService()

// テスト用のモックメールサービス
export const mockMailService = {
  sendMail: vi.fn()
}
