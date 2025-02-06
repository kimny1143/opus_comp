import { Prisma } from '@prisma/client'

/**
 * Prisma.Decimal型のモックを作成するヘルパー関数
 * 
 * このヘルパーは、テストコードでPrisma.Decimal型の値を扱う際に使用します。
 * 実際のPrisma.Decimal型と同じインターフェースを持つモックオブジェクトを生成し、
 * 数値計算や比較操作をテストできるようにします。
 * 
 * 主な用途:
 * - 金額計算のテスト
 * - 税率計算のテスト
 * - DB層とView層の型変換テスト
 * 
 * 使用例:
 * ```typescript
 * // 基本的な使用方法
 * const amount = createDecimalMock(1000)
 * expect(amount.toNumber()).toBe(1000)
 * 
 * // 計算のテスト
 * const price = createDecimalMock(1000)
 * const tax = createDecimalMock(100)
 * const total = price.plus(tax)
 * expect(total.toNumber()).toBe(1100)
 * 
 * // 比較のテスト
 * const a = createDecimalMock(1000)
 * const b = createDecimalMock(2000)
 * expect(a.lt(b)).toBe(true)
 * ```
 * 
 * 注意点:
 * - このモックは、実際のPrisma.Decimal型の完全な再現ではありません
 * - 精度が必要な計算の場合は、実際のDecimal型を使用することを推奨します
 * - テストコードでのみ使用し、プロダクションコードでは使用しないでください
 * 
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
    mul: (other: number | Prisma.Decimal) => {
      const otherValue = typeof other === 'number' ? other : other.toNumber()
      return createDecimalMock(value * otherValue)
    },
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