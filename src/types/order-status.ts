import { PurchaseOrderStatus } from '@prisma/client'

export interface StatusTransition {
  from: PurchaseOrderStatus;
  to: PurchaseOrderStatus;
  requiredRole: string[];
  conditions?: () => boolean;
}

// PurchaseOrderStatus から OrderStatus への変換マッピング
export const mapPurchaseOrderStatusToOrderStatus = (status: string): PurchaseOrderStatus => {
  switch (status) {
    case 'DRAFT':
      return 'DRAFT';
    case 'PENDING':
      return 'PENDING';
    case 'SENT':
      return 'SENT';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'REJECTED':
      return 'REJECTED';
    case 'OVERDUE':
      return 'OVERDUE';
    default:
      return 'DRAFT';
  }
}; 