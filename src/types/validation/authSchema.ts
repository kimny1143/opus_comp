import { z } from 'zod'
import { commonValidation } from './commonValidation'

/**
 * パスワードポリシーの定義
 */
const passwordPolicy = {
  minLength: 8,
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
  messages: {
    minLength: 'パスワードは8文字以上で入力してください',
    pattern: 'パスワードは大文字、小文字、数字を含める必要があります',
    required: 'パスワードは必須です',
    mismatch: 'パスワードが一致しません'
  }
}

/**
 * サインアップのバリデーションスキーマ
 */
export const signUpSchema = z.object({
  email: z.string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  password: z.string()
    .min(1, passwordPolicy.messages.required)
    .min(passwordPolicy.minLength, passwordPolicy.messages.minLength)
    .regex(passwordPolicy.pattern, passwordPolicy.messages.pattern),
  confirmPassword: z.string()
    .min(1, 'パスワード（確認）は必須です')
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: passwordPolicy.messages.mismatch,
    path: ['confirmPassword']
  }
)

/**
 * サインインのバリデーションスキーマ
 */
export const signInSchema = z.object({
  email: z.string()
    .email('有効なメールアドレスを入力してください')
    .min(1, 'メールアドレスは必須です'),
  password: z.string()
    .min(1, 'パスワードは必須です')
})

/**
 * パスワードリセットのバリデーションスキーマ
 */
export const resetPasswordSchema = z.object({
  email: z.string()
    .email('有効なメールアドレスを入力してください')
    .min(1, 'メールアドレスは必須です')
})

/**
 * 新しいパスワード設定のバリデーションスキーマ
 */
export const newPasswordSchema = z.object({
  password: z.string()
    .min(1, passwordPolicy.messages.required)
    .min(passwordPolicy.minLength, passwordPolicy.messages.minLength)
    .regex(passwordPolicy.pattern, passwordPolicy.messages.pattern),
  confirmPassword: z.string()
    .min(1, 'パスワード（確認）は必須です')
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: passwordPolicy.messages.mismatch,
    path: ['confirmPassword']
  }
)

// 型定義のエクスポート
export type SignUpFormData = z.infer<typeof signUpSchema>
export type SignInFormData = z.infer<typeof signInSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type NewPasswordFormData = z.infer<typeof newPasswordSchema> 