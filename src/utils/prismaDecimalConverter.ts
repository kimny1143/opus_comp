import { Prisma } from '@prisma/client'

export interface DecimalFields {
  unitPrice?: number | Prisma.Decimal
  taxRate?: number | Prisma.Decimal
  amount?: number | Prisma.Decimal
}

/**
 * 数値をPrisma.Decimalに変換
 */
export function toDecimal<T extends DecimalFields>(data: T): T {
  const result = { ...data }
  
  if (typeof result.unitPrice === 'number') {
    result.unitPrice = new Prisma.Decimal(result.unitPrice)
  }
  if (typeof result.taxRate === 'number') {
    result.taxRate = new Prisma.Decimal(result.taxRate)
  }
  if (typeof result.amount === 'number') {
    result.amount = new Prisma.Decimal(result.amount)
  }
  
  return result
}

/**
 * Prisma.Decimalを数値に変換
 */
export function fromDecimal<T extends DecimalFields>(data: T): T {
  const result = { ...data }
  
  if (result.unitPrice instanceof Prisma.Decimal) {
    result.unitPrice = Number(result.unitPrice)
  }
  if (result.taxRate instanceof Prisma.Decimal) {
    result.taxRate = Number(result.taxRate)
  }
  if (result.amount instanceof Prisma.Decimal) {
    result.amount = Number(result.amount)
  }
  
  return result
}

/**
 * 配列内のDecimal値を変換
 */
export function convertArrayItems<T extends DecimalFields>(
  items: T[],
  converter: typeof toDecimal | typeof fromDecimal
): T[] {
  return items.map(item => converter(item))
}

/**
 * APIリクエスト用にデータを変換
 */
export function prepareForApi<T extends { items?: DecimalFields[] }>(data: T): T {
  const result = { ...data }
  if (result.items) {
    result.items = convertArrayItems(result.items, toDecimal)
  }
  return result
}

/**
 * APIレスポンスのデータを変換
 */
export function prepareFromApi<T extends { items?: DecimalFields[] }>(data: T): T {
  const result = { ...data }
  if (result.items) {
    result.items = convertArrayItems(result.items, fromDecimal)
  }
  return result
} 