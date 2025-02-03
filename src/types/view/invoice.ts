import { BaseInvoice, BaseInvoiceItem, InvoiceStatus } from '../base/invoice';
import { TagFormData } from '../tag';
import { AccountType } from '@/types/bankAccount';

// View層の請求書アイテム型(新規作成時)
export interface ViewInvoiceItemInput {
  itemName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  description: string;
}

// View層の請求書アイテム型(表示・編集時)
export interface ViewInvoiceItem extends ViewInvoiceItemInput {
  id: string;
}

// View層の請求書フォーム型(新規作成時)
export interface ViewInvoiceFormInput {
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  items: ViewInvoiceItemInput[];
  notes?: string;
  bankInfo?: {
    accountType: AccountType;
    bankName: string;
    branchName: string;
    accountNumber: string;
    accountHolder: string;
  };
  vendorId: string;
  tags?: TagFormData[];
  registrationNumber: string;
  purchaseOrderId?: string;
  invoiceNumber?: string;
}

// View層の請求書フォーム型(編集時)
export interface ViewInvoiceForm extends Omit<ViewInvoiceFormInput, 'items'> {
  id?: string;
  items: ViewInvoiceItem[];
}

// View層の請求書表示型
export interface ViewInvoice {
  id: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  items: ViewInvoiceItem[];
  notes: string;
  bankInfo: {
    accountType: AccountType;
    bankName: string;
    branchName: string;
    accountNumber: string;
    accountHolder: string;
  };
  vendorId: string;
  tags: TagFormData[];
  registrationNumber: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  purchaseOrderId: string;
  invoiceNumber: string;
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
export const toViewInvoice = (base: BaseInvoice): ViewInvoiceForm => ({
  id: base.id,
  status: base.status,
  issueDate: base.issueDate,
  dueDate: base.dueDate,
  items: base.items.map(item => ({
    id: item.id || crypto.randomUUID(),
    itemName: item.itemName,
    description: item.description || '',
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    taxRate: Number(item.taxRate)
  })),
  notes: base.notes || '',
  bankInfo: base.bankInfo || {
    accountType: AccountType.ORDINARY,
    bankName: '',
    branchName: '',
    accountNumber: '',
    accountHolder: ''
  },
  vendorId: base.vendorId,
  tags: base.tags || [],
  registrationNumber: base.registrationNumber,
  purchaseOrderId: base.purchaseOrderId,
  invoiceNumber: base.invoiceNumber || ''
});

// フォームデータをベース型に変換
export const toBaseInvoice = (form: ViewInvoiceForm): BaseInvoice => ({
  id: form.id,
  status: form.status,
  issueDate: form.issueDate,
  dueDate: form.dueDate,
  items: form.items.map(item => ({
    id: item.id,
    itemName: item.itemName,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice.toString(),
    taxRate: item.taxRate.toString()
  })),
  notes: form.notes,
  bankInfo: form.bankInfo,
  vendorId: form.vendorId,
  tags: form.tags,
  registrationNumber: form.registrationNumber,
  purchaseOrderId: form.purchaseOrderId,
  invoiceNumber: form.invoiceNumber
});