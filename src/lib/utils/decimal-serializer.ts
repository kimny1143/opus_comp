import { Prisma } from '@prisma/client'

type DecimalFields<T> = {
  [P in keyof T]: T[P] extends Prisma.Decimal
    ? string
    : T[P] extends Prisma.Decimal | null
    ? string | null
    : T[P] extends object
    ? DecimalFields<T[P]>
    : T[P] extends Array<infer U>
    ? Array<DecimalFields<U>>
    : T[P]
}

export function serializeDecimal<T>(obj: T): DecimalFields<T> {
  if (obj === null || obj === undefined) {
    return obj as DecimalFields<T>
  }

  if (obj instanceof Prisma.Decimal) {
    return obj.toString() as DecimalFields<T>
  }

  if (Array.isArray(obj)) {
    return obj.map(item => serializeDecimal(item)) as DecimalFields<T>
  }

  if (typeof obj === 'object') {
    const result: any = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeDecimal(value)
    }
    return result
  }

  return obj as DecimalFields<T>
} 