import { InvoiceStatus, canTransitionTo } from './status';
import { UserRole, hasHigherOrEqualRole } from '../auth/roles';

/**
 * 請求書ステータス管理クラス
 */
export class InvoiceStatusManager {
  private currentStatus: InvoiceStatus;
  private userRole: UserRole;

  constructor(status: InvoiceStatus, userRole: UserRole) {
    this.currentStatus = status;
    this.userRole = userRole;
  }

  /**
   * ステータス変更が可能か確認
   */
  canChangeTo(nextStatus: InvoiceStatus): boolean {
    // ステータス遷移の可否をチェック
    if (!canTransitionTo(this.currentStatus, nextStatus)) {
      return false;
    }

    // ロールに基づく権限チェック
    switch (nextStatus) {
      case 'APPROVED':
        return hasHigherOrEqualRole(this.userRole, 'MANAGER');
      case 'SENT':
        return hasHigherOrEqualRole(this.userRole, 'ACCOUNTANT');
      case 'PAID':
        return hasHigherOrEqualRole(this.userRole, 'ACCOUNTANT');
      case 'REJECTED':
        return hasHigherOrEqualRole(this.userRole, 'MANAGER');
      default:
        return hasHigherOrEqualRole(this.userRole, 'STAFF');
    }
  }

  /**
   * 編集が可能か確認
   */
  canEdit(): boolean {
    // 取引先は編集不可
    if (this.userRole === 'VENDOR') {
      return false;
    }

    // 特定のステータスのみ編集可能
    const editableStatuses: InvoiceStatus[] = ['DRAFT', 'PENDING', 'REJECTED', 'REVIEWING'];
    return editableStatuses.includes(this.currentStatus);
  }

  /**
   * 送信が可能か確認
   */
  canSend(): boolean {
    // 経理担当以上のみ送信可能
    if (!hasHigherOrEqualRole(this.userRole, 'ACCOUNTANT')) {
      return false;
    }

    // 承認済みのみ送信可能
    return this.currentStatus === 'APPROVED';
  }

  /**
   * 支払い登録が可能か確認
   */
  canRegisterPayment(): boolean {
    // 経理担当以上のみ支払い登録可能
    if (!hasHigherOrEqualRole(this.userRole, 'ACCOUNTANT')) {
      return false;
    }

    // 送信済みのみ支払い登録可能
    return this.currentStatus === 'SENT';
  }

  /**
   * 現在のステータスを取得
   */
  getCurrentStatus(): InvoiceStatus {
    return this.currentStatus;
  }

  /**
   * 現在のユーザーロールを取得
   */
  getUserRole(): UserRole {
    return this.userRole;
  }

  /**
   * 権限チェック
   */
  static hasPermission(role: UserRole, action: 'approve' | 'send' | 'pay' | 'reject'): boolean {
    switch (action) {
      case 'approve':
      case 'reject':
        return hasHigherOrEqualRole(role, 'MANAGER');
      case 'send':
      case 'pay':
        return hasHigherOrEqualRole(role, 'ACCOUNTANT');
      default:
        return hasHigherOrEqualRole(role, 'STAFF');
    }
  }

  /**
   * ステータス遷移の検証
   */
  static validateTransition(currentStatus: InvoiceStatus, nextStatus: InvoiceStatus): boolean {
    return canTransitionTo(currentStatus, nextStatus);
  }

  /**
   * 通知が必要かどうかを判定
   */
  static needsNotification(status: InvoiceStatus): boolean {
    return ['APPROVED', 'SENT', 'PAID', 'REJECTED'].includes(status);
  }

  /**
   * 次の可能なステータスを取得
   */
  static getNextPossibleStatuses(currentStatus: InvoiceStatus, role: UserRole): InvoiceStatus[] {
    const allStatuses: InvoiceStatus[] = ['DRAFT', 'PENDING', 'APPROVED', 'SENT', 'PAID', 'REJECTED', 'REVIEWING', 'OVERDUE'];
    return allStatuses.filter(nextStatus => {
      if (!canTransitionTo(currentStatus, nextStatus)) {
        return false;
      }

      switch (nextStatus) {
        case 'APPROVED':
        case 'REJECTED':
          return hasHigherOrEqualRole(role, 'MANAGER');
        case 'SENT':
        case 'PAID':
          return hasHigherOrEqualRole(role, 'ACCOUNTANT');
        default:
          return hasHigherOrEqualRole(role, 'STAFF');
      }
    });
  }

  /**
   * 期限切れかどうかを判定
   */
  static isOverdue(status: InvoiceStatus, dueDate: Date): boolean {
    if (status === 'PAID' || status === 'OVERDUE') {
      return false;
    }
    return new Date() > dueDate;
  }
}