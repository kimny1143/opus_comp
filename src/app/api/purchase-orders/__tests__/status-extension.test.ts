import { PurchaseOrderStatus } from '@prisma/client'
import { PurchaseOrderStatusDisplay, PurchaseOrderStatusStyles, PurchaseOrderStatusTransitions } from '@/types/enums'

describe('Purchase Order Status Enum Extension Tests', () => {
  // 全てのステータスが表示名を持っているか
  it('全てのステータスが表示名を持っている', () => {
    Object.values(PurchaseOrderStatus).forEach(status => {
      expect(PurchaseOrderStatusDisplay[status]).toBeDefined()
      expect(typeof PurchaseOrderStatusDisplay[status]).toBe('string')
      expect(PurchaseOrderStatusDisplay[status].length).toBeGreaterThan(0)
    })
  })

  // 全てのステータスがスタイル定義を持っているか
  it('全てのステータスがスタイル定義を持っている', () => {
    Object.values(PurchaseOrderStatus).forEach(status => {
      expect(PurchaseOrderStatusStyles[status]).toBeDefined()
      expect(typeof PurchaseOrderStatusStyles[status]).toBe('string')
      expect(PurchaseOrderStatusStyles[status].length).toBeGreaterThan(0)
    })
  })

  // 全てのステータスが遷移定義を持っているか
  it('全てのステータスが遷移定義を持っている', () => {
    Object.values(PurchaseOrderStatus).forEach(status => {
      expect(PurchaseOrderStatusTransitions[status]).toBeDefined()
      expect(Array.isArray(PurchaseOrderStatusTransitions[status])).toBe(true)
    })
  })

  // 遷移定義が有効なステータスのみを含んでいるか
  it('遷移定義が有効なステータスのみを含んでいる', () => {
    Object.values(PurchaseOrderStatus).forEach(fromStatus => {
      PurchaseOrderStatusTransitions[fromStatus].forEach(toStatus => {
        expect(Object.values(PurchaseOrderStatus)).toContain(toStatus)
      })
    })
  })

  // 遷移の循環参照チェック
  it('ステータス遷移に無限ループが存在しない', () => {
    Object.values(PurchaseOrderStatus).forEach(startStatus => {
      const visited = new Set<PurchaseOrderStatus>()
      const checkCycle = (currentStatus: PurchaseOrderStatus, path: Set<PurchaseOrderStatus>): boolean => {
        if (path.has(currentStatus)) {
          return true // 循環を検出
        }
        if (visited.has(currentStatus)) {
          return false // 既に確認済みのパス
        }
        visited.add(currentStatus)
        path.add(currentStatus)
        
        for (const nextStatus of PurchaseOrderStatusTransitions[currentStatus]) {
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
    const overdueTransitions = PurchaseOrderStatusTransitions[PurchaseOrderStatus.OVERDUE]
    expect(overdueTransitions).toContain(PurchaseOrderStatus.PENDING)
    expect(overdueTransitions.length).toBe(1) // 期限切れからは保留中のみに遷移可能
  })

  // 終端ステータスの確認
  it('終端ステータスは適切に定義されている', () => {
    // 完了は終端ステータス
    expect(PurchaseOrderStatusTransitions[PurchaseOrderStatus.COMPLETED].length).toBe(0)
  })

  // ステータス間の相互遷移の整合性
  it('ステータス間の相互遷移が整合している', () => {
    // 却下から下書きへの遷移と、下書きから保留中への遷移の確認
    expect(PurchaseOrderStatusTransitions[PurchaseOrderStatus.REJECTED]).toContain(PurchaseOrderStatus.DRAFT)
    expect(PurchaseOrderStatusTransitions[PurchaseOrderStatus.DRAFT]).toContain(PurchaseOrderStatus.PENDING)
    
    // 保留中から送信済みまたは却下への遷移
    expect(PurchaseOrderStatusTransitions[PurchaseOrderStatus.PENDING]).toContain(PurchaseOrderStatus.SENT)
    expect(PurchaseOrderStatusTransitions[PurchaseOrderStatus.PENDING]).toContain(PurchaseOrderStatus.REJECTED)
    
    // 送信済みから完了または却下への遷移
    expect(PurchaseOrderStatusTransitions[PurchaseOrderStatus.SENT]).toContain(PurchaseOrderStatus.COMPLETED)
    expect(PurchaseOrderStatusTransitions[PurchaseOrderStatus.SENT]).toContain(PurchaseOrderStatus.REJECTED)
  })
}) 