import { MailTemplates } from '../types'
import { invoiceCreated } from './invoiceCreated'
import { invoiceStatusUpdated } from './invoiceStatusUpdated'
import { purchaseOrderCreated } from './purchaseOrderCreated'
import { purchaseOrderStatusUpdated } from './purchaseOrderStatusUpdated'
import { paymentReminder } from './paymentReminder'

// メールテンプレートをエクスポート
export const templates: MailTemplates = {
  invoiceCreated,
  invoiceStatusUpdated,
  purchaseOrderCreated,
  purchaseOrderStatusUpdated,
  paymentReminder
}

// 個別のテンプレートもエクスポート
export {
  invoiceCreated,
  invoiceStatusUpdated,
  purchaseOrderCreated,
  purchaseOrderStatusUpdated,
  paymentReminder
} 