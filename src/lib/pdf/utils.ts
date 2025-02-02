import { Prisma } from '@prisma/client';
import { QualifiedInvoice, QualifiedInvoiceItem } from '@/types/invoice';
import { PdfInvoice, PdfInvoiceItem } from './types';

/**
 * QualifiedInvoiceItemをPDF生成用の形式に変換
 */
export const convertToPdfInvoiceItem = (item: QualifiedInvoiceItem): PdfInvoiceItem => {
  const unitPrice = new Prisma.Decimal(item.unitPrice);
  const quantity = new Prisma.Decimal(item.quantity);
  const taxRate = new Prisma.Decimal(Number(item.taxRate) / 100); // パーセント表記から小数に変換
  const taxableAmount = unitPrice.mul(quantity);
  const taxAmount = taxableAmount.mul(taxRate);

  return {
    id: item.id,
    invoiceId: item.invoiceId,
    itemName: item.itemName,
    quantity: Number(quantity),
    unitPrice,
    taxRate,
    description: item.description,
    category: item.category,
    taxAmount,
    taxableAmount
  };
};

/**
 * QualifiedInvoiceをPDF生成用の形式に変換
 */
export const convertToPdfInvoice = (invoice: QualifiedInvoice): PdfInvoice => {
  const items = invoice.items.map(convertToPdfInvoiceItem);
  const subtotal = items.reduce((acc, item) => acc.add(item.taxableAmount), new Prisma.Decimal(0));
  const taxAmount = items.reduce((acc, item) => acc.add(item.taxAmount), new Prisma.Decimal(0));
  const totalAmount = subtotal.add(taxAmount);

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    notes: invoice.notes,
    status: invoice.status,
    vendor: {
      id: invoice.vendor.id,
      name: invoice.vendor.name,
      address: invoice.vendor.address,
      registrationNumber: invoice.vendor.registrationNumber
    },
    items,
    subtotal,
    taxAmount,
    totalAmount
  };
};