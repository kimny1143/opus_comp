import { InvoiceStatus } from '@prisma/client';
import { InvoiceStatusType } from './types';

/**
 * 利用可能な権限の定義
 */
export type UserRole = 'user' | 'admin' | 'system';

/**
 * 通知が必要なステータスの定義
 */
export const NOTIFICATION_STATUSES = [
  InvoiceStatus.APPROVED,
  InvoiceStatus.REJECTED,
  InvoiceStatus.OVERDUE,
  InvoiceStatus.PAID
] as const;

export type NotificationStatus = typeof NOTIFICATION_STATUSES[number];

/**
 * ステータス遷移の定義
 * キー: 現在のステータス
 * 値: 遷移可能な次のステータスの配列
 */
const STATUS_TRANSITIONS: Record<InvoiceStatus, readonly InvoiceStatus[]> = {
  [InvoiceStatus.DRAFT]: [
    InvoiceStatus.PENDING,
    InvoiceStatus.REJECTED
  ],
  [InvoiceStatus.PENDING]: [
    InvoiceStatus.REVIEWING,
    InvoiceStatus.REJECTED
  ],
  [InvoiceStatus.REVIEWING]: [
    InvoiceStatus.APPROVED,
    InvoiceStatus.REJECTED,
    InvoiceStatus.PENDING
  ],
  [InvoiceStatus.APPROVED]: [
    InvoiceStatus.PAID,
    InvoiceStatus.OVERDUE,
    InvoiceStatus.SENT
  ],
  [InvoiceStatus.PAID]: [],  // 最終ステータス
  [InvoiceStatus.OVERDUE]: [
    InvoiceStatus.PAID
  ],
  [InvoiceStatus.REJECTED]: [
    InvoiceStatus.DRAFT
  ],
  [InvoiceStatus.SENT]: [
    InvoiceStatus.APPROVED,
    InvoiceStatus.PAID
  ]
} as const;

/**
 * ステータス変更に必要な権限の定義
 */
export const STATUS_PERMISSIONS: Record<InvoiceStatus, readonly UserRole[]> = {
  [InvoiceStatus.DRAFT]: ['user', 'admin'],
  [InvoiceStatus.PENDING]: ['user', 'admin'],
  [InvoiceStatus.REVIEWING]: ['admin'],
  [InvoiceStatus.APPROVED]: ['admin'],
  [InvoiceStatus.PAID]: ['admin'],
  [InvoiceStatus.OVERDUE]: ['system', 'admin'],  // systemは自動処理用
  [InvoiceStatus.REJECTED]: ['admin'],
  [InvoiceStatus.SENT]: ['user', 'admin']
} as const;

export class InvoiceStatusManager {
  /**
   * 指定されたステータス遷移が有効かどうかを検証
   */
  static validateTransition(
    currentStatus: InvoiceStatusType,
    nextStatus: InvoiceStatusType
  ): boolean {
    const allowedStatuses = STATUS_TRANSITIONS[currentStatus];
    return allowedStatuses.includes(nextStatus);
  }

  /**
   * ステータス変更に必要な権限を持っているかを検証
   */
  static hasPermission(
    status: InvoiceStatusType,
    userRoles: UserRole[]
  ): boolean {
    const requiredRoles = STATUS_PERMISSIONS[status];
    return userRoles.some(role => requiredRoles.includes(role));
  }

  /**
   * 次に可能なステータスの一覧を取得
   */
  static getNextPossibleStatuses(
    currentStatus: InvoiceStatusType,
    userRoles: UserRole[]
  ): InvoiceStatusType[] {
    const allowedStatuses = STATUS_TRANSITIONS[currentStatus];
    return allowedStatuses.filter(status => 
      this.hasPermission(status, userRoles)
    );
  }

  /**
   * ステータスに応じたメール通知が必要かどうかを判定
   */
  static needsNotification(status: InvoiceStatusType): boolean {
    return NOTIFICATION_STATUSES.includes(status as NotificationStatus);
  }

  /**
   * 支払期限超過の判定
   */
  static isOverdue(dueDate: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }
}