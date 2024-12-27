import { OrderStatus } from './order-status';

export interface StatusHistory {
  id: string;
  status: OrderStatus;
  timestamp: Date;
  updatedBy: string;
  comment?: string;
} 