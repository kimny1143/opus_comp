/**
 * 請求書のステータス
 */
export type InvoiceStatus =
  | 'DRAFT'      // 下書き
  | 'PENDING'    // 承認待ち
  | 'APPROVED'   // 承認済み
  | 'SENT'       // 送信済み
  | 'PAID'       // 支払済み
  | 'REJECTED'   // 却下
  | 'REVIEWING'  // レビュー中
  | 'OVERDUE';   // 期限超過

/**
 * ステータスの表示名
 */
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: '下書き',
  PENDING: '承認待ち',
  APPROVED: '承認済み',
  SENT: '送信済み',
  PAID: '支払済み',
  REJECTED: '却下',
  REVIEWING: 'レビュー中',
  OVERDUE: '期限超過'
};

/**
 * 編集可能なステータス
 */
export const EDITABLE_STATUSES: InvoiceStatus[] = [
  'DRAFT',
  'PENDING',
  'REJECTED',
  'REVIEWING'
];

/**
 * キャンセル可能なステータス
 */
export const CANCELABLE_STATUSES: InvoiceStatus[] = [
  'DRAFT',
  'PENDING',
  'APPROVED',
  'REVIEWING'
];

/**
 * 送信可能なステータス
 */
export const SENDABLE_STATUSES: InvoiceStatus[] = [
  'APPROVED'
];

/**
 * 支払い登録可能なステータス
 */
export const PAYABLE_STATUSES: InvoiceStatus[] = [
  'SENT'
];

/**
 * ステータスの遷移可否をチェック
 */
export const canTransitionTo = (
  currentStatus: InvoiceStatus,
  nextStatus: InvoiceStatus
): boolean => {
  const allowedTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
    DRAFT: ['PENDING', 'REVIEWING'],
    PENDING: ['APPROVED', 'REJECTED', 'REVIEWING'],
    APPROVED: ['SENT'],
    SENT: ['PAID', 'OVERDUE'],
    PAID: [],
    REJECTED: ['DRAFT'],
    REVIEWING: ['PENDING', 'REJECTED'],
    OVERDUE: ['PAID']
  };

  return allowedTransitions[currentStatus].includes(nextStatus);
};

/**
 * ステータスの表示名を取得
 */
export const getStatusLabel = (status: InvoiceStatus): string => {
  return INVOICE_STATUS_LABELS[status];
};

/**
 * ステータスの色を取得
 */
export const getStatusColor = (status: InvoiceStatus): string => {
  const colors: Record<InvoiceStatus, string> = {
    DRAFT: 'gray',
    PENDING: 'yellow',
    APPROVED: 'green',
    SENT: 'blue',
    PAID: 'purple',
    REJECTED: 'red',
    REVIEWING: 'orange',
    OVERDUE: 'red'
  };
  return colors[status];
};

// 再エクスポート
export type { UserRole } from '../auth/roles';
export { InvoiceStatusManager } from './statusManager';