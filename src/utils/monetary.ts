import { Prisma } from '@prisma/client'
import { MonetaryAmount } from '@/types/base/common'

/**
 * MonetaryAmount型をDecimal型に変換
 */
export function monetaryToDecimal(monetary: MonetaryAmount): Prisma.Decimal {
  return new Prisma.Decimal(monetary.amount.toString())
}

/**
 * Decimal型をMonetaryAmount型に変換
 */
export function decimalToMonetary(decimal: Prisma.Decimal, currency: string = 'JPY'): MonetaryAmount {
  return {
    amount: decimal.toNumber(),
    currency
  }
}

/**
 * 数値をMonetaryAmount型に変換
 */
export function numberToMonetary(amount: number, currency: string = 'JPY'): MonetaryAmount {
  return {
    amount,
    currency
  }
}

/**
 * MonetaryAmount型を数値に変換
 */
export function monetaryToNumber(monetary: MonetaryAmount): number {
  return monetary.amount
}