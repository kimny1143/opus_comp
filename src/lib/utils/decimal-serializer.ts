import { Prisma } from '@prisma/client'

export function serializeDecimal<T>(data: T): T {
  if (data === null || data === undefined) return data;
  
  if (data instanceof Prisma.Decimal) {
    return data.toString() as any;
  }
  
  if (Array.isArray(data)) {
    return data.map(serializeDecimal) as any;
  }
  
  if (typeof data === 'object' && data !== null) {
    const entries = Object.entries(data).map(([key, value]) => {
      if (value instanceof Prisma.Decimal) {
        return [key, value.toString()];
      }
      return [key, serializeDecimal(value)];
    });
    return Object.fromEntries(entries) as any;
  }
  
  return data;
} 