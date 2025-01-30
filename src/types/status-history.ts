import { PurchaseOrderStatus } from '@prisma/client';

export interface StatusHistory {
  id: string;
  type: string;
  status: PurchaseOrderStatus;
  comment?: string;
  createdAt: string;
  userId: string;
  invoiceId?: string;
  purchaseOrderId?: string;
} 