export enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SENT = 'SENT',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  OVERDUE = 'OVERDUE'
}

export interface StatusTransition {
  from: OrderStatus;
  to: OrderStatus;
  requiredRole: string[];
  conditions?: () => boolean;
}

// PurchaseOrderStatus から OrderStatus への変換マッピング
export const mapPurchaseOrderStatusToOrderStatus = (status: string): OrderStatus => {
  switch (status) {
    case 'DRAFT':
      return OrderStatus.DRAFT;
    case 'PENDING':
      return OrderStatus.PENDING;
    case 'IN_PROGRESS':
      return OrderStatus.IN_PROGRESS;
    case 'SENT':
      return OrderStatus.SENT;
    case 'COMPLETED':
      return OrderStatus.COMPLETED;
    case 'REJECTED':
      return OrderStatus.REJECTED;
    case 'EXPIRED':
      return OrderStatus.EXPIRED;
    case 'OVERDUE':
      return OrderStatus.OVERDUE;
    default:
      return OrderStatus.DRAFT;
  }
}; 