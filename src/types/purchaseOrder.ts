import { PurchaseOrderStatus } from '@prisma/client'

export const PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  DRAFT: '下書き',
  PENDING: '承認待ち',
  SENT: '発注済み',
  COMPLETED: '完了',
  REJECTED: '却下',
  OVERDUE: '期限超過'
} as const

export interface PurchaseOrderForm {
  orderDate: string;
  deliveryDate: string;
  description: string;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  description?: string;
}

export interface VendorSelectProps {
  onSelect: (vendorId: number) => void;
}

export interface ItemTemplate {
  id: string;
  name: string;
  items: PurchaseOrderItem[];
  createdAt: Date;
  updatedAt: Date;
} 