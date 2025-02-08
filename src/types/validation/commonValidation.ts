import { z } from 'zod'

export const validationMessages = {
  required: '必須項目です',
  invalidFormat: '無効な形式です',
  arrayMinLength: '1つ以上の項目が必要です',
  invalidDate: '無効な日付です',
  invalidEmail: '無効なメールアドレスです',
  invalidPassword: 'パスワードは8文字以上必要です',
  invalidNumber: '数値を入力してください',
  invalidUUID: '無効なIDです',
  invalidStatus: '無効なステータスです',
  invalidPhone: '無効な電話番号です'
} as const

export const stringValidation = {
  required: z.string().min(1, validationMessages.required),
  optional: z.string().optional(),
  email: z.string().email(validationMessages.invalidEmail),
  password: z.string().min(8, validationMessages.invalidPassword),
  phone: z.string().regex(/^[0-9\-]+$/, validationMessages.invalidPhone).optional()
}

export const dateValidation = {
  required: z.coerce.date({
    required_error: validationMessages.required,
    invalid_type_error: validationMessages.invalidDate
  }),
  optional: z.coerce.date({
    invalid_type_error: validationMessages.invalidDate
  }).optional()
}

export const numberValidation = {
  required: z.number({
    required_error: validationMessages.required,
    invalid_type_error: validationMessages.invalidNumber
  }),
  optional: z.number({
    invalid_type_error: validationMessages.invalidNumber
  }).optional()
}

export const arrayValidation = {
  required: <T extends z.ZodTypeAny>(schema: T) =>
    z.array(schema).min(1, validationMessages.arrayMinLength),
  optional: <T extends z.ZodTypeAny>(schema: T) =>
    z.array(schema).optional()
}

export const commonSchemas = {
  id: z.string().uuid(validationMessages.invalidUUID),
  item: z.object({
    itemName: stringValidation.required,
    quantity: numberValidation.required.positive(),
    unitPrice: numberValidation.required.positive(),
    taxRate: numberValidation.required.min(0),
    description: stringValidation.optional
  }),
  tag: z.object({
    id: z.string().optional(),
    name: stringValidation.required
  }),
  bankInfo: z.object({
    bankName: stringValidation.required,
    branchName: stringValidation.required,
    accountType: z.enum(['ORDINARY', 'CURRENT', 'SAVINGS'], {
      required_error: validationMessages.required,
      invalid_type_error: validationMessages.invalidFormat
    }),
    accountNumber: stringValidation.required,
    accountHolder: stringValidation.required
  })
}