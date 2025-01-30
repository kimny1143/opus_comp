import { describe, it, expect } from 'vitest'
import { InvoiceStatus } from '@prisma/client'
import { InvoiceStatusDisplay, InvoiceStatusStyles, InvoiceStatusTransitions } from '@/types/enums'

describe('Invoice Status Enum Extension Tests', () => {
  // 全てのステータスが表示名を持っているか
  it('全てのステータスが表示名を持っている', () => {
    Object.values(InvoiceStatus).forEach(status => {
      const displayName = InvoiceStatusDisplay[status]
      expect(displayName).toBeDefined()
      expect(typeof displayName).toBe('string')
      expect(displayName.length).toBeGreaterThan(0)
    })
  })

  // 全てのステータスがスタイル定義を持っているか
  it('全てのステータスがスタイル定義を持っている', () => {
    Object.values(InvoiceStatus).forEach(status => {
      const style = InvoiceStatusStyles[status]
      expect(style).toBeDefined()
      expect(typeof style).toBe('string')
      expect(style.length).toBeGreaterThan(0)
    })
  })

  // 全てのステータスが遷移定義を持っているか
  it('全てのステータスが遷移定義を持っている', () => {
    Object.values(InvoiceStatus).forEach(status => {
      const nextStatuses = InvoiceStatusTransitions[status]
      expect(Array.isArray(nextStatuses)).toBe(true)
    })
  })

  // 遷移定義が有効なステータスのみを含んでいるか
  it('遷移定義が有効なステータスのみを含んでいる', () => {
    const allStatuses = new Set(Object.values(InvoiceStatus))
    Object.values(InvoiceStatus).forEach(status => {
      const nextStatuses = InvoiceStatusTransitions[status]
      nextStatuses.forEach(nextStatus => {
        expect(allStatuses.has(nextStatus)).toBe(true)
      })
    })
  })

  // 遷移の循環参照チェック
  it('ステータス遷移に無限ループが存在しない', () => {
    const checkCycle = (status: InvoiceStatus, visited: Set<InvoiceStatus>): boolean => {
      if (visited.has(status)) {
        return true
      }
      visited.add(status)
      const nextStatuses = InvoiceStatusTransitions[status]
      return nextStatuses.some(nextStatus => checkCycle(nextStatus, new Set(visited)))
    }

    Object.values(InvoiceStatus).forEach(startStatus => {
      expect(checkCycle(startStatus, new Set())).toBe(false)
    })
  })

  // 期限切れステータスの特別な遷移ルール
  it('期限切れステータスは適切な遷移先を持っている', () => {
    const overdueStatus = InvoiceStatus.OVERDUE
    const nextStatuses = InvoiceStatusTransitions[overdueStatus]
    expect(nextStatuses).toContain(InvoiceStatus.PENDING)
  })

  // 終端ステータスの確認
  it('終端ステータスは適切に定義されている', () => {
    const terminalStatuses = [InvoiceStatus.PAID]
    terminalStatuses.forEach(status => {
      expect(InvoiceStatusTransitions[status]).toHaveLength(0)
    })
  })

  // ステータス間の相互遷移の整合性
  it('ステータス間の相互遷移が整合している', () => {
    // 下書きから保留中への遷移
    expect(InvoiceStatusTransitions[InvoiceStatus.DRAFT]).toContain(InvoiceStatus.PENDING)
    
    // 保留中から確認中または却下への遷移
    expect(InvoiceStatusTransitions[InvoiceStatus.PENDING]).toContain(InvoiceStatus.REVIEWING)
    expect(InvoiceStatusTransitions[InvoiceStatus.PENDING]).toContain(InvoiceStatus.REJECTED)
    
    // 確認中から承認済みまたは却下への遷移
    expect(InvoiceStatusTransitions[InvoiceStatus.REVIEWING]).toContain(InvoiceStatus.APPROVED)
    expect(InvoiceStatusTransitions[InvoiceStatus.REVIEWING]).toContain(InvoiceStatus.REJECTED)
    
    // 承認済みから支払済みまたは却下への遷移
    expect(InvoiceStatusTransitions[InvoiceStatus.APPROVED]).toContain(InvoiceStatus.PAID)
    expect(InvoiceStatusTransitions[InvoiceStatus.APPROVED]).toContain(InvoiceStatus.REJECTED)
    
    // 却下から下書きへの遷移
    expect(InvoiceStatusTransitions[InvoiceStatus.REJECTED]).toContain(InvoiceStatus.DRAFT)
  })
}) 