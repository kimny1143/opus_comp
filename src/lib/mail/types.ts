import { Invoice, InvoiceStatus, PurchaseOrder, PurchaseOrderStatus } from '@prisma/client'

// メールテンプレートの種類を定義
export type MailTemplateType = 
  | 'invoiceCreated'
  | 'invoiceStatusUpdated'
  | 'purchaseOrderCreated'
  | 'purchaseOrderStatusUpdated'
  | 'paymentReminder'

// メールテンプレートのコンテキスト型
export interface MailContext {
  invoiceCreated: {
    invoice: Invoice
  }
  invoiceStatusUpdated: {
    invoice: Invoice
    oldStatus: InvoiceStatus
    newStatus: InvoiceStatus
  }
  purchaseOrderCreated: {
    purchaseOrder: PurchaseOrder
  }
  purchaseOrderStatusUpdated: {
    purchaseOrder: PurchaseOrder
    oldStatus: PurchaseOrderStatus
    newStatus: PurchaseOrderStatus
  }
  paymentReminder: {
    invoice: Invoice
    daysOverdue: number
  }
}

// メールテンプレート関数の型
export type MailTemplate<T extends MailTemplateType> = (
  context: MailContext[T]
) => Promise<{
  subject: string
  body: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}>

// メールテンプレートの集合
export type MailTemplates = {
  [K in MailTemplateType]: MailTemplate<K>
} 