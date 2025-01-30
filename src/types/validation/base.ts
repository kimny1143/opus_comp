import { z } from 'zod'

/**
 * 基本的なバリデーションメッセージ
 */
export const baseValidationMessages = {
  // 必須項目
  required: '必須項目です',
  invalidFormat: '無効な形式です',
  
  // 数値
  positiveNumber: '0より大きい値を入力してください',
  integerNumber: '整数を入力してください',
  minNumber: (min: number) => `${min}以上の値を入力してください`,
  maxNumber: (max: number) => `${max}以下の値を入力してください`,
  
  // 日付
  invalidDate: '無効な日付です',
  requiredDate: '日付を入力してください',
  futureDate: '未来の日付を指定してください',
  pastDate: '過去の日付を指定してください',
  minDate: (date: string) => `${date}以降の日付を指定してください`,
  maxDate: (date: string) => `${date}以前の日付を指定してください`,
  
  // 文字列
  minLength: (min: number) => `${min}文字以上で入力してください`,
  maxLength: (max: number) => `${max}文字以下で入力してください`,
  invalidEmail: '有効なメールアドレスを入力してください',
  invalidPhone: '電話番号は数字とハイフンのみ使用できます',
  
  // 配列
  minItems: (min: number) => `${min}個以上の項目が必要です`,
  maxItems: (max: number) => `${max}個以下の項目にしてください`
} as const

/**
 * 基本的なバリデーションルール
 */
export const baseValidationRules = {
  // 必須の文字列
  requiredString: z.string().min(1, baseValidationMessages.required),
  
  // オプションの文字列
  optionalString: z.string().optional(),
  
  // メールアドレス
  email: z.string().email(baseValidationMessages.invalidEmail),
  
  // 電話番号
  phone: z.string().regex(/^[0-9-]+$/, baseValidationMessages.invalidPhone),
  
  // 必須の日付
  requiredDate: z.date({
    required_error: baseValidationMessages.requiredDate,
    invalid_type_error: baseValidationMessages.invalidDate
  }),
  
  // オプションの日付
  optionalDate: z.date({
    invalid_type_error: baseValidationMessages.invalidDate
  }).optional(),
  
  // 過去日付（今日以前）
  pastDate: z.date({
    required_error: baseValidationMessages.requiredDate,
    invalid_type_error: baseValidationMessages.invalidDate
  }).max(new Date(), baseValidationMessages.pastDate),
  
  // 未来日付（今日以降）
  futureDate: z.date({
    required_error: baseValidationMessages.requiredDate,
    invalid_type_error: baseValidationMessages.invalidDate
  }).min(new Date(), baseValidationMessages.futureDate),
  
  // 日付範囲（最小日付以降）
  minDate: (minDate: Date) => z.date({
    required_error: baseValidationMessages.requiredDate,
    invalid_type_error: baseValidationMessages.invalidDate
  }).min(minDate, baseValidationMessages.minDate(minDate.toLocaleDateString())),
  
  // 配列の最小数チェック
  nonEmptyArray: <T extends z.ZodTypeAny>(schema: T) => 
    z.array(schema).min(1, baseValidationMessages.minItems(1))
} as const 