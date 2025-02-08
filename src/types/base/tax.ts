import { Prisma } from '@prisma/client'

export interface DbTaxCalculation {
  taxableAmount: Prisma.Decimal
  taxAmount: Prisma.Decimal
}

export interface DbTaxSummary {
  byRate: Record<string, DbTaxCalculation>
  totalTaxableAmount: Prisma.Decimal
  totalTaxAmount: Prisma.Decimal
}

export interface ClientTaxCalculation {
  taxableAmount: number
  taxAmount: number
}

export interface ClientTaxSummary {
  byRate: Record<string, ClientTaxCalculation>
  totalTaxableAmount: number
  totalTaxAmount: number
}

export interface TaxableItem {
  quantity: number
  unitPrice: number
  taxRate: number
}