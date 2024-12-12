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
  name: string;
  quantity: number;
  unitPrice: number;
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