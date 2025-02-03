import { BasePurchaseOrder, BasePurchaseOrderItem, PurchaseOrderStatus } from '../base/purchaseOrder';
import { TagFormData } from '../tag';

// View層の発注書アイテム型(新規作成時)
export interface ViewPurchaseOrderItemInput {
  itemName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  description?: string;
}

// View層の発注書アイテム型(表示・編集時)
export interface ViewPurchaseOrderItem extends ViewPurchaseOrderItemInput {
  id: string;
}

// View層の発注書フォーム型(新規作成時)
export interface ViewPurchaseOrderFormInput {
  status: PurchaseOrderStatus;
  orderDate: Date;
  deliveryDate?: Date;
  items: ViewPurchaseOrderItemInput[];
  notes?: string;
  deliveryAddress?: string;
  orderNumber?: string;
  vendorId: string;
  tags?: TagFormData[];
}

// View層の発注書フォーム型(編集時)
export interface ViewPurchaseOrderForm extends Omit<ViewPurchaseOrderFormInput, 'items'> {
  id?: string;
  items: ViewPurchaseOrderItem[];
}

// View層の発注書表示型
export interface ViewPurchaseOrder {
  id: string;
  status: PurchaseOrderStatus;
  orderDate: string;
  deliveryDate?: string;
  items: ViewPurchaseOrderItem[];
  notes: string;
  deliveryAddress: string;
  orderNumber: string;
  vendorId: string;
  tags: TagFormData[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// View層の税計算型
export interface ViewTaxSummary {
  byRate: {
    taxRate: number;
    taxableAmount: number;
    taxAmount: number;
  }[];
  totalTaxableAmount: number;
  totalTaxAmount: number;
}

// 型変換ユーティリティ
export const toViewPurchaseOrder = (base: BasePurchaseOrder): ViewPurchaseOrderForm => ({
  id: base.id,
  status: base.status,
  orderDate: base.orderDate,
  deliveryDate: base.deliveryDate,
  items: base.items.map(item => ({
    id: item.id || crypto.randomUUID(),
    itemName: item.itemName,
    description: item.description,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    taxRate: Number(item.taxRate)
  })),
  notes: base.notes || '',
  deliveryAddress: base.deliveryAddress || '',
  orderNumber: base.orderNumber || '',
  vendorId: base.vendorId,
  tags: base.tags || []
});

// フォームデータをベース型に変換
export const toBasePurchaseOrder = (form: ViewPurchaseOrderForm): BasePurchaseOrder => ({
  id: form.id,
  status: form.status,
  orderDate: form.orderDate,
  deliveryDate: form.deliveryDate,
  items: form.items.map(item => ({
    id: item.id,
    itemName: item.itemName,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice.toString(),
    taxRate: item.taxRate.toString()
  })),
  notes: form.notes,
  deliveryAddress: form.deliveryAddress,
  orderNumber: form.orderNumber,
  vendorId: form.vendorId,
  tags: form.tags
});