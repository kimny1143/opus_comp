import { Invoice, InvoiceStatus } from '@prisma/client';
import { InvoiceStatusDisplay } from '@/types/enums';

// ステータス遷移のバリデーション
export function isValidInvoiceStatusTransition(
  currentStatus: InvoiceStatus,
  newStatus: InvoiceStatus
): boolean {
  const statusTransitions: Record<InvoiceStatus, readonly InvoiceStatus[]> = {
    'DRAFT': ['PENDING'],
    'PENDING': ['REVIEWING', 'REJECTED'],
    'REVIEWING': ['APPROVED', 'REJECTED'],
    'APPROVED': ['PAID', 'REJECTED'],
    'PAID': [],
    'REJECTED': ['DRAFT'],
    'OVERDUE': ['PENDING']
  }

  return statusTransitions[currentStatus]?.includes(newStatus) ?? false
}

// 請求書の状態チェック
export function checkInvoiceStatus(invoice: Invoice): InvoiceStatus {
  const now = new Date()
  const dueDate = new Date(invoice.dueDate)

  // 支払済みまたは却下された請求書は状態を変更しない
  if (
    invoice.status === 'PAID' ||
    invoice.status === 'REJECTED'
  ) {
    return invoice.status
  }

  // 承認済みで期限切れの場合
  if (
    invoice.status === 'APPROVED' &&
    now > dueDate
  ) {
    return 'REJECTED'
  }

  return invoice.status
}

// ステータスに応じたアクション権限チェック
export function canUpdateInvoiceStatus(
  invoice: Invoice,
  newStatus: InvoiceStatus
): boolean {
  // 基本的な遷移チェック
  if (!isValidInvoiceStatusTransition(invoice.status, newStatus)) {
    return false
  }

  // 支払済みの請求書は変更不可
  if (invoice.status === 'PAID') {
    return false
  }

  return true
}

// ステータスに応じたバッジの色を取得
export function getStatusBadgeColor(status: InvoiceStatus): string {
  const colors = {
    'DRAFT': 'bg-gray-200 text-gray-800',
    'PENDING': 'bg-yellow-200 text-yellow-800',
    'REVIEWING': 'bg-purple-200 text-purple-800',
    'APPROVED': 'bg-green-100 text-green-800',
    'PAID': 'bg-green-200 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800',
    'OVERDUE': 'bg-orange-100 text-orange-800'
  } as const satisfies Record<InvoiceStatus, string>

  return colors[status]
}

// ステータスのラベルを取得
export function getStatusLabel(status: InvoiceStatus): string {
  return InvoiceStatusDisplay[status]
} 