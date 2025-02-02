import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  BaseInvoice,
  BaseInvoiceItem,
  BaseVendor,
  BaseInvoiceTemplate,
  BaseIssuer,
  InvoiceTaxSummary
} from '@/types/base/invoice';
import { BankInfo } from '@/types/bankAccount';
import { ItemCategory } from '@/types/itemCategory';
import { InvoiceStatus } from '@/domains/invoice/status';

/**
 * 請求書明細項目の変換
 */
export const convertToBaseInvoiceItem = (item: {
  id: string;
  invoiceId: string;
  itemName: string;
  description: string | null;
  quantity: number;
  unitPrice: string | number | Decimal;
  taxRate: string | number | Decimal;
  category?: ItemCategory;
}): BaseInvoiceItem => {
  return {
    id: item.id,
    invoiceId: item.invoiceId,
    itemName: item.itemName,
    description: item.description,
    quantity: item.quantity,
    unitPrice: new Prisma.Decimal(item.unitPrice.toString()),
    taxRate: new Prisma.Decimal(item.taxRate.toString()),
    category: item.category
  };
};

/**
 * 請求書の変換
 */
export const convertToBaseInvoice = (invoice: {
  id: string;
  templateId: string;
  purchaseOrderId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  notes: string | null;
  bankInfo: BankInfo;
  items: Array<{
    id: string;
    invoiceId: string;
    itemName: string;
    description: string | null;
    quantity: number;
    unitPrice: string | number | Decimal;
    taxRate: string | number | Decimal;
    category?: ItemCategory;
  }>;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  updatedById: string | null;
  vendorId: string;
  totalAmount: string | number | Decimal;
}): BaseInvoice => {
  return {
    id: invoice.id,
    templateId: invoice.templateId,
    purchaseOrderId: invoice.purchaseOrderId,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    notes: invoice.notes,
    bankInfo: invoice.bankInfo,
    items: invoice.items.map(convertToBaseInvoiceItem),
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
    createdById: invoice.createdById,
    updatedById: invoice.updatedById,
    vendorId: invoice.vendorId,
    totalAmount: new Prisma.Decimal(invoice.totalAmount.toString())
  };
};

/**
 * 取引先情報の変換
 */
export const convertToBaseVendor = (vendor: {
  id: string;
  name: string;
  registrationNumber: string;
  address: string;
  tel?: string;
  email?: string;
}): BaseVendor => {
  return {
    id: vendor.id,
    name: vendor.name,
    registrationNumber: vendor.registrationNumber,
    address: vendor.address,
    tel: vendor.tel,
    email: vendor.email
  };
};

/**
 * 請求書テンプレートの変換
 */
export const convertToBaseInvoiceTemplate = (template: {
  id: string;
  name: string;
  description?: string;
  bankInfo: BankInfo;
  contractorName: string;
  contractorAddress: string;
  registrationNumber: string;
  paymentTerms?: string;
}): BaseInvoiceTemplate => {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    bankInfo: template.bankInfo,
    contractorName: template.contractorName,
    contractorAddress: template.contractorAddress,
    registrationNumber: template.registrationNumber,
    paymentTerms: template.paymentTerms
  };
};

/**
 * 発行者情報の変換
 */
export const convertToBaseIssuer = (issuer: {
  name: string;
  registrationNumber: string;
  address: string;
  tel?: string;
  email?: string;
}): BaseIssuer => {
  return {
    name: issuer.name,
    registrationNumber: issuer.registrationNumber,
    address: issuer.address,
    tel: issuer.tel,
    email: issuer.email
  };
};