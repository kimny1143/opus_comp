import { Prisma } from '@prisma/client'

/**
 * Decimal型を含むオブジェクトをシリアライズ可能な形式に変換する
 */
export function serializeDecimal<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map(item => serializeDecimal(item)) as T
  }

  if (data instanceof Prisma.Decimal) {
    return data.toString() as T
  }

  if (data && typeof data === 'object') {
    const result: any = {}
    for (const [key, value] of Object.entries(data)) {
      result[key] = serializeDecimal(value)
    }
    return result
  }

  return data
} 