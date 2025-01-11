import { render, screen } from '@testing-library/react'
import { StatusBadge } from '../StatusBadge'
import { PurchaseOrderStatus } from '@prisma/client'
import { PurchaseOrderStatusDisplay } from '@/types/enums'

describe('StatusBadge', () => {
  it('正しいステータスラベルが表示される', () => {
    render(<StatusBadge status={PurchaseOrderStatus.DRAFT} />)
    expect(screen.getByText(PurchaseOrderStatusDisplay[PurchaseOrderStatus.DRAFT])).toBeInTheDocument()
  })

  it('各ステータスで適切なスタイルが適用される', () => {
    const { rerender } = render(<StatusBadge status={PurchaseOrderStatus.DRAFT} />)
    expect(screen.getByText(PurchaseOrderStatusDisplay[PurchaseOrderStatus.DRAFT])).toHaveClass('bg-gray-100', 'text-gray-800')

    rerender(<StatusBadge status={PurchaseOrderStatus.PENDING} />)
    expect(screen.getByText(PurchaseOrderStatusDisplay[PurchaseOrderStatus.PENDING])).toHaveClass('bg-yellow-100', 'text-yellow-800')

    rerender(<StatusBadge status={PurchaseOrderStatus.SENT} />)
    expect(screen.getByText(PurchaseOrderStatusDisplay[PurchaseOrderStatus.SENT])).toHaveClass('bg-blue-100', 'text-blue-800')

    rerender(<StatusBadge status={PurchaseOrderStatus.COMPLETED} />)
    expect(screen.getByText(PurchaseOrderStatusDisplay[PurchaseOrderStatus.COMPLETED])).toHaveClass('bg-green-100', 'text-green-800')

    rerender(<StatusBadge status={PurchaseOrderStatus.REJECTED} />)
    expect(screen.getByText(PurchaseOrderStatusDisplay[PurchaseOrderStatus.REJECTED])).toHaveClass('bg-red-100', 'text-red-800')

    rerender(<StatusBadge status={PurchaseOrderStatus.OVERDUE} />)
    expect(screen.getByText(PurchaseOrderStatusDisplay[PurchaseOrderStatus.OVERDUE])).toHaveClass('bg-orange-100', 'text-orange-800')
  })
}) 