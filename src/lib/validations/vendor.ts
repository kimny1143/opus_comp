import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { validationMessages as msg } from './messages'

export const vendorSchema = z.object({
  name: z.string().min(1, msg.required.vendor),
  email: z.string().email(msg.format.email).nullable().optional(),
  phone: z
    .string()
    .regex(/^[0-9-]+$/, msg.format.phone)
    .nullable()
    .optional(),
  address: z.string().nullable().optional(),
  contactPerson: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED']),
  entityType: z.enum(['corporation', 'individual', 'other']),
  registrationNumber: z
    .string()
    .regex(/^T\d{13}$/, msg.format.registrationNumber)
    .nullable()
    .optional(),
  invoiceNumber: z.string().nullable().optional(),
  myNumber: z
    .string()
    .regex(/^\d{13}$/, 'マイナンバーの形式が正しくありません')
    .nullable()
    .optional(),
  industry: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  establishedDate: z.date().nullable().optional(),
  contractStartDate: z.date().nullable().optional(),
})

export type VendorInput = z.infer<typeof vendorSchema> 