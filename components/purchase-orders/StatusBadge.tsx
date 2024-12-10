import { PurchaseOrderStatusEnum } from '@prisma/client';

interface StatusBadgeProps {
  status: PurchaseOrderStatusEnum;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = (status: PurchaseOrderStatusEnum) => {
    switch (status) {
      case PurchaseOrderStatusEnum.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case PurchaseOrderStatusEnum.SENT:
        return 'bg-blue-100 text-blue-800';
      case PurchaseOrderStatusEnum.ACCEPTED:
        return 'bg-green-100 text-green-800';
      case PurchaseOrderStatusEnum.REJECTED:
        return 'bg-red-100 text-red-800';
      case PurchaseOrderStatusEnum.COMPLETED:
        return 'bg-purple-100 text-purple-800';
    }
  };

  const getStatusLabel = (status: PurchaseOrderStatusEnum) => {
    switch (status) {
      case PurchaseOrderStatusEnum.DRAFT:
        return '下書き';
      case PurchaseOrderStatusEnum.SENT:
        return '送信済み';
      case PurchaseOrderStatusEnum.ACCEPTED:
        return '承認済み';
      case PurchaseOrderStatusEnum.REJECTED:
        return '却下';
      case PurchaseOrderStatusEnum.COMPLETED:
        return '完了';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
} 