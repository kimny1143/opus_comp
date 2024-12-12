import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { validationMessages as msg } from './messages'

const invoiceItemSchema = z.object({
  itemName: z.string().min(1, msg.required.itemName),
  description: z.string().nullable().optional(),
  quantity: z.number().min(1, msg.number.quantity),
  unitPrice: z.number().min(0, msg.number.unitPrice),
  taxRate: z.number().min(0).max(1, msg.number.taxRate),
})

export const invoiceSchema = z.object({
  vendorId: z.string().min(1, msg.required.vendor),
  purchaseOrderId: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']),
  issueDate: z.date(),
  dueDate: z.date(),
  paymentMethod: z.enum(['BANK_TRANSFER', 'CREDIT_CARD', 'DIRECT_DEBIT', 'CASH', 'OTHER']).nullable().optional(),
  bankAccount: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(invoiceItemSchema).min(1, msg.required.itemName),
}).superRefine((data, ctx) => {
  if (data.dueDate < data.issueDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: msg.date.dueDate,
    });
  }
});

export type InvoiceInput = z.infer<typeof invoiceSchema>
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema> 