import { PurchaseOrder, PurchaseOrderItem, Vendor } from '@prisma/client'

export type SerializedPurchaseOrder = Omit<PurchaseOrder, 'totalAmount' | 'taxAmount' | 'createdAt' | 'updatedAt'> & {
  totalAmount: string;
  taxAmount: string | null;
  createdAt: string;
  updatedAt: string;
  vendor: Vendor;
  items: (Omit<PurchaseOrderItem, 'unitPrice' | 'taxRate' | 'amount' | 'createdAt' | 'updatedAt'> & {
    unitPrice: string;
    taxRate: string;
    amount: string | null;
    createdAt: string;
    updatedAt: string;
  })[];
}

export type ExtendedPurchaseOrder = SerializedPurchaseOrder;

export const PurchaseOrderStatusDefinition = {
  DRAFT: '下書き',      // 作成中、未送信
  PENDING: '保留中',    // 承認待ち
  SENT: '処理中',       // 発注書送信済み
  COMPLETED: '完了',    // 納品・支払完了
  REJECTED: '却下',     // 取引先・承認者による却下
  OVERDUE: '期限超過'   // 納期超過
} as const 