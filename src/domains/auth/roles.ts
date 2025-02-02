/**
 * ユーザーロール
 */
export type UserRole =
  | 'ADMIN'          // システム管理者
  | 'MANAGER'        // 管理職
  | 'ACCOUNTANT'     // 経理担当
  | 'STAFF'          // 一般スタッフ
  | 'VENDOR';        // 取引先

/**
 * ロールの表示名
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'システム管理者',
  MANAGER: '管理職',
  ACCOUNTANT: '経理担当',
  STAFF: '一般スタッフ',
  VENDOR: '取引先'
};

/**
 * ロールの権限レベル
 */
export const ROLE_LEVELS: Record<UserRole, number> = {
  ADMIN: 100,
  MANAGER: 80,
  ACCOUNTANT: 60,
  STAFF: 40,
  VENDOR: 20
};

/**
 * ロールの表示名を取得
 */
export const getRoleLabel = (role: UserRole): string => {
  return ROLE_LABELS[role];
};

/**
 * ロールの権限レベルを取得
 */
export const getRoleLevel = (role: UserRole): number => {
  return ROLE_LEVELS[role];
};

/**
 * 権限レベルを比較
 */
export const hasHigherOrEqualRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
};