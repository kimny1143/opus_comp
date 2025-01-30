import { z } from 'zod'
import { VendorCategory, VendorStatus } from '@prisma/client'
import {
  commonSchemas,
  stringValidation,
  dateValidation,
  validationMessages
} from '@/types/validation/commonValidation'

export const vendorSchema = z.object({
  name: stringValidation.required,
  email: stringValidation.email,
  phone: stringValidation.phone,
  address: stringValidation.required,
  contactPerson: stringValidation.optional,
  status: z.nativeEnum(VendorStatus, {
    required_error: validationMessages.required,
    invalid_type_error: validationMessages.invalidFormat
  }),
  category: z.nativeEnum(VendorCategory, {
    required_error: validationMessages.required,
    invalid_type_error: validationMessages.invalidFormat
  }),
  registrationNumber: stringValidation.registrationNumber.optional(),
  bankInfo: commonSchemas.bankInfo,
  notes: stringValidation.optional,
  establishedDate: dateValidation.optional,
  contractStartDate: dateValidation.optional,
  tags: z.array(commonSchemas.tag).default([])
})

export type VendorInput = z.infer<typeof vendorSchema>

// バルクアクション用のスキーマ
export const bulkActionSchema = z.object({
  ids: z.array(z.string().uuid()),
  action: z.enum(['delete', 'updateStatus']),
  status: z.nativeEnum(VendorStatus).optional()
}) 