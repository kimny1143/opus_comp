import { z } from 'zod'
import { AccountType } from '../bankAccount'

/**
 * 共通のバリデーションメッセージ
 * @note 将来的な多言語対応を考慮し、メッセージを一元管理
 */
const validationMessages = {
  // 基本メッセージ
  required: '必須項目です',
  invalidFormat: '無効な形式です',
  
  // 数値関連
  positiveNumber: '0より大きい値を入力してください',
  nonNegativeNumber: '0以上の値を入力してください',
  integerNumber: '整数を入力してください',
  taxRateMin: 'インボイス制度に基づき、税率は10%以上を入力してください',
  taxRateMax: '税率は100%以下を入力してください',
  
  // 日付関連
  invalidDate: '無効な日付です',
  futureDate: '未来の日付を指定してください',
  pastDate: '過去の日付を指定してください',
  
  // 文字列関連
  invalidEmail: '有効なメールアドレスを入力してください',
  invalidPhone: '電話番号は数字とハイフンのみ使用できます',
  invalidPassword: 'パスワードは8文字以上で、大文字・小文字・数字を含める必要があります',
  invalidRegistrationNumber: '登録番号はTで始まる13桁の数字である必要があります',
  invalidAccountNumber: '口座番号は数字のみ使用できます',
  
  // 配列関連
  arrayMinLength: '1つ以上の項目が必要です'
}

/**
 * 数値関連の共通バリデーション
 */
const numberValidation = {
  quantity: z.number()
    .positive(validationMessages.positiveNumber)
    .int(validationMessages.integerNumber),
  
  taxRate: z.number()
    .min(0.1, validationMessages.taxRateMin)
    .max(1, validationMessages.taxRateMax)
    .transform(value => Number(value.toFixed(2))),
  
  price: z.number()
    .min(0, validationMessages.nonNegativeNumber)
    .transform(value => Number(value.toFixed(0))),
  
  amount: z.number()
    .min(0, validationMessages.nonNegativeNumber)
    .transform(value => Number(value.toFixed(0)))
}

/**
 * 日付関連の共通バリデーション
 */
const dateValidation = {
  required: z.date({
    required_error: validationMessages.required,
    invalid_type_error: validationMessages.invalidDate
  }),
  
  future: z.date()
    .min(new Date(), validationMessages.futureDate),
  
  past: z.date()
    .max(new Date(), validationMessages.pastDate),
  
  optional: z.date({
    invalid_type_error: validationMessages.invalidDate
  }).optional()
}

/**
 * 文字列関連の共通バリデーション
 */
const stringValidation = {
  required: z.string().min(1, validationMessages.required),
  optional: z.string().optional(),
  
  email: z.string()
    .email(validationMessages.invalidEmail)
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .regex(/^[0-9-]*$/, validationMessages.invalidPhone)
    .optional(),
  
  description: z.string().optional(),
  
  password: z.string()
    .min(8, validationMessages.invalidPassword)
    .regex(/[A-Z]/, validationMessages.invalidPassword)
    .regex(/[a-z]/, validationMessages.invalidPassword)
    .regex(/[0-9]/, validationMessages.invalidPassword),
  
  registrationNumber: z.string()
    .regex(/^T\d{13}$/, validationMessages.invalidRegistrationNumber),
  
  accountNumber: z.string()
    .min(1, validationMessages.required)
    .regex(/^[0-9]+$/, validationMessages.invalidAccountNumber)
}

/**
 * 配列関連の共通バリデーション
 */
const arrayValidation = {
  nonEmpty: <T extends z.ZodTypeAny>(schema: T) => 
    z.array(schema).min(1, validationMessages.arrayMinLength)
}

/**
 * 共通のスキーマ定義
 */
const commonSchemas = {
  // タグのスキーマ
  tag: z.object({
    id: z.string().optional(),
    name: stringValidation.required
  }),

  // 銀行情報のスキーマ
  bankInfo: z.object({
    bankName: stringValidation.required,
    branchName: stringValidation.required,
    accountType: z.nativeEnum(AccountType),
    accountNumber: stringValidation.accountNumber,
    accountHolder: stringValidation.required
  }),

  // 明細行のスキーマ
  item: z.object({
    id: z.string().optional(),
    itemName: stringValidation.required,
    quantity: numberValidation.quantity,
    unitPrice: numberValidation.price,
    taxRate: numberValidation.taxRate,
    description: stringValidation.optional
  })
}

// メインのエクスポート
export const commonValidation = {
  number: numberValidation,
  date: dateValidation,
  string: stringValidation,
  array: arrayValidation,
  schemas: commonSchemas,
  messages: validationMessages
}

// 型定義のエクスポート
export type Tag = z.infer<typeof commonSchemas.tag>
export type BankInfo = z.infer<typeof commonSchemas.bankInfo>
export type Item = z.infer<typeof commonSchemas.item>

// 個別のエクスポートも維持（後方互換性のため）
export {
  numberValidation,
  dateValidation,
  stringValidation,
  arrayValidation,
  commonSchemas,
  validationMessages
} 