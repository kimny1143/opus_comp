import { validationMessages as commonMessages } from '@/types/validation/commonValidation'

export const validationMessages = {
  ...commonMessages,
  auth: {
    required: '認証が必要です',
    invalid: '認証情報が無効です',
    expired: 'セッションが期限切れです',
    invalidCredentials: 'メールアドレスまたはパスワードが正しくありません'
  },
  vendor: {
    notFound: '取引先が見つかりません',
    hasRelatedData: '関連する発注書または請求書が存在するため削除できません',
    deleted: '取引先を削除しました',
  },
  validation: {
    invalid: 'バリデーションエラーが発生しました',
    required: '必須項目です',
    invalidFormat: '形式が正しくありません',
    minLength: (min: number) => `${min}文字以上で入力してください`,
    maxLength: (max: number) => `${max}文字以下で入力してください`,
    arrayMinLength: '1つ以上の項目を追加してください',
    arrayMaxLength: (max: number) => `${max}個以下の項目を指定してください`,
    positiveNumber: '0より大きい数値を入力してください',
    nonNegativeNumber: '0以上の数値を入力してください',
    taxRateMin: '税率は0.1以上で入力してください',
    taxRateMax: '税率は1以下で入力してください',
    futureDate: '未来の日付を指定してください',
    pastDate: '過去の日付を指定してください'
  },
  error: {
    deletion: '削除中にエラーが発生しました',
    system: 'システムエラーが発生しました',
    update: '更新中にエラーが発生しました',
    methodNotAllowed: '許可されていないメソッドです',
    server: 'サーバーエラーが発生しました'
  },
  invoice: {
    notFound: '請求書が見つかりません',
    hasRelatedData: '関連するデータが存在するため削除できません',
    invalidStatus: '無効なステータスです',
    deleted: '請求書を削除しました',
  },
  purchaseOrder: {
    notFound: '発注書が見つかりません',
    hasRelatedData: '関連するデータが存在するため削除できません',
    invalidStatus: '無効なステータスです',
    deleted: '発注書を削除しました',
    statusUpdated: 'ステータスを更新しました',
    bulkDeleted: '選択した発注書を削除しました',
    bulkStatusUpdated: '選択した発注書のステータスを更新しました',
    statusTransition: {
      draft: {
        sent: '発注書を送信しました',
        rejected: 'ステータスをDRAFTからREJECTEDに直接変更することはできません',
        completed: 'ステータスをDRAFTからCOMPLETEDに直接変更することはできません'
      },
      sent: {
        accepted: '発注書が承認されました',
        rejected: '発注書が却下されました',
        completed: 'ステータスをSENTからCOMPLETEDに直接変更することはできません'
      },
      accepted: {
        completed: '発注書を完了しました',
        rejected: 'ステータスをACCEPTEDからREJECTEDに変更することはできません'
      },
      rejected: {
        draft: '発注書を下書きに戻しました',
        completed: 'ステータスをREJECTEDからCOMPLETEDに変更することはできません'
      },
      completed: {
        message: '完了済みの発注書のステータスは変更できません'
      }
    }
  },
} as const; 