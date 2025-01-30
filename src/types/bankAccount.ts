import { z } from 'zod'
import { Prisma } from '@prisma/client'

export enum AccountType {
  ORDINARY = 'ORDINARY',
  CURRENT = 'CURRENT',
  SAVINGS = 'SAVINGS'
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  [AccountType.ORDINARY]: '普通',
  [AccountType.CURRENT]: '当座',
  [AccountType.SAVINGS]: '貯蓄'
} as const

// 口座種別のオプション（SelectFieldで使用）
export const ACCOUNT_TYPE_OPTIONS = Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label
}))

// 基本的な銀行情報インターフェース（すべてのフィールドが必須）
export interface BankInfo {
  bankName: string
  branchName: string
  accountType: AccountType
  accountNumber: string
  accountHolder: string
}

// Zodスキーマ定義（すべてのフィールドが必須）
export const bankInfoSchema = z.strictObject({
  bankName: z.string().min(1, '銀行名は必須です').nonempty(),
  branchName: z.string().min(1, '支店名は必須です').nonempty(),
  accountType: z.nativeEnum(AccountType, {
    required_error: '口座種別は必須です',
    invalid_type_error: '無効な口座種別です'
  }),
  accountNumber: z.string().min(1, '口座番号は必須です').nonempty(),
  accountHolder: z.string().min(1, '口座名義は必須です').nonempty()
})

// スキーマから型を生成（BankInfo と完全に一致することを保証）
export type BankInfoSchema = z.infer<typeof bankInfoSchema>

// null許容型（APIレスポンス用）
export type BankInfoNullable = {
  [K in keyof BankInfo]: BankInfo[K] | null
}

// 空文字列許容型（フォーム用）
export type BankInfoOptional = Partial<BankInfo>

// フォーム入力用のスキーマ（すべてのフィールドがオプショナル）
export const bankInfoFormSchema = z.object({
  bankName: z.string().optional(),
  branchName: z.string().optional(),
  accountType: z.nativeEnum(AccountType).optional(),
  accountNumber: z.string().optional(),
  accountHolder: z.string().optional()
})

// フォーム入力用の型（すべてのフィールドがオプショナル）
export type BankInfoFormData = z.infer<typeof bankInfoFormSchema>

// JSON変換用のユーティリティ関数
export const bankInfoToPrismaJson = (bankInfo: BankInfoOptional): Prisma.JsonValue => {
  const converted = {
    bankName: bankInfo.bankName || '',
    branchName: bankInfo.branchName || '',
    accountType: bankInfo.accountType || AccountType.ORDINARY,
    accountNumber: bankInfo.accountNumber || '',
    accountHolder: bankInfo.accountHolder || ''
  }
  return converted as unknown as Prisma.JsonValue
}

export const bankInfoFromPrismaJson = (json: Prisma.JsonValue): BankInfoOptional => {
  if (typeof json !== 'object' || json === null) {
    throw new Error('Invalid bank info format: must be an object')
  }

  const result = bankInfoFormSchema.safeParse(json)
  if (!result.success) {
    throw new Error(`Invalid bank info data: ${result.error.message}`)
  }

  return {
    bankName: result.data.bankName || '',
    branchName: result.data.branchName || '',
    accountType: result.data.accountType || AccountType.ORDINARY,
    accountNumber: result.data.accountNumber || '',
    accountHolder: result.data.accountHolder || ''
  }
}

// デフォルト値（すべてのフィールドが必須）
export const defaultBankInfo: BankInfo = {
  bankName: '',
  branchName: '',
  accountType: AccountType.ORDINARY,
  accountNumber: '',
  accountHolder: ''
} 