import { PurchaseOrderStatus, PurchaseOrderStatusDisplay, PurchaseOrderStatusStyles } from '@/types/enums'

interface Props {
  status: PurchaseOrderStatus
}

export function StatusBadge({ status }: Props) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${PurchaseOrderStatusStyles[status]}`}>
      {PurchaseOrderStatusDisplay[status]}
    </span>
  )
} 