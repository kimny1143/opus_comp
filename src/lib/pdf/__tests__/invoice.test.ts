import { describe, expect, it, vi } from 'vitest';
import { convertToPdfInvoice, convertToPdfInvoiceItem } from '../utils';
import { createTestInvoice, createTestInvoiceItem } from '@/test/helpers/invoice';
import { PdfValidationError } from '../types';
import { Prisma } from '@prisma/client';
import { ItemCategory } from '@/types/itemCategory';

describe('PDF生成ユーティリティ', () => {
  describe('convertToPdfInvoiceItem', () => {
    it('正しく明細項目を変換できる', () => {
      const item = createTestInvoiceItem({
        quantity: 2,
        unitPrice: '1000',
        taxRate: 10,
        category: ItemCategory.ELECTRONICS
      });

      const pdfItem = convertToPdfInvoiceItem(item);

      expect(pdfItem.quantity).toBe(2);
      expect(pdfItem.unitPrice).toEqual(new Prisma.Decimal('1000'));
      expect(pdfItem.taxRate).toEqual(new Prisma.Decimal('0.1')); // 10% → 0.1
      expect(pdfItem.category).toBe(ItemCategory.ELECTRONICS);
    });

    it('金額計算メソッドが正しく動作する', () => {
      const item = createTestInvoiceItem({
        quantity: 2,
        unitPrice: '1000',
        taxRate: 10,
        category: ItemCategory.ELECTRONICS
      });

      const pdfItem = convertToPdfInvoiceItem(item);

      expect(pdfItem.calculateTaxableAmount().toString()).toBe('2000');
      expect(pdfItem.calculateTaxAmount().toString()).toBe('200');
      expect(pdfItem.calculateTotalAmount().toString()).toBe('2200');
    });

    it('カテゴリーが未設定の場合はエラーを投げる', () => {
      const item = createTestInvoiceItem();
      delete (item as any).category;

      expect(() => convertToPdfInvoiceItem(item)).toThrow(PdfValidationError);
    });
  });

  describe('convertToPdfInvoice', () => {
    it('正しく請求書を変換できる', () => {
      const invoice = createTestInvoice();
      const pdfInvoice = convertToPdfInvoice(invoice);

      expect(pdfInvoice.invoiceNumber).toBe(invoice.invoiceNumber);
      expect(pdfInvoice.issueDate).toBe(invoice.issueDate);
      expect(pdfInvoice.vendor.registrationNumber).toBe(invoice.vendor.registrationNumber);
      expect(pdfInvoice.issuer.registrationNumber).toBe(invoice.issuer.registrationNumber);
      expect(pdfInvoice.items).toHaveLength(invoice.items.length);
    });

    it('金額の集計が正しく行われる', () => {
      const invoice = createTestInvoice({
        items: [
          createTestInvoiceItem({
            quantity: 2,
            unitPrice: '1000',
            taxRate: 10,
            category: ItemCategory.ELECTRONICS
          }),
          createTestInvoiceItem({
            quantity: 1,
            unitPrice: '2000',
            taxRate: 8,
            category: ItemCategory.FOOD
          })
        ]
      });

      const pdfInvoice = convertToPdfInvoice(invoice);

      // 2 * 1000 + 1 * 2000 = 4000
      expect(pdfInvoice.subtotal.toString()).toBe('4000');
      // (2000 * 0.1) + (2000 * 0.08) = 200 + 160 = 360
      expect(pdfInvoice.taxAmount.toString()).toBe('360');
      // 4000 + 360 = 4360
      expect(pdfInvoice.totalAmount.toString()).toBe('4360');
    });

    it('バリデーションが正しく動作する', () => {
      const invoice = createTestInvoice();
      const pdfInvoice = convertToPdfInvoice(invoice);

      expect(pdfInvoice.validate()).toBe(true);
    });

    it('必須項目が不足している場合はエラーを投げる', () => {
      const invoice = createTestInvoice();
      delete (invoice as any).invoiceNumber;

      expect(() => {
        const pdfInvoice = convertToPdfInvoice(invoice);
        pdfInvoice.validate();
      }).toThrow(PdfValidationError);
    });

    it('金額の整合性チェックが正しく動作する', () => {
      const invoice = createTestInvoice();
      const pdfInvoice = convertToPdfInvoice(invoice);

      // 金額を不正に変更
      (pdfInvoice as any).subtotal = new Prisma.Decimal('9999');

      expect(() => pdfInvoice.validate()).toThrow(PdfValidationError);
    });
  });
});