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
      case 'CANCELED':
        return hasHigherOrEqualRole(this.userRole, 'MANAGER');
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
    const editableStatuses: InvoiceStatus[] = ['DRAFT', 'PENDING', 'REJECTED'];
    return editableStatuses.includes(this.currentStatus);
  }

  /**
   * キャンセルが可能か確認
   */
  canCancel(): boolean {
    // 管理職以上のみキャンセル可能
    if (!hasHigherOrEqualRole(this.userRole, 'MANAGER')) {
      return false;
    }

    // 特定のステータスのみキャンセル可能
    const cancelableStatuses: InvoiceStatus[] = ['DRAFT', 'PENDING', 'APPROVED'];
    return cancelableStatuses.includes(this.currentStatus);
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
}