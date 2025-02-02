/**
 * 請求書のステータス
 */
export type InvoiceStatus =
  | 'DRAFT'      // 下書き
  | 'PENDING'    // 承認待ち
  | 'APPROVED'   // 承認済み
  | 'SENT'       // 送信済み
  | 'PAID'       // 支払済み
  | 'CANCELED'   // キャンセル
  | 'REJECTED';  // 却下

/**
 * ステータスの表示名
 */
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: '下書き',
  PENDING: '承認待ち',
  APPROVED: '承認済み',
  SENT: '送信済み',
  PAID: '支払済み',
  CANCELED: 'キャンセル',
  REJECTED: '却下'
};

/**
 * 編集可能なステータス
 */
export const EDITABLE_STATUSES: InvoiceStatus[] = [
  'DRAFT',
  'PENDING',
  'REJECTED'
];

/**
 * キャンセル可能なステータス
 */
export const CANCELABLE_STATUSES: InvoiceStatus[] = [
  'DRAFT',
  'PENDING',
  'APPROVED'
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
    DRAFT: ['PENDING', 'CANCELED'],
    PENDING: ['APPROVED', 'REJECTED', 'CANCELED'],
    APPROVED: ['SENT', 'CANCELED'],
    SENT: ['PAID'],
    PAID: [],
    CANCELED: [],
    REJECTED: ['DRAFT', 'CANCELED']
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
    CANCELED: 'red',
    REJECTED: 'red'
  };
  return colors[status];
};