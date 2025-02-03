import { Prisma } from '@prisma/client';
import { TagFormData } from '../tag';

// 基本的な発注書ステータス定義
export const PURCHASE_ORDER_STATUS = {
  DRAFT: '下書き',
  PENDING: '承認待ち',
  SENT: '発注済み',
  COMPLETED: '完了',
  REJECTED: '却下',
  OVERDUE: '期限超過'
} as const;

export type PurchaseOrderStatus = keyof typeof PURCHASE_ORDER_STATUS;

// 基本的な発注書アイテム型
export interface BasePurchaseOrderItem {
  id?: string;
  itemName: string;
  quantity: number;
  unitPrice: number | string | Prisma.Decimal;
  taxRate: number | string | Prisma.Decimal;
  description?: string;
  purchaseOrderId?: string;
}

// 基本的な発注書型
export interface BasePurchaseOrder {
  id?: string;
  vendorId: string;
  status: PurchaseOrderStatus;
  orderDate: Date;
  deliveryDate?: Date;
  items: BasePurchaseOrderItem[];
  notes?: string;
  deliveryAddress?: string;
  orderNumber?: string;
  tags?: TagFormData[];
  totalAmount?: number | string | Prisma.Decimal;
  createdAt?: Date;
  updatedAt?: Date;
}

// 税計算関連の基本型
export interface BaseTaxSummary {
  byRate: {
    taxRate: number;
    taxableAmount: number | string | Prisma.Decimal;
    taxAmount: number | string | Prisma.Decimal;
  }[];
  totalTaxableAmount: number | string | Prisma.Decimal;
  totalTaxAmount: number | string | Prisma.Decimal;
}

// テンプレート関連の基本型
export interface BaseItemTemplate {
  id: string;
  name: string;
  items: BasePurchaseOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

// テスト用ファクトリ関数
export const createTestPurchaseOrderItem = (overrides?: Partial<BasePurchaseOrderItem>): BasePurchaseOrderItem => ({
  id: 'test-item-id',
  itemName: 'テスト商品',
  quantity: 1,
  unitPrice: new Prisma.Decimal(1000),
  taxRate: new Prisma.Decimal(0.1),
  description: 'テスト説明',
  ...overrides
});

export const createTestPurchaseOrder = (overrides?: Partial<BasePurchaseOrder>): BasePurchaseOrder => ({
  id: 'test-order-id',
  vendorId: 'test-vendor-id',
  status: 'DRAFT',
  orderDate: new Date(),
  deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  items: [createTestPurchaseOrderItem()],
  notes: 'テスト備考',
  deliveryAddress: 'テスト住所',
  orderNumber: 'TEST-001',
  tags: [{ name: 'テストタグ' }],
  ...overrides
});