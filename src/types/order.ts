import { PurchaseOrderStatus } from '@prisma/client';
import { StatusHistory } from './status-history';

export interface Order {
  id: string;
  status: PurchaseOrderStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  history: StatusHistory[];
  statusHistory: StatusHistory[];
  // その他の注文関連フィールド
} 