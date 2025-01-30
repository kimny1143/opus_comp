import { VendorStatus, PurchaseOrderStatus } from '@prisma/client'
import { InvoiceStatus as PrismaInvoiceStatus } from '@prisma/client'

export const InvoiceStatusDisplay: Record<PrismaInvoiceStatus, string> = {
  DRAFT: '下書き',
  PENDING: '保留中',
  REVIEWING: '確認中',
  APPROVED: '承認済み',
  PAID: '支払済み',
  OVERDUE: '支払期限超過',
  REJECTED: '却下',
  SENT: '送信済み'
};

// PurchaseOrderStatus表示名
export const PurchaseOrderStatusDisplay: Record<PurchaseOrderStatus, string> = {
  DRAFT: '下書き',
  PENDING: '保留中',
  SENT: '送信済み',
  COMPLETED: '納品完了',
  REJECTED: '却下',
  OVERDUE: '期限超過'
} as const

// VendorStatus表示名
export const VendorStatusDisplay: Record<VendorStatus, string> = {
  ACTIVE: '有効',
  INACTIVE: '無効',
  BLOCKED: 'ブロック'
} as const

// 型エクスポート
export type { InvoiceStatus } from '@prisma/client';
export type { VendorStatus, PurchaseOrderStatus }

// ステータス遷移定義
export const InvoiceStatusTransitions: Record<PrismaInvoiceStatus, readonly PrismaInvoiceStatus[]> = {
  DRAFT: ['PENDING'],
  PENDING: ['REVIEWING', 'REJECTED'],
  REVIEWING: ['APPROVED', 'REJECTED'],
  APPROVED: ['PAID', 'REJECTED'],
  PAID: [],
  OVERDUE: ['PENDING'],
  REJECTED: ['DRAFT'],
  SENT: []
} as const

export const PurchaseOrderStatusTransitions: Record<PurchaseOrderStatus, readonly PurchaseOrderStatus[]> = {
  DRAFT: ['PENDING'],
  PENDING: ['SENT', 'REJECTED'],
  SENT: ['COMPLETED', 'REJECTED'],
  COMPLETED: [],
  REJECTED: ['DRAFT'],
  OVERDUE: ['PENDING']
} as const

// ステータスに応じたスタイル定義
export const InvoiceStatusStyles: Record<PrismaInvoiceStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  REVIEWING: 'bg-purple-100 text-purple-800',
  APPROVED: 'bg-green-100 text-green-800',
  PAID: 'bg-blue-100 text-blue-800',
  OVERDUE: 'bg-red-100 text-red-800',
  REJECTED: 'bg-red-100 text-red-800',
  SENT: 'bg-blue-100 text-blue-800'
} as const

export const PurchaseOrderStatusStyles: Record<PurchaseOrderStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  SENT: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  OVERDUE: 'bg-orange-100 text-orange-800'
} as const 