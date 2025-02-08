import { Prisma, PurchaseOrder as PrismaPurchaseOrder, Vendor } from '@prisma/client'
import { PurchaseOrderStatus } from './enums'
import { TagFormData } from '@/types/tag'
import type { PurchaseOrderData } from '@/types/validation/purchaseOrder'

// 基本型定義
export type PurchaseOrderStatusType = PurchaseOrderStatus;

// DBモデル用の型定義
export interface PurchaseOrderItem {
  id?: string;
  purchaseOrderId?: string;
  itemName: string;
  description?: string | null;
  quantity: number;
  unitPrice: Prisma.Decimal;
  taxRate: Prisma.Decimal;
  amount?: number;
}

// フォーム用の型定義は validation/purchaseOrder から再エクスポート
export { type PurchaseOrderData };

// API入力用の型定義
export interface PurchaseOrderCreateInput {
  vendorId: string;
  status?: PurchaseOrderStatusType;
  orderDate?: Date;
  deliveryDate?: Date;
  items?: Array<{
    id?: string;
    itemName: string;
    quantity: number;
    unitPrice: number | string | Prisma.Decimal;
    taxRate: number | string | Prisma.Decimal;
    description?: string;
  }>;
  notes?: string;
  deliveryAddress?: string;
  orderNumber?: string;
}

// 拡張発注書型定義
export interface BasePurchaseOrder extends Omit<PrismaPurchaseOrder, 'totalAmount'> {
  totalAmount: Prisma.Decimal;
  vendor: Vendor;
  items: PurchaseOrderItem[];
  notes: string | null;
  tags?: TagFormData[];
}

export interface PurchaseOrder extends BasePurchaseOrder {
  orderDate: Date;
  deliveryDate: Date | null;
  status: PurchaseOrderStatusType;
  tags: TagFormData[];
}

// シリアライズ用の型定義
export interface SerializedPurchaseOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  vendorId: string;
  deliveryDate: string | null;
  status: PurchaseOrderStatusType;
  totalAmount: string;
  taxAmount: string;
  description: string | null;
  terms: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  updatedById: string | null;
  projectId: string | null;
  items: {
    id: string;
    purchaseOrderId: string;
    itemName: string;
    description: string | null;
    quantity: number;
    unitPrice: string;
    taxRate: string;
  }[];
  vendor: {
    id: string;
    name: string;
    code: string | null;
    address: string | null;
  };
  statusHistory: {
    id: string;
    type: string;
    status: string;
    comment: string | null;
    createdAt: string;
    userId: string;
  }[];
}

export type PurchaseOrderWithRelations = PurchaseOrder;

// 税計算関連の型定義
export interface PurchaseOrderTaxSummary {
  byRate: {
    taxRate: number;
    taxableAmount: Prisma.Decimal;
    taxAmount: Prisma.Decimal;
  }[];
  totalTaxableAmount: Prisma.Decimal;
  totalTaxAmount: Prisma.Decimal;
}

export const PurchaseOrderStatusDefinition = {
  DRAFT: '下書き',      // 作成中、未送信
  PENDING: '保留中',    // 承認待ち
  SENT: '処理中',       // 発注書送信済み
  COMPLETED: '完了',    // 納品・支払完了
  REJECTED: '却下',     // 取引先・承認者による却下
  OVERDUE: '期限超過'   // 納期超過
} as const