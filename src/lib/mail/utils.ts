import { Prisma } from '@prisma/client';
import { QualifiedInvoice, QualifiedInvoiceItem } from '@/types/invoice';
import { MailInvoice, MailInvoiceItem } from './types';

/**
 * QualifiedInvoiceItemをメール送信用の形式に変換
 */
export const convertToMailInvoiceItem = (item: QualifiedInvoiceItem): MailInvoiceItem => {
  const unitPrice = new Prisma.Decimal(item.unitPrice);
  const quantity = new Prisma.Decimal(item.quantity);
  const taxRate = new Prisma.Decimal(Number(item.taxRate) / 100); // パーセント表記から小数に変換
  const taxableAmount = unitPrice.mul(quantity);
  const taxAmount = taxableAmount.mul(taxRate);

  return {
    id: item.id,
    invoiceId: item.invoiceId,
    itemName: item.itemName,
    description: item.description,
    quantity: Number(quantity),
    unitPrice,
    taxRate,
    taxAmount,
    taxableAmount
  };
};

/**
 * QualifiedInvoiceをメール送信用の形式に変換
 */
export const convertToMailInvoice = (invoice: QualifiedInvoice): MailInvoice => {
  const items = invoice.items.map(convertToMailInvoiceItem);
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