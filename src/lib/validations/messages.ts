import { validationMessages as commonMessages } from '@/types/validation/commonValidation'

export const validationMessages = {
  ...commonMessages,
  auth: {
    required: '認証が必要です',
    invalid: '認証情報が無効です',
    expired: 'セッションが期限切れです'
  },
  validation: {
    invalid: '入力内容が無効です',
    arrayMinLength: '1つ以上の項目が必要です',
    invalidDate: '無効な日付です',
    invalidEmail: '無効なメールアドレスです',
    invalidPassword: 'パスワードは8文字以上必要です',
    invalidNumber: '数値を入力してください',
    invalidUUID: '無効なIDです',
    invalidStatus: '無効なステータスです'
  }
}