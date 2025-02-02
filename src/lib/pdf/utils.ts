import { Prisma } from '@prisma/client';
import { QualifiedInvoice, QualifiedInvoiceItem } from '@/types/invoice';
import { PdfInvoice, PdfInvoiceItem, PdfValidationError } from './types';

/**
 * QualifiedInvoiceItemをPDF生成用の形式に変換
 */
export const convertToPdfInvoiceItem = (item: QualifiedInvoiceItem): PdfInvoiceItem => {
  const unitPrice = new Prisma.Decimal(item.unitPrice);
  const quantity = new Prisma.Decimal(item.quantity);
  const taxRate = new Prisma.Decimal(Number(item.taxRate) / 100); // パーセント表記から小数に変換
  const taxableAmount = unitPrice.mul(quantity);
  const taxAmount = taxableAmount.mul(taxRate);

  if (!item.category) {
    throw new PdfValidationError('カテゴリーは必須です', ['category is required']);
  }

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
    taxableAmount,
    calculateTaxableAmount: () => unitPrice.mul(quantity),
    calculateTaxAmount: () => taxableAmount.mul(taxRate),
    calculateTotalAmount: () => taxableAmount.add(taxAmount)
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
      registrationNumber: invoice.vendor.registrationNumber,
      tel: invoice.vendor.tel,
      email: invoice.vendor.email
    },
    issuer: {
      name: invoice.issuer.name,
      registrationNumber: invoice.issuer.registrationNumber,
      address: invoice.issuer.address,
      tel: invoice.issuer.tel,
      email: invoice.issuer.email
    },
    items,
    taxSummary: invoice.taxSummary,
    subtotal,
    taxAmount,
    totalAmount,
    validate: () => {
      const errors: string[] = [];

      // 必須項目のチェック
      if (!invoice.invoiceNumber) errors.push('請求書番号は必須です');
      if (!invoice.issueDate) errors.push('発行日は必須です');
      if (!invoice.vendor.registrationNumber) errors.push('取引先の登録番号は必須です');
      if (!invoice.issuer.registrationNumber) errors.push('発行者の登録番号は必須です');
      if (items.length === 0) errors.push('明細項目は1つ以上必要です');

      // 金額の整合性チェック
      const calculatedSubtotal = items.reduce(
        (acc, item) => acc.add(item.calculateTaxableAmount()),
        new Prisma.Decimal(0)
      );
      const calculatedTaxAmount = items.reduce(
        (acc, item) => acc.add(item.calculateTaxAmount()),
        new Prisma.Decimal(0)
      );

      if (!calculatedSubtotal.equals(subtotal)) {
        errors.push('小計が不正です');
      }
      if (!calculatedTaxAmount.equals(taxAmount)) {
        errors.push('税額が不正です');
      }

      if (errors.length > 0) {
        throw new PdfValidationError('PDFの生成に必要な情報が不足しています', errors);
      }

      return true;
    }
  };
};