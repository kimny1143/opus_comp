import { z } from 'zod'
import { InvoiceStatus } from '@prisma/client'
import {
  commonSchemas,
  stringValidation,
  dateValidation,
  validationMessages
} from '@/types/validation/commonValidation'

// 請求書作成用のスキーマ
const invoiceBaseSchema = {
  vendorId: stringValidation.required,
  purchaseOrderId: stringValidation.required,
  status: z.nativeEnum(InvoiceStatus, {
    required_error: validationMessages.required,
    invalid_type_error: validationMessages.invalidFormat
  }).default('DRAFT'),
  issueDate: dateValidation.required,
  dueDate: dateValidation.required,
  items: z.array(commonSchemas.item).min(1, validationMessages.arrayMinLength),
  bankInfo: commonSchemas.bankInfo,
  notes: stringValidation.optional,
  registrationNumber: stringValidation.registrationNumber,
  tags: z.array(commonSchemas.tag).default([])
} as const

export const invoiceCreateSchema = z.object(invoiceBaseSchema).refine(
  (data) => data.dueDate >= data.issueDate,
  {
    message: '支払期限は発行日以降の日付を指定してください',
    path: ['dueDate']
  }
)

// 請求書更新用のスキーマ
export const invoiceUpdateSchema = z.object({
  ...Object.fromEntries(
    Object.entries(invoiceBaseSchema).map(([key, schema]) => [key, schema.optional()])
  )
}).refine(
  (data) => !data.dueDate || !data.issueDate || data.dueDate >= data.issueDate,
  {
    message: '支払期限は発行日以降の日付を指定してください',
    path: ['dueDate']
  }
)

// 請求書ステータス更新用のスキーマ
export const invoiceStatusUpdateSchema = z.object({
  status: z.nativeEnum(InvoiceStatus, {
    required_error: validationMessages.required,
    invalid_type_error: validationMessages.invalidFormat
  })
})

// バルクアクション用のスキーマ
export const bulkActionSchema = z.object({
  ids: z.array(z.string().uuid()),
  action: z.enum(['delete', 'updateStatus']),
  status: z.nativeEnum(InvoiceStatus).optional()
})

export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>
export type InvoiceUpdateInput = z.infer<typeof invoiceUpdateSchema>
export type InvoiceStatusUpdateInput = z.infer<typeof invoiceStatusUpdateSchema> 