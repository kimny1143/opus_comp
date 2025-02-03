import { Prisma, PurchaseOrder as PrismaPurchaseOrder, Vendor } from '@prisma/client';
import { BasePurchaseOrder, BasePurchaseOrderItem, PurchaseOrderStatus } from '../base/purchaseOrder';
import { TagFormData } from '../tag';

// DB層の発注書アイテム型
export interface DbPurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  itemName: string;
  quantity: number;
  unitPrice: Prisma.Decimal;
  taxRate: Prisma.Decimal;
  description: string;
  amount?: Prisma.Decimal;
}

// DB層の発注書型
export interface DbPurchaseOrder {
  id: string;
  vendorId: string;
  status: PurchaseOrderStatus;
  orderDate: Date;
  deliveryDate: Date | undefined;
  totalAmount: Prisma.Decimal;
  vendor: Vendor;
  items: DbPurchaseOrderItem[];
  notes: string;
  tags: TagFormData[];
  createdAt: Date;
  updatedAt: Date;
  deliveryAddress: string;
  orderNumber: string;
}

// DB層の税計算型
export interface DbTaxSummary {
  byRate: {
    taxRate: number;
    taxableAmount: Prisma.Decimal;
    taxAmount: Prisma.Decimal;
  }[];
  totalTaxableAmount: Prisma.Decimal;
  totalTaxAmount: Prisma.Decimal;
}

// 型変換ユーティリティ
export const toDbPurchaseOrder = (base: BasePurchaseOrder): Omit<DbPurchaseOrder, 'id' | 'vendor' | 'createdAt' | 'updatedAt'> => ({
  vendorId: base.vendorId,
  status: base.status,
  orderDate: base.orderDate,
  deliveryDate: base.deliveryDate,
  totalAmount: new Prisma.Decimal(base.totalAmount || 0),
  items: base.items.map(item => ({
    id: item.id || crypto.randomUUID(),
    purchaseOrderId: item.purchaseOrderId || '',
    itemName: item.itemName,
    description: item.description || '',
    quantity: item.quantity,
    unitPrice: new Prisma.Decimal(item.unitPrice),
    taxRate: new Prisma.Decimal(item.taxRate),
    amount: new Prisma.Decimal(item.quantity).mul(new Prisma.Decimal(item.unitPrice))
  })),
  notes: base.notes || '',
  tags: base.tags || [],
  deliveryAddress: base.deliveryAddress || '',
  orderNumber: base.orderNumber || ''
});