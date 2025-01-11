import { OrderStatus } from './order-status';

export interface StatusHistory {
  id: string;
  type: string;
  status: OrderStatus;
  comment?: string;
  createdAt: string;
  userId: string;
  invoiceId?: string;
  purchaseOrderId?: string;
} 