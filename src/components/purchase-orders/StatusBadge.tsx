import { PurchaseOrderStatus } from '@prisma/client'

const STATUS_STYLES: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.DRAFT]: 'bg-gray-100 text-gray-800',
  [PurchaseOrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [PurchaseOrderStatus.SENT]: 'bg-blue-100 text-blue-800',
  [PurchaseOrderStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [PurchaseOrderStatus.REJECTED]: 'bg-red-100 text-red-800',
  [PurchaseOrderStatus.OVERDUE]: 'bg-orange-100 text-orange-800'
}

const STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.DRAFT]: '下書き',
  [PurchaseOrderStatus.PENDING]: '承認待ち',
  [PurchaseOrderStatus.SENT]: '送信済み',
  [PurchaseOrderStatus.COMPLETED]: '完了',
  [PurchaseOrderStatus.REJECTED]: '却下',
  [PurchaseOrderStatus.OVERDUE]: '期限超過'
}

interface Props {
  status: PurchaseOrderStatus
}

export function StatusBadge({ status }: Props) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
} 