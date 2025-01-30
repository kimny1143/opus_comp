import { Prisma } from '@prisma/client'

/**
 * Prisma.Decimal型のモックを作成するヘルパー関数
 * @param value 数値
 * @returns Prisma.Decimal型のモック
 */
export const createDecimalMock = (value: number): Prisma.Decimal => {
  const decimal = {
    d: [value],
    e: 0,
    s: value < 0 ? -1 : 1,
    toNumber: () => value,
    toString: () => value.toString(),
    equals: (other: Prisma.Decimal) => value === other.toNumber(),
    gt: (other: Prisma.Decimal) => value > other.toNumber(),
    gte: (other: Prisma.Decimal) => value >= other.toNumber(),
    lt: (other: Prisma.Decimal) => value < other.toNumber(),
    lte: (other: Prisma.Decimal) => value <= other.toNumber(),
    minus: (other: Prisma.Decimal) => createDecimalMock(value - other.toNumber()),
    plus: (other: Prisma.Decimal) => createDecimalMock(value + other.toNumber()),
    times: (other: Prisma.Decimal) => createDecimalMock(value * other.toNumber()),
    div: (other: Prisma.Decimal) => createDecimalMock(value / other.toNumber()),
    toFixed: (precision?: number) => value.toFixed(precision),
    abs: () => createDecimalMock(Math.abs(value)),
    ceil: () => createDecimalMock(Math.ceil(value)),
    floor: () => createDecimalMock(Math.floor(value)),
    round: () => createDecimalMock(Math.round(value)),
    isNegative: () => value < 0,
    isPositive: () => value > 0,
    isZero: () => value === 0,
    comparedTo: (other: Prisma.Decimal) => value - other.toNumber(),
    cmp: (other: Prisma.Decimal) => value - other.toNumber(),
    absoluteValue: () => createDecimalMock(Math.abs(value)),
    clamp: (min: Prisma.Decimal, max: Prisma.Decimal) => 
      createDecimalMock(Math.min(Math.max(value, min.toNumber()), max.toNumber())),
    clampedTo: (min: Prisma.Decimal, max: Prisma.Decimal) => 
      createDecimalMock(Math.min(Math.max(value, min.toNumber()), max.toNumber())),
    cosine: () => createDecimalMock(Math.cos(value)),
    cos: () => createDecimalMock(Math.cos(value)),
    sine: () => createDecimalMock(Math.sin(value)),
    sin: () => createDecimalMock(Math.sin(value)),
    tangent: () => createDecimalMock(Math.tan(value)),
    tan: () => createDecimalMock(Math.tan(value))
  }

  return decimal as unknown as Prisma.Decimal
} 