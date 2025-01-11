import { InvoiceStatus } from '@prisma/client'
import { InvoiceStatusDisplay, InvoiceStatusStyles, InvoiceStatusTransitions } from '@/types/enums'

describe('Invoice Status Enum Extension Tests', () => {
  // 全てのステータスが表示名を持っているか
  it('全てのステータスが表示名を持っている', () => {
    Object.values(InvoiceStatus).forEach(status => {
      expect(InvoiceStatusDisplay[status]).toBeDefined()
      expect(typeof InvoiceStatusDisplay[status]).toBe('string')
      expect(InvoiceStatusDisplay[status].length).toBeGreaterThan(0)
    })
  })

  // 全てのステータスがスタイル定義を持っているか
  it('全てのステータスがスタイル定義を持っている', () => {
    Object.values(InvoiceStatus).forEach(status => {
      expect(InvoiceStatusStyles[status]).toBeDefined()
      expect(typeof InvoiceStatusStyles[status]).toBe('string')
      expect(InvoiceStatusStyles[status].length).toBeGreaterThan(0)
    })
  })

  // 全てのステータスが遷移定義を持っているか
  it('全てのステータスが遷移定義を持っている', () => {
    Object.values(InvoiceStatus).forEach(status => {
      expect(InvoiceStatusTransitions[status]).toBeDefined()
      expect(Array.isArray(InvoiceStatusTransitions[status])).toBe(true)
    })
  })

  // 遷移定義が有効なステータスのみを含んでいるか
  it('遷移定義が有効なステータスのみを含んでいる', () => {
    Object.values(InvoiceStatus).forEach(fromStatus => {
      InvoiceStatusTransitions[fromStatus].forEach(toStatus => {
        expect(Object.values(InvoiceStatus)).toContain(toStatus)
      })
    })
  })

  // 遷移の循環参照チェック
  it('ステータス遷移に無限ループが存在しない', () => {
    Object.values(InvoiceStatus).forEach(startStatus => {
      const visited = new Set<InvoiceStatus>()
      const checkCycle = (currentStatus: InvoiceStatus, path: Set<InvoiceStatus>): boolean => {
        if (path.has(currentStatus)) {
          return true // 循環を検出
        }
        if (visited.has(currentStatus)) {
          return false // 既に確認済みのパス
        }
        visited.add(currentStatus)
        path.add(currentStatus)
        
        for (const nextStatus of InvoiceStatusTransitions[currentStatus]) {
          if (checkCycle(nextStatus, new Set(path))) {
            return true
          }
        }
        return false
      }
      
      expect(checkCycle(startStatus, new Set())).toBe(false)
    })
  })

  // 期限切れステータスの特別な遷移ルール
  it('期限切れステータスは適切な遷移先を持っている', () => {
    const overdueTransitions = InvoiceStatusTransitions[InvoiceStatus.OVERDUE]
    expect(overdueTransitions).toContain(InvoiceStatus.PENDING)
    expect(overdueTransitions.length).toBe(1) // 期限切れからは保留中のみに遷移可能
  })

  // 終端ステータスの確認
  it('終端ステータスは適切に定義されている', () => {
    // 支払済みは終端ステータス
    expect(InvoiceStatusTransitions[InvoiceStatus.PAID].length).toBe(0)
  })

  // ステータス間の相互遷移の整合性
  it('ステータス間の相互遷移が整合している', () => {
    // 却下から下書きへの遷移と、下書きから保留中への遷移の確認
    expect(InvoiceStatusTransitions[InvoiceStatus.REJECTED]).toContain(InvoiceStatus.DRAFT)
    expect(InvoiceStatusTransitions[InvoiceStatus.DRAFT]).toContain(InvoiceStatus.PENDING)
    
    // 保留中から確認中または却下への遷移
    expect(InvoiceStatusTransitions[InvoiceStatus.PENDING]).toContain(InvoiceStatus.REVIEWING)
    expect(InvoiceStatusTransitions[InvoiceStatus.PENDING]).toContain(InvoiceStatus.REJECTED)
  })
}) 